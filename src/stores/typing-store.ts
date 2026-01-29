import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LyricsData, TypingStats, PracticeRecord } from '@/types/lyrics';

// ============================================================================
// Types
// ============================================================================

interface TypingState {
  // Lyrics data
  lyrics: LyricsData | null;
  isLoading: boolean;
  error: string | null;

  // Typing practice state
  currentLineIndex: number;
  userInput: string;
  isStarted: boolean;
  isCompleted: boolean;
  startTime: number | null;
  lineStartTime: number | null;

  // Stats
  totalChars: number;
  correctChars: number;
  lineStats: { correct: number; total: number }[];

  // Practice history
  history: PracticeRecord[];
}

interface TypingActions {
  // Lyrics actions
  setLyrics: (lyrics: LyricsData) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearLyrics: () => void;

  // Typing actions
  startPractice: () => void;
  setUserInput: (input: string) => void;
  submitLine: () => void;
  nextLine: () => void;
  resetPractice: () => void;

  // Stats actions
  calculateStats: () => TypingStats;
  saveRecord: () => void;
  clearHistory: () => void;
}

type TypingStore = TypingState & TypingActions;

// ============================================================================
// Constants
// ============================================================================

const INITIAL_STATE: TypingState = {
  lyrics: null,
  isLoading: false,
  error: null,
  currentLineIndex: 0,
  userInput: '',
  isStarted: false,
  isCompleted: false,
  startTime: null,
  lineStartTime: null,
  totalChars: 0,
  correctChars: 0,
  lineStats: [],
  history: [],
};

// ============================================================================
// Helper Functions
// ============================================================================

function calculateCorrectChars(input: string, target: string): number {
  let correct = 0;
  const minLength = Math.min(input.length, target.length);

  for (let i = 0; i < minLength; i++) {
    if (input[i] === target[i]) {
      correct++;
    }
  }

  return correct;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================================================
// Store
// ============================================================================

export const useTypingStore = create<TypingStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      // Lyrics actions
      setLyrics: (lyrics) => set({ lyrics, error: null }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error, isLoading: false }),

      clearLyrics: () =>
        set({
          lyrics: null,
          error: null,
          currentLineIndex: 0,
          userInput: '',
          isStarted: false,
          isCompleted: false,
          startTime: null,
          lineStartTime: null,
          totalChars: 0,
          correctChars: 0,
          lineStats: [],
        }),

      // Typing actions
      startPractice: () => {
        const now = Date.now();
        set({
          isStarted: true,
          isCompleted: false,
          startTime: now,
          lineStartTime: now,
          currentLineIndex: 0,
          userInput: '',
          totalChars: 0,
          correctChars: 0,
          lineStats: [],
        });
      },

      setUserInput: (input) => set({ userInput: input }),

      submitLine: () => {
        const state = get();
        const { lyrics, currentLineIndex, userInput } = state;

        if (!lyrics) return;

        const currentLine = lyrics.lines[currentLineIndex];
        if (!currentLine) return;

        const targetText = currentLine.text;
        const correct = calculateCorrectChars(userInput, targetText);
        const total = targetText.length;

        set((prev) => ({
          totalChars: prev.totalChars + total,
          correctChars: prev.correctChars + correct,
          lineStats: [...prev.lineStats, { correct, total }],
        }));
      },

      nextLine: () => {
        const state = get();
        const { lyrics, currentLineIndex } = state;

        if (!lyrics) return;

        const isLastLine = currentLineIndex >= lyrics.lines.length - 1;

        if (isLastLine) {
          set({ isCompleted: true, userInput: '' });
        } else {
          set({
            currentLineIndex: currentLineIndex + 1,
            userInput: '',
            lineStartTime: Date.now(),
          });
        }
      },

      resetPractice: () => {
        set({
          currentLineIndex: 0,
          userInput: '',
          isStarted: false,
          isCompleted: false,
          startTime: null,
          lineStartTime: null,
          totalChars: 0,
          correctChars: 0,
          lineStats: [],
        });
      },

      // Stats actions
      calculateStats: () => {
        const state = get();
        const { totalChars, correctChars, startTime } = state;

        const elapsedTime = startTime ? (Date.now() - startTime) / 1000 : 0;
        const accuracy = totalChars > 0 ? (correctChars / totalChars) * 100 : 0;
        const cpm = elapsedTime > 0 ? Math.round((correctChars / elapsedTime) * 60) : 0;

        return {
          totalChars,
          correctChars,
          accuracy: Math.round(accuracy * 10) / 10,
          cpm,
          elapsedTime: Math.round(elapsedTime),
        };
      },

      saveRecord: () => {
        const state = get();
        const { lyrics } = state;

        if (!lyrics) return;

        const stats = get().calculateStats();
        const record: PracticeRecord = {
          id: generateId(),
          title: lyrics.title,
          artist: lyrics.artist,
          completedAt: new Date().toISOString(),
          stats,
        };

        set((prev) => ({
          history: [record, ...prev.history].slice(0, 50),
        }));
      },

      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'typing-practice-storage',
      partialize: (state) => ({
        history: state.history,
        lyrics: state.lyrics,
      }),
    }
  )
);
