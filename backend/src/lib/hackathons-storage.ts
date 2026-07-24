import { 
  getAllHackathons as dbGetAllHackathons,
  getHackathonById as dbGetHackathonById,
  createHackathon as dbCreateHackathon,
  updateHackathon as dbUpdateHackathon,
  deleteHackathon as dbDeleteHackathon,
  getHackathonsForDisplay as dbGetHackathonsForDisplay,
  getHackathonsByStatus as dbGetHackathonsByStatus,
  getBasicHackathonStats as dbGetBasicHackathonStats,
  getHackathonsCount as dbGetHackathonsCount
} from '@/lib/db/hackathons';

import { type Hackathon, type WinnerTier } from '@/lib/db/schema';

// Export type
export interface BasicHackathon {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  startDate: string;
  endDate: string;
  location: string;
  category: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  registrationLink?: string;
  
  // Organizer details
  organizerName?: string;
  organizerEmail?: string;
  organizerPhone?: string;
  organizerWebsite?: string;
  
  // Requirements and eligibility
  requirements?: string;
  eligibility?: string;
  teamSize?: string;
  
  // Prize pool
  specialPrizes?: string;
  winnerTiers: WinnerTier[];
  
  // Timeline and important details
  timeline?: string;
  importantNotes?: string;
  
  // Additional details
  themes?: string;
  judingCriteria?: string;
  submissionGuidelines?: string;
  
  createdAt: string;
  updatedAt: string;
  draft: boolean;
  teamRequired: boolean;
  pointsParticipation: number;
  deleted: boolean;
}

function getAutomaticStatus(startDateStr: string, endDateStr: string, fallbackStatus: string): "upcoming" | "ongoing" | "completed" | "cancelled" {
  if (fallbackStatus === "cancelled" || fallbackStatus === "completed") return fallbackStatus as any;
  if (!startDateStr || !endDateStr) return fallbackStatus as any;
  
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    const startParts = startDateStr.split('-');
    const endParts = endDateStr.split('-');
    
    if (startParts.length !== 3 || endParts.length !== 3) return fallbackStatus as any;
    
    const startVal = new Date(Number(startParts[0]), Number(startParts[1]) - 1, Number(startParts[2])).getTime();
    const endVal = new Date(Number(endParts[0]), Number(endParts[1]) - 1, Number(endParts[2])).getTime();
    
    if (today <= startVal) {
      return "upcoming";
    } else if (today <= endVal) {
      return "ongoing";
    } else {
      return "completed";
    }
  } catch (e) {
    return fallbackStatus as any;
  }
}

function mapDBToData(h: Hackathon): BasicHackathon {
  const computedStatus = getAutomaticStatus(h.startDate, h.endDate, h.status);
  
  return {
    id: h.id,
    name: h.name,
    description: h.description,
    longDescription: h.longDescription,
    startDate: h.startDate,
    endDate: h.endDate,
    location: h.location,
    category: h.category,
    status: computedStatus,
    registrationLink: h.registrationLink || undefined,
    organizerName: h.organizerName || undefined,
    organizerEmail: h.organizerEmail || undefined,
    organizerPhone: h.organizerPhone || undefined,
    organizerWebsite: h.organizerWebsite || undefined,
    requirements: h.requirements || undefined,
    eligibility: h.eligibility || undefined,
    teamSize: h.teamSize || undefined,
    specialPrizes: h.specialPrizes || undefined,
    timeline: h.timeline || undefined,
    importantNotes: h.importantNotes || undefined,
    themes: h.themes || undefined,
    judingCriteria: h.judingCriteria || undefined,
    submissionGuidelines: h.submissionGuidelines || undefined,
    createdAt: h.createdAt.toISOString(),
    updatedAt: h.updatedAt.toISOString(),
    draft: h.draft,
    deleted: h.deleted,
    teamRequired: h.teamRequired,
    winnerTiers: h.winnerTiers,
    pointsParticipation: h.pointsParticipation,
  };
}

export async function getAllHackathons(): Promise<Record<string, BasicHackathon>> {
  const dbList = await dbGetAllHackathons();
  const result: Record<string, BasicHackathon> = {};
  Object.keys(dbList).forEach((key) => {
    result[key] = mapDBToData(dbList[key]);
  });
  return result;
}

export async function getHackathonById(id: string): Promise<BasicHackathon | null> {
  const h = await dbGetHackathonById(id);
  return h ? mapDBToData(h) : null;
}

export async function createHackathon(hackathonInput: Record<string, any>): Promise<BasicHackathon> {
  // Convert input to typed values
  const input = {
    name: String(hackathonInput.name || ''),
    description: String(hackathonInput.description || ''),
    longDescription: String(hackathonInput.longDescription || ''),
    startDate: String(hackathonInput.startDate || ''),
    endDate: String(hackathonInput.endDate || ''),
    location: String(hackathonInput.location || ''),
    category: String(hackathonInput.category || ''),
    status: String(hackathonInput.status || 'upcoming'),
    registrationLink: hackathonInput.registrationLink ? String(hackathonInput.registrationLink) : null,
    organizerName: hackathonInput.organizerName ? String(hackathonInput.organizerName) : null,
    organizerEmail: hackathonInput.organizerEmail ? String(hackathonInput.organizerEmail) : null,
    organizerPhone: hackathonInput.organizerPhone ? String(hackathonInput.organizerPhone) : null,
    organizerWebsite: hackathonInput.organizerWebsite ? String(hackathonInput.organizerWebsite) : null,
    requirements: hackathonInput.requirements ? String(hackathonInput.requirements) : null,
    eligibility: hackathonInput.eligibility ? String(hackathonInput.eligibility) : null,
    teamSize: hackathonInput.teamSize ? String(hackathonInput.teamSize) : null,
    specialPrizes: hackathonInput.specialPrizes ? String(hackathonInput.specialPrizes) : null,
    timeline: hackathonInput.timeline ? String(hackathonInput.timeline) : null,
    importantNotes: hackathonInput.importantNotes ? String(hackathonInput.importantNotes) : null,
    themes: hackathonInput.themes ? String(hackathonInput.themes) : null,
    judingCriteria: hackathonInput.judingCriteria ? String(hackathonInput.judingCriteria) : null,
    submissionGuidelines: hackathonInput.submissionGuidelines ? String(hackathonInput.submissionGuidelines) : null,
    draft: Boolean(hackathonInput.draft),
    teamRequired: Boolean(hackathonInput.teamRequired),
    winnerTiers: hackathonInput.winnerTiers || [],
    pointsParticipation: Number(hackathonInput.pointsParticipation !== undefined ? hackathonInput.pointsParticipation : 10),
  };

  const newH = await dbCreateHackathon(input);
  return mapDBToData(newH);
}

export async function updateHackathon(id: string, updates: Record<string, any>): Promise<BasicHackathon> {
  const cleanUpdates: Partial<Omit<Hackathon, 'id' | 'createdAt' | 'updatedAt'>> = {};
  
  if (updates.name !== undefined) cleanUpdates.name = String(updates.name);
  if (updates.description !== undefined) cleanUpdates.description = String(updates.description);
  if (updates.longDescription !== undefined) cleanUpdates.longDescription = String(updates.longDescription);
  if (updates.startDate !== undefined) cleanUpdates.startDate = String(updates.startDate);
  if (updates.endDate !== undefined) cleanUpdates.endDate = String(updates.endDate);
  if (updates.location !== undefined) cleanUpdates.location = String(updates.location);
  if (updates.category !== undefined) cleanUpdates.category = String(updates.category);
  if (updates.status !== undefined) cleanUpdates.status = String(updates.status);
  if (updates.registrationLink !== undefined) cleanUpdates.registrationLink = updates.registrationLink ? String(updates.registrationLink) : null;
  if (updates.organizerName !== undefined) cleanUpdates.organizerName = updates.organizerName ? String(updates.organizerName) : null;
  if (updates.organizerEmail !== undefined) cleanUpdates.organizerEmail = updates.organizerEmail ? String(updates.organizerEmail) : null;
  if (updates.organizerPhone !== undefined) cleanUpdates.organizerPhone = updates.organizerPhone ? String(updates.organizerPhone) : null;
  if (updates.organizerWebsite !== undefined) cleanUpdates.organizerWebsite = updates.organizerWebsite ? String(updates.organizerWebsite) : null;
  if (updates.requirements !== undefined) cleanUpdates.requirements = updates.requirements ? String(updates.requirements) : null;
  if (updates.eligibility !== undefined) cleanUpdates.eligibility = updates.eligibility ? String(updates.eligibility) : null;
  if (updates.teamSize !== undefined) cleanUpdates.teamSize = updates.teamSize ? String(updates.teamSize) : null;
  if (updates.specialPrizes !== undefined) cleanUpdates.specialPrizes = updates.specialPrizes ? String(updates.specialPrizes) : null;
  if (updates.timeline !== undefined) cleanUpdates.timeline = updates.timeline ? String(updates.timeline) : null;
  if (updates.importantNotes !== undefined) cleanUpdates.importantNotes = updates.importantNotes ? String(updates.importantNotes) : null;
  if (updates.themes !== undefined) cleanUpdates.themes = updates.themes ? String(updates.themes) : null;
  if (updates.judingCriteria !== undefined) cleanUpdates.judingCriteria = updates.judingCriteria ? String(updates.judingCriteria) : null;
  if (updates.submissionGuidelines !== undefined) cleanUpdates.submissionGuidelines = updates.submissionGuidelines ? String(updates.submissionGuidelines) : null;
  if (updates.draft !== undefined) cleanUpdates.draft = Boolean(updates.draft);
  if (updates.teamRequired !== undefined) cleanUpdates.teamRequired = Boolean(updates.teamRequired);
  if (updates.winnerTiers !== undefined) cleanUpdates.winnerTiers = updates.winnerTiers;
  if (updates.pointsParticipation !== undefined) cleanUpdates.pointsParticipation = Number(updates.pointsParticipation);

  const updated = await dbUpdateHackathon(id, cleanUpdates);
  return mapDBToData(updated);
}

export async function deleteHackathon(id: string): Promise<void> {
  await dbDeleteHackathon(id);
}

export async function getHackathonsForDisplay(limit?: number, offset?: number): Promise<BasicHackathon[]> {
  const list = await dbGetHackathonsForDisplay(limit, offset);
  return list.map(mapDBToData);
}

export async function getHackathonsCount(): Promise<number> {
  return await dbGetHackathonsCount();
}

export async function getHackathonsByStatus(status: BasicHackathon['status']): Promise<BasicHackathon[]> {
  const allMap = await getAllHackathons();
  const allList = Object.values(allMap);
  const filtered = allList.filter(h => h.status === status);
  return filtered.sort((a, b) => b.startDate.localeCompare(a.startDate));
}

export async function getUpcomingHackathons(): Promise<BasicHackathon[]> {
  return getHackathonsByStatus('upcoming');
}

export async function getCompletedHackathons(): Promise<BasicHackathon[]> {
  return getHackathonsByStatus('completed');
}

export async function getOngoingHackathons(): Promise<BasicHackathon[]> {
  return getHackathonsByStatus('ongoing');
}

export async function getBasicHackathonStats() {
  return await dbGetBasicHackathonStats();
}

export async function migrateFromFileSystem(): Promise<boolean> {
  try {
    const fs = await import('fs').then(m => m.promises);
    const path = await import('path');
    
    const dataDir = path.join(process.cwd(), 'data');
    const hackathonsFile = path.join(dataDir, 'hackathons.json');
    
    const fileContent = await fs.readFile(hackathonsFile, 'utf8');
    const fileData = JSON.parse(fileContent);
    
    if (Object.keys(fileData).length > 0) {
      console.log(`Migrating local hackathons to SQL database...`);
      for (const key of Object.keys(fileData)) {
        await createHackathon(fileData[key]);
      }
      return true;
    }
    return false;
  } catch (error) {
    console.log('No file system data to migrate or migration failed:', error);
    return false;
  }
}
