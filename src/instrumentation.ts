// ============================================================================
// Next.js Instrumentation
// This file runs once when the server starts
// ============================================================================

export async function register() {
  // Only run on server side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('[Instrumentation] Server starting...');

    const { initializeDatabase } = await import('@/lib/db');

    // Initialize database connection
    const dbConnected = await initializeDatabase();

    if (dbConnected) {
      console.log('[Instrumentation] Database ready for caching');
    } else {
      console.log('[Instrumentation] Running without database caching');
    }

    console.log('[Instrumentation] Server initialization completed');
  }
}
