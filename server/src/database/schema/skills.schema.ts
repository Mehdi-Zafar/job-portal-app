// src/database/schema/skills.schema.ts
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { applicantSkills, jobRequiredSkills } from './applications.schema';

// Skills master table
export const skills = pgTable('skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  category: varchar('category', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const skillsRelations = relations(skills, ({ many }) => ({
  applicantSkills: many(applicantSkills),
  jobRequiredSkills: many(jobRequiredSkills),
}));