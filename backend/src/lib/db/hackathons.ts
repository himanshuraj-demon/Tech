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

export async function getBasicHackathonStats() {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Select only status and date fields for active hackathons
    const list = await db
      .select({
        status: hackathons.status,
        startDate: hackathons.startDate,
        endDate: hackathons.endDate,
      })
      .from(hackathons)
      .where(
        and(
          eq(hackathons.draft, false),
          eq(hackathons.deleted, false)
        )
      );

    const total = list.length;
    let upcoming = 0;
    let ongoing = 0;
    let completed = 0;

    list.forEach(h => {
      let computedStatus = h.status;
      if (h.status !== 'cancelled' && h.status !== 'completed') {
        if (h.startDate && today < h.startDate) {
          computedStatus = 'upcoming';
        } else if (h.startDate && h.endDate && today >= h.startDate && today < h.endDate) {
          computedStatus = 'ongoing';
        } else if (h.endDate && today >= h.endDate) {
          computedStatus = 'completed';
        }
      }
      
      if (computedStatus === 'upcoming') upcoming++;
      else if (computedStatus === 'ongoing') ongoing++;
      else if (computedStatus === 'completed') completed++;
    });

    return {
      total,
      upcoming,
      ongoing,
      completed,
      totalCount: total,
      upcomingCount: upcoming,
      ongoingCount: ongoing,
      completedCount: completed,
      totalPrizePool: 0
    };
  } catch (error) {
    console.error('Error getting hackathon stats:', error);
    return {
      total: 0,
      upcoming: 0,
      ongoing: 0,
      completed: 0,
      totalCount: 0,
      upcomingCount: 0,
      ongoingCount: 0,
      completedCount: 0,
      totalPrizePool: 0
    };
  }
}
