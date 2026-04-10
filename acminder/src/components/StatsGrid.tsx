import { CalendarDays, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  accent?: string;
  bg?: string;
}

function StatCard({ label, value, subtitle, icon, accent = 'text-primary', bg = 'bg-primaryLight' }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-card border border-border">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <div className={`text-2xl font-bold font-display ${accent}`}>{value}</div>
      <div className="text-xs font-semibold text-textPrimary mt-0.5">{label}</div>
      <div className="text-[10px] text-textSecondary mt-0.5">{subtitle}</div>
    </div>
  );
}

interface StatsGridProps {
  todayCount: number;
  upcomingCount: number;
  clashCount: number;
  completedCount: number;
}

export default function StatsGrid({ todayCount, upcomingCount, clashCount, completedCount }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      <StatCard
        label="Today's Items"
        value={todayCount}
        subtitle="on schedule"
        icon={<CalendarDays size={16} className="text-primary" />}
        accent="text-primary"
        bg="bg-primaryLight"
      />
      <StatCard
        label="Upcoming"
        value={upcomingCount}
        subtitle="next 7 days"
        icon={<TrendingUp size={16} className="text-accent" />}
        accent="text-accent"
        bg="bg-accentLight"
      />
      <StatCard
        label="Clashes"
        value={clashCount}
        subtitle="need attention"
        icon={<AlertTriangle size={16} className={clashCount > 0 ? 'text-danger' : 'text-success'} />}
        accent={clashCount > 0 ? 'text-danger' : 'text-success'}
        bg={clashCount > 0 ? 'bg-red-50' : 'bg-green-50'}
      />
      <StatCard
        label="Completed"
        value={completedCount}
        subtitle="this week"
        icon={<CheckCircle2 size={16} className="text-success" />}
        accent="text-success"
        bg="bg-green-50"
      />
    </div>
  );
}
