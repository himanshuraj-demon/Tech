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

// Locate backup folder
function findBackupDir() {
  const candidates = [
    path.resolve(__dirname, '../backups'),
    path.resolve(__dirname, '../backup'),
    path.resolve(process.cwd(), 'backups'),
    path.resolve(process.cwd(), 'backup'),
    path.resolve(process.cwd(), 'backend/backups'),
    path.resolve(process.cwd(), 'backend/backup')
  ];

  for (const dir of candidates) {
    if (fs.existsSync(dir) && fs.existsSync(path.join(dir, 'events.json'))) {
      return dir;
    }
  }
  return candidates[0];
}

// Table schemas to auto-create if running against a fresh database
const tableSchemas = [
  {
    name: 'admin_emails',
    ddl: `
      CREATE TABLE IF NOT EXISTS "admin_emails" (
        "email" text PRIMARY KEY NOT NULL,
        "modified_by" text DEFAULT 'system' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `
  },
  {
    name: 'contact_info',
    ddl: `
      CREATE TABLE IF NOT EXISTS "contact_info" (
        "id" text PRIMARY KEY DEFAULT 'default' NOT NULL,
        "street" text DEFAULT '' NOT NULL,
        "city" text DEFAULT '' NOT NULL,
        "state" text DEFAULT '' NOT NULL,
        "postal_code" text DEFAULT '' NOT NULL,
        "country" text DEFAULT 'India' NOT NULL,
        "phone" text DEFAULT '' NOT NULL,
        "email" text DEFAULT '' NOT NULL,
        "instagram" text DEFAULT '' NOT NULL,
        "youtube" text DEFAULT '' NOT NULL,
        "linkedin" text DEFAULT '' NOT NULL,
        "facebook" text DEFAULT '' NOT NULL,
        "modified_by" text DEFAULT 'System' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `
  },
  {
    name: 'inter_iit_achievements',
    ddl: `
      CREATE TABLE IF NOT EXISTS "inter_iit_achievements" (
        "id" text PRIMARY KEY NOT NULL,
        "achievement_type" text NOT NULL,
        "competition_name" text NOT NULL,
        "inter_iit_edition" text NOT NULL,
        "year" text NOT NULL,
        "host_iit" text NOT NULL,
        "location" text NOT NULL,
        "ranking" integer,
        "achievement_description" text NOT NULL,
        "significance" text NOT NULL,
        "competition_category" text NOT NULL,
        "achievement_date" text NOT NULL,
        "points" integer,
        "status" text NOT NULL,
        "team_members" jsonb NOT NULL,
        "supporting_documents" jsonb NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `
  },
  {
    name: 'events',
    ddl: `
      CREATE TABLE IF NOT EXISTS "events" (
        "id" text PRIMARY KEY NOT NULL,
        "title" text NOT NULL,
        "description" text NOT NULL,
        "date" text NOT NULL,
        "location" text NOT NULL,
        "duration" text NOT NULL,
        "participants" text NOT NULL,
        "organizer" text NOT NULL,
        "category" text NOT NULL,
        "highlights" jsonb NOT NULL,
        "gallery" jsonb NOT NULL,
        "draft" boolean DEFAULT false,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `
  },
  {
    name: 'team_members',
    ddl: `
      CREATE TABLE IF NOT EXISTS "team_members" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "position" text NOT NULL,
        "email" text NOT NULL,
        "initials" text NOT NULL,
        "gradient_from" text NOT NULL,
        "gradient_to" text NOT NULL,
        "category" text NOT NULL,
        "photo_path" text,
        "is_secretary" boolean DEFAULT false NOT NULL,
        "is_coordinator" boolean DEFAULT false NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "team_members_email_unique" UNIQUE("email")
      );
    `
  },
  {
    name: 'clubs',
    ddl: `
      CREATE TABLE IF NOT EXISTS "clubs" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "description" text NOT NULL,
        "long_description" text NOT NULL,
        "type" text NOT NULL,
        "category" text NOT NULL,
        "members" text NOT NULL,
        "established" text NOT NULL,
        "email" text NOT NULL,
        "achievements" jsonb NOT NULL,
        "projects" jsonb NOT NULL,
        "team" jsonb NOT NULL,
        "logo_path" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `
  },
  {
    name: 'torque_magazines',
    ddl: `
      CREATE TABLE IF NOT EXISTS "torque_magazines" (
        "id" text PRIMARY KEY NOT NULL,
        "year" text NOT NULL,
        "title" text NOT NULL,
        "description" text NOT NULL,
        "pages" integer NOT NULL,
        "articles" integer NOT NULL,
        "featured" text NOT NULL,
        "file_path" text NOT NULL,
        "file_name" text NOT NULL,
        "file_size" integer NOT NULL,
        "cover_photo" text,
        "cover_photo_file_name" text,
        "is_latest" boolean DEFAULT false NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `
  },
  {
    name: 'hackathons',
    ddl: `
      CREATE TABLE IF NOT EXISTS "hackathons" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "description" text NOT NULL,
        "long_description" text NOT NULL,
        "start_date" text DEFAULT '' NOT NULL,
        "end_date" text DEFAULT '' NOT NULL,
        "location" text NOT NULL,
        "category" text NOT NULL,
        "status" text NOT NULL,
        "registration_link" text,
        "organizer_name" text,
        "organizer_email" text,
        "organizer_phone" text,
        "organizer_website" text,
        "requirements" text,
        "eligibility" text,
        "team_size" text,
        "special_prizes" text,
        "timeline" text,
        "important_notes" text,
        "themes" text,
        "juding_criteria" text,
        "submission_guidelines" text,
        "draft" boolean DEFAULT false NOT NULL,
        "team_required" boolean DEFAULT false NOT NULL,
        "submission_fields" jsonb DEFAULT '[]'::jsonb NOT NULL,
        "winner_tiers" jsonb DEFAULT '[]'::jsonb NOT NULL,
        "points_participation" integer DEFAULT 0 NOT NULL,
        "deleted" boolean DEFAULT false NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `
  },
  {
    name: 'users',
    ddl: `
      CREATE TABLE IF NOT EXISTS "users" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "email" text NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "users_email_unique" UNIQUE("email")
      );
    `
  },
  {
    name: 'event_registrations',
    ddl: `
      CREATE TABLE IF NOT EXISTS "event_registrations" (
        "id" text PRIMARY KEY NOT NULL,
        "event_id" text NOT NULL,
        "user_id" text NOT NULL,
        "user_name" text NOT NULL,
        "user_email" text NOT NULL,
        "degree_type" text NOT NULL,
        "year_of_joining" text NOT NULL,
        "branch_name" text NOT NULL,
        "team_members" jsonb,
        "winner_place" integer,
        "github_link" text,
        "docs_link" text,
        "submission_data" jsonb DEFAULT '{}'::jsonb,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `
  },
  {
    name: 'leaderboard',
    ddl: `
      CREATE TABLE IF NOT EXISTS "leaderboard" (
        "email" text PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "score" integer DEFAULT 0 NOT NULL,
        "participations" integer DEFAULT 0 NOT NULL,
        "first_places" integer DEFAULT 0 NOT NULL,
        "second_places" integer DEFAULT 0 NOT NULL,
        "third_places" integer DEFAULT 0 NOT NULL,
        "events" jsonb DEFAULT '[]'::jsonb NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `
  }
];

// Compatibility migrations for existing tables
const migrations = [
  'ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "draft" boolean DEFAULT false;',
  'ALTER TABLE "hackathons" ADD COLUMN IF NOT EXISTS "start_date" text DEFAULT \'\' NOT NULL;',
  'ALTER TABLE "hackathons" ADD COLUMN IF NOT EXISTS "end_date" text DEFAULT \'\' NOT NULL;',
  'ALTER TABLE "hackathons" ADD COLUMN IF NOT EXISTS "winner_tiers" jsonb DEFAULT \'[]\'::jsonb NOT NULL;',
  'ALTER TABLE "hackathons" ADD COLUMN IF NOT EXISTS "submission_fields" jsonb DEFAULT \'[]\'::jsonb NOT NULL;',
  'ALTER TABLE "hackathons" ADD COLUMN IF NOT EXISTS "points_participation" integer DEFAULT 0 NOT NULL;',
  'ALTER TABLE "hackathons" ADD COLUMN IF NOT EXISTS "deleted" boolean DEFAULT false NOT NULL;',
  'ALTER TABLE "hackathons" ADD COLUMN IF NOT EXISTS "draft" boolean DEFAULT false NOT NULL;',
  'ALTER TABLE "hackathons" ADD COLUMN IF NOT EXISTS "team_required" boolean DEFAULT false NOT NULL;',
  'ALTER TABLE "event_registrations" ADD COLUMN IF NOT EXISTS "github_link" text;',
  'ALTER TABLE "event_registrations" ADD COLUMN IF NOT EXISTS "docs_link" text;',
  'ALTER TABLE "event_registrations" ADD COLUMN IF NOT EXISTS "submission_data" jsonb DEFAULT \'{}\'::jsonb;'
];

const tablesInOrder = [
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

async function runRestore() {
  console.log('Connecting to PostgreSQL database...');
  console.log(`Target: ${databaseUrl.replace(/:[^:@]*@/, ':****@')}`);
  console.log(`SSL enabled: ${requiresSsl}`);

  const client = new Client({
    connectionString: databaseUrl,
    ssl: requiresSsl ? { rejectUnauthorized: false } : false
  });

  await client.connect();
  console.log('Connected to database successfully.');

  const backupDir = findBackupDir();
  console.log(`Using backup files from: ${backupDir}`);

  // 1. Ensure all tables exist
  console.log('Verifying / creating database tables...');
  for (const table of tableSchemas) {
    await client.query(table.ddl);
  }

  // 2. Apply column migrations if needed
  for (const migration of migrations) {
    try {
      await client.query(migration);
    } catch {
      // Ignore migration errors if column already exists
    }
  }
  console.log('All table schemas and columns verified.');

  // 3. Restore data table by table
  for (const table of tablesInOrder) {
    try {
      const filePath = path.join(backupDir, `${table}.json`);
      if (!fs.existsSync(filePath)) {
        console.log(`- Skipping table: ${table} (no backup file found)`);
        continue;
      }

      const fileData = fs.readFileSync(filePath, 'utf-8');
      const rows = JSON.parse(fileData);

      if (!Array.isArray(rows) || rows.length === 0) {
        console.log(`- Table ${table}: backup has 0 rows. Truncating table...`);
        await client.query(`TRUNCATE TABLE "${table}" CASCADE`);
        continue;
      }

      // Truncate existing data first to prevent duplicates
      await client.query(`TRUNCATE TABLE "${table}" CASCADE`);

      // Determine all unique column names present across rows
      const columnSet = new Set();
      for (const row of rows) {
        for (const col of Object.keys(row)) {
          columnSet.add(col);
        }
      }
      const columns = Array.from(columnSet);
      const columnSql = columns.map(c => `"${c}"`).join(', ');

      // Insert in batches of 50
      const batchSize = 50;
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        const valuePlaceholders = [];
        const flatValues = [];

        let paramIndex = 1;
        for (const row of batch) {
          const rowPlaceholders = [];
          for (const col of columns) {
            rowPlaceholders.push(`$${paramIndex++}`);
            const val = row[col];

            if (val === undefined) {
              flatValues.push(null);
            } else if (val !== null && typeof val === 'object') {
              flatValues.push(JSON.stringify(val));
            } else {
              flatValues.push(val);
            }
          }
          valuePlaceholders.push(`(${rowPlaceholders.join(', ')})`);
        }

        const insertQuery = `INSERT INTO "${table}" (${columnSql}) VALUES ${valuePlaceholders.join(', ')}`;
        await client.query(insertQuery, flatValues);
      }

      console.log(`✓ Restored ${rows.length} rows to "${table}"`);
    } catch (error) {
      console.error(`✗ Error restoring table "${table}":`, error.message);
      throw error;
    }
  }

  // Verification step
  console.log('\n--- RESTORE VERIFICATION ---');
  for (const table of tablesInOrder) {
    const res = await client.query(`SELECT COUNT(*)::int as count FROM "${table}"`);
    console.log(`Table ${table.padEnd(24)}: ${res.rows[0].count} rows`);
  }

  await client.end();
  console.log('\nDatabase restore completed successfully with 0 errors!');
}

runRestore().catch((err) => {
  console.error('\nRestore script failed:', err);
  process.exit(1);
});
