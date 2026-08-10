import { create } from 'zustand';
import { routineService } from '@/services/routineService';
import { skillsService } from '@/services/skillsService';
import { todoService } from '@/services/todoService';
import { toUserMessage } from '@/utils/errors';
import { refreshRoutineWidget } from '@/widgets/refreshWidget';
import type { RoutineDisplayItem } from '@/types';

interface RoutineState {
  items: RoutineDisplayItem[];
  archivedHabits: Awaited<ReturnType<typeof routineService.getArchivedHabits>>;
  isLoading: boolean;
  error: string | null;
  /** ids of items currently mid-toggle — guards against a rapid double-tap firing two
   * overlapping writes for the same item before the first one resolves. */
  togglingIds: Set<string>;

  load: () => Promise<void>;
  loadArchivedHabits: () => Promise<void>;
  restoreHabit: (id: string) => Promise<void>;
  toggleItem: (item: RoutineDisplayItem) => Promise<void>;
  /** Persists a new drag order for the (incomplete) active items, split by source type. */
  reorderActiveItems: (orderedActiveItems: RoutineDisplayItem[]) => Promise<void>;
}

/**
 * docs/04-Architecture/03-State-Management.md
 * Combines Habits + Active Skills + Pending To-Dos into the unified Routine view.
 * Derived state (progress %) is computed via selectors, not stored.
 */
export const useRoutineStore = create<RoutineState>((set, get) => ({
  items: [],
  archivedHabits: [],
  isLoading: false,
  error: null,
  togglingIds: new Set(),

  load: async () => {
    set({ isLoading: true, error: null });
    try {
      const [habits, activeSkills, todos, completedIds] = await Promise.all([
        routineService.getActiveHabits(),
        skillsService.getActiveSkills(),
        todoService.getActiveTodos(),
        routineService.getCompletedIdsForToday(),
      ]);

      const items: RoutineDisplayItem[] = [
        ...habits.map((h) => ({
          id: `habit:${h.id}`,
          sourceId: h.id,
          type: 'habit' as const,
          title: h.title,
          icon: h.icon ?? 'CheckCircle2',
          completed: completedIds.has(h.id),
        })),
        ...activeSkills.map((s) => ({
          id: `skill:${s.id}`,
          sourceId: s.id,
          type: 'skill' as const,
          title: s.title,
          icon: s.icon ?? 'Sparkles',
          completed: false,
          metadata: 'Active skill',
        })),
        ...todos.map((t) => ({
          id: `todo:${t.id}`,
          sourceId: t.id,
          type: 'todo' as const,
          title: t.title,
          icon: 'ListTodo',
          completed: t.completed,
        })),
      ];

      // Incomplete items first, completed items below the divider.
      items.sort((a, b) => Number(a.completed) - Number(b.completed));

      set({ items, isLoading: false });
    } catch (e) {
      set({ isLoading: false, error: toUserMessage(e) });
    }
  },

  toggleItem: async (item) => {
    // Ignore a second tap that arrives while the first toggle for this item is still
    // in flight — without this, a fast double-tap can race two writes for the same
    // item (see routineRepository's unique index for the belt-and-braces DB-side guard).
    if (get().togglingIds.has(item.id)) return;
    set({ togglingIds: new Set(get().togglingIds).add(item.id) });

    // Optimistic update.
    const previous = get().items;
    set({
      items: previous.map((i) => (i.id === item.id ? { ...i, completed: !i.completed } : i)),
    });

    try {
      if (item.type === 'habit') {
        await routineService.toggleCompletion(item.sourceId);
      } else if (item.type === 'todo') {
        if (item.completed) {
          await todoService.uncomplete(item.sourceId);
        } else {
          await todoService.complete(item.sourceId);
        }
      }
      await get().load();
      refreshRoutineWidget();
    } catch (e) {
      // Roll back on failure.
      set({ items: previous, error: toUserMessage(e) });
    } finally {
      const next = new Set(get().togglingIds);
      next.delete(item.id);
      set({ togglingIds: next });
    }
  },

  loadArchivedHabits: async () => {
    set({ isLoading: true, error: null });
    try {
      const archivedHabits = await routineService.getArchivedHabits();
      set({ archivedHabits, isLoading: false });
    } catch (e) {
      set({ isLoading: false, error: toUserMessage(e) });
    }
  },

  restoreHabit: async (id) => {
    await routineService.restoreHabit(id);
    await get().loadArchivedHabits();
  },

  reorderActiveItems: async (orderedActiveItems) => {
    const completed = get().items.filter((i) => i.completed);
    // Optimistic: active items in new order, completed items unchanged below.
    set({ items: [...orderedActiveItems, ...completed] });

    const habitIds = orderedActiveItems.filter((i) => i.type === 'habit').map((i) => i.sourceId);
    const skillIds = orderedActiveItems.filter((i) => i.type === 'skill').map((i) => i.sourceId);
    const todoIds = orderedActiveItems.filter((i) => i.type === 'todo').map((i) => i.sourceId);

    try {
      await Promise.all([
        habitIds.length > 0 ? routineService.reorder(habitIds) : Promise.resolve(),
        skillIds.length > 0 ? skillsService.reorder(skillIds) : Promise.resolve(),
        todoIds.length > 0 ? todoService.reorder(todoIds) : Promise.resolve(),
      ]);
      await get().load();
    } catch (e) {
      set({ error: toUserMessage(e) });
      await get().load();
    }
  },
}));

/** Derived selector — never stored, always computed. */
export function selectDailyProgress(items: RoutineDisplayItem[]) {
  const total = items.length;
  const completed = items.filter((i) => i.completed).length;
  return { completed, total, percentage: total === 0 ? 0 : completed / total };
}
