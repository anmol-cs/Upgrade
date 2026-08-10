import { todoRepository } from '@/database/repositories/todoRepository';
import { generateId } from '@/utils/id';
import { now } from '@/utils/date';
import { ValidationError } from '@/utils/errors';
import type { Todo } from '@/database/schema';

/**
 * docs/07-Modules/03-ToDo-Module.md
 * To-dos persist until completed; completion archives the item automatically.
 */
export const todoService = {
  async createTodo(title: string, opts?: { priority?: number; dueDate?: number }): Promise<Todo> {
    const trimmed = title.trim();
    if (!trimmed) throw new ValidationError('Task title is required.');

    return todoRepository.create({
      id: generateId(),
      title: trimmed,
      priority: opts?.priority ?? 0,
      dueDate: opts?.dueDate ?? null,
      completed: false,
      archived: false,
      createdAt: now(),
      updatedAt: now(),
    });
  },

  /** Completing a task marks it completed AND archived in a single write — see
   * todoRepository.setCompletionState for why this must not be two separate calls. */
  async complete(id: string): Promise<void> {
    await todoRepository.setCompletionState(id, true);
  },

  /** Undo immediately after accidental completion — restores to active. */
  async uncomplete(id: string): Promise<void> {
    await todoRepository.setCompletionState(id, false);
  },

  /** Restoring an archived (completed) task returns it to the active list. */
  async restoreFromArchive(id: string): Promise<void> {
    await todoRepository.setCompletionState(id, false);
  },

  async reorder(orderedIds: string[]): Promise<void> {
    await todoRepository.reorder(orderedIds);
  },

  async getActiveTodos(): Promise<Todo[]> {
    const all = await todoRepository.list(false);
    return all.filter((t) => !t.completed);
  },

  async getArchivedTodos(): Promise<Todo[]> {
    const all = await todoRepository.list(true);
    return all.filter((t) => t.archived);
  },
};
