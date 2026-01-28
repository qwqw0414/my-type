'use client';

import { useEffect, useState, useCallback } from 'react';
import { Play, RotateCcw, Check, ChevronRight } from '@/components/icons';
import { useTypingStore } from '@/stores/typing-store';
import { TypingLine } from '@/components/typing-line';
import { StatsDisplay } from '@/components/stats-display';
import type { TypingStats } from '@/types/lyrics';

// ============================================================================
// Typing Practice Component
// ============================================================================

export function TypingPractice() {
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
  } = useTypingStore();

  const [liveStats, setLiveStats] = useState<TypingStats | null>(null);

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
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{lyrics.title}</h2>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">{lyrics.artist}</p>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
            {totalLines}줄 | {lyrics.language === 'ko' ? '한국어' : lyrics.language === 'en' ? '영어' : '혼합'}
          </p>
        </div>

        {/* Preview */}
        <div className="max-h-64 overflow-y-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
          <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            {lyrics.lines.slice(0, 10).map((line) => (
              <p key={line.index}>{line.text}</p>
            ))}
            {lyrics.lines.length > 10 && (
              <p className="text-zinc-400 dark:text-zinc-500">... 외 {lyrics.lines.length - 10}줄</p>
            )}
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={startPractice}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 font-medium text-white transition-colors hover:bg-emerald-700"
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
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">완료!</h2>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            {lyrics.title} - {lyrics.artist}
          </p>
        </div>

        {liveStats && <StatsDisplay stats={liveStats} />}

        <div className="flex gap-3">
          <button
            onClick={handleSaveAndReset}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-3 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Check className="h-5 w-5" />
            기록 저장
          </button>
          <button
            onClick={resetPractice}
            className="flex items-center justify-center gap-2 rounded-lg border border-zinc-300 px-4 py-3 font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <RotateCcw className="h-5 w-5" />
            다시
          </button>
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
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">{lyrics.title}</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{lyrics.artist}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {currentLineIndex + 1} / {totalLines}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{progress}% 완료</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Live stats */}
      {liveStats && <StatsDisplay stats={liveStats} isCompact />}

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
        <div className="flex items-center gap-2 text-sm text-zinc-400 dark:text-zinc-500">
          <ChevronRight className="h-4 w-4" />
          <span className="truncate">{lyrics.lines[currentLineIndex + 1]?.text}</span>
        </div>
      )}

      {/* Reset button */}
      <button
        onClick={resetPractice}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        <RotateCcw className="h-4 w-4" />
        처음부터 다시
      </button>
    </div>
  );
}
