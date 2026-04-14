import { format } from 'date-fns';
import { AlertTriangle, ArrowRight } from 'lucide-react';
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
      className="rounded-bento p-4 cursor-pointer transition-all hover:opacity-95 active:scale-[0.99]"
      style={{
        background: '#FDF1EF',
        boxShadow: '0 1px 3px rgba(229,91,69,0.12), 0 0 0 1px rgba(229,91,69,0.18)'
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[8px] bg-orange/15 flex items-center justify-center">
            <AlertTriangle size={14} className="text-orange" />
          </div>
          <span className="text-[13px] font-semibold text-orange">Schedule Conflict</span>
        </div>
        {totalCount > 1 && (
          <span className="bg-orange/15 text-orange text-[10px] font-semibold px-2 py-0.5 rounded-badge">
            +{totalCount - 1} more
          </span>
        )}
      </div>

      <p className="text-[14px] font-medium text-dark leading-snug mb-1.5">
        {conflict.item_a.title}
        <span className="text-muted font-normal mx-1.5">vs</span>
        {conflict.item_b.title}
      </p>

      <div className="flex items-center gap-2 text-[12px] text-secondary mb-3">
        {dateStr && <span>{format(new Date(`${dateStr}T00:00:00`), 'EEE, MMM d')}</span>}
        {overlap && <><span className="text-border">·</span><span>{overlap}</span></>}
      </div>

      <div className="flex items-center gap-1 text-[12px] font-semibold text-orange">
        Review details <ArrowRight size={12} />
      </div>
    </div>
  );
}
