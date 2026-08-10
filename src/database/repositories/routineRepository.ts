import { and, eq, asc, gte, lte } from 'drizzle-orm';
import { db } from '../client';
import { routines, routineCompletions, type Routine, type NewRoutine } from '../schema';
import { PersistenceError, NotFoundError } from '@/utils/errors';

/** docs/08-API/03-Repository-Layer.md — CRUD + queries only, no business rules. */
export const routineRepository = {
  async create(data: NewRoutine): Promise<Routine> {
    try {
      await db.insert(routines).values(data);
      return data as Routine;
    } catch (e) {
      throw new PersistenceError('Failed to create routine.');
    }
  },

  async getById(id: string): Promise<Routine> {
    const [row] = await db.select().from(routines).where(eq(routines.id, id));
    if (!row) throw new NotFoundError('Routine', id);
    return row;
  },

  async list(includeArchived = false): Promise<Routine[]> {
    const rows = await db.select().from(routines).orderBy(asc(routines.position));
    return includeArchived ? rows : rows.filter((r) => !r.archived);
  },

  async update(id: string, patch: Partial<NewRoutine>): Promise<void> {
    await db.update(routines).set(patch).where(eq(routines.id, id));
  },

  async archive(id: string): Promise<void> {
    await db.update(routines).set({ archived: true, updatedAt: Date.now() }).where(eq(routines.id, id));
  },

  async restore(id: string): Promise<void> {
    await db.update(routines).set({ archived: false, updatedAt: Date.now() }).where(eq(routines.id, id));
  },

  // Runs as N parallel UPDATE statements rather than one bulk statement or a
  // transaction — fine here since position is the only field touched and a
  // partial failure just leaves ordering slightly stale (self-heals on the next
  // successful reorder), not corrupted data.
  async reorder(orderedIds: string[]): Promise<void> {
    await Promise.all(
      orderedIds.map((id, index) =>
        db.update(routines).set({ position: index, updatedAt: Date.now() }).where(eq(routines.id, id))
      )
    );
  },

  // --- Completions ---

  async getCompletionsForDate(routineId: string, dateKey: string) {
    return db
      .select()
      .from(routineCompletions)
      .where(and(eq(routineCompletions.routineId, routineId), eq(routineCompletions.completedOn, dateKey)));
  },

  async getCompletedIdsForDate(dateKey: string): Promise<Set<string>> {
    const rows = await db
      .select()
      .from(routineCompletions)
      .where(eq(routineCompletions.completedOn, dateKey));
    return new Set(rows.map((r) => r.routineId));
  },

  async addCompletion(routineId: string, dateKey: string, id: string) {
    await db.insert(routineCompletions).values({
      id,
      routineId,
      completedOn: dateKey,
      completedAt: Date.now(),
    });
  },

  async removeCompletion(routineId: string, dateKey: string) {
    await db
      .delete(routineCompletions)
      .where(and(eq(routineCompletions.routineId, routineId), eq(routineCompletions.completedOn, dateKey)));
  },

  async getHistory(routineId: string) {
    return db.select().from(routineCompletions).where(eq(routineCompletions.routineId, routineId));
  },

  /**
   * Used by insightsService (90-day heatmap) and trackerService (month/quarter/
   * year grid, up to ~365 days) — filters in SQL via the completed_on index
   * rather than pulling every completion row ever recorded into memory and
   * filtering in JS, which would get slower every month as history grows.
   * completedOn is stored as 'YYYY-MM-DD' text, so a plain string >=/<=
   * comparison is a correct and index-friendly range filter.
   */
  async getAllCompletionsInRange(startKey: string, endKey: string) {
    return db
      .select()
      .from(routineCompletions)
      .where(and(gte(routineCompletions.completedOn, startKey), lte(routineCompletions.completedOn, endKey)));
  },
};

