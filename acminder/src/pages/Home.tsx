import { useContext, useEffect, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import ScheduleItemCard from '../components/ScheduleItemCard';
import MiniCalendar from '../components/MiniCalendar';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, CheckCircle } from 'lucide-react';

import type { Conflict, ScheduleItem } from '../types';

function getGreeting() {
	const hour = new Date().getHours();
	if (hour < 12) return 'morning';
	if (hour < 18) return 'afternoon';
	return 'evening';
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
	const todaysItems = (items || [])
		.filter(i => {
			const itemDate = i.type === 'assignment' ? (i.due_date || i.date) : i.date;
			return itemDate === todayStr;
		})
		.sort((a, b) => {
			const timeA = a.type === 'assignment' ? (a.due_time || a.start_time || '') : a.start_time;
			const timeB = b.type === 'assignment' ? (b.due_time || b.start_time || '') : b.start_time;
			return timeA.localeCompare(timeB);
		});
		
	// Only show assignments due today or in the future, and not completed
	const assignments = (items || [])
		.filter((i): i is import('../types').AssignmentItem => i.type === 'assignment')
		.filter(i => {
			const d = i.due_date || i.date;
			return d && d >= todayStr && !i.completed;
		})
		.sort((a, b) => {
			const dA = a.due_date || a.date || '';
			const dB = b.due_date || b.date || '';
			return dA.localeCompare(dB);
		});
	const unresolved = (conflicts || []).find(c => !c.resolved && getConflictDateStr(c) === todayStr);

	const horizonDays = 14;
	const endDate = useMemo(() => {
		const d = new Date();
		d.setDate(d.getDate() + horizonDays);
		return d;
	}, []);
	const endStr = format(endDate, 'yyyy-MM-dd');

	function getConflictDateStr(c: Conflict) {
		return c.date || '';
	}

	function overlapLabel(c: Conflict) {
		if (!c.overlap_start || !c.overlap_end) return '';
		
		const format12 = (t: string) => {
		    const [h,m] = t.split(':').map(Number);
		    const ampm = h >= 12 ? 'PM' : 'AM';
		    const h12 = h % 12 === 0 ? 12 : h % 12;
		    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
		};

		if (c.overlap_start === c.overlap_end) return format12(c.overlap_start);
		return `${format12(c.overlap_start)} - ${format12(c.overlap_end)}`;
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
									<div className="text-xs text-textSecondary mt-1 mb-2">
										{format(today, 'EEEE, MMM d')}
									</div>
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
									className={`w-full border-l-4 rounded-xl p-3 mb-4 cursor-pointer flex flex-col gap-1 ${unresolved.severity === 'minor' ? 'bg-orange-50 border-orange-500' : 'bg-[#FFF0EC] border-primary'}`}
									onClick={() => navigate(`/conflict/${unresolved.id}`)}
								>
									<div className={`text-sm font-bold ${unresolved.severity === 'minor' ? 'text-orange-600' : 'text-red-600'}`}>
										⚠ {unresolved.severity === 'minor' ? `Tight Schedule: ${unresolved.item_a.title} & ${unresolved.item_b.title}` : `Conflict: ${unresolved.item_a.title} vs ${unresolved.item_b.title}`}
									</div>
									<div className="text-xs text-textSecondary">
										{unresolved.severity === 'minor' ? 'These events are scheduled very close together. Tap to review.' : 'Tap to resolve this schedule overlap.'}
									</div>
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
								Conflicts & Suggestions
							</button>
						</div>

						{activeTab === 'today' ? (
							/* TODAY Section */
							<div className="mt-2">
								<div className="text-[11px] text-textSecondary uppercase font-semibold mb-2 tracking-widest">today</div>
								{todaysItems.length === 0 ? (
									<div className="flex flex-col items-center justify-center py-12 animate-fadeIn">
										<Calendar size={42} className="text-gray-200 mb-4" strokeWidth={1} />
										<div className="text-sm text-gray-400 text-center font-medium">No events today. Tap + to add one.</div>
									</div>
								) : (
									<div>
										{todaysItems.map(item => (
											<ScheduleItemCard
												key={item.id}
												item={item}
												conflictSeverity={(conflicts || []).find(c => (c.item_a.id === item.id || c.item_b.id === item.id) && !c.resolved)?.severity || 'none'}
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
									<div className="flex flex-col items-center justify-center py-12 animate-fadeIn">
										<CheckCircle size={42} className="text-green-200 mb-4" strokeWidth={1} />
										<div className="text-sm text-gray-400 text-center font-medium">No upcoming conflicts in the next 2 weeks.</div>
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
														<div className="mt-2 font-semibold text-textPrimary leading-tight">
															{c.item_a.title} <span className="font-normal text-textSecondary px-1">{c.severity === 'minor' ? 'close to' : 'vs'}</span> {c.item_b.title} <span className="font-normal text-primary ml-1">{overlapLabel(c) ? `(${overlapLabel(c)})` : ''}</span>
														</div>
														<div className="mt-1 text-sm text-textSecondary">{mitigationIdea(c)}</div>
													</div>
													<div className={`${c.severity === 'minor' ? 'text-orange-500' : 'text-red-500'} font-bold`}>⚠</div>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						)}
					</div>
					
					{/* Mobile Only: Upcoming Deadlines Section */}
					<div className="block lg:hidden mt-8">
						<div className="text-[11px] text-textSecondary uppercase font-semibold mb-2 tracking-widest">upcoming deadlines</div>
						{assignments.length === 0 ? (
							<div className="text-xs text-gray-400 mb-4">No upcoming deadlines.</div>
						) : (
							<div>
								{assignments.map(item => {
									const d = item.due_date || item.date;
									const due = d ? new Date(`${d}T00:00:00`) : null;
									const days = due ? Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
									const dueText = days === 0 ? 'Due today' : days === 1 ? 'Due tomorrow' : days !== null ? `Due in ${days} days` : '';
									const dueColor = days !== null && days <= 1 ? 'text-primary font-semibold' : days !== null && days <= 3 ? 'text-orange-400' : 'text-gray-400';
									return (
										<div key={`mobile-${item.id}`} className="mb-3">
											<ScheduleItemCard
												item={item}
												onClick={() => navigate(`/item/${item.id}`)}
												onMarkDone={() => ctx?.updateItem?.(item.id, { completed: true })}
											/>
											{due && <div className={`text-xs mt-1 ml-2 ${dueColor}`}>{dueText}</div>}
										</div>
									);
								})}
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
					const d = item.due_date || item.date;
					const due = d ? new Date(`${d}T00:00:00`) : null;
					const days = due ? Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
					const dueText = days === 0 ? 'Due today' : days === 1 ? 'Due tomorrow' : days !== null ? `Due in ${days} days` : '';
					const dueColor = days !== null && days <= 1 ? 'text-primary font-semibold' : days !== null && days <= 3 ? 'text-orange-400' : 'text-gray-400';
					return (
						<div key={item.id} className="mb-3">
							<ScheduleItemCard
								item={item}
								onClick={() => navigate(`/item/${item.id}`)}
								onMarkDone={() => ctx?.updateItem?.(item.id, { completed: true })}
							/>
							{due && <div className={`text-xs mt-1 ml-2 ${dueColor}`}>{dueText}</div>}
						</div>
					);
				})}		</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
