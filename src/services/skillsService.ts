import { skillsRepository } from '@/database/repositories/skillsRepository';
import { generateId } from '@/utils/id';
import { now } from '@/utils/date';
import { assignIcon } from '@/utils/icon';
import { ValidationError, ConflictError } from '@/utils/errors';
import type { Skill } from '@/database/schema';

/**
 * docs/07-Modules/02-Skills-Module.md
 * States: inactive -> active -> completed; any -> archived.
 * Archived skills cannot accept new sessions. Practice history is immutable.
 */
export const skillsService = {
  async createSkill(title: string, targetMinutes?: number): Promise<Skill> {
    const trimmed = title.trim();
    if (!trimmed) throw new ValidationError('Skill title is required.');

    const existing = await skillsRepository.list();
    return skillsRepository.create({
      id: generateId(),
      title: trimmed,
      icon: assignIcon(trimmed, 'skill'),
      targetMinutes: targetMinutes ?? null,
      position: existing.length,
      state: 'inactive',
      archived: false,
      createdAt: now(),
      updatedAt: now(),
    });
  },

  async reorder(orderedIds: string[]): Promise<void> {
    await skillsRepository.reorder(orderedIds);
  },

  /** Restored skills return in their prior state (Inactive/Completed) unless explicitly reactivated. */
  async restoreSkill(id: string): Promise<void> {
    await skillsRepository.restore(id);
  },

  async activate(id: string): Promise<void> {
    const skill = await skillsRepository.getById(id);
    if (skill.archived) throw new ConflictError('Cannot activate an archived skill.');
    await skillsRepository.update(id, { state: 'active', startedAt: now(), updatedAt: now() });
  },

  async deactivate(id: string): Promise<void> {
    await skillsRepository.update(id, { state: 'inactive', updatedAt: now() });
  },

  /** Records completion date and duration; moves to Completed state, visible in Insights. */
  async completeSkill(id: string): Promise<void> {
    const skill = await skillsRepository.getById(id);
    if (skill.state !== 'active') {
      throw new ConflictError('Only active skills can be completed.');
    }
    await skillsRepository.update(id, { state: 'completed', completedAt: now(), updatedAt: now() });
  },

  async archiveSkill(id: string): Promise<void> {
    await skillsRepository.archive(id);
  },

  async logSession(skillId: string, durationMinutes: number, notes?: string): Promise<void> {
    const skill = await skillsRepository.getById(skillId);
    if (skill.archived) throw new ConflictError('Archived skills cannot accept new sessions.');
    if (durationMinutes <= 0) throw new ValidationError('Duration must be greater than zero.');

    await skillsRepository.addSession({
      id: generateId(),
      skillId,
      durationMinutes,
      notes: notes ?? null,
      completedAt: now(),
    });
  },

  async getActiveSkills(): Promise<Skill[]> {
    const all = await skillsRepository.list(false);
    return all.filter((s) => s.state === 'active');
  },

  async getInactiveSkills(): Promise<Skill[]> {
    const all = await skillsRepository.list(false);
    return all.filter((s) => s.state === 'inactive');
  },

  async getCompletedSkills(): Promise<Skill[]> {
    const all = await skillsRepository.list(true);
    return all.filter((s) => s.state === 'completed');
  },

  async getArchivedSkills(): Promise<Skill[]> {
    const all = await skillsRepository.list(true);
    return all.filter((s) => s.archived);
  },

  async getSessionHistory(skillId: string) {
    return skillsRepository.getSessions(skillId);
  },
};
