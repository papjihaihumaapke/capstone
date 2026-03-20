import { useContext, useEffect, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import ScheduleItemCard from '../components/ScheduleItemCard';
import MiniCalendar from '../components/MiniCalendar';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import type { Conflict, ScheduleItem } from '../types';
import { timeToMinutes } from '../lib/conflictEngine';

function getGreeting() {
	const hour = new Date().getHours();
	if (hour < 12) return 'morning';
	if (hour < 18) return 'afternoon';
	return 'evening';
}

function formatDate(dateStr: string) {
	const date = new Date(dateStr);
	return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

function minutesTo12Time(mins: number) {
	const h24 = Math.floor(mins / 60);
	const m = mins % 60;
	const ampm = h24 >= 12 ? 'PM' : 'AM';
	const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
	return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

export default function Home() {
	const navigate = useNavigate();
	const ctx = useContext(AppContext);
	const { items, conflicts, detectConflicts } = ctx || {};
	const [activeTab, setActiveTab] = useState<'today' | 'suggestions'>('today');

	useEffect(() => {
		detectConflicts && detectConflicts();
	}, [items]);

	const today = new Date();
	const todayStr = format(today, 'yyyy-MM-dd');
	const todaysItems = (items || []).filter(i => i.date === todayStr).sort((a, b) => a.start_time.localeCompare(b.start_time));
	const assignments = (items || []).filter(i => i.type === 'assignment' && i.due_date).sort((a, b) => (a.due_date || '').localeCompare(b.due_date || ''));

	// Find first unresolved conflict
	const unresolved = (conflicts || []).find(c => !c.resolved);

	const horizonDays = 14;
	const endDate = useMemo(() => {
		const d = new Date();
		d.setDate(d.getDate() + horizonDays);
		return d;
	}, []);
	const endStr = format(endDate, 'yyyy-MM-dd');

	function getConflictDateStr(c: Conflict) {
		const a = c.item_a;
		const b = c.item_b;
		const aDate = a.type === 'assignment' ? a.due_date || a.date : a.date;
		const bDate = b.type === 'assignment' ? b.due_date || b.date : b.date;
		return aDate || bDate || '';
	}

	function getIntervalForItem(item: ScheduleItem) {
		if (item.type === 'assignment') {
			const t = item.due_time || item.start_time;
			if (!t) return null;
			const start = timeToMinutes(t);
			return { start, end: start + 1 };
		}
		if (!item.start_time || !item.end_time) return null;
		return { start: timeToMinutes(item.start_time), end: timeToMinutes(item.end_time) };
	}

	function overlapLabel(c: Conflict) {
		const aInt = getIntervalForItem(c.item_a);
		const bInt = getIntervalForItem(c.item_b);
		if (!aInt || !bInt) return '';
		const start = Math.max(aInt.start, bInt.start);
		const end = Math.min(aInt.end, bInt.end);
		if (end <= start) return '';
		if (end - start <= 1) return minutesTo12Time(start);
		return `${minutesTo12Time(start)} - ${minutesTo12Time(end)}`;
	}

	function mitigationIdea(c: Conflict) {
		const a = c.item_a;
		const b = c.item_b;

		const weeklyClassInvolved = (a.type === 'class' && !!a.repeats_weekly) || (b.type === 'class' && !!b.repeats_weekly);

		const isMovableClass = (item: ScheduleItem) => item.type === 'class' && !item.repeats_weekly;
		const isMovableShift = (item: ScheduleItem) => item.type === 'shift';
		const isMovableAssignment = (item: ScheduleItem) => item.type === 'assignment';

		const prefer =
			isMovableShift(a) ? a : isMovableShift(b) ? b : isMovableClass(a) ? a : isMovableClass(b) ? b : isMovableAssignment(a) ? a : isMovableAssignment(b) ? b : null;

		const overlap = overlapLabel(c);
		const overlapPart = overlap ? `around ${overlap}` : '';

		if (weeklyClassInvolved && prefer?.type === 'shift') {
			return `Mitigate ${overlapPart}: this conflict is tied to a weekly class, so adjust your shift time earlier/later.`;
		}
		if (weeklyClassInvolved && prefer?.type === 'assignment') {
			return `Mitigate ${overlapPart}: weekly class repeats, so adjust the assignment due time or reschedule the shift.`;
		}
		if (prefer?.type === 'shift') {
			return `Mitigate ${overlapPart}: shift the shift by 15–60 minutes to remove the overlap.`;
		}
		if (prefer?.type === 'class') {
			return `Mitigate ${overlapPart}: adjust the class time (only if it's not weekly) or move the shift.`;
		}
		if (prefer?.type === 'assignment') {
			return `Mitigate ${overlapPart}: if you can, adjust the assignment time or move the conflicting shift/class.`;
		}

		return `Mitigate ${overlapPart}: review schedules and add buffer before the conflict.`;
	}

	const futureConflicts = useMemo(() => {
		return (conflicts || [])
			.filter(c => !c.resolved)
			.map(c => ({ c, dateStr: getConflictDateStr(c) }))
			.filter(x => x.dateStr >= todayStr && x.dateStr <= endStr)
			.sort((x, y) => x.dateStr.localeCompare(y.dateStr));
	}, [conflicts, todayStr, endStr]);

	return (
    <div className="relative min-h-screen bg-background animate-fadeIn">
			<div className="max-w-7xl mx-auto px-4 lg:px-8">
				<div className="lg:grid lg:grid-cols-2 lg:gap-8">
					{/* Left Column: Today's Schedule */}
					<div>
						{/* Top Section */}
						<div className="pt-6 pb-2">
							<div className="flex items-start justify-between gap-3">
								<div>
									<h2 className="font-display text-2xl font-bold">Good {getGreeting()},</h2>
									<div className="text-xs text-textSecondary mt-1 mb-2">{formatDate(todayStr)}</div>
								</div>
								<button
									type="button"
									onClick={() => navigate('/import')}
									className="shrink-0 mt-1 px-3 py-2 rounded-full text-xs font-semibold border border-gray-200 bg-white hover:bg-gray-50 active:scale-95 transition"
								>
									Import schedule
								</button>
							</div>
							{unresolved ? (
								<div
									className="w-full bg-[#FFF0EC] border-l-4 border-primary rounded-xl p-3 mb-4 cursor-pointer flex flex-col gap-1"
									onClick={() => navigate(`/conflict/${unresolved.id}`)}
								>
									<div className="text-sm font-bold text-red-600">⚠ {conflicts?.length} Conflict Detected</div>
									<div className="text-xs text-textSecondary">Your schedule has overlapping items. Tap to review.</div>
								</div>
							) : (
								<div className="w-full bg-green-50 border-l-4 border-green-500 rounded-xl p-3 mb-4 flex items-center gap-3">
									<div className="text-green-600 text-lg">✓</div>
									<div>
										<div className="text-sm font-bold text-green-600">You're all clear!</div>
										<div className="text-xs text-green-700">No conflicts detected.</div>
									</div>
								</div>
							)}
						</div>

						{/* Tabs */}
						<div className="flex gap-2 mb-4">
							<button
								type="button"
								onClick={() => setActiveTab('today')}
								className={`flex-1 px-3 py-2 rounded-full text-xs font-semibold border transition ${activeTab === 'today' ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
							>
								Today
							</button>
							<button
								type="button"
								onClick={() => setActiveTab('suggestions')}
								className={`flex-1 px-3 py-2 rounded-full text-xs font-semibold border transition ${activeTab === 'suggestions' ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
							>
								Suggestions
							</button>
						</div>

						{activeTab === 'today' ? (
							/* TODAY Section */
							<div className="mt-2">
								<div className="text-[11px] text-textSecondary uppercase font-semibold mb-2 tracking-widest">today</div>
								{todaysItems.length === 0 ? (
									<div className="flex flex-col items-center justify-center py-12">
										<div className="text-4xl text-gray-300 mb-4">📅</div>
										<div className="text-sm text-gray-500 text-center">No events today. Tap + to add one.</div>
									</div>
								) : (
									<div>
										{todaysItems.map(item => (
											<ScheduleItemCard
												key={item.id}
												item={item}
												hasConflict={!!(conflicts || []).find(c => (c.item_a.id === item.id || c.item_b.id === item.id) && !c.resolved)}
												onClick={() => navigate(`/item/${item.id}`)}
											/>
										))}
									</div>
								)}
							</div>
						) : (
							/* Suggestions Section */
							<div className="mt-2">
								<div className="text-[11px] text-textSecondary uppercase font-semibold mb-2 tracking-widest">upcoming conflicts</div>
								{futureConflicts.length === 0 ? (
									<div className="flex flex-col items-center justify-center py-12">
										<div className="text-4xl text-gray-300 mb-4">✅</div>
										<div className="text-sm text-gray-500 text-center">No upcoming conflicts in the next 2 weeks.</div>
									</div>
								) : (
									<div>
										{futureConflicts.slice(0, 6).map(({ c, dateStr }) => (
											<div
												key={c.id}
												className="w-full bg-white border border-gray-100 rounded-2xl p-4 mb-3 cursor-pointer hover:shadow-sm transition"
												onClick={() => navigate(`/conflict/${c.id}`)}
											>
												<div className="flex items-start justify-between gap-3">
													<div>
														<div className="text-xs text-textSecondary uppercase font-semibold tracking-widest">
															{format(new Date(`${dateStr}T00:00:00`), 'EEE, MMM d')}
														</div>
														<div className="mt-2 font-semibold text-textPrimary">
															Conflict detected {overlapLabel(c) ? `(${overlapLabel(c)})` : ''}
														</div>
														<div className="mt-1 text-sm text-textSecondary">{mitigationIdea(c)}</div>
													</div>
													<div className="text-red-500 font-bold">⚠</div>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						)}
					</div>

					{/* Right Column: Upcoming Deadlines + Mini Calendar */}
					<div className="lg:block hidden">
						{/* Mini Calendar */}
						<div className="mb-6">
							<MiniCalendar
								items={items || []}
								selectedDate={today}
								onDateSelect={(date) => navigate(`/calendar?date=${date.toISOString().slice(0, 10)}`)}
							/>
						</div>

						{/* UPCOMING DEADLINES Section */}
						<div>
							<div className="text-[11px] text-textSecondary uppercase font-semibold mb-2 tracking-widest">upcoming deadlines</div>
							{assignments.length === 0 ? (
								<div className="text-xs text-gray-400 mb-4">No upcoming deadlines.</div>
							) : (
								<div>
									{assignments.map(item => {
										const due = item.due_date ? new Date(item.due_date) : null;
										const days = due ? Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
										const dueText = days !== null ? (days <= 3 ? `Due in ${days} days` : `Due in ${days} days`) : '';
										const dueColor = days !== null && days <= 3 ? 'text-primary' : 'text-gray-400';
										return (
											<div key={item.id} className="mb-3">
												<ScheduleItemCard
													item={item}
													onClick={() => navigate(`/item/${item.id}`)}
												/>
												{due && (
													<div className={`text-xs mt-1 ml-2 ${dueColor}`}>{dueText}</div>
												)}
											</div>
										);
									})}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
