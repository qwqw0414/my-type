import { NextResponse } from 'next/server';
import {
  initializeDatabase,
  getRandomSongs,
  getSongCount,
  isDatabaseConnected,
  type SongInfo,
} from '@/lib/db';

// ============================================================================
// Types
// ============================================================================

interface RandomSongsResponse {
  success: boolean;
  data?: {
    songs: SongInfo[];
    totalCount: number;
  };
  error?: string;
}

// ============================================================================
// Database Initialization
// ============================================================================

let dbInitialized = false;

async function ensureDatabaseInitialized(): Promise<void> {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
}

// ============================================================================
// API Handler
// ============================================================================

export async function GET(): Promise<NextResponse<RandomSongsResponse>> {
  try {
    // Ensure database is initialized before checking connection
    await ensureDatabaseInitialized();

    if (!isDatabaseConnected()) {
      return NextResponse.json({
        success: true,
        data: { songs: [], totalCount: 0 },
      });
    }

    const [songs, totalCount] = await Promise.all([
      getRandomSongs(6),
      getSongCount(),
    ]);

    return NextResponse.json({
      success: true,
      data: { songs, totalCount },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
