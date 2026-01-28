'use client';

import { Keyboard, AlertCircle } from '@/components/icons';
import { SearchForm } from '@/components/search-form';
import { TypingPractice } from '@/components/typing-practice';
import { PracticeHistory } from '@/components/practice-history';
import { useTypingStore } from '@/stores/typing-store';

// ============================================================================
// Main Page
// ============================================================================

export default function Home() {
  const { lyrics, error, clearLyrics } = useTypingStore();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Header */}
        <header className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 dark:bg-zinc-100">
            <Keyboard className="h-7 w-7 text-white dark:text-zinc-900" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            My Type
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            좋아하는 노래 가사로 타자 연습하기
          </p>
        </header>

        {/* Main content */}
        <main className="space-y-6">
          {/* Search form - show when no lyrics loaded */}
          {!lyrics && (
            <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
              <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                노래 검색
              </h2>
              <SearchForm />

              {/* Error display */}
              {error && (
                <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                  <div>
                    <p className="font-medium text-red-800 dark:text-red-200">오류 발생</p>
                    <p className="mt-1 text-sm text-red-600 dark:text-red-300">{error}</p>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Typing practice - show when lyrics loaded */}
          {lyrics && (
            <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  타자 연습
                </h2>
                <button
                  onClick={clearLyrics}
                  className="text-sm text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                >
                  다른 노래 검색
                </button>
              </div>
              <TypingPractice />
            </section>
          )}

          {/* Practice history */}
          <section>
            <PracticeHistory />
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-zinc-400 dark:text-zinc-500">
          <p>Powered by Vertex AI Gemini</p>
        </footer>
      </div>
    </div>
  );
}
