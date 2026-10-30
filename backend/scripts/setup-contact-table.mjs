import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL not found');
  process.exit(1);
}

const requiresSsl =
  !dbUrl.includes('sslmode=disable') &&
  (dbUrl.includes('sslmode=require') ||
   dbUrl.includes('neon.tech') ||
   dbUrl.includes('supabase.co'));

const client = new Client({
  connectionString: dbUrl,
  ssl: requiresSsl ? { rejectUnauthorized: false } : false
});

async function main() {
  await client.connect();
  console.log('Connected to database.');

  // 1. Check if contact_info table exists
  const checkRes = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'contact_info'
  `);

  if (checkRes.rows.length > 0) {
    console.log('Table contact_info already exists.');
  } else {
    console.log('Table contact_info does NOT exist. Creating it now...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "contact_info" (
        "id" text PRIMARY KEY DEFAULT 'default',
        "street" text NOT NULL DEFAULT '',
        "city" text NOT NULL DEFAULT '',
        "state" text NOT NULL DEFAULT '',
        "postal_code" text NOT NULL DEFAULT '',
        "country" text NOT NULL DEFAULT 'India',
        "phone" text NOT NULL DEFAULT '',
        "email" text NOT NULL DEFAULT '',
        "instagram" text NOT NULL DEFAULT '',
        "youtube" text NOT NULL DEFAULT '',
        "linkedin" text NOT NULL DEFAULT '',
        "facebook" text NOT NULL DEFAULT '',
        "modified_by" text NOT NULL DEFAULT 'System',
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      );
    `);
    console.log('Created contact_info table successfully.');
  }

  // 2. Check if default row exists
  const rowRes = await client.query(`SELECT * FROM "contact_info" WHERE "id" = 'default'`);
  if (rowRes.rows.length === 0) {
    console.log('No default contact info record found. Seeding from contact-info.json or defaults...');
    let initialData = {
      street: "323, Acad Block 4, IIT Gandhinagar",
      city: "Palaj, Gandhinagar",
      state: "Gujarat",
      postalCode: "382355",
      country: "India",
      phone: "+91-79-2395-2001",
      email: "technical.secretary@iitgn.ac.in",
      instagram: "https://www.instagram.com/tech_iitgn?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
      youtube: "https://www.youtube.com/@tech_iitgn",
      linkedin: "https://www.linkedin.com/school/tech-council-iitgn/",
      facebook: "https://www.facebook.com/tech.iitgn",
      modifiedBy: "System"
    };

    const jsonPath = path.join(process.cwd(), 'data', 'contact-info.json');
    if (fs.existsSync(jsonPath)) {
      try {
        const fileData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        if (fileData.address) {
          initialData.street = fileData.address.street || initialData.street;
          initialData.city = fileData.address.city || initialData.city;
          initialData.state = fileData.address.state || initialData.state;
          initialData.postalCode = fileData.address.postalCode || initialData.postalCode;
          initialData.country = fileData.address.country || initialData.country;
        }
        if (fileData.phone) initialData.phone = fileData.phone;
        if (fileData.email) initialData.email = fileData.email;
        if (fileData.socialMedia) {
          initialData.instagram = fileData.socialMedia.instagram || initialData.instagram;
          initialData.youtube = fileData.socialMedia.youtube || initialData.youtube;
          initialData.linkedin = fileData.socialMedia.linkedin || initialData.linkedin;
          initialData.facebook = fileData.socialMedia.facebook || initialData.facebook;
        }
        if (fileData.modifiedBy) initialData.modifiedBy = fileData.modifiedBy;
      } catch (err) {
        console.warn('Could not read contact-info.json:', err.message);
      }
    }

    await client.query(`
      INSERT INTO "contact_info" (
        "id", "street", "city", "state", "postal_code", "country",
        "phone", "email", "instagram", "youtube", "linkedin", "facebook",
        "modified_by", "created_at", "updated_at"
      ) VALUES (
        'default', $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10, $11,
        $12, now(), now()
      )
    `, [
      initialData.street,
      initialData.city,
      initialData.state,
      initialData.postalCode,
      initialData.country,
      initialData.phone,
      initialData.email,
      initialData.instagram,
      initialData.youtube,
      initialData.linkedin,
      initialData.facebook,
      initialData.modifiedBy
    ]);
    console.log('Seeded contact_info table successfully.');
  } else {
    console.log('Existing contact_info record:', rowRes.rows[0]);
  }

  // 3. Verify row
  const finalCheck = await client.query(`SELECT * FROM "contact_info" WHERE "id" = 'default'`);
  console.log('Current contact_info in DB:', finalCheck.rows[0]);

  await client.end();
}

main().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
