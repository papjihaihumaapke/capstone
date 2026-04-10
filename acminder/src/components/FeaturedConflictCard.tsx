import { AlertTriangle, Calendar, Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import type { Conflict } from '../types';

function formatTime12(t: string | undefined) {
  if (!t) return '';
  const match = t.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return t;
  const h = Number(match[1]);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${match[2]} ${ampm}`;
}

function overlapLabel(c: Conflict) {
  if (!c.overlap_start || !c.overlap_end) return '';
  if (c.overlap_start === c.overlap_end) return formatTime12(c.overlap_start);
  return `${formatTime12(c.overlap_start)} – ${formatTime12(c.overlap_end)}`;
}

interface Props {
  conflict: Conflict;
  totalCount: number;
  onClick: () => void;
}

export default function FeaturedConflictCard({ conflict, totalCount, onClick }: Props) {
  const dateStr = conflict.date || '';
  const overlap = overlapLabel(conflict);
  const isCritical = conflict.severity !== 'minor';

  return (
    <div
      onClick={onClick}
      className="relative bg-blue-gradient rounded-3xl p-5 mb-4 cursor-pointer active:scale-[0.98] transition-transform overflow-hidden"
    >
      {/* Decorative circles */}
      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/8" />
      <div className="absolute top-8 -right-2 w-16 h-16 rounded-full bg-white/5" />

      <div className="relative z-10">
        {/* Top row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
              <AlertTriangle size={14} className="text-white" />
            </div>
            <span className="text-white/90 text-xs font-bold uppercase tracking-wider">
              {isCritical ? 'Conflict Detected' : 'Tight Schedule'}
            </span>
          </div>
          {totalCount > 1 && (
            <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
              +{totalCount - 1} more
            </span>
          )}
        </div>

        {/* Item names */}
        <h3 className="text-white font-display font-bold text-lg leading-tight mb-2">
          {conflict.item_a.title}
          <span className="text-white/60 font-normal mx-1.5">vs</span>
          {conflict.item_b.title}
        </h3>

        {/* Meta */}
        <div className="flex items-center gap-3 text-white/70 text-xs mb-4">
          {dateStr && (
            <span className="flex items-center gap-1.5">
              <Calendar size={11} className="opacity-80" />
              {format(new Date(`${dateStr}T00:00:00`), 'EEE, MMM d')}
            </span>
          )}
          {overlap && (
            <span className="flex items-center gap-1.5">
              <Clock size={11} />
              {overlap}
            </span>
          )}
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between">
          <div className="flex-1 bg-white/15 rounded-full h-1.5 mr-3">
            <div className="bg-white rounded-full h-full w-3/4" />
          </div>
          <span className="bg-white text-primary text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-card">
            Review <ArrowRight size={11} />
          </span>
        </div>
      </div>
    </div>
  );
}
