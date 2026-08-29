import { db, events, type Event, type NewEvent } from '@/lib/db';
import { eq, or, isNull } from 'drizzle-orm';

function normalizeEvent(event: any): Event {
  let gallery = event.gallery;
  if (typeof gallery === 'string') {
    try {
      gallery = JSON.parse(gallery);
    } catch {
      gallery = [];
    }
  }
  let highlights = event.highlights;
  if (typeof highlights === 'string') {
    try {
      highlights = JSON.parse(highlights);
    } catch {
      highlights = [];
    }
  }

  return {
    ...event,
    highlights: Array.isArray(highlights) ? highlights : [],
    gallery: Array.isArray(gallery) ? gallery : [],
    draft: Boolean(event.draft),
  };
}

// Get all events directly from database
export async function getAllEvents(): Promise<Event[]> {
  try {
    console.log('🔍 Fetching all events from database...');
    const allEvents = await db.select().from(events);
    console.log(`✅ Successfully fetched ${allEvents.length} events from database`);
    return allEvents.map(normalizeEvent);
  } catch (error) {
    console.error('❌ Error fetching events from database:', error);
    throw new Error('Failed to fetch events from database');
  }
}

// Get events for public display (non-draft only) directly from database
export async function getEventsForDisplay(): Promise<Event[]> {
  try {
    console.log('🔍 Fetching public events from database...');
    const publicEvents = await db
      .select()
      .from(events)
      .where(or(eq(events.draft, false), isNull(events.draft)));
    
    console.log(`✅ Successfully fetched ${publicEvents.length} public events from database`);
    return publicEvents
      .map(normalizeEvent)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('❌ Error fetching public events from database:', error);
    throw new Error('Failed to fetch events for display from database');
  }
}

// Get event by ID directly from database
export async function getEventById(id: string): Promise<Event | null> {
  try {
    console.log(`🔍 Fetching event by ID from database: ${id}`);
    const [eventResult] = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);
    
    if (eventResult) {
      console.log(`✅ Found event in database: ${eventResult.title}`);
      return normalizeEvent(eventResult);
    }
    console.log(`⚠️ No event found in database with ID: ${id}`);
    return null;
  } catch (error) {
    console.error(`❌ Error fetching event by ID (${id}) from database:`, error);
    throw new Error('Failed to fetch event from database');
  }
}

// Create new event in database
export async function createEvent(
  event: Omit<NewEvent, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Event> {
  try {
    console.log(`🔍 Creating event in database: ${event.title}`);
    const baseId = event.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
    
    let uniqueId = baseId;
    let counter = 1;
    
    while (true) {
      const existing = await getEventById(uniqueId);
      if (!existing) break;
      uniqueId = `${baseId}-${counter}`;
      counter++;
    }

    const newEvent: NewEvent = {
      ...event,
      id: uniqueId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.insert(events).values(newEvent).returning();
    console.log(`✅ Successfully created event in database: ${result[0].id}`);
    return normalizeEvent(result[0]);
  } catch (error) {
    console.error('❌ Error creating event in database:', error);
    throw new Error('Failed to create event in database');
  }
}

// Update event in database
export async function updateEvent(
  id: string,
  updates: Partial<Omit<NewEvent, 'id' | 'createdAt'>>
): Promise<Event> {
  try {
    console.log(`🔍 Updating event in database: ${id}`);
    const result = await db
      .update(events)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id))
      .returning();

    if (!result || result.length === 0) {
      throw new Error('Event not found');
    }

    console.log(`✅ Successfully updated event in database: ${id}`);
    return normalizeEvent(result[0]);
  } catch (error) {
    console.error(`❌ Error updating event in database (${id}):`, error);
    throw new Error('Failed to update event in database');
  }
}

// Delete event from database
export async function deleteEvent(id: string): Promise<void> {
  try {
    console.log(`🔍 Deleting event from database: ${id}`);
    const result = await db
      .delete(events)
      .where(eq(events.id, id))
      .returning();

    if (!result || result.length === 0) {
      throw new Error('Event not found');
    }
    console.log(`✅ Successfully deleted event from database: ${id}`);
  } catch (error) {
    console.error(`❌ Error deleting event from database (${id}):`, error);
    throw new Error('Failed to delete event from database');
  }
}
