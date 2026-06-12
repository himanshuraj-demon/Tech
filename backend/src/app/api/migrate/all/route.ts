import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { clubs, teamMembers, events, interIITAchievements } from '@/lib/db/schema';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Helper for safe integer parsing
const safeParseInt = (val: any): number | null => {
  if (val === undefined || val === null || val === '') return null;
  const num = parseInt(val.toString(), 10);
  return isNaN(num) ? null : num;
};

// Helper for safe date parsing
const safeParseDate = (dateVal: any, defaultDate: Date = new Date()): Date => {
  if (!dateVal) return defaultDate;
  const parsed = new Date(dateVal);
  return isNaN(parsed.getTime()) ? defaultDate : parsed;
};

export async function POST() {
  const summary: Record<string, any> = {};
  const errors: any[] = [];

  try {
    console.log('🚀 Starting Unified Database Seeding/Migration...');

    // 1. CLUBS MIGRATION
    const clubsPath = join(process.cwd(), 'data', 'clubs.json');
    if (existsSync(clubsPath)) {
      try {
        console.log('⏳ Migrating clubs...');
        const clubsData = JSON.parse(readFileSync(clubsPath, 'utf-8'));
        const clubsList = Object.values(clubsData);

        // Clear existing
        await db.delete(clubs);

        // Prepare and Insert
        let inserted = 0;
        for (const item of clubsList as any[]) {
          await db.insert(clubs).values({
            id: item.id,
            name: item.name,
            description: item.description,
            longDescription: item.longDescription,
            type: item.type,
            category: item.category,
            members: item.members,
            established: item.established,
            email: item.email,
            achievements: item.achievements || [],
            projects: item.projects || [],
            team: item.team || [],
            logoPath: item.logoPath || null,
            createdAt: safeParseDate(item.createdAt, new Date('2023-01-01T00:00:00Z')),
            updatedAt: safeParseDate(item.updatedAt),
          });
          inserted++;
        }
        summary.clubs = { total: clubsList.length, inserted };
        console.log(`✅ Clubs migrated successfully (${inserted} records)`);
      } catch (err: any) {
        console.error('❌ Clubs migration failed:', err);
        errors.push({ step: 'clubs', error: err.message });
      }
    } else {
      summary.clubs = { status: 'skipped', reason: 'File data/clubs.json not found' };
    }

    // 2. TEAM MEMBERS MIGRATION
    const teamPath = join(process.cwd(), 'data', 'team.json');
    if (existsSync(teamPath)) {
      try {
        console.log('⏳ Migrating team members...');
        const teamData = JSON.parse(readFileSync(teamPath, 'utf-8'));
        const teamList = Object.values(teamData);

        // Clear existing
        await db.delete(teamMembers);

        // Prepare and Insert
        let inserted = 0;
        for (const item of teamList as any[]) {
          await db.insert(teamMembers).values({
            id: item.id,
            name: item.name,
            position: item.position,
            email: item.email,
            initials: item.initials,
            gradientFrom: item.gradientFrom,
            gradientTo: item.gradientTo,
            category: item.category,
            photoPath: item.photoPath || null,
            isSecretary: item.isSecretary || false,
            isCoordinator: item.isCoordinator || false,
            createdAt: safeParseDate(item.createdAt, new Date('2023-01-01T00:00:00Z')),
            updatedAt: safeParseDate(item.updatedAt),
          });
          inserted++;
        }
        summary.teamMembers = { total: teamList.length, inserted };
        console.log(`✅ Team members migrated successfully (${inserted} records)`);
      } catch (err: any) {
        console.error('❌ Team members migration failed:', err);
        errors.push({ step: 'teamMembers', error: err.message });
      }
    } else {
      summary.teamMembers = { status: 'skipped', reason: 'File data/team.json not found' };
    }

    // 3. EVENTS MIGRATION
    const eventsPath = join(process.cwd(), 'data', 'events.json');
    if (existsSync(eventsPath)) {
      try {
        console.log('⏳ Migrating events...');
        const eventsData = JSON.parse(readFileSync(eventsPath, 'utf-8'));
        const eventsList = Object.values(eventsData);

        // Clear existing
        await db.delete(events);

        // Prepare and Insert
        let inserted = 0;
        for (const item of eventsList as any[]) {
          await db.insert(events).values({
            id: item.id,
            title: item.title,
            description: item.description,
            date: item.date,
            location: item.location,
            duration: item.duration,
            participants: item.participants,
            organizer: item.organizer,
            category: item.category,
            highlights: item.highlights || [],
            gallery: item.gallery || [],
            draft: item.draft || false,
            createdAt: safeParseDate(item.createdAt, new Date('2023-01-01T00:00:00Z')),
            updatedAt: safeParseDate(item.updatedAt),
          });
          inserted++;
        }
        summary.events = { total: eventsList.length, inserted };
        console.log(`✅ Events migrated successfully (${inserted} records)`);
      } catch (err: any) {
        console.error('❌ Events migration failed:', err);
        errors.push({ step: 'events', error: err.message });
      }
    } else {
      summary.events = { status: 'skipped', reason: 'File data/events.json not found' };
    }

    // 4. INTER-IIT ACHIEVEMENTS MIGRATION
    const achievementsPath = join(process.cwd(), 'data', 'inter-iit-achievements.json');
    if (existsSync(achievementsPath)) {
      try {
        console.log('⏳ Migrating achievements...');
        const achievementsData = JSON.parse(readFileSync(achievementsPath, 'utf-8'));
        const achievementsList = Object.values(achievementsData);

        // Clear existing
        await db.delete(interIITAchievements);

        // Prepare and Insert
        let inserted = 0;
        for (const item of achievementsList as any[]) {
          await db.insert(interIITAchievements).values({
            id: item.id,
            achievementType: item.achievementType,
            competitionName: item.competitionName,
            interIITEdition: item.interIITEdition,
            year: item.year,
            hostIIT: item.hostIIT,
            location: item.location,
            ranking: safeParseInt(item.ranking),
            achievementDescription: item.achievementDescription,
            significance: item.significance,
            competitionCategory: item.competitionCategory,
            achievementDate: item.achievementDate,
            points: safeParseInt(item.points),
            status: item.status || 'verified',
            teamMembers: item.teamMembers || [],
            supportingDocuments: item.supportingDocuments || [],
            createdAt: safeParseDate(item.createdAt, new Date('2023-01-01T00:00:00Z')),
            updatedAt: safeParseDate(item.updatedAt),
          });
          inserted++;
        }
        summary.interIITAchievements = { total: achievementsList.length, inserted };
        console.log(`✅ Achievements migrated successfully (${inserted} records)`);
      } catch (err: any) {
        console.error('❌ Achievements migration failed:', err);
        errors.push({ step: 'interIITAchievements', error: err.message });
      }
    } else {
      summary.interIITAchievements = { status: 'skipped', reason: 'File data/inter-iit-achievements.json not found' };
    }

    return NextResponse.json({
      success: errors.length === 0,
      message: errors.length === 0 ? 'All data files uploaded successfully' : 'Migration completed with errors',
      summary,
      errors: errors.length > 0 ? errors : null
    });

  } catch (error: any) {
    console.error('💥 Critical Migration Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Critical migration failure',
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

// Support GET requests too so users can trigger it via simple browser visits
export async function GET() {
  return NextResponse.json({
    message: "Use POST method to trigger the database migration",
    endpoint: "/api/migrate/all",
    method: "POST",
    note: "Sending a POST request will delete existing records in Neon tables and reload them from local JSON files."
  });
}
