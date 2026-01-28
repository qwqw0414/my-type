import { GoogleGenAI, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import type { LyricsRequest, LyricsResponse, LyricsData } from '@/types/lyrics';
import {
  initializeDatabase,
  isDatabaseConnected,
  findLyricsByArtistAndTitle,
  saveLyrics,
} from '@/lib/db';

// ============================================================================
// Constants
// ============================================================================

const LOG_PREFIX = '[lyrics API]';
const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

// ============================================================================
// Helper Functions
// ============================================================================

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

function log(requestId: string, message: string, data?: Record<string, unknown>): void {
  const timestamp = new Date().toISOString();
  const dataStr = data ? ` ${Object.entries(data).map(([k, v]) => `[${k}]=[${JSON.stringify(v)}]`).join(' ')}` : '';
  console.log(`${LOG_PREFIX} [${timestamp}] [requestId]=[${requestId}] ${message}${dataStr}`);
}

function logError(requestId: string, message: string, error: unknown): void {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`${LOG_PREFIX} [${timestamp}] [requestId]=[${requestId}] ${message} [error]=[${errorMessage}]`);
}

const LYRICS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: 'The title of the song',
    },
    artist: {
      type: Type.STRING,
      description: 'The artist/singer name',
    },
    language: {
      type: Type.STRING,
      enum: ['ko', 'en', 'mixed'],
      description: 'Primary language of the lyrics',
    },
    lines: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          index: {
            type: Type.NUMBER,
            description: 'Line number starting from 0',
          },
          text: {
            type: Type.STRING,
            description: 'The lyric text for this line',
          },
        },
        required: ['index', 'text'],
      },
      description: 'Array of lyric lines',
    },
  },
  required: ['title', 'artist', 'language', 'lines'],
};

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

export async function POST(request: NextRequest): Promise<NextResponse<LyricsResponse>> {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    // Initialize database connection (only once)
    await ensureDatabaseInitialized();

    const body = (await request.json()) as LyricsRequest;
    const { artist, title } = body;

    log(requestId, 'Request received', { artist, title, dbConnected: isDatabaseConnected() });

    if (!artist || !title) {
      log(requestId, 'Validation failed: missing required fields');
      return NextResponse.json(
        { success: false, error: 'Artist and title are required' },
        { status: 400 }
      );
    }

    // Step 0: Check database cache first
    if (isDatabaseConnected()) {
      log(requestId, 'Step 0: Checking database cache');
      const cachedLyrics = await findLyricsByArtistAndTitle(artist, title);

      if (cachedLyrics) {
        const totalDuration = Date.now() - startTime;
        log(requestId, 'Cache hit - returning cached lyrics', {
          totalDuration: `${totalDuration}ms`,
          linesCount: cachedLyrics.lines?.length ?? 0,
          source: 'database',
        });

        return NextResponse.json({
          success: true,
          data: cachedLyrics,
        });
      }

      log(requestId, 'Cache miss - proceeding with LLM request');
    } else {
      log(requestId, 'Database not connected - skipping cache check');
    }

    const projectId = process.env.GOOGLE_CLOUD_PROJECT;
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    const model = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

    log(requestId, 'Configuration loaded', { model, location });

    if (!projectId) {
      log(requestId, 'Configuration error: missing project ID');
      return NextResponse.json(
        { success: false, error: 'Google Cloud project not configured' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
      vertexai: true,
      project: projectId,
      location: location,
    });

    // Step 1: Search for lyrics using Google Search Grounding
    log(requestId, 'Step 1: Starting lyrics search with Google Grounding');
    const step1StartTime = Date.now();

    const searchPrompt = `Search for the complete lyrics of the song "${title}" by "${artist}".
Return ONLY the original lyrics text, line by line, without any explanation, commentary, or romanization.`;

    const searchResponse = await ai.models.generateContent({
      model: model,
      contents: searchPrompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const rawLyrics = searchResponse.text ?? '';
    const step1Duration = Date.now() - step1StartTime;

    log(requestId, 'Step 1: Search completed', {
      duration: `${step1Duration}ms`,
      rawLyricsLength: rawLyrics.length,
    });
    log(requestId, 'Step 1: LLM Response (raw lyrics)');
    console.log(`${LOG_PREFIX} [requestId]=[${requestId}] --- RAW LYRICS START ---`);
    console.log(rawLyrics);
    console.log(`${LOG_PREFIX} [requestId]=[${requestId}] --- RAW LYRICS END ---`);

    // Step 2: Structure the lyrics using JSON schema
    log(requestId, 'Step 2: Starting lyrics structuring');
    const step2StartTime = Date.now();

    const structurePrompt = `Convert the following lyrics into a structured JSON format.

Lyrics:
${rawLyrics}

Song Info:
- Title: ${title}
- Artist: ${artist}

Instructions:
- Return ONLY the original lyrics text line by line
- Each line should be a meaningful segment (not word by word)
- Do NOT include romanization or any translation
- Detect the language: 'ko' for Korean, 'en' for English, 'mixed' for mixed languages
- Do not include section markers like [Verse], [Chorus] etc in the text
- If lyrics are empty, return empty lines array`;

    const structureResponse = await ai.models.generateContent({
      model: model,
      contents: structurePrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: LYRICS_SCHEMA,
      },
    });

    const structuredText = structureResponse.text ?? '{}';
    const lyricsData = JSON.parse(structuredText) as LyricsData;
    const step2Duration = Date.now() - step2StartTime;

    log(requestId, 'Step 2: Structuring completed', {
      duration: `${step2Duration}ms`,
      linesCount: lyricsData.lines?.length ?? 0,
      language: lyricsData.language,
    });
    log(requestId, 'Step 2: LLM Response (structured JSON)');
    console.log(`${LOG_PREFIX} [requestId]=[${requestId}] --- STRUCTURED JSON START ---`);
    console.log(structuredText);
    console.log(`${LOG_PREFIX} [requestId]=[${requestId}] --- STRUCTURED JSON END ---`);

    // Step 3: Save to database cache
    if (isDatabaseConnected() && lyricsData.lines && lyricsData.lines.length > 0) {
      log(requestId, 'Step 3: Saving lyrics to database cache');
      const saved = await saveLyrics(lyricsData);
      log(requestId, `Step 3: Save ${saved ? 'successful' : 'failed'}`);
    }

    const totalDuration = Date.now() - startTime;
    log(requestId, 'Request completed successfully', {
      totalDuration: `${totalDuration}ms`,
      step1Duration: `${step1Duration}ms`,
      step2Duration: `${step2Duration}ms`,
      source: 'llm',
    });

    return NextResponse.json({
      success: true,
      data: lyricsData,
    });
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    logError(requestId, `Request failed after ${totalDuration}ms`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
