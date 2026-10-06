import {
  type ContactInfo,
  DEFAULT_CONTACT,
  getContactInfoFromDB,
  saveContactInfoToDB,
  updateContactFieldInDB,
  resetContactInfoInDB,
} from '@/lib/db/contact';

export type { ContactInfo };
export { DEFAULT_CONTACT };

// Get contact information from DB
export async function getContactInfo(): Promise<ContactInfo> {
  return await getContactInfoFromDB();
}

// Save contact information to DB
export async function saveContactInfo(contactInfo: ContactInfo): Promise<ContactInfo> {
  return await saveContactInfoToDB(contactInfo);
}

// Update specific contact field in DB
export async function updateContactField(field: string, value: unknown, modifiedBy: string): Promise<ContactInfo> {
  return await updateContactFieldInDB(field, value, modifiedBy);
}

// Reset contact information in DB
export async function resetContactInfo(modifiedBy: string): Promise<ContactInfo> {
  return await resetContactInfoInDB(modifiedBy);
}
