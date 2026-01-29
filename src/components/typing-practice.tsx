'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Play, RotateCcw, Check, ChevronRight, Home } from '@/components/icons';
import { useTypingStore } from '@/stores/typing-store';
import { TypingLine } from '@/components/typing-line';
import { StatsDisplay } from '@/components/stats-display';
import type { TypingStats } from '@/types/lyrics';

// ============================================================================
// Typing Practice Component
// ============================================================================

export function TypingPractice() {
  const router = useRouter();
  const {
    lyrics,
    currentLineIndex,
    userInput,
    isStarted,
    isCompleted,
    startPractice,
    setUserInput,
    submitLine,
    nextLine,
    resetPractice,
    calculateStats,
    saveRecord,
    clearLyrics,
  } = useTypingStore();

  const [liveStats, setLiveStats] = useState<TypingStats | null>(null);

  // Initialize stats immediately when practice starts
  useEffect(() => {
    if (isStarted && !liveStats) {
      setLiveStats(calculateStats());
    }
  }, [isStarted, liveStats, calculateStats]);

  // Update live stats every second while practicing
  useEffect(() => {
    if (!isStarted || isCompleted) return;

    const interval = setInterval(() => {
      setLiveStats(calculateStats());
    }, 1000);

    return () => clearInterval(interval);
  }, [isStarted, isCompleted, calculateStats]);

  // Calculate final stats when completed
  useEffect(() => {
    if (isCompleted) {
      setLiveStats(calculateStats());
    }
  }, [isCompleted, calculateStats]);

  const handleSubmitLine = useCallback(() => {
    if (!lyrics) return;

    const currentLine = lyrics.lines[currentLineIndex];
    if (!currentLine) return;

    submitLine();
    nextLine();
  }, [lyrics, currentLineIndex, submitLine, nextLine]);

  const handleSaveAndReset = useCallback(() => {
    saveRecord();
    resetPractice();
  }, [saveRecord, resetPractice]);

  const handleSaveAndGoHome = useCallback(() => {
    saveRecord();
    clearLyrics();
    router.push('/');
  }, [saveRecord, clearLyrics, router]);

  if (!lyrics) return null;

  const currentLine = lyrics.lines[currentLineIndex];
  const totalLines = lyrics.lines.length;
  const progress = Math.round(((currentLineIndex + (isCompleted ? 1 : 0)) / totalLines) * 100);

  // Not started state
  if (!isStarted) {
    return (
      <div className="space-y-6">
        {/* Song info */}
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">{lyrics.title}</h2>
          <p className="mt-1.5 text-[var(--muted-foreground)]">{lyrics.artist}</p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs text-[var(--muted-foreground)]">
            <span>{totalLines}줄</span>
            <span className="h-1 w-1 rounded-full bg-current opacity-40" />
            <span>{lyrics.language === 'ko' ? '한국어' : lyrics.language === 'en' ? '영어' : '혼합'}</span>
          </div>
        </div>

        {/* Preview */}
        <div className="max-h-56 overflow-y-auto rounded-xl bg-[var(--muted)] p-4">
          <div className="space-y-1.5 text-sm leading-relaxed text-[var(--muted-foreground)]">
            {lyrics.lines.slice(0, 8).map((line) => (
              <p key={line.index}>{line.text}</p>
            ))}
            {lyrics.lines.length > 8 && (
              <p className="pt-1 opacity-60">... 외 {lyrics.lines.length - 8}줄</p>
            )}
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={startPractice}
          className="flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-xl bg-emerald-500 px-5 py-3.5 font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-[0.98]"
        >
          <Play className="h-5 w-5" />
          타자 연습 시작
        </button>
      </div>
    );
  }

  // Completed state
  if (isCompleted) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 shadow-lg shadow-emerald-500/20 dark:bg-emerald-900/30">
            <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">완료!</h2>
          <p className="mt-1.5 text-[var(--muted-foreground)]">
            {lyrics.title} - {lyrics.artist}
          </p>
        </div>

        {liveStats && <StatsDisplay stats={liveStats} />}

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={handleSaveAndGoHome}
            className="flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-xl bg-emerald-500 px-5 py-3.5 font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-[0.98]"
          >
            <Home className="h-5 w-5" />
            저장하고 다른 노래 검색
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleSaveAndReset}
              className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-3 font-medium text-[var(--foreground)] transition-all hover:bg-[var(--muted)] active:scale-[0.98]"
            >
              <RotateCcw className="h-4 w-4" />
              다시 연습
            </button>
            <button
              onClick={resetPractice}
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm text-[var(--muted-foreground)] transition-all hover:bg-[var(--muted)] hover:text-[var(--foreground)] active:scale-[0.98]"
            >
              저장 없이
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Practice in progress
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-[var(--foreground)]">{lyrics.title}</h2>
          <p className="text-sm text-[var(--muted-foreground)]">{lyrics.artist}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold tabular-nums text-[var(--foreground)]">
            {currentLineIndex + 1} / {totalLines}
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">{progress}%</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Live stats - Always reserve space to prevent CLS */}
      <StatsDisplay stats={liveStats} isCompact />

      {/* Current line */}
      {currentLine && (
        <TypingLine
          line={currentLine}
          userInput={userInput}
          onInputChange={setUserInput}
          onSubmit={handleSubmitLine}
          isActive={true}
        />
      )}

      {/* Next line preview */}
      {currentLineIndex < totalLines - 1 && (
        <div className="flex items-center gap-2 rounded-lg bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
          <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
          <span className="truncate">{lyrics.lines[currentLineIndex + 1]?.text}</span>
        </div>
      )}

      {/* Reset button */}
      <button
        onClick={resetPractice}
        className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl text-sm text-[var(--muted-foreground)] transition-all hover:bg-[var(--muted)] hover:text-[var(--foreground)] active:scale-[0.98]"
      >
        <RotateCcw className="h-4 w-4" />
        처음부터 다시
      </button>
    </div>
  );
}
