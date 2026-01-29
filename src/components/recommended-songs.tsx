'use client';

import { useRandomSongs } from '@/hooks/use-random-songs';

// ============================================================================
// Types
// ============================================================================

interface RecommendedSongsProps {
  onSelect: (artist: string, title: string) => void;
}

interface SongInfo {
  artist: string;
  title: string;
}

// ============================================================================
// Skeleton Component - CLS Prevention
// ============================================================================

function SongSkeleton() {
  return (
    <div className="flex shrink-0 items-center gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5">
      <div className="skeleton h-4 w-20" />
      <div className="skeleton h-3 w-14" />
    </div>
  );
}

// ============================================================================
// Song Button Component
// ============================================================================

function SongButton({ song, onSelect }: { song: SongInfo; onSelect: (artist: string, title: string) => void }) {
  return (
    <button
      onClick={() => onSelect(song.artist, song.title)}
      className="flex shrink-0 items-center gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm transition-all hover:border-emerald-400 hover:shadow-md active:scale-[0.98] dark:hover:border-emerald-600"
    >
      <span className="max-w-[120px] truncate font-medium text-[var(--foreground)]">
        {song.title}
      </span>
      <span className="max-w-[80px] truncate text-[var(--muted-foreground)]">
        {song.artist}
      </span>
    </button>
  );
}

// ============================================================================
// Recommended Songs Component
// ============================================================================

export function RecommendedSongs({ onSelect }: RecommendedSongsProps) {
  const { data, isLoading } = useRandomSongs();

  const songs = data?.songs ?? [];
  const totalCount = data?.totalCount ?? 0;

  // Don't render if no songs available (after loading)
  if (!isLoading && songs.length === 0) {
    return null;
  }

  // Calculate animation duration based on number of songs
  const animationDuration = Math.max(songs.length * 4, 20);

  return (
    <div className="mb-4">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <span className="text-sm font-medium text-[var(--muted-foreground)]">
          저장된 곡
        </span>
        {totalCount > 0 && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            {totalCount}
          </span>
        )}
      </div>

      {/* Marquee container */}
      <div className="relative overflow-hidden">
        {/* Gradient masks for smooth edges */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-[var(--background)] to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-[var(--background)] to-transparent" />

        {/* Scrolling content */}
        <div className="marquee-container flex overflow-hidden">
          {isLoading ? (
            <div className="flex gap-3 px-2">
              <SongSkeleton />
              <SongSkeleton />
              <SongSkeleton />
              <SongSkeleton />
            </div>
          ) : (
            <div
              className="marquee-content flex gap-3"
              style={{
                animation: `marquee ${animationDuration}s linear infinite`,
              }}
            >
              {/* First set of songs */}
              {songs.map((song, index) => (
                <SongButton
                  key={`first-${song.artist}-${song.title}-${index}`}
                  song={song}
                  onSelect={onSelect}
                />
              ))}
              {/* Duplicate for seamless loop */}
              {songs.map((song, index) => (
                <SongButton
                  key={`second-${song.artist}-${song.title}-${index}`}
                  song={song}
                  onSelect={onSelect}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
