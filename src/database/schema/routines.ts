import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const routines = sqliteTable('routines', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  icon: text('icon'),
  position: integer('position').notNull().default(0),
  archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export type Routine = typeof routines.$inferSelect;
export type NewRoutine = typeof routines.$inferInsert;
