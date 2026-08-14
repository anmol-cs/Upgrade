import { skillsRepository } from '@/database/repositories/skillsRepository';
import { generateId } from '@/utils/id';
import { now } from '@/utils/date';
import { assignIcon } from '@/utils/icon';
import { ValidationError, ConflictError } from '@/utils/errors';
import { startOfDay, addDays } from 'date-fns';
import type { Skill } from '@/database/schema';

function todayWindow(): { start: number; end: number } {
  const start = startOfDay(new Date());
  return { start: start.getTime(), end: addDays(start, 1).getTime() };
}

export const skillsService = {
  async createSkill(title: string, targetMinutes?: number): Promise<Skill> {
    const trimmed = title.trim();
    if (!trimmed) throw new ValidationError('Skill title is required.');

    const existing = await skillsRepository.list(true);
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

  async restoreSkill(id: string): Promise<void> {
    await skillsRepository.restore(id);
  },

  async activate(id: string): Promise<void> {
    const skill = await skillsRepository.getById(id);
    if (skill.archived) throw new ConflictError('Cannot activate an archived skill.');
    await skillsRepository.update(id, { state: 'active', startedAt: skill.startedAt ?? now(), updatedAt: now() });
  },

  async deactivate(id: string): Promise<void> {
    await skillsRepository.update(id, { state: 'inactive', updatedAt: now() });
  },

  /** Marks the skill complete for today by recording a daily practice session. */
  async completeSkill(id: string, durationMinutes: number): Promise<void> {
    const skill = await skillsRepository.getById(id);
    if (skill.archived) throw new ConflictError('Cannot complete an archived skill.');
    if (skill.state !== 'active') throw new ConflictError('Only active skills can be completed.');
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      throw new ValidationError('Practice time must be greater than zero.');
    }

    const { start, end } = todayWindow();
    const existing = await skillsRepository.getSessionForDate(id, start, end);
    if (existing) throw new ConflictError('This skill is already completed for today.');

    await skillsRepository.addSession({
      id: generateId(),
      skillId: id,
      durationMinutes,
      notes: null,
      completedAt: now(),
    });
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
    return all.filter((s) => s.state === 'completed' && !s.archived);
  },

  async getArchivedSkills(): Promise<Skill[]> {
    const all = await skillsRepository.list(true);
    return all.filter((s) => s.archived);
  },

  async getSessionHistory(skillId: string) {
    return skillsRepository.getSessions(skillId);
  },

  async isCompletedToday(skillId: string): Promise<boolean> {
    const { start, end } = todayWindow();
    return Boolean(await skillsRepository.getSessionForDate(skillId, start, end));
  },
};
