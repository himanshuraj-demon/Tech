import { db, adminEmails } from '@/lib/db';
import { eq } from 'drizzle-orm';

export interface AdminEmailsData {
  emails: string[]
  lastModified: string
  modifiedBy: string
  createdAt: string
  updatedAt: string
}

// Default admin emails (seeding/fallback)
const defaultAdminEmails: AdminEmailsData = {
  emails: [
    "naveen.pal@iitgn.ac.in",
    "technical.secretary@iitgn.ac.in",
    "himanshu.raj@iitgn.ac.in",
    "vishal.boliwal@iitgn.ac.in",
  ],
  lastModified: new Date().toISOString(),
  modifiedBy: 'system',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

// Get admin emails from Neon database
export async function getAdminEmails(): Promise<AdminEmailsData> {
  try {
    const rows = await db.select().from(adminEmails);
    
    // Seed database if empty
    if (rows.length === 0) {
      console.log('Admin emails table is empty, seeding defaults...');
      const now = new Date();
      const insertValues = defaultAdminEmails.emails.map(email => ({
        email,
        modifiedBy: 'system',
        createdAt: now,
        updatedAt: now,
      }));
      await db.insert(adminEmails).values(insertValues);
      
      return {
        ...defaultAdminEmails,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        lastModified: now.toISOString(),
      };
    }

    // Determine metadata from the list
    let earliestCreatedAt = rows[0].createdAt;
    let latestUpdatedAt = rows[0].updatedAt;
    let modifiedBy = rows[0].modifiedBy;

    for (const row of rows) {
      if (row.createdAt < earliestCreatedAt) {
        earliestCreatedAt = row.createdAt;
      }
      if (row.updatedAt > latestUpdatedAt) {
        latestUpdatedAt = row.updatedAt;
        modifiedBy = row.modifiedBy;
      }
    }

    return {
      emails: rows.map(r => r.email),
      lastModified: latestUpdatedAt.toISOString(),
      modifiedBy,
      createdAt: earliestCreatedAt.toISOString(),
      updatedAt: latestUpdatedAt.toISOString()
    };
  } catch (error) {
    console.error('Error getting admin emails from database:', error);
    return defaultAdminEmails;
  }
}

// Save admin emails to Neon database (used for synchronization / bulk updates)
export async function saveAdminEmails(adminEmailsData: AdminEmailsData): Promise<void> {
  try {
    const emailsList = adminEmailsData.emails;
    const modifiedBy = adminEmailsData.modifiedBy || 'system';
    
    if (!emailsList || emailsList.length === 0) {
      throw new Error('At least one admin email is required');
    }

    // Run within a transaction to maintain atomicity and consistency
    await db.transaction(async (tx) => {
      const currentRows = await tx.select().from(adminEmails);
      const currentEmails = currentRows.map(r => r.email);
      
      const toDelete = currentEmails.filter(e => !emailsList.includes(e));
      const toAdd = emailsList.filter(e => !currentEmails.includes(e));
      const toKeep = emailsList.filter(e => currentEmails.includes(e));
      
      const now = new Date();
      
      if (toDelete.length > 0) {
        // Prevent deleting all admins in the transaction (safety check)
        const remainingCount = currentEmails.length - toDelete.length + toAdd.length;
        if (remainingCount === 0) {
          throw new Error('Cannot remove the last admin email');
        }
        for (const email of toDelete) {
          await tx.delete(adminEmails).where(eq(adminEmails.email, email));
        }
      }
      
      if (toAdd.length > 0) {
        await tx.insert(adminEmails).values(toAdd.map(email => ({
          email,
          modifiedBy,
          createdAt: now,
          updatedAt: now,
        })));
      }
      
      // Update metadata for kept/updated rows to reflect the latest modifier
      if (toKeep.length > 0) {
        for (const email of toKeep) {
          await tx.update(adminEmails)
            .set({
              modifiedBy,
              updatedAt: now,
            })
            .where(eq(adminEmails.email, email));
        }
      }
    });

    console.log('Admin emails saved to database successfully');
  } catch (error) {
    console.error('Error saving admin emails to database:', error);
    throw error;
  }
}

// Add admin email
export async function addAdminEmail(email: string, modifiedBy: string = 'system'): Promise<AdminEmailsData> {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    const trimmedEmail = email.trim();
    
    // Check if email already exists
    const [existing] = await db.select().from(adminEmails).where(eq(adminEmails.email, trimmedEmail)).limit(1);
    if (existing) {
      throw new Error('Email already exists in admin list');
    }

    const now = new Date();
    await db.insert(adminEmails).values({
      email: trimmedEmail,
      modifiedBy,
      createdAt: now,
      updatedAt: now,
    });

    return await getAdminEmails();
  } catch (error) {
    console.error('Error adding admin email:', error);
    throw error;
  }
}

// Remove admin email
export async function removeAdminEmail(email: string, modifiedBy: string = 'system'): Promise<AdminEmailsData> {
  try {
    const trimmedEmail = email.trim();
    
    // Check if email exists
    const [existing] = await db.select().from(adminEmails).where(eq(adminEmails.email, trimmedEmail)).limit(1);
    if (!existing) {
      throw new Error('Email not found in admin list');
    }

    // Get all admin emails to count them
    const allEmails = await db.select().from(adminEmails);
    
    // Prevent removing the last admin email (Ensure at least one admin email always exists)
    if (allEmails.length <= 1) {
      throw new Error('Cannot remove the last admin email');
    }

    await db.delete(adminEmails).where(eq(adminEmails.email, trimmedEmail));
    
    return await getAdminEmails();
  } catch (error) {
    console.error('Error removing admin email:', error);
    throw error;
  }
}

// Update all admin emails (bulk update)
export async function updateAdminEmails(emails: string[], modifiedBy: string = 'system'): Promise<AdminEmailsData> {
  try {
    if (!emails || emails.length === 0) {
      throw new Error('At least one admin email is required');
    }

    // Remove duplicates and filter out empty strings
    const uniqueEmails = [...new Set(emails.map(email => email.trim()).filter(email => email.length > 0))];
    
    if (uniqueEmails.length === 0) {
      throw new Error('At least one valid admin email is required');
    }

    const currentEmails = await getAdminEmails();
    const updatedData: AdminEmailsData = {
      ...currentEmails,
      emails: uniqueEmails,
      lastModified: new Date().toISOString(),
      modifiedBy,
      updatedAt: new Date().toISOString()
    };

    await saveAdminEmails(updatedData);
    return await getAdminEmails();
  } catch (error) {
    console.error('Error updating admin emails:', error);
    throw error;
  }
}

// Check if email is admin
export async function isAdminEmail(email: string): Promise<boolean> {
  try {
    const trimmedEmail = email.trim();
    const [row] = await db.select().from(adminEmails).where(eq(adminEmails.email, trimmedEmail)).limit(1);
    if (row) {
      return true;
    }
    
    // Check if the database has any admin emails registered at all
    const allEmails = await db.select().from(adminEmails).limit(1);
    if (allEmails.length === 0) {
      // If table is unseeded, fallback to the hardcoded defaults
      return defaultAdminEmails.emails.includes(trimmedEmail);
    }
    
    return false;
  } catch (error) {
    console.error('Error checking admin email:', error);
    // Fallback to checking default admin emails in case of connection error
    return defaultAdminEmails.emails.includes(email);
  }
}
