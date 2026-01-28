'use client';

import { useState } from 'react';
import { Search, Music, Loader2 } from '@/components/icons';
import { useTypingStore } from '@/stores/typing-store';
import type { LyricsResponse } from '@/types/lyrics';

// ============================================================================
// Search Form Component
// ============================================================================

export function SearchForm() {
  const [artist, setArtist] = useState('');
  const [title, setTitle] = useState('');

  const { setLyrics, setLoading, setError, isLoading, clearLyrics } = useTypingStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!artist.trim() || !title.trim()) {
      setError('가수명과 곡 제목을 모두 입력해주세요.');
      return;
    }

    clearLyrics();
    setLoading(true);

    try {
      const response = await fetch('/api/lyrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artist: artist.trim(), title: title.trim() }),
      });

      const result: LyricsResponse = await response.json();

      if (!result.success || !result.data) {
        setError(result.error ?? '가사를 불러오는데 실패했습니다.');
        return;
      }

      setLyrics(result.data);
    } catch (error) {
      console.error('[SearchForm] Error:', error);
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="artist" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            가수명
          </label>
          <div className="relative">
            <Music className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              id="artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="예: BTS, IU, Adele"
              className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-500"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex-1">
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            곡 제목
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: Dynamite, 좋은 날"
              className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-500"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !artist.trim() || !title.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            가사 검색 중...
          </>
        ) : (
          <>
            <Search className="h-4 w-4" />
            가사 검색
          </>
        )}
      </button>
    </form>
  );
}
