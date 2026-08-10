import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

/** Skill state machine: inactive -> active -> completed; any state -> archived */
export const SKILL_STATES = ['inactive', 'active', 'completed', 'archived'] as const;
export type SkillState = (typeof SKILL_STATES)[number];

export const skills = sqliteTable('skills', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  icon: text('icon'),
  category: text('category'),
  targetMinutes: integer('target_minutes'),
  position: integer('position').notNull().default(0),
  state: text('state').$type<SkillState>().notNull().default('inactive'),
  startedAt: integer('started_at'),
  completedAt: integer('completed_at'),
  archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const skillSessions = sqliteTable(
  'skill_sessions',
  {
    id: text('id').primaryKey(),
    skillId: text('skill_id')
      .notNull()
      .references(() => skills.id),
    durationMinutes: integer('duration_minutes').notNull(),
    notes: text('notes'),
    completedAt: integer('completed_at').notNull(),
  },
  (table) => ({
    skillIdIdx: index('skill_sessions_skill_id_idx').on(table.skillId),
  })
);

export type Skill = typeof skills.$inferSelect;
export type NewSkill = typeof skills.$inferInsert;
export type SkillSession = typeof skillSessions.$inferSelect;
export type NewSkillSession = typeof skillSessions.$inferInsert;
