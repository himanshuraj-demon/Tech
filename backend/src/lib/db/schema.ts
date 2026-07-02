import { pgTable, text, timestamp, jsonb, integer, boolean } from 'drizzle-orm/pg-core';

// Inter-IIT Achievements Table
export const interIITAchievements = pgTable('inter_iit_achievements', {
  id: text('id').primaryKey(),
  achievementType: text('achievement_type').notNull(),
  competitionName: text('competition_name').notNull(),
  interIITEdition: text('inter_iit_edition').notNull(),
  year: text('year').notNull(),
  hostIIT: text('host_iit').notNull(),
  location: text('location').notNull(),
  ranking: integer('ranking'),
  achievementDescription: text('achievement_description').notNull(),
  significance: text('significance').notNull(),
  competitionCategory: text('competition_category').notNull(),
  achievementDate: text('achievement_date').notNull(),
  points: integer('points'),
  status: text('status').notNull(),
  teamMembers: jsonb('team_members').notNull().$type<TeamMember[]>(),
  supportingDocuments: jsonb('supporting_documents').notNull().$type<SupportingDocument[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Events Table
export const events = pgTable('events', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  date: text('date').notNull(),
  location: text('location').notNull(),
  duration: text('duration').notNull(),
  participants: text('participants').notNull(),
  organizer: text('organizer').notNull(),
  category: text('category').notNull(),
  highlights: jsonb('highlights').notNull().$type<string[]>(),
  gallery: jsonb('gallery').notNull().$type<GalleryItem[]>(),
  draft: boolean('draft').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Team Members Table
export const teamMembers = pgTable('team_members', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  position: text('position').notNull(),
  email: text('email').notNull().unique(),
  initials: text('initials').notNull(),
  gradientFrom: text('gradient_from').notNull(),
  gradientTo: text('gradient_to').notNull(),
  category: text('category').notNull(),
  photoPath: text('photo_path'),
  isSecretary: boolean('is_secretary').default(false).notNull(),
  isCoordinator: boolean('is_coordinator').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Clubs Table
export const clubs = pgTable('clubs', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  longDescription: text('long_description').notNull(),
  type: text('type').notNull(), // 'club' or 'hobby-group'
  category: text('category').notNull(),
  members: text('members').notNull(),
  established: text('established').notNull(),
  email: text('email').notNull(),
  achievements: jsonb('achievements').notNull().$type<string[]>(),
  projects: jsonb('projects').notNull().$type<string[]>(),
  team: jsonb('team').notNull().$type<ClubTeamMember[]>(),
  logoPath: text('logo_path'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Types for TypeScript
export type TeamMember = {
  name: string;
  rollNumber: string;
  branch: string;
  year: string;
  role: string;
  email: string;
  achievements: string[];
};

export type SupportingDocument = {
  name: string;
  type: string;
  filePath: string;
  uploadDate: string;
  description: string;
};

export type GalleryItem = {
  id: string;
  url: string;
  alt: string;
  caption?: string;
};

export type InterIITAchievement = typeof interIITAchievements.$inferSelect;
export type NewInterIITAchievement = typeof interIITAchievements.$inferInsert;

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export type TeamMemberDB = typeof teamMembers.$inferSelect;
export type NewTeamMemberDB = typeof teamMembers.$inferInsert;

export type ClubTeamMember = {
  name: string;
  role: string;
  email: string;
  phone?: string;
};

export type Club = typeof clubs.$inferSelect;
export type NewClub = typeof clubs.$inferInsert;

// Admin Emails Table
export const adminEmails = pgTable('admin_emails', {
  email: text('email').primaryKey(),
  modifiedBy: text('modified_by').notNull().default('system'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type AdminEmail = typeof adminEmails.$inferSelect;
export type NewAdminEmail = typeof adminEmails.$inferInsert;

// Torque Magazines Table
export const torqueMagazines = pgTable('torque_magazines', {
  id: text('id').primaryKey(),
  year: text('year').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  pages: integer('pages').notNull(),
  articles: integer('articles').notNull(),
  featured: text('featured').notNull(),
  filePath: text('file_path').notNull(),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size').notNull(),
  coverPhoto: text('cover_photo'),
  coverPhotoFileName: text('cover_photo_file_name'),
  isLatest: boolean('is_latest').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type TorqueMagazine = typeof torqueMagazines.$inferSelect;
export type NewTorqueMagazine = typeof torqueMagazines.$inferInsert;

// Hackathons Table
export const hackathons = pgTable('hackathons', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  longDescription: text('long_description').notNull(),
  date: text('date').notNull(),
  startTime: text('start_time'),
  endTime: text('end_time'),
  location: text('location').notNull(),
  category: text('category').notNull(),
  status: text('status').notNull(), // 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  registrationLink: text('registration_link'),
  organizerName: text('organizer_name'),
  organizerEmail: text('organizer_email'),
  organizerPhone: text('organizer_phone'),
  organizerWebsite: text('organizer_website'),
  requirements: text('requirements'),
  eligibility: text('eligibility'),
  teamSize: text('team_size'),
  firstPrize: text('first_prize'),
  secondPrize: text('second_prize'),
  thirdPrize: text('third_prize'),
  specialPrizes: text('special_prizes'),
  timeline: text('timeline'),
  importantNotes: text('important_notes'),
  themes: text('themes'),
  judingCriteria: text('juding_criteria'),
  submissionGuidelines: text('submission_guidelines'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Hackathon = typeof hackathons.$inferSelect;
export type NewHackathon = typeof hackathons.$inferInsert;
