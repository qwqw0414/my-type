import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { LyricsData, LyricsResponse } from '@/types/lyrics';

// ============================================================================
// API Functions
// ============================================================================

async function fetchLyrics(artist: string, title: string): Promise<LyricsData> {
  const response = await fetch('/api/lyrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ artist, title }),
  });

  const result: LyricsResponse = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error ?? '가사를 불러오는데 실패했습니다.');
  }

  return result.data;
}

// ============================================================================
// Hooks
// ============================================================================

export function useLyricsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ artist, title }: { artist: string; title: string }) =>
      fetchLyrics(artist, title),
    onSuccess: () => {
      // Invalidate random songs query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['randomSongs'] });
    },
  });
}
