import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Get the database URL from environment variables
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Only enable SSL for Neon/Supabase cloud providers or when explicitly required
const requiresSsl =
  !databaseUrl.includes('sslmode=disable') &&
  (databaseUrl.includes('sslmode=require') ||
   databaseUrl.includes('neon.tech') ||
   databaseUrl.includes('supabase.co'));

// Global cache to prevent multiple connections in development hot reload
const globalForDb = globalThis as unknown as {
  conn: Pool | undefined;
  db: NodePgDatabase<typeof schema> | undefined;
};

if (!globalForDb.conn) {
  globalForDb.conn = new Pool({
    connectionString: databaseUrl,
    ssl: requiresSsl ? { rejectUnauthorized: false } : false
  });
}

if (!globalForDb.db) {
  globalForDb.db = drizzle(globalForDb.conn, { schema });
}

export const db = globalForDb.db;

export * from './schema';
export * from './leaderboard';
export * from './contact';
