'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Keyboard, ArrowLeft, Loader2 } from '@/components/icons';
import { TypingPractice } from '@/components/typing-practice';
import { useTypingStore } from '@/stores/typing-store';

// ============================================================================
// Practice Page
// ============================================================================

export default function PracticePage() {
  const router = useRouter();
  const { lyrics, clearLyrics } = useTypingStore();

  // Redirect to home if no lyrics
  useEffect(() => {
    if (!lyrics) {
      router.replace('/');
    }
  }, [lyrics, router]);

  const handleBackToSearch = () => {
    clearLyrics();
    router.push('/');
  };

  // Show loading while checking for lyrics
  if (!lyrics) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      {/* Centered content wrapper */}
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            {/* Back button */}
            <button
              onClick={handleBackToSearch}
              className="flex min-h-[44px] items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] transition-all hover:bg-[var(--muted)] hover:text-[var(--foreground)] active:scale-[0.98]"
            >
              <ArrowLeft className="h-4 w-4" />
              다른 노래
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 shadow-sm shadow-emerald-500/20">
                <Keyboard className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="font-semibold text-[var(--foreground)]">
                My Type
              </span>
            </div>
          </div>
        </header>

        {/* Main content - Centered */}
        <main className="flex-1">
          <section className="card p-6 sm:p-8">
            <TypingPractice />
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-[var(--muted-foreground)]">
          <p>Powered by Vertex AI Gemini</p>
        </footer>
      </div>
    </div>
  );
}
