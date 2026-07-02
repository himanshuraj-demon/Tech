import { db, torqueMagazines, type TorqueMagazine, type NewTorqueMagazine } from '@/lib/db';
import { eq } from 'drizzle-orm';

// Helper function to generate a unique ID for magazines
function generateMagazineId(): string {
  return `mag_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

// Get all magazines
export async function getAllMagazines(): Promise<Record<string, TorqueMagazine>> {
  try {
    const magazines = await db.select().from(torqueMagazines);
    const result: Record<string, TorqueMagazine> = {};
    magazines.forEach((mag) => {
      result[mag.id] = mag;
    });
    return result;
  } catch (error) {
    console.error('Error fetching all magazines from DB:', error);
    throw error;
  }
}

// Get single magazine by ID
export async function getMagazineById(id: string): Promise<TorqueMagazine | null> {
  try {
    const [magazine] = await db
      .select()
      .from(torqueMagazines)
      .where(eq(torqueMagazines.id, id))
      .limit(1);
    return magazine || null;
  } catch (error) {
    console.error(`Error fetching magazine by ID (${id}):`, error);
    throw error;
  }
}

// Get latest magazine
export async function getLatestMagazine(): Promise<TorqueMagazine | null> {
  try {
    const [latest] = await db
      .select()
      .from(torqueMagazines)
      .where(eq(torqueMagazines.isLatest, true))
      .limit(1);
    return latest || null;
  } catch (error) {
    console.error('Error fetching latest magazine:', error);
    throw error;
  }
}

// Create new magazine
export async function createMagazine(
  magazine: Omit<NewTorqueMagazine, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<TorqueMagazine> {
  try {
    const id = magazine.id || generateMagazineId();
    
    // If this magazine is set as latest, unset all others first
    if (magazine.isLatest) {
      await unsetAllLatest();
    }
    
    const [newMagazine] = await db
      .insert(torqueMagazines)
      .values({
        ...magazine,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
      
    return newMagazine;
  } catch (error) {
    console.error('Error creating magazine:', error);
    throw error;
  }
}

// Update existing magazine
export async function updateMagazine(
  id: string,
  updates: Partial<Omit<NewTorqueMagazine, 'id' | 'createdAt'>>
): Promise<TorqueMagazine | null> {
  try {
    // If setting this as latest, unset all others first
    if (updates.isLatest === true) {
      await unsetAllLatest();
    }
    
    const [updated] = await db
      .update(torqueMagazines)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(torqueMagazines.id, id))
      .returning();
      
    return updated || null;
  } catch (error) {
    console.error(`Error updating magazine (${id}):`, error);
    throw error;
  }
}

// Set a magazine as the latest (and unset all others)
export async function setLatestMagazine(targetId: string): Promise<void> {
  try {
    // First, unset all magazines as latest
    await unsetAllLatest();
    
    // Then set the target as latest
    await db
      .update(torqueMagazines)
      .set({ isLatest: true, updatedAt: new Date() })
      .where(eq(torqueMagazines.id, targetId));
  } catch (error) {
    console.error(`Error setting latest magazine (${targetId}):`, error);
    throw error;
  }
}

// Helper function to unset all magazines as latest
async function unsetAllLatest(): Promise<void> {
  try {
    await db
      .update(torqueMagazines)
      .set({ isLatest: false, updatedAt: new Date() })
      .where(eq(torqueMagazines.isLatest, true));
  } catch (error) {
    console.error('Error unsetting all latest magazines:', error);
    throw error;
  }
}

// Delete magazine from DB
export async function deleteMagazine(id: string): Promise<boolean> {
  try {
    const result = await db
      .delete(torqueMagazines)
      .where(eq(torqueMagazines.id, id));
    return result.rowCount > 0;
  } catch (error) {
    console.error(`Error deleting magazine (${id}):`, error);
    return false;
  }
}

// Validate and fix latest magazine consistency
export async function ensureOnlyOneLatest(): Promise<void> {
  try {
    const latestMagazines = await db
      .select()
      .from(torqueMagazines)
      .where(eq(torqueMagazines.isLatest, true));
      
    if (latestMagazines.length > 1) {
      console.warn(`Found ${latestMagazines.length} magazines marked as latest. Fixing...`);
      
      // Keep the most recently updated one as latest
      const mostRecent = latestMagazines.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
      
      // Unset all others
      await unsetAllLatest();
      
      // Set the most recent as latest
      await db
        .update(torqueMagazines)
        .set({ isLatest: true, updatedAt: new Date() })
        .where(eq(torqueMagazines.id, mostRecent.id));
    }
  } catch (error) {
    console.error('Error ensuring only one latest magazine:', error);
  }
}

// Get count of magazines marked as latest
export async function getLatestCount(): Promise<number> {
  try {
    const latestMagazines = await db
      .select()
      .from(torqueMagazines)
      .where(eq(torqueMagazines.isLatest, true));
    return latestMagazines.length;
  } catch (error) {
    console.error('Error getting latest count:', error);
    return 0;
  }
}
