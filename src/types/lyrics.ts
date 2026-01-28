// ============================================================================
// Lyrics Types
// ============================================================================

export interface LyricLine {
  index: number;
  text: string;
}

export interface LyricsData {
  title: string;
  artist: string;
  language: 'ko' | 'en' | 'mixed';
  lines: LyricLine[];
}

// ============================================================================
// Typing Practice Types
// ============================================================================

export interface TypingStats {
  totalChars: number;
  correctChars: number;
  accuracy: number;
  cpm: number;
  elapsedTime: number;
}

export interface PracticeRecord {
  id: string;
  title: string;
  artist: string;
  completedAt: string;
  stats: TypingStats;
}

// ============================================================================
// API Types
// ============================================================================

export interface LyricsRequest {
  artist: string;
  title: string;
}

export interface LyricsResponse {
  success: boolean;
  data?: LyricsData;
  error?: string;
}
