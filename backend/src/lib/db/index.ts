import { neon } from '@neondatabase/serverless';
import { drizzle as drizzleNeon, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
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
  db: any | undefined;
};

let dbInstance: any;

if (isLocal) {
  if (!globalForDb.conn) {
    globalForDb.conn = new Pool({ connectionString: databaseUrl });
  }
  if (!globalForDb.db) {
    globalForDb.db = drizzlePg(globalForDb.conn, { schema });
  }
  dbInstance = globalForDb.db;
} else {
  const sql = neon(databaseUrl);
  dbInstance = drizzleNeon(sql, { schema });
}

export const db = dbInstance as NeonHttpDatabase<typeof schema>;

export * from './schema';
export * from './leaderboard';
