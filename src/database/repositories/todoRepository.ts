import { eq, asc, desc } from 'drizzle-orm';
import { db } from '../client';
import { todos, type Todo, type NewTodo } from '../schema';
import { NotFoundError, PersistenceError } from '@/utils/errors';

export const todoRepository = {
  async create(data: NewTodo): Promise<Todo> {
    try {
      await db.insert(todos).values(data);
      return data as Todo;
    } catch {
      throw new PersistenceError('Failed to create to-do.');
    }
  },

  async getById(id: string): Promise<Todo> {
    const [row] = await db.select().from(todos).where(eq(todos.id, id));
    if (!row) throw new NotFoundError('Todo', id);
    return row;
  },

  async list(includeArchived = false): Promise<Todo[]> {
    const rows = await db.select().from(todos).orderBy(desc(todos.priority), asc(todos.createdAt));
    return includeArchived ? rows : rows.filter((t) => !t.archived);
  },

  async update(id: string, patch: Partial<NewTodo>): Promise<void> {
    await db.update(todos).set(patch).where(eq(todos.id, id));
  },

  /**
   * Single atomic write for completed+archived+completedAt together.
   * Two sequential UPDATEs here would risk an inconsistent row (e.g. completed=true,
   * archived=false) if the app were killed between them — that row would then be
   * invisible to both getActiveTodos() and getArchivedTodos().
   */
  async setCompletionState(id: string, completed: boolean): Promise<void> {
    await db
      .update(todos)
      .set({
        completed,
        archived: completed,
        completedAt: completed ? Date.now() : null,
        updatedAt: Date.now(),
      })
      .where(eq(todos.id, id));
  },

  /** No dedicated position column — priority doubles as the display/drag order key. */
  async reorder(orderedIds: string[]): Promise<void> {
    const highest = orderedIds.length;
    await Promise.all(
      orderedIds.map((id, index) =>
        db.update(todos).set({ priority: highest - index, updatedAt: Date.now() }).where(eq(todos.id, id))
      )
    );
  },
};
