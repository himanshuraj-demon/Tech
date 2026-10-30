import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function populateLeaderboard() {
  const client = new Client({
    connectionString: databaseUrl,
    ssl: requiresSsl ? { rejectUnauthorized: false } : false
  });

  await client.connect();
  console.log('Connected to database.');

  console.log('Cleaning up existing hackathons points_participation to 0...');
  await client.query('UPDATE hackathons SET points_participation = 0 WHERE points_participation = 10');

  console.log('Fetching all hackathons and event registrations...');
  const hackathonsRes = await client.query('SELECT * FROM hackathons');
  const registrationsRes = await client.query('SELECT * FROM event_registrations');

  const hackathons = hackathonsRes.rows;
  const registrations = registrationsRes.rows;

  console.log(`Fetched ${hackathons.length} hackathons and ${registrations.length} registrations.`);

  // Create lookup map for hackathons
  const hackathonsMap = {};
  for (const h of hackathons) {
    hackathonsMap[h.id] = h;
  }

  // Compile leaderboard stats grouped by student email
  const leaderboardMap = {};

  for (const reg of registrations) {
    const email = reg.user_email.toLowerCase();
    const hackathon = hackathonsMap[reg.event_id];
    if (!hackathon) continue; // Skip if hackathon no longer exists

    // Only completed hackathons count towards the leaderboard
    if (hackathon.status !== 'completed') continue;

    const hasSubmission = !!(reg.github_link?.trim() || reg.docs_link?.trim());

    // Skip registrations that never submitted a project and aren't winners
    if (!hasSubmission && !reg.winner_place) continue;

    if (!leaderboardMap[email]) {
      leaderboardMap[email] = {
        email: reg.user_email,
        name: reg.user_name,
        score: 0,
        participations: 0,
        firstPlaces: 0,
        secondPlaces: 0,
        thirdPlaces: 0,
        events: []
      };
    }

    const student = leaderboardMap[email];
    student.participations += 1;

    let pointsEarned = 0;
    let placeName = null;

    if (reg.winner_place) {
      let winnerTiers = hackathon.winner_tiers;
      if (typeof winnerTiers === 'string') {
        try {
          winnerTiers = JSON.parse(winnerTiers);
        } catch {
          winnerTiers = [];
        }
      }

      const tier = Array.isArray(winnerTiers) ? winnerTiers.find((t) => t.rank === reg.winner_place) : null;

      if (tier) {
        pointsEarned = Number(tier.points);
        placeName = tier.name;
        if (reg.winner_place === 1) student.firstPlaces += 1;
        else if (reg.winner_place === 2) student.secondPlaces += 1;
        else if (reg.winner_place === 3) student.thirdPlaces += 1;
      } else {
        pointsEarned = hasSubmission ? Number(hackathon.points_participation || 0) : 0;
      }
    } else {
      pointsEarned = hasSubmission ? Number(hackathon.points_participation || 0) : 0;
    }

    student.score += pointsEarned;
    student.events.push({
      id: hackathon.id,
      title: hackathon.name,
      place: reg.winner_place,
      placeName: placeName,
      points: pointsEarned
    });
  }

  // Convert map to array and filter out users with 0 points
  const leaderboardList = Object.values(leaderboardMap).filter(student => student.score > 0);

  console.log(`Calculated leaderboard for ${leaderboardList.length} students with > 0 points.`);

  // Truncate the leaderboard table first
  console.log('Clearing leaderboard table...');
  await client.query('TRUNCATE TABLE leaderboard');

  // Insert rows into the leaderboard table
  console.log('Inserting pre-computed rows into leaderboard table...');
  for (const student of leaderboardList) {
    try {
      await client.query(
        `INSERT INTO leaderboard (email, name, score, participations, first_places, second_places, third_places, events, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
        [
          student.email.toLowerCase(),
          student.name,
          student.score,
          student.participations,
          student.firstPlaces,
          student.secondPlaces,
          student.thirdPlaces,
          JSON.stringify(student.events)
        ]
      );
    } catch (err) {
      console.error(`Failed to insert student ${student.email}:`, err);
    }
  }

  await client.end();
  console.log('Leaderboard table successfully populated!');
}

populateLeaderboard().catch((err) => {
  console.error('Population script failed:', err);
  process.exit(1);
});
