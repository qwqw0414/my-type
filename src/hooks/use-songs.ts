import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SongDetail, LyricsData } from '@/lib/db';

// ============================================================================
// Types
// ============================================================================

interface SongsResponse {
  success: boolean;
  data?: {
    songs: SongDetail[];
    isConnected: boolean;
  };
  error?: string;
}

interface DeleteResponse {
  success: boolean;
  error?: string;
}

interface LyricsApiResponse {
  success: boolean;
  data?: LyricsData;
  error?: string;
}

// ============================================================================
// Fetch Functions
// ============================================================================

async function fetchAllSongs(): Promise<{ songs: SongDetail[]; isConnected: boolean }> {
  const response = await fetch('/api/songs');
  const data: SongsResponse = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch songs');
  }

  return data.data ?? { songs: [], isConnected: false };
}

async function deleteSongById(id: number): Promise<void> {
  const response = await fetch(`/api/songs/${id}`, {
    method: 'DELETE',
  });

  const data: DeleteResponse = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to delete song');
  }
}

async function fetchLyricsById(id: number): Promise<LyricsResponse> {
  const response = await fetch(`/api/songs/${id}`);
  const data: LyricsApiResponse = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch lyrics');
  }

  return data.data;
}

// ============================================================================
// Hooks
// ============================================================================

export function useAllSongs() {
  return useQuery({
    queryKey: ['allSongs'],
    queryFn: fetchAllSongs,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useDeleteSong() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSongById,
    onSuccess: () => {
      // Invalidate both allSongs and randomSongs queries
      queryClient.invalidateQueries({ queryKey: ['allSongs'] });
      queryClient.invalidateQueries({ queryKey: ['randomSongs'] });
    },
  });
}

export function useSongLyrics(id: number | null) {
  return useQuery({
    queryKey: ['songLyrics', id],
    queryFn: () => fetchLyricsById(id!),
    enabled: id !== null,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
