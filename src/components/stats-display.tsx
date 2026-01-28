'use client';

import { Clock, Target, Keyboard } from '@/components/icons';
import type { TypingStats } from '@/types/lyrics';

// ============================================================================
// Types
// ============================================================================

interface StatsDisplayProps {
  stats: TypingStats;
  isCompact?: boolean;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
}

// ============================================================================
// Stat Card Component
// ============================================================================

function StatCard({ icon, label, value, unit }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
        {icon}
      </div>
      <div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
        <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {value}
          {unit && <span className="ml-1 text-sm font-normal text-zinc-500">{unit}</span>}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Stats Display Component
// ============================================================================

export function StatsDisplay({ stats, isCompact = false }: StatsDisplayProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isCompact) {
    return (
      <div className="flex items-center justify-center gap-6 text-sm text-zinc-600 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {formatTime(stats.elapsedTime)}
        </span>
        <span className="flex items-center gap-1.5">
          <Target className="h-4 w-4" />
          {stats.accuracy}%
        </span>
        <span className="flex items-center gap-1.5">
          <Keyboard className="h-4 w-4" />
          {stats.cpm} CPM
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      <StatCard
        icon={<Clock className="h-5 w-5" />}
        label="소요 시간"
        value={formatTime(stats.elapsedTime)}
      />
      <StatCard
        icon={<Target className="h-5 w-5" />}
        label="정확도"
        value={stats.accuracy}
        unit="%"
      />
      <StatCard
        icon={<Keyboard className="h-5 w-5" />}
        label="타자 속도"
        value={stats.cpm}
        unit="CPM"
      />
    </div>
  );
}
