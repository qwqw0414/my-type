'use client';

import { useState, useCallback } from 'react';
import { History, Trash2, Clock, Target, Keyboard, AlertTriangle, X } from '@/components/icons';
import { useTypingStore } from '@/stores/typing-store';
import moment from 'moment';

// ============================================================================
// Types
// ============================================================================

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// ============================================================================
// Confirm Dialog Component - Error Prevention
// ============================================================================

function ConfirmDialog({ isOpen, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className="card relative w-full max-w-sm p-6 shadow-2xl"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-description"
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
          aria-label="닫기"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
          <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
        </div>

        {/* Content */}
        <h2
          id="confirm-title"
          className="mb-2 text-center text-lg font-semibold text-[var(--foreground)]"
        >
          기록 전체 삭제
        </h2>
        <p
          id="confirm-description"
          className="mb-6 text-center text-sm text-[var(--muted-foreground)]"
        >
          모든 연습 기록이 삭제됩니다.<br />
          이 작업은 되돌릴 수 없습니다.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex min-h-[46px] flex-1 items-center justify-center rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition-all hover:bg-[var(--muted)] active:scale-[0.98]"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex min-h-[46px] flex-1 items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700 active:scale-[0.98]"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Practice History Component
// ============================================================================

export function PracticeHistory() {
  const { history, clearHistory } = useTypingStore();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleDeleteClick = useCallback(() => {
    setIsConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    clearHistory();
    setIsConfirmOpen(false);
  }, [clearHistory]);

  const handleCancelDelete = useCallback(() => {
    setIsConfirmOpen(false);
  }, []);

  if (history.length === 0) {
    return (
      <div className="card p-6">
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--muted)]">
            <History className="h-7 w-7 text-[var(--muted-foreground)]" />
          </div>
          <p className="font-medium text-[var(--foreground)]">아직 연습 기록이 없습니다</p>
          <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">
            타자 연습을 완료하면 기록이 저장됩니다
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
    <>
      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <div className="card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--card-border)] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <h3 className="font-semibold text-[var(--foreground)]">연습 기록</h3>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              {history.length}
            </span>
          </div>
          <button
            onClick={handleDeleteClick}
            className="flex min-h-[40px] items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-[var(--muted-foreground)] transition-all hover:bg-red-50 hover:text-red-600 active:scale-[0.98] dark:hover:bg-red-900/20 dark:hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
            삭제
          </button>
        </div>

        {/* Records list */}
        <div className="max-h-80 divide-y divide-[var(--card-border)] overflow-y-auto">
          {history.map((record) => (
            <div key={record.id} className="px-5 py-4 transition-colors hover:bg-[var(--muted)]/50">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-[var(--foreground)]">{record.title}</p>
                  <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">{record.artist}</p>
                </div>
                <p className="ml-4 shrink-0 text-xs text-[var(--muted-foreground)]">
                  {moment(record.completedAt).fromNow()}
                </p>
              </div>

              <div className="mt-3 flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
                <span className="flex items-center gap-1.5 rounded-md bg-[var(--muted)] px-2 py-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatTime(record.stats.elapsedTime)}
                </span>
                <span className="flex items-center gap-1.5 rounded-md bg-[var(--muted)] px-2 py-1">
                  <Target className="h-3.5 w-3.5" />
                  {record.stats.accuracy}%
                </span>
                <span className="flex items-center gap-1.5 rounded-md bg-[var(--muted)] px-2 py-1">
                  <Keyboard className="h-3.5 w-3.5" />
                  {record.stats.cpm} CPM
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
