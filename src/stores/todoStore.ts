import { create } from 'zustand';
import { todoService } from '@/services/todoService';
import { toUserMessage } from '@/utils/errors';
import { refreshRoutineWidget } from '@/widgets/refreshWidget';
import type { Todo } from '@/database/schema';

interface TodoState {
  active: Todo[];
  archived: Todo[];
  isLoading: boolean;
  error: string | null;

  load: () => Promise<void>;
  create: (title: string, priority?: number) => Promise<void>;
  complete: (id: string) => Promise<void>;
  uncomplete: (id: string) => Promise<void>;
  restore: (id: string) => Promise<void>;
  reorder: (orderedIds: string[]) => Promise<void>;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  active: [],
  archived: [],
  isLoading: false,
  error: null,

  load: async () => {
    set({ isLoading: true, error: null });
    try {
      const [active, archived] = await Promise.all([
        todoService.getActiveTodos(),
        todoService.getArchivedTodos(),
      ]);
      set({ active, archived, isLoading: false });
    } catch (e) {
      set({ isLoading: false, error: toUserMessage(e) });
    }
  },

  create: async (title, priority) => {
    try {
      await todoService.createTodo(title, { priority });
      await get().load();
      refreshRoutineWidget();
    } catch (e) {
      set({ error: toUserMessage(e) });
      throw e;
    }
  },

  complete: async (id) => {
    await todoService.complete(id);
    await get().load();
    refreshRoutineWidget();
  },

  uncomplete: async (id) => {
    await todoService.uncomplete(id);
    await get().load();
    refreshRoutineWidget();
  },

  restore: async (id) => {
    await todoService.restoreFromArchive(id);
    await get().load();
  },

  reorder: async (orderedIds) => {
    const previous = get().active;
    const reordered = orderedIds
      .map((id) => previous.find((t) => t.id === id))
      .filter((t): t is (typeof previous)[number] => Boolean(t));
    set({ active: reordered });
    try {
      await todoService.reorder(orderedIds);
    } catch (e) {
      set({ error: toUserMessage(e) });
      await get().load();
    }
  },
}));
