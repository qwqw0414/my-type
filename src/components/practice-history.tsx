'use client';

import { History, Trash2, Clock, Target, Keyboard } from '@/components/icons';
import { useTypingStore } from '@/stores/typing-store';
import moment from 'moment';

// ============================================================================
// Practice History Component
// ============================================================================

export function PracticeHistory() {
  const { history, clearHistory } = useTypingStore();

  if (history.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <History className="mb-3 h-12 w-12 text-zinc-300 dark:text-zinc-600" />
          <p className="text-zinc-500 dark:text-zinc-400">아직 연습 기록이 없습니다.</p>
          <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
            타자 연습을 완료하면 기록이 저장됩니다.
          </p>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">연습 기록</h3>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400">
            {history.length}
          </span>
        </div>
        <button
          onClick={clearHistory}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
        >
          <Trash2 className="h-4 w-4" />
          전체 삭제
        </button>
      </div>

      {/* Records list */}
      <div className="max-h-96 divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-700/50">
        {history.map((record) => (
          <div key={record.id} className="px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-700/30">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-zinc-900 dark:text-zinc-100">{record.title}</p>
                <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{record.artist}</p>
              </div>
              <p className="ml-4 shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
                {moment(record.completedAt).fromNow()}
              </p>
            </div>

            <div className="mt-2 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatTime(record.stats.elapsedTime)}
              </span>
              <span className="flex items-center gap-1">
                <Target className="h-3.5 w-3.5" />
                {record.stats.accuracy}%
              </span>
              <span className="flex items-center gap-1">
                <Keyboard className="h-3.5 w-3.5" />
                {record.stats.cpm} CPM
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
