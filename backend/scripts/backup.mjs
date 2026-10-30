import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Resolve current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('Error: DATABASE_URL is not set in environment.');
  process.exit(1);
}

const requiresSsl =
  !databaseUrl.includes('sslmode=disable') &&
  (databaseUrl.includes('sslmode=require') ||
   databaseUrl.includes('neon.tech') ||
   databaseUrl.includes('supabase.co'));

const tables = [
  'admin_emails',
  'contact_info',
  'inter_iit_achievements',
  'events',
  'team_members',
  'clubs',
  'torque_magazines',
  'hackathons',
  'users',
  'event_registrations',
  'leaderboard'
];

async function runBackup() {
  console.log('Connecting to PostgreSQL database...');
  console.log(`Target: ${databaseUrl.replace(/:[^:@]*@/, ':****@')}`);
  console.log(`SSL enabled: ${requiresSsl}`);

  const client = new Client({
    connectionString: databaseUrl,
    ssl: requiresSsl ? { rejectUnauthorized: false } : false
  });

  await client.connect();
  console.log('Connected to database successfully.');

  const backupDirs = [
    path.resolve(__dirname, '../backups'),
    path.resolve(__dirname, '../backup')
  ];

  for (const dir of backupDirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  console.log(`Starting backup of database to: ${backupDirs[0]}`);

  for (const table of tables) {
    try {
      console.log(`Backing up table: ${table}...`);
      const res = await client.query(`SELECT * FROM "${table}"`);
      const rows = res.rows;

      for (const dir of backupDirs) {
        const filePath = path.join(dir, `${table}.json`);
        fs.writeFileSync(filePath, JSON.stringify(rows, null, 2), 'utf-8');
      }

      console.log(`✓ Saved ${rows.length} rows from table ${table}`);
    } catch (error) {
      console.error(`✗ Error backing up table ${table}:`, error.message);
    }
  }

  await client.end();
  console.log('\nDatabase backup complete! Backups saved to backend/backups and backend/backup.');
}

runBackup().catch((err) => {
  console.error('Backup script failed:', err);
  process.exit(1);
});
