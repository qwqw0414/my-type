'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Keyboard, AlertCircle, Loader2 } from '@/components/icons';
import { SearchForm } from '@/components/search-form';
import { PracticeHistory } from '@/components/practice-history';
import { RecommendedSongs } from '@/components/recommended-songs';
import { useTypingStore } from '@/stores/typing-store';
import { useLyricsMutation } from '@/hooks/use-lyrics';

// ============================================================================
// Main Page - Search & History
// ============================================================================

export default function Home() {
  const router = useRouter();
  const { error, clearLyrics, setLyrics, setError } = useTypingStore();
  const lyricsMutation = useLyricsMutation();

  const handleSongSelect = (artist: string, title: string) => {
    clearLyrics();

    lyricsMutation.mutate(
      { artist, title },
      {
        onSuccess: (data) => {
          setLyrics(data);
          router.push('/practice');
        },
        onError: (err) => {
          setError(err.message);
        },
      }
    );
  };

  const isLoading = lyricsMutation.isPending;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      {/* Centered content wrapper */}
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-12 sm:px-6 sm:py-16">

        {/* Header - Centered */}
        <header className="mb-10 text-center">
          <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-500/20">
            <Keyboard className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">
            My Type
          </h1>
          <p className="mt-2 text-[var(--muted-foreground)]">
            좋아하는 노래 가사로 타자 연습하기
          </p>
        </header>

        {/* Main content - Centered */}
        <main className="flex-1 space-y-6">
          {/* Recommended songs */}
          {!isLoading && (
            <RecommendedSongs onSelect={handleSongSelect} />
          )}

          {/* Search form card */}
          <section className="card p-6">
            <SearchForm onSuccess={() => router.push('/practice')} />

            {/* Loading state */}
            {isLoading && (
              <div className="mt-5 flex items-center justify-center gap-3 rounded-xl bg-[var(--muted)] p-4">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
                <p className="text-sm text-[var(--muted-foreground)]">
                  가사를 검색하고 있습니다...
                </p>
              </div>
            )}

            {/* Error display */}
            {error && !isLoading && (
              <div className="mt-5 flex items-start gap-3 rounded-xl bg-red-50 p-4 dark:bg-red-950/30">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                <div>
                  <p className="font-medium text-red-700 dark:text-red-400">오류 발생</p>
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400/80">{error}</p>
                </div>
              </div>
            )}
          </section>

          {/* Practice history */}
          <section>
            <PracticeHistory />
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-12 flex items-center justify-center gap-4 text-sm text-[var(--muted-foreground)]">
          <p>Powered by Vertex AI Gemini</p>
          <span className="h-3 w-px bg-[var(--card-border)]" />
          <Link
            href="/admin"
            className="transition-colors hover:text-[var(--foreground)]"
          >
            곡 관리
          </Link>
        </footer>
      </div>
    </div>
  );
}
