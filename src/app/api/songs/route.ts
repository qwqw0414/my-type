import { NextResponse } from 'next/server';
import {
  initializeDatabase,
  getAllSongs,
  isDatabaseConnected,
  type SongDetail,
} from '@/lib/db';

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
// API Handler - GET all songs
// ============================================================================

export async function GET(): Promise<NextResponse<SongsResponse>> {
  try {
    await ensureDatabaseInitialized();

    const isConnected = isDatabaseConnected();

    if (!isConnected) {
      return NextResponse.json({
        success: true,
        data: { songs: [], isConnected: false },
      });
    }

    const songs = await getAllSongs();

    return NextResponse.json({
      success: true,
      data: { songs, isConnected: true },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
