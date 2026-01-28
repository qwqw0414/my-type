'use client';

import { useRef, useEffect, useMemo } from 'react';
import type { LyricLine } from '@/types/lyrics';

// ============================================================================
// Types
// ============================================================================

interface TypingLineProps {
  line: LyricLine;
  userInput: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  isActive: boolean;
}

interface CharacterProps {
  char: string;
  typed: string | undefined;
  isCurrentPosition: boolean;
}

// ============================================================================
// Character Component
// ============================================================================

function Character({ char, typed, isCurrentPosition }: CharacterProps) {
  const isTyped = typed !== undefined;
  const isCorrect = typed === char;

  let className = 'inline-block transition-colors duration-75';

  if (isCurrentPosition) {
    className += ' border-b-2 border-zinc-900 dark:border-zinc-100';
  }

  if (!isTyped) {
    className += ' text-zinc-400 dark:text-zinc-500';
  } else if (isCorrect) {
    className += ' text-emerald-600 dark:text-emerald-400';
  } else {
    className += ' text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
  }

  return <span className={className}>{char === ' ' ? '\u00A0' : char}</span>;
}

// ============================================================================
// Typing Line Component
// ============================================================================

export function TypingLine({ line, userInput, onInputChange, onSubmit, isActive }: TypingLineProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const targetText = line.text;

  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive, line.index]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };

  const characters = useMemo(() => {
    return targetText.split('').map((char, index) => ({
      char,
      typed: userInput[index],
      isCurrentPosition: index === userInput.length,
    }));
  }, [targetText, userInput]);

  const progress = Math.min((userInput.length / targetText.length) * 100, 100);

  return (
    <div className="space-y-4">
      {/* Target text display */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
        <div className="font-mono text-lg leading-relaxed tracking-wide">
          {characters.map((charData, index) => (
            <Character key={index} {...charData} />
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Input field */}
      <input
        ref={inputRef}
        type="text"
        value={userInput}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="여기에 입력하세요..."
        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 font-mono text-lg focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-400"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        disabled={!isActive}
      />

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        Enter 키를 눌러 다음 줄로 이동
      </p>
    </div>
  );
}
