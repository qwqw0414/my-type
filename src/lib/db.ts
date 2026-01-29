import mysql, { Pool, RowDataPacket } from 'mysql2/promise';
import type { LyricsData } from '@/types/lyrics';

// Re-export for external use
export type { LyricsData };

// ============================================================================
// Constants
// ============================================================================

const LOG_PREFIX = '[DB]';

// ============================================================================
// Types
// ============================================================================

interface LyricsRow extends RowDataPacket {
  id: number;
  artist: string;
  title: string;
  language: string;
  lyrics_json: string;
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// Database Connection
// ============================================================================

let pool: Pool | null = null;
let isConnected = false;

function getDbConfig() {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'my_type',
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  };
}

// ============================================================================
// Initialization
// ============================================================================

async function ensureDatabaseExists(): Promise<boolean> {
  const config = getDbConfig();
  const dbName = config.database;

  console.log(`${LOG_PREFIX} Checking if database exists [database]=[${dbName}]`);

  try {
    // Connect without specifying database
    const tempPool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      waitForConnections: true,
      connectionLimit: 1,
    });

    // Check if database exists
    const [rows] = await tempPool.execute<RowDataPacket[]>(
      'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?',
      [dbName]
    );

    if (rows.length === 0) {
      console.log(`${LOG_PREFIX} Database does not exist, creating [database]=[${dbName}]`);
      await tempPool.execute(
        `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
      );
      console.log(`${LOG_PREFIX} Database created successfully [database]=[${dbName}]`);
    } else {
      console.log(`${LOG_PREFIX} Database already exists [database]=[${dbName}]`);
    }

    await tempPool.end();
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`${LOG_PREFIX} Failed to ensure database exists [error]=[${errorMessage}]`);
    return false;
  }
}

export async function initializeDatabase(): Promise<boolean> {
  if (isConnected && pool) {
    console.log(`${LOG_PREFIX} Database already initialized`);
    return true;
  }

  const config = getDbConfig();

  console.log(`${LOG_PREFIX} ========================================`);
  console.log(`${LOG_PREFIX} Starting database initialization`);
  console.log(`${LOG_PREFIX} [host]=[${config.host}] [port]=[${config.port}] [database]=[${config.database}]`);
  console.log(`${LOG_PREFIX} ========================================`);

  try {
    // Step 1: Ensure database exists
    const dbExists = await ensureDatabaseExists();
    if (!dbExists) {
      throw new Error('Failed to ensure database exists');
    }

    // Step 2: Create connection pool
    pool = mysql.createPool(config);

    // Step 3: Test connection
    console.log(`${LOG_PREFIX} Testing database connection...`);
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log(`${LOG_PREFIX} Database connection successful`);

    // Step 4: Create tables if not exists
    await createLyricsTable();

    isConnected = true;
    console.log(`${LOG_PREFIX} ========================================`);
    console.log(`${LOG_PREFIX} Database initialization completed`);
    console.log(`${LOG_PREFIX} ========================================`);
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn(`${LOG_PREFIX} ========================================`);
    console.warn(`${LOG_PREFIX} Database initialization failed`);
    console.warn(`${LOG_PREFIX} [error]=[${errorMessage}]`);
    console.warn(`${LOG_PREFIX} Application will continue without database caching`);
    console.warn(`${LOG_PREFIX} ========================================`);
    pool = null;
    isConnected = false;
    return false;
  }
}

async function createLyricsTable(): Promise<void> {
  if (!pool) return;

  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS lyrics_cache (
      id INT AUTO_INCREMENT PRIMARY KEY,
      artist VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      language VARCHAR(10) NOT NULL,
      lyrics_json JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_song (artist, title)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;

  try {
    await pool.execute(createTableSQL);
    console.log(`${LOG_PREFIX} Lyrics cache table ready`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`${LOG_PREFIX} Failed to create lyrics table [error]=[${errorMessage}]`);
  }
}

// ============================================================================
// Public API
// ============================================================================

export function isDatabaseConnected(): boolean {
  return isConnected && pool !== null;
}

export async function findLyricsByArtistAndTitle(
  artist: string,
  title: string
): Promise<LyricsData | null> {
  if (!pool || !isConnected) {
    return null;
  }

  try {
    const [rows] = await pool.execute<LyricsRow[]>(
      'SELECT * FROM lyrics_cache WHERE artist = ? AND title = ? LIMIT 1',
      [artist.toLowerCase().trim(), title.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      console.log(`${LOG_PREFIX} Cache miss [artist]=[${artist}] [title]=[${title}]`);
      return null;
    }

    const row = rows[0];

    // MySQL JSON type may return as object or string depending on driver version
    let lyricsData: LyricsData;
    if (typeof row.lyrics_json === 'string') {
      lyricsData = JSON.parse(row.lyrics_json);
    } else {
      lyricsData = row.lyrics_json as unknown as LyricsData;
    }

    console.log(`${LOG_PREFIX} Cache hit [artist]=[${artist}] [title]=[${title}] [linesCount]=[${lyricsData.lines?.length ?? 0}]`);
    return lyricsData;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`${LOG_PREFIX} Error finding lyrics [error]=[${errorMessage}]`);
    return null;
  }
}

export async function saveLyrics(lyricsData: LyricsData): Promise<boolean> {
  if (!pool || !isConnected) {
    return false;
  }

  try {
    const insertSQL = `
      INSERT INTO lyrics_cache (artist, title, language, lyrics_json)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        language = VALUES(language),
        lyrics_json = VALUES(lyrics_json),
        updated_at = CURRENT_TIMESTAMP
    `;

    await pool.execute(insertSQL, [
      lyricsData.artist.toLowerCase().trim(),
      lyricsData.title.toLowerCase().trim(),
      lyricsData.language,
      JSON.stringify(lyricsData),
    ]);

    console.log(`${LOG_PREFIX} Lyrics saved [artist]=[${lyricsData.artist}] [title]=[${lyricsData.title}]`);
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`${LOG_PREFIX} Error saving lyrics [error]=[${errorMessage}]`);
    return false;
  }
}

// ============================================================================
// Song Types
// ============================================================================

export interface SongInfo {
  artist: string;
  title: string;
}

export interface SongDetail {
  id: number;
  artist: string;
  title: string;
  language: string;
  linesCount: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Song Management
// ============================================================================

export async function getAllSongs(): Promise<SongDetail[]> {
  if (!pool || !isConnected) {
    return [];
  }

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, artist, title, language, 
              JSON_LENGTH(lyrics_json, '$.lines') as lines_count,
              created_at, updated_at 
       FROM lyrics_cache 
       ORDER BY updated_at DESC`
    );

    const songs: SongDetail[] = rows.map((row) => ({
      id: row.id,
      artist: row.artist,
      title: row.title,
      language: row.language,
      linesCount: row.lines_count ?? 0,
      createdAt: row.created_at?.toISOString() ?? '',
      updatedAt: row.updated_at?.toISOString() ?? '',
    }));

    console.log(`${LOG_PREFIX} All songs fetched [count]=[${songs.length}]`);
    return songs;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`${LOG_PREFIX} Error fetching all songs [error]=[${errorMessage}]`);
    return [];
  }
}

export async function deleteSong(id: number): Promise<boolean> {
  if (!pool || !isConnected) {
    return false;
  }

  try {
    const [result] = await pool.execute<RowDataPacket[]>(
      'DELETE FROM lyrics_cache WHERE id = ?',
      [id]
    );

    const affectedRows = (result as unknown as { affectedRows: number }).affectedRows;
    console.log(`${LOG_PREFIX} Song deleted [id]=[${id}] [affectedRows]=[${affectedRows}]`);
    return affectedRows > 0;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`${LOG_PREFIX} Error deleting song [id]=[${id}] [error]=[${errorMessage}]`);
    return false;
  }
}

export async function getLyricsById(id: number): Promise<LyricsData | null> {
  if (!pool || !isConnected) {
    return null;
  }

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT lyrics_json FROM lyrics_cache WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    let lyricsData: LyricsData;

    if (typeof row.lyrics_json === 'string') {
      lyricsData = JSON.parse(row.lyrics_json);
    } else {
      lyricsData = row.lyrics_json;
    }

    console.log(`${LOG_PREFIX} Lyrics fetched by id [id]=[${id}]`);
    return lyricsData;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`${LOG_PREFIX} Error fetching lyrics by id [id]=[${id}] [error]=[${errorMessage}]`);
    return null;
  }
}

// ============================================================================
// Random Songs
// ============================================================================

export async function getRandomSongs(limit: number = 5): Promise<SongInfo[]> {
  if (!pool || !isConnected) {
    console.log(`${LOG_PREFIX} getRandomSongs: Database not connected [pool]=[${!!pool}] [isConnected]=[${isConnected}]`);
    return [];
  }

  try {
    // Use query() instead of execute() for LIMIT with dynamic value
    // MySQL prepared statements don't handle LIMIT parameters well
    const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT artist, title FROM lyrics_cache ORDER BY RAND() LIMIT ${safeLimit}`
    );

    const songs: SongInfo[] = rows.map((row) => ({
      artist: row.artist,
      title: row.title,
    }));

    console.log(`${LOG_PREFIX} Random songs fetched [count]=[${songs.length}]`);
    return songs;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`${LOG_PREFIX} Error fetching random songs [error]=[${errorMessage}]`);
    return [];
  }
}

export async function getSongCount(): Promise<number> {
  if (!pool || !isConnected) {
    return 0;
  }

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM lyrics_cache'
    );
    return rows[0]?.count ?? 0;
  } catch (error) {
    return 0;
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    isConnected = false;
    console.log(`${LOG_PREFIX} Database connection closed`);
  }
}
