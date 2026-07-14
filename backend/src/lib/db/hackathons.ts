import { db, hackathons, type Hackathon, type NewHackathon } from '@/lib/db';
import { eq, desc, and, count } from 'drizzle-orm';

// Helper function to generate an ID from name
function generateHackathonId(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
}

// Get all hackathons
export async function getAllHackathons(): Promise<Record<string, Hackathon>> {
  try {
    const list = await db.select().from(hackathons).where(eq(hackathons.deleted, false));
    const result: Record<string, Hackathon> = {};
    list.forEach((h) => {
      result[h.id] = h;
    });
    return result;
  } catch (error) {
    console.error('Error fetching all hackathons from DB:', error);
    throw error;
  }
}

// Get hackathon by ID
export async function getHackathonById(id: string): Promise<Hackathon | null> {
  try {
    const [h] = await db
      .select()
      .from(hackathons)
      .where(eq(hackathons.id, id))
      .limit(1);
    return h || null;
  } catch (error) {
    console.error(`Error fetching hackathon by ID (${id}):`, error);
    throw error;
  }
}

// Create new hackathon
export async function createHackathon(
  hackathonInput: Omit<NewHackathon, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Hackathon> {
  try {
    const baseId = generateHackathonId(hackathonInput.name);
    let uniqueId = baseId;
    let counter = 1;
    
    while (true) {
      const existing = await getHackathonById(uniqueId);
      if (!existing) break;
      uniqueId = `${baseId}-${counter}`;
      counter++;
    }

    const [newHackathon] = await db
      .insert(hackathons)
      .values({
        ...hackathonInput,
        draft: hackathonInput.draft ?? false,
        id: uniqueId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
      
    return newHackathon;
  } catch (error) {
    console.error('Error creating hackathon in DB:', error);
    throw error;
  }
}

// Update existing hackathon
export async function updateHackathon(
  id: string,
  updates: Partial<Omit<NewHackathon, 'id' | 'createdAt'>>
): Promise<Hackathon> {
  try {
    const [updated] = await db
      .update(hackathons)
      .set({
        ...updates,
        ...(updates.draft !== undefined ? { draft: updates.draft ?? false } : {}),
        updatedAt: new Date(),
      })
      .where(eq(hackathons.id, id))
      .returning();

    if (!updated) {
      throw new Error('Hackathon not found');
    }

    return updated;
  } catch (error) {
    console.error(`Error updating hackathon (${id}) in DB:`, error);
    throw error;
  }
}

// Delete hackathon
export async function deleteHackathon(id: string): Promise<void> {
  try {
    const result = await db
      .update(hackathons)
      .set({ deleted: true, updatedAt: new Date() })
      .where(eq(hackathons.id, id))
      .returning();
      
    if (result.length === 0) {
      throw new Error('Hackathon not found');
    }
  } catch (error) {
    console.error(`Error deleting hackathon (${id}) in DB:`, error);
    throw error;
  }
}

// Get hackathons for public display (sorted by date desc)
export async function getHackathonsForDisplay(limit?: number, offset?: number): Promise<Hackathon[]> {
  try {
    const query = db
      .select()
      .from(hackathons)
      .where(eq(hackathons.deleted, false))
      .orderBy(desc(hackathons.startDate));
      
    if (limit !== undefined && offset !== undefined) {
      return await query.limit(limit).offset(offset);
    } else if (limit !== undefined) {
      return await query.limit(limit);
    } else if (offset !== undefined) {
      return await query.offset(offset);
    }
    
    return await query;
  } catch (error) {
    console.error('Error fetching hackathons for display:', error);
    return [];
  }
}

// Get total count of active (non-deleted) hackathons
export async function getHackathonsCount(): Promise<number> {
  try {
    const [result] = await db
      .select({ value: count() })
      .from(hackathons)
      .where(eq(hackathons.deleted, false));
    return result?.value || 0;
  } catch (error) {
    console.error('Error counting hackathons:', error);
    return 0;
  }
}

// Get hackathons by status
export async function getHackathonsByStatus(status: string): Promise<Hackathon[]> {
  try {
    const list = await db
      .select()
      .from(hackathons)
      .where(and(eq(hackathons.status, status), eq(hackathons.deleted, false)))
      .orderBy(desc(hackathons.startDate));
    return list;
  } catch (error) {
    console.error(`Error fetching hackathons by status (${status}):`, error);
    return [];
  }
}

// Get hackathon statistics
export async function getBasicHackathonStats() {
  try {
    const list = await getHackathonsForDisplay();
    const total = list.length;
    const upcoming = list.filter(h => h.status === 'upcoming').length;
    
    // Estimates as in original
    const totalParticipants = list.reduce((sum, h) => {
      switch (h.status) {
        case 'completed': return sum + 75;
        case 'ongoing': return sum + 50;
        case 'upcoming': return sum + 30;
        default: return sum + 40;
      }
    }, 0);
    
    const totalPrizePool = list.length * 25000;
    
    return {
      total,
      upcoming,
      totalParticipants,
      totalPrizePool
    };
  } catch (error) {
    console.error('Error getting hackathon stats:', error);
    return { total: 0, upcoming: 0, totalParticipants: 0, totalPrizePool: 0 };
  }
}
