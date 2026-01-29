'use client';

import { Clock, Target, Keyboard } from '@/components/icons';
import type { TypingStats } from '@/types/lyrics';

// ============================================================================
// Types
// ============================================================================

interface StatsDisplayProps {
  stats: TypingStats | null;
  isCompact?: boolean;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  highlight?: boolean;
}

// ============================================================================
// Default Stats (for initial render to prevent CLS)
// ============================================================================

const DEFAULT_STATS: TypingStats = {
  elapsedTime: 0,
  accuracy: 0,
  cpm: 0,
  totalChars: 0,
  correctChars: 0,
};

// ============================================================================
// Stat Card Component
// ============================================================================

function StatCard({ icon, label, value, unit, highlight }: StatCardProps) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-[var(--muted)] p-4">
      <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${highlight ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-[var(--card)] text-[var(--muted-foreground)]'}`}>
        {icon}
      </div>
      <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-0.5 text-xl font-bold tabular-nums text-[var(--foreground)]">
        {value}
        {unit && <span className="ml-0.5 text-sm font-normal text-[var(--muted-foreground)]">{unit}</span>}
      </p>
    </div>
  );
}

// ============================================================================
// Stats Display Component
// ============================================================================

export function StatsDisplay({ stats, isCompact = false }: StatsDisplayProps) {
  // Use default stats if null to prevent CLS
  const displayStats = stats ?? DEFAULT_STATS;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isCompact) {
    return (
      <div className="flex items-center justify-center gap-5 rounded-xl bg-[var(--muted)] px-4 py-3">
        <span className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)]">
          <Clock className="h-4 w-4" />
          <span className="font-medium tabular-nums text-[var(--foreground)]">{formatTime(displayStats.elapsedTime)}</span>
        </span>
        <span className="h-4 w-px bg-[var(--card-border)]" />
        <span className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)]">
          <Target className="h-4 w-4" />
          <span className="font-medium tabular-nums text-[var(--foreground)]">{displayStats.accuracy}%</span>
        </span>
        <span className="h-4 w-px bg-[var(--card-border)]" />
        <span className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)]">
          <Keyboard className="h-4 w-4" />
          <span className="font-medium tabular-nums text-[var(--foreground)]">{displayStats.cpm}</span>
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      <StatCard
        icon={<Clock className="h-5 w-5" />}
        label="소요 시간"
        value={formatTime(displayStats.elapsedTime)}
      />
      <StatCard
        icon={<Target className="h-5 w-5" />}
        label="정확도"
        value={displayStats.accuracy}
        unit="%"
        highlight={displayStats.accuracy >= 95}
      />
      <StatCard
        icon={<Keyboard className="h-5 w-5" />}
        label="타자 속도"
        value={displayStats.cpm}
        unit="CPM"
        highlight={displayStats.cpm >= 300}
      />
    </div>
  );
}
