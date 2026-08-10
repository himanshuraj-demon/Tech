import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Get the database URL from environment variables
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const isLocal = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');

// Global cache to prevent multiple connections in development hot reload
const globalForDb = globalThis as unknown as {
  conn: Pool | undefined;
  db: NodePgDatabase<typeof schema> | undefined;
};

if (!globalForDb.conn) {
  globalForDb.conn = new Pool({
    connectionString: databaseUrl,
    ssl: isLocal ? false : { rejectUnauthorized: false }
  });
}

if (!globalForDb.db) {
  globalForDb.db = drizzle(globalForDb.conn, { schema });
}

export const db = globalForDb.db;

export * from './schema';
export * from './leaderboard';
