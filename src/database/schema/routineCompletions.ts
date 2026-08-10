import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { routines } from './routines';

export const routineCompletions = sqliteTable(
  'routine_completions',
  {
    id: text('id').primaryKey(),
    routineId: text('routine_id')
      .notNull()
      .references(() => routines.id),
    completedOn: text('completed_on').notNull(), // YYYY-MM-DD (local date)
    completedAt: integer('completed_at').notNull(),
  },
  (table) => ({
    completedOnIdx: index('routine_completions_completed_on_idx').on(table.completedOn),
    routineIdIdx: index('routine_completions_routine_id_idx').on(table.routineId),
    // Structural guard against duplicate completions for the same routine+day —
    // belt-and-braces alongside the in-flight guard in routineStore, in case a
    // race ever slips past the client-side check (e.g. two rapid taps before
    // the first request resolves).
    oneCompletionPerDayIdx: uniqueIndex('routine_completions_routine_id_completed_on_unique').on(
      table.routineId,
      table.completedOn
    ),
  })
);

export type RoutineCompletion = typeof routineCompletions.$inferSelect;
export type NewRoutineCompletion = typeof routineCompletions.$inferInsert;
