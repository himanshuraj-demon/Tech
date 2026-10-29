import { db } from "@/lib/db";
import { contactInfo, type ContactInfoDB } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import fs from "fs";
import path from "path";

export interface ContactInfo {
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  phone: string;
  email: string;
  socialMedia: {
    instagram: string;
    youtube: string;
    linkedin: string;
    facebook: string;
  };
  lastModified?: string;
  modifiedBy?: string;
}

export const DEFAULT_CONTACT: ContactInfo = {
  address: {
    street: "323, Acad Block 4, IIT Gandhinagar",
    city: "Palaj, Gandhinagar",
    state: "Gujarat",
    postalCode: "382355",
    country: "India",
  },
  phone: "+91-79-2395-2001",
  email: "technical.secretary@iitgn.ac.in",
  socialMedia: {
    instagram:
      "https://www.instagram.com/tech_iitgn?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
    youtube: "https://www.youtube.com/@tech_iitgn",
    linkedin: "https://www.linkedin.com/school/tech-council-iitgn/",
    facebook: "https://www.facebook.com/tech.iitgn",
  },
  lastModified: new Date().toISOString(),
  modifiedBy: "System",
};

export function formatContactInfo(row: ContactInfoDB): ContactInfo {
  return {
    address: {
      street: row.street || "",
      city: row.city || "",
      state: row.state || "",
      postalCode: row.postalCode || "",
      country: row.country || "India",
    },
    phone: row.phone || "",
    email: row.email || "",
    socialMedia: {
      instagram: row.instagram || "",
      youtube: row.youtube || "",
      linkedin: row.linkedin || "",
      facebook: row.facebook || "",
    },
    lastModified: row.updatedAt
      ? new Date(row.updatedAt).toISOString()
      : new Date().toISOString(),
    modifiedBy: row.modifiedBy || "System",
  };
}

async function ensureDefaultRecord(): Promise<ContactInfoDB> {
  const seed = DEFAULT_CONTACT;

  const [record] = await db
    .insert(contactInfo)
    .values({
      id: "default",
      street: seed.address.street,
      city: seed.address.city,
      state: seed.address.state,
      postalCode: seed.address.postalCode,
      country: seed.address.country,
      phone: seed.phone,
      email: seed.email,
      instagram: seed.socialMedia.instagram,
      youtube: seed.socialMedia.youtube,
      linkedin: seed.socialMedia.linkedin,
      facebook: seed.socialMedia.facebook,
      modifiedBy: seed.modifiedBy || "System",
    })
    .onConflictDoNothing()
    .returning();

  if (record) return record;

  const [existing] = await db
    .select()
    .from(contactInfo)
    .where(eq(contactInfo.id, "default"))
    .limit(1);

  if (!existing) {
    throw new Error("Default contact record could not be initialized");
  }

  return existing;
}

/**
 * Fetch existing contact info from the database.
 */
export async function getContactInfoFromDB(): Promise<ContactInfo> {
  try {
    const [record] = await db
      .select()
      .from(contactInfo)
      .where(eq(contactInfo.id, "default"))
      .limit(1);

    if (!record) {
      throw new Error("Default contact info record not found");
    }

    return formatContactInfo(record);
  } catch (error) {
    console.error("Error fetching contact info from database:", error);
    throw error;
  }
}

/**
 * Save/update full contact info in database.
 */
export async function saveContactInfoToDB(
  info: Partial<ContactInfo> & { modifiedBy?: string },
): Promise<ContactInfo> {
  try {
    await ensureDefaultRecord();

    const updatePayload: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (info.modifiedBy) {
      updatePayload.modifiedBy = info.modifiedBy;
    }

    if (info.phone !== undefined) {
      updatePayload.phone = info.phone;
    }

    if (info.email !== undefined) {
      updatePayload.email = info.email;
    }

    if (info.address) {
      if (info.address.street !== undefined)
        updatePayload.street = info.address.street;
      if (info.address.city !== undefined)
        updatePayload.city = info.address.city;
      if (info.address.state !== undefined)
        updatePayload.state = info.address.state;
      if (info.address.postalCode !== undefined)
        updatePayload.postalCode = info.address.postalCode;
      if (info.address.country !== undefined)
        updatePayload.country = info.address.country;
    }

    if (info.socialMedia) {
      if (info.socialMedia.instagram !== undefined)
        updatePayload.instagram = info.socialMedia.instagram;
      if (info.socialMedia.youtube !== undefined)
        updatePayload.youtube = info.socialMedia.youtube;
      if (info.socialMedia.linkedin !== undefined)
        updatePayload.linkedin = info.socialMedia.linkedin;
      if (info.socialMedia.facebook !== undefined)
        updatePayload.facebook = info.socialMedia.facebook;
    }

    const [updated] = await db
      .update(contactInfo)
      .set(updatePayload)
      .where(eq(contactInfo.id, "default"))
      .returning();

    return formatContactInfo(updated);
  } catch (error) {
    console.error("Error saving contact info to database:", error);
    throw new Error("Failed to save contact info to database");
  }
}

/**
 * Update single field in contact info.
 */
export async function updateContactFieldInDB(
  field: string,
  value: unknown,
  modifiedBy: string,
): Promise<ContactInfo> {
  try {
    await ensureDefaultRecord();

    const updatePayload: Record<string, unknown> = {
      modifiedBy,
      updatedAt: new Date(),
    };

    if (field === "phone") {
      updatePayload.phone = String(value ?? "");
    } else if (field === "email") {
      updatePayload.email = String(value ?? "");
    } else if (field === "address.street") {
      updatePayload.street = String(value ?? "");
    } else if (field === "address.city") {
      updatePayload.city = String(value ?? "");
    } else if (field === "address.state") {
      updatePayload.state = String(value ?? "");
    } else if (field === "address.postalCode") {
      updatePayload.postalCode = String(value ?? "");
    } else if (field === "address.country") {
      updatePayload.country = String(value ?? "");
    } else if (field === "socialMedia.instagram") {
      updatePayload.instagram = String(value ?? "");
    } else if (field === "socialMedia.youtube") {
      updatePayload.youtube = String(value ?? "");
    } else if (field === "socialMedia.linkedin") {
      updatePayload.linkedin = String(value ?? "");
    } else if (field === "socialMedia.facebook") {
      updatePayload.facebook = String(value ?? "");
    }

    const [updated] = await db
      .update(contactInfo)
      .set(updatePayload)
      .where(eq(contactInfo.id, "default"))
      .returning();

    return formatContactInfo(updated);
  } catch (error) {
    console.error("Error updating contact field in database:", error);
    throw new Error("Failed to update contact field in database");
  }
}

/**
 * Reset contact info to default in database.
 */
export async function resetContactInfoInDB(
  modifiedBy: string,
): Promise<ContactInfo> {
  try {
    await ensureDefaultRecord();

    const [reset] = await db
      .update(contactInfo)
      .set({
        street: DEFAULT_CONTACT.address.street,
        city: DEFAULT_CONTACT.address.city,
        state: DEFAULT_CONTACT.address.state,
        postalCode: DEFAULT_CONTACT.address.postalCode,
        country: DEFAULT_CONTACT.address.country,
        phone: DEFAULT_CONTACT.phone,
        email: DEFAULT_CONTACT.email,
        instagram: DEFAULT_CONTACT.socialMedia.instagram,
        youtube: DEFAULT_CONTACT.socialMedia.youtube,
        linkedin: DEFAULT_CONTACT.socialMedia.linkedin,
        facebook: DEFAULT_CONTACT.socialMedia.facebook,
        modifiedBy: modifiedBy || "System",
        updatedAt: new Date(),
      })
      .where(eq(contactInfo.id, "default"))
      .returning();

    return formatContactInfo(reset);
  } catch (error) {
    console.error("Error resetting contact info in database:", error);
    throw new Error("Failed to reset contact info in database");
  }
}
