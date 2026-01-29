import { NextRequest, NextResponse } from 'next/server';
import {
  initializeDatabase,
  deleteSong,
  getLyricsById,
  isDatabaseConnected,
  type LyricsData,
} from '@/lib/db';

// ============================================================================
// Types
// ============================================================================

interface DeleteResponse {
  success: boolean;
  error?: string;
}

interface GetLyricsResponse {
  success: boolean;
  data?: LyricsData;
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
// API Handler - GET lyrics by id
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<GetLyricsResponse>> {
  try {
    await ensureDatabaseInitialized();

    if (!isDatabaseConnected()) {
      return NextResponse.json(
        { success: false, error: 'Database not connected' },
        { status: 503 }
      );
    }

    const { id } = await params;
    const songId = parseInt(id, 10);

    if (isNaN(songId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid song ID' },
        { status: 400 }
      );
    }

    const lyrics = await getLyricsById(songId);

    if (!lyrics) {
      return NextResponse.json(
        { success: false, error: 'Song not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: lyrics });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// ============================================================================
// API Handler - DELETE song by id
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<DeleteResponse>> {
  try {
    await ensureDatabaseInitialized();

    if (!isDatabaseConnected()) {
      return NextResponse.json(
        { success: false, error: 'Database not connected' },
        { status: 503 }
      );
    }

    const { id } = await params;
    const songId = parseInt(id, 10);

    if (isNaN(songId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid song ID' },
        { status: 400 }
      );
    }

    const deleted = await deleteSong(songId);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Song not found or could not be deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
