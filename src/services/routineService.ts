import { routineRepository } from '@/database/repositories/routineRepository';
import { generateId } from '@/utils/id';
import { now, todayKey } from '@/utils/date';
import { assignIcon } from '@/utils/icon';
import { ValidationError } from '@/utils/errors';
import type { Routine } from '@/database/schema';

/**
 * docs/08-API/02-Service-Layer.md
 * Services validate inputs, apply business rules, and coordinate repositories.
 * Never contains UI/presentation logic.
 */
export const routineService = {
  async createHabit(title: string): Promise<Routine> {
    const trimmed = title.trim();
    if (!trimmed) throw new ValidationError('Habit title is required.');

    const existing = await routineRepository.list();
    return routineRepository.create({
      id: generateId(),
      title: trimmed,
      icon: assignIcon(trimmed, 'habit'),
      position: existing.length,
      archived: false,
      createdAt: now(),
      updatedAt: now(),
    });
  },

  async renameHabit(id: string, title: string): Promise<void> {
    const trimmed = title.trim();
    if (!trimmed) throw new ValidationError('Habit title is required.');
    await routineRepository.update(id, { title: trimmed, updatedAt: now() });
  },

  async archiveHabit(id: string): Promise<void> {
    await routineRepository.archive(id);
  },

  async restoreHabit(id: string): Promise<void> {
    await routineRepository.restore(id);
  },

  async reorder(orderedIds: string[]): Promise<void> {
    await routineRepository.reorder(orderedIds);
  },

  /**
   * Completion is recorded once per scheduled occurrence
   * (docs/07-Modules/01-Routine-Module.md — Business Rules).
   * Toggling is idempotent per local calendar day.
   *
   * The store guards against overlapping calls for the same item, and the schema has
   * a unique(routineId, completedOn) index as a second line of defense — if a race
   * ever slips past both and the insert hits that constraint, we treat it as a no-op:
   * the row we were trying to create already exists, which is the correct end state.
   */
  async toggleCompletion(routineId: string, date: Date = new Date()): Promise<boolean> {
    const dateKey = todayKey(date);
    const existing = await routineRepository.getCompletionsForDate(routineId, dateKey);
    if (existing.length > 0) {
      await routineRepository.removeCompletion(routineId, dateKey);
      return false;
    }
    try {
      await routineRepository.addCompletion(routineId, dateKey, generateId());
    } catch (e) {
      // Unique constraint hit — another call already inserted today's completion.
      const message = e instanceof Error ? e.message : String(e);
      if (!message.toLowerCase().includes('unique')) throw e;
    }
    return true;
  },

  async getActiveHabits(): Promise<Routine[]> {
    return routineRepository.list(false);
  },

  async getArchivedHabits(): Promise<Routine[]> {
    const all = await routineRepository.list(true);
    return all.filter((r) => r.archived);
  },

  async getCompletedIdsForToday(): Promise<Set<string>> {
    return routineRepository.getCompletedIdsForDate(todayKey());
  },
};
