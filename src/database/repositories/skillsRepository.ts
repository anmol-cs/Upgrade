import { eq, asc } from 'drizzle-orm';
import { db } from '../client';
import { skills, skillSessions, type Skill, type NewSkill, type NewSkillSession } from '../schema';
import { NotFoundError, PersistenceError } from '@/utils/errors';

export const skillsRepository = {
  async create(data: NewSkill): Promise<Skill> {
    try {
      await db.insert(skills).values(data);
      return data as Skill;
    } catch {
      throw new PersistenceError('Failed to create skill.');
    }
  },

  async getById(id: string): Promise<Skill> {
    const [row] = await db.select().from(skills).where(eq(skills.id, id));
    if (!row) throw new NotFoundError('Skill', id);
    return row;
  },

  async list(includeArchived = false): Promise<Skill[]> {
    const rows = await db.select().from(skills).orderBy(asc(skills.position));
    return includeArchived ? rows : rows.filter((s) => !s.archived);
  },

  async update(id: string, patch: Partial<NewSkill>): Promise<void> {
    await db.update(skills).set(patch).where(eq(skills.id, id));
  },

  async archive(id: string): Promise<void> {
    await db.update(skills).set({ archived: true, updatedAt: Date.now() }).where(eq(skills.id, id));
  },

  async restore(id: string): Promise<void> {
    await db.update(skills).set({ archived: false, updatedAt: Date.now() }).where(eq(skills.id, id));
  },

  async reorder(orderedIds: string[]): Promise<void> {
    await Promise.all(
      orderedIds.map((id, index) =>
        db.update(skills).set({ position: index, updatedAt: Date.now() }).where(eq(skills.id, id))
      )
    );
  },

  async addSession(data: NewSkillSession) {
    await db.insert(skillSessions).values(data);
  },

  async getSessions(skillId: string) {
    return db.select().from(skillSessions).where(eq(skillSessions.skillId, skillId));
  },
};
