import { ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import type { Conflict } from '../types';

function formatTimeOnly(t: string | undefined) {
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
  if (c.overlap_start === c.overlap_end) return formatTimeOnly(c.overlap_start);
  return `${formatTimeOnly(c.overlap_start)} – ${formatTimeOnly(c.overlap_end)}`;
}

interface Props {
  conflict: Conflict;
  totalCount: number;
  onClick: () => void;
}

export default function FeaturedConflictCard({ conflict, totalCount, onClick }: Props) {
  const dateStr = conflict.date || '';
  const overlap = overlapLabel(conflict);

  return (
    <div
      onClick={onClick}
      className="bg-peach rounded-card border border-peachborder p-4 cursor-pointer active:scale-[0.98] transition-transform flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Icon Wrapper */}
          <div className="w-8 h-8 rounded-badge bg-orange flex items-center justify-center">
             <svg className="w-4 h-4 stroke-white" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
          </div>
          <span className="text-peachtext font-display text-bodybold uppercase tracking-wide">
            Schedule Conflict
          </span>
        </div>
        {totalCount > 1 && (
          <span className="bg-orange/20 text-orange text-[10px] font-bold px-2 py-0.5 rounded-badge">
            +{totalCount - 1} more
          </span>
        )}
      </div>

      <div>
        <h3 className="text-peachtext font-bold text-[15px] leading-tight mb-1">
          {conflict.item_a.title}
          <span className="text-peachtext/60 font-normal mx-1.5">vs</span>
          {conflict.item_b.title}
        </h3>
        
        <div className="text-peachtext/80 text-caption flex items-center gap-2">
          {dateStr && (
            <span>{format(new Date(`${dateStr}T00:00:00`), 'EEE, MMM d')}</span>
          )}
          {overlap && (
            <>
              <span className="text-peachtext/40">•</span>
              <span>{overlap}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-caption font-semibold text-orange flex items-center gap-1">
          Review details <ArrowRight size={12} />
        </span>
      </div>
    </div>
  );
}
