import { db, interIITAchievements, type InterIITAchievement, type NewInterIITAchievement } from '@/lib/db';
import { eq } from 'drizzle-orm';

function normalizeAchievement(ach: any): InterIITAchievement {
  let teamMembers = ach.teamMembers;
  if (typeof teamMembers === 'string') {
    try {
      teamMembers = JSON.parse(teamMembers);
    } catch {
      teamMembers = [];
    }
  }

  let supportingDocuments = ach.supportingDocuments;
  if (typeof supportingDocuments === 'string') {
    try {
      supportingDocuments = JSON.parse(supportingDocuments);
    } catch {
      supportingDocuments = [];
    }
  }

  return {
    ...ach,
    teamMembers: Array.isArray(teamMembers) ? teamMembers : [],
    supportingDocuments: Array.isArray(supportingDocuments) ? supportingDocuments : [],
    ranking: ach.ranking ? Number(ach.ranking) : null,
    points: ach.points ? Number(ach.points) : null,
  };
}

// Get all Inter-IIT achievements directly from database
export async function getAllInterIITAchievements(): Promise<InterIITAchievement[]> {
  try {
    console.log('🔍 Fetching all Inter-IIT achievements from database...');
    const achievements = await db.select().from(interIITAchievements);
    console.log(`✅ Successfully fetched ${achievements.length} achievements from database`);
    return achievements.map(normalizeAchievement);
  } catch (error) {
    console.error('❌ Error fetching Inter-IIT achievements from database:', error);
    throw new Error('Failed to fetch Inter-IIT achievements from database');
  }
}

// Get Inter-IIT achievements for public display (only verified) directly from database
export async function getInterIITAchievementsForDisplay(): Promise<InterIITAchievement[]> {
  try {
    console.log('🔍 Fetching public Inter-IIT achievements from database...');
    const achievements = await db
      .select()
      .from(interIITAchievements)
      .where(eq(interIITAchievements.status, 'verified'));
    
    console.log(`✅ Successfully fetched ${achievements.length} verified achievements from database`);
    return achievements
      .map(normalizeAchievement)
      .sort((a, b) => new Date(b.achievementDate || 0).getTime() - new Date(a.achievementDate || 0).getTime());
  } catch (error) {
    console.error('❌ Error fetching achievements for display from database:', error);
    throw new Error('Failed to fetch achievements for display from database');
  }
}

// Get Inter-IIT achievement by ID directly from database
export async function getInterIITAchievementById(id: string): Promise<InterIITAchievement | null> {
  try {
    console.log(`🔍 Fetching Inter-IIT achievement by ID from database: ${id}`);
    const [achievementResult] = await db
      .select()
      .from(interIITAchievements)
      .where(eq(interIITAchievements.id, id))
      .limit(1);
    
    if (achievementResult) {
      console.log(`✅ Found achievement in database: ${achievementResult.competitionName}`);
      return normalizeAchievement(achievementResult);
    }
    console.log(`⚠️ No achievement found in database with ID: ${id}`);
    return null;
  } catch (error) {
    console.error(`❌ Error fetching Inter-IIT achievement by ID (${id}) from database:`, error);
    throw new Error('Failed to fetch Inter-IIT achievement from database');
  }
}

// Create new Inter-IIT achievement in database
export async function createInterIITAchievement(
  achievement: Omit<NewInterIITAchievement, 'id' | 'createdAt' | 'updatedAt'>
): Promise<InterIITAchievement> {
  try {
    console.log(`🔍 Creating Inter-IIT achievement in database: ${achievement.competitionName}`);
    const baseId = `${achievement.competitionName.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')}-${achievement.year}`;
    
    let uniqueId = baseId;
    let counter = 1;
    
    while (true) {
      const existing = await getInterIITAchievementById(uniqueId);
      if (!existing) break;
      uniqueId = `${baseId}-${counter}`;
      counter++;
    }

    const newAchievement: NewInterIITAchievement = {
      ...achievement,
      id: uniqueId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.insert(interIITAchievements).values(newAchievement).returning();
    console.log(`✅ Successfully created achievement in database: ${result[0].id}`);
    return normalizeAchievement(result[0]);
  } catch (error) {
    console.error('❌ Error creating Inter-IIT achievement in database:', error);
    throw new Error('Failed to create Inter-IIT achievement in database');
  }
}

// Update Inter-IIT achievement in database
export async function updateInterIITAchievement(
  id: string,
  updates: Partial<Omit<NewInterIITAchievement, 'id' | 'createdAt'>>
): Promise<InterIITAchievement> {
  try {
    console.log(`🔍 Updating Inter-IIT achievement in database: ${id}`);
    const result = await db
      .update(interIITAchievements)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(interIITAchievements.id, id))
      .returning();

    if (!result || result.length === 0) {
      throw new Error('Inter-IIT achievement not found');
    }

    console.log(`✅ Successfully updated achievement in database: ${id}`);
    return normalizeAchievement(result[0]);
  } catch (error) {
    console.error(`❌ Error updating Inter-IIT achievement in database (${id}):`, error);
    throw new Error('Failed to update Inter-IIT achievement in database');
  }
}

// Delete Inter-IIT achievement from database
export async function deleteInterIITAchievement(id: string): Promise<void> {
  try {
    console.log(`🔍 Deleting Inter-IIT achievement from database: ${id}`);
    const result = await db
      .delete(interIITAchievements)
      .where(eq(interIITAchievements.id, id))
      .returning();

    if (!result || result.length === 0) {
      throw new Error('Inter-IIT achievement not found');
    }
    console.log(`✅ Successfully deleted achievement from database: ${id}`);
  } catch (error) {
    console.error(`❌ Error deleting Inter-IIT achievement from database (${id}):`, error);
    throw new Error('Failed to delete Inter-IIT achievement from database');
  }
}
