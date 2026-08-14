import { todoRepository } from '@/database/repositories/todoRepository';
import { generateId } from '@/utils/id';
import { now } from '@/utils/date';
import { ValidationError } from '@/utils/errors';
import type { Todo } from '@/database/schema';

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

  async complete(id: string): Promise<void> {
    await todoRepository.setCompletionState(id, true);
  },

  async uncomplete(id: string): Promise<void> {
    await todoRepository.setCompletionState(id, false);
  },

  async archiveTodo(id: string): Promise<void> {
    await todoRepository.archive(id);
  },

  async deleteTodo(id: string): Promise<void> {
    await todoRepository.delete(id);
  },

  async restoreFromArchive(id: string): Promise<void> {
    await todoRepository.setCompletionState(id, false);
  },

  async reorder(orderedIds: string[]): Promise<void> {
    await todoRepository.reorder(orderedIds);
  },

  async getActiveTodos(): Promise<Todo[]> {
    const all = await todoRepository.list(false);
    return all.filter((t) => !t.completed && !t.archived);
  },

  async getArchivedTodos(): Promise<Todo[]> {
    const all = await todoRepository.list(true);
    return all.filter((t) => t.archived);
  },
};
