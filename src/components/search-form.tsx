'use client';

import { useState } from 'react';
import { Search, Music, Loader2 } from '@/components/icons';
import { useTypingStore } from '@/stores/typing-store';
import { useLyricsMutation } from '@/hooks/use-lyrics';

// ============================================================================
// Types
// ============================================================================

interface SearchFormProps {
  onSuccess?: () => void;
}

// ============================================================================
// Search Form Component
// ============================================================================

export function SearchForm({ onSuccess }: SearchFormProps) {
  const [artist, setArtist] = useState('');
  const [title, setTitle] = useState('');

  const { setLyrics, setError, clearLyrics } = useTypingStore();
  const lyricsMutation = useLyricsMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!artist.trim() || !title.trim()) {
      setError('가수명과 곡 제목을 모두 입력해주세요.');
      return;
    }

    clearLyrics();

    lyricsMutation.mutate(
      { artist: artist.trim(), title: title.trim() },
      {
        onSuccess: (data) => {
          setLyrics(data);
          onSuccess?.();
        },
        onError: (error) => {
          setError(error.message);
        },
      }
    );
  };

  const isLoading = lyricsMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="artist" className="mb-2 block text-sm font-medium text-[var(--foreground)]">
            가수명
          </label>
          <div className="relative">
            <Music className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              type="text"
              id="artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="예: BTS, IU, Adele"
              className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--muted)] py-3 pl-11 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-colors focus:border-emerald-500 focus:bg-[var(--card)] focus:outline-none disabled:opacity-50"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex-1">
          <label htmlFor="title" className="mb-2 block text-sm font-medium text-[var(--foreground)]">
            곡 제목
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: Dynamite, 좋은 날"
              className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--muted)] py-3 pl-11 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-colors focus:border-emerald-500 focus:bg-[var(--card)] focus:outline-none disabled:opacity-50"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !artist.trim() || !title.trim()}
        className="flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-emerald-500/20 transition-all hover:bg-emerald-600 hover:shadow-md hover:shadow-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:active:scale-100"
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
