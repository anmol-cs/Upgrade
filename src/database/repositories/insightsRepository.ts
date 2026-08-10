import { db } from '../client';
import { routineCompletions, skillSessions, todos, routines } from '../schema';
import { eq } from 'drizzle-orm';

/** Read-only aggregate queries feeding the Insights module. */
export const insightsRepository = {
  async getAllCompletions() {
    return db.select().from(routineCompletions);
  },

  async getAllSkillSessions() {
    return db.select().from(skillSessions);
  },

  async getCompletedTodosCount(): Promise<number> {
    const rows = await db.select().from(todos).where(eq(todos.completed, true));
    return rows.length;
  },

  async getActiveRoutineCount(): Promise<number> {
    const rows = await db.select().from(routines).where(eq(routines.archived, false));
    return rows.length;
  },
};
