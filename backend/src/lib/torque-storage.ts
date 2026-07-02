import { 
  getAllMagazines as dbGetAllMagazines,
  getMagazineById as dbGetMagazineById,
  getLatestMagazine as dbGetLatestMagazine,
  createMagazine as dbCreateMagazine,
  updateMagazine as dbUpdateMagazine,
  setLatestMagazine as dbSetLatestMagazine,
  ensureOnlyOneLatest as dbEnsureOnlyOneLatest,
  getLatestCount as dbGetLatestCount,
  deleteMagazine as dbDeleteMagazine
} from '@/lib/db/torque';

import { type TorqueMagazine } from '@/lib/db/schema';

// Export types for backward compatibility
export interface TorqueMagazineData {
  id: string;
  year: string;
  title: string;
  description: string;
  pages: number;
  articles: number;
  featured: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  coverPhoto?: string;
  coverPhotoFileName?: string;
  isLatest: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TorqueMagazineInput {
  id?: string;
  year: string;
  title: string;
  description: string;
  pages: number;
  articles: number;
  featured: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  coverPhoto?: string;
  coverPhotoFileName?: string;
  isLatest: boolean;
}

// Map database Drizzle object to JSON format used by frontend
function mapDBToData(mag: TorqueMagazine): TorqueMagazineData {
  return {
    id: mag.id,
    year: mag.year,
    title: mag.title,
    description: mag.description,
    pages: mag.pages,
    articles: mag.articles,
    featured: mag.featured,
    filePath: mag.filePath,
    fileName: mag.fileName,
    fileSize: mag.fileSize,
    coverPhoto: mag.coverPhoto || undefined,
    coverPhotoFileName: mag.coverPhotoFileName || undefined,
    isLatest: mag.isLatest,
    createdAt: mag.createdAt.toISOString(),
    updatedAt: mag.updatedAt.toISOString(),
  };
}

export async function getAllMagazines(): Promise<Record<string, TorqueMagazineData>> {
  const dbMags = await dbGetAllMagazines();
  const result: Record<string, TorqueMagazineData> = {};
  Object.keys(dbMags).forEach((key) => {
    result[key] = mapDBToData(dbMags[key]);
  });
  return result;
}

export async function getMagazineById(id: string): Promise<TorqueMagazineData | null> {
  const mag = await dbGetMagazineById(id);
  return mag ? mapDBToData(mag) : null;
}

export async function getLatestMagazine(): Promise<TorqueMagazineData | null> {
  const mag = await dbGetLatestMagazine();
  return mag ? mapDBToData(mag) : null;
}

export async function createMagazine(magazine: TorqueMagazineInput): Promise<TorqueMagazineData> {
  const newMag = await dbCreateMagazine(magazine);
  return mapDBToData(newMag);
}

export async function updateMagazine(id: string, updates: Partial<TorqueMagazineInput>): Promise<TorqueMagazineData | null> {
  const updated = await dbUpdateMagazine(id, updates);
  return updated ? mapDBToData(updated) : null;
}

export async function setLatestMagazine(targetId: string): Promise<void> {
  await dbSetLatestMagazine(targetId);
}

export async function deleteMagazine(id: string): Promise<boolean> {
  // DB record deletion
  return await dbDeleteMagazine(id);
}

export async function ensureOnlyOneLatest(): Promise<void> {
  await dbEnsureOnlyOneLatest();
}

export async function getLatestCount(): Promise<number> {
  return await dbGetLatestCount();
}
