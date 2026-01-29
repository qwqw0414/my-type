import { useQuery } from '@tanstack/react-query';

// ============================================================================
// Types
// ============================================================================

interface SongInfo {
  artist: string;
  title: string;
}

interface RandomSongsResponse {
  success: boolean;
  data?: {
    songs: SongInfo[];
    totalCount: number;
  };
  error?: string;
}

// ============================================================================
// API Functions
// ============================================================================

async function fetchRandomSongs(): Promise<{ songs: SongInfo[]; totalCount: number }> {
  const response = await fetch('/api/songs/random');
  const result: RandomSongsResponse = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error ?? '곡 목록을 불러오는데 실패했습니다.');
  }

  return result.data;
}

// ============================================================================
// Hooks
// ============================================================================

export function useRandomSongs() {
  return useQuery({
    queryKey: ['randomSongs'],
    queryFn: fetchRandomSongs,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}
