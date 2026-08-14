import { create } from 'zustand';
import { routineService } from '@/services/routineService';
import { skillsService } from '@/services/skillsService';
import { todoService } from '@/services/todoService';
import { toUserMessage } from '@/utils/errors';
import { refreshRoutineWidget } from '@/widgets/refreshWidget';
import type { RoutineDisplayItem } from '@/types';

interface RoutineState { items: RoutineDisplayItem[]; archivedHabits: Awaited<ReturnType<typeof routineService.getArchivedHabits>>; isLoading: boolean; error: string | null; togglingIds: Set<string>; load: () => Promise<void>; loadArchivedHabits: () => Promise<void>; restoreHabit: (id: string) => Promise<void>; toggleItem: (item: RoutineDisplayItem) => Promise<void>; archiveHabit: (id: string) => Promise<void>; deleteHabit: (id: string) => Promise<void>; archiveSkill: (id: string) => Promise<void>; deleteSkill: (id: string) => Promise<void>; archiveTodo: (id: string) => Promise<void>; deleteTodo: (id: string) => Promise<void>; reorderActiveItems: (items: RoutineDisplayItem[]) => Promise<void>; }

export const useRoutineStore = create<RoutineState>((set, get) => ({
 items: [], archivedHabits: [], isLoading: false, error: null, togglingIds: new Set(),
 load: async () => { set({ isLoading: true, error: null }); try { const [habits, activeSkills, todos, completedIds] = await Promise.all([routineService.getActiveHabits(), skillsService.getActiveSkills(), todoService.getActiveTodos(), routineService.getCompletedIdsForToday()]); const skillDone = new Set<string>(); await Promise.all(activeSkills.map(async (s) => { if (await skillsService.isCompletedToday(s.id)) skillDone.add(s.id); })); const items: RoutineDisplayItem[] = [...habits.map((h) => ({ id: `habit:${h.id}`, sourceId: h.id, type: 'habit' as const, title: h.title, icon: h.icon ?? 'CheckCircle2', completed: completedIds.has(h.id) })), ...activeSkills.map((s) => ({ id: `skill:${s.id}`, sourceId: s.id, type: 'skill' as const, title: s.title, icon: s.icon ?? 'Sparkles', completed: skillDone.has(s.id), metadata: 'Active skill' })), ...todos.map((t) => ({ id: `todo:${t.id}`, sourceId: t.id, type: 'todo' as const, title: t.title, icon: 'ListTodo', completed: t.completed }))]; items.sort((a, b) => Number(a.completed) - Number(b.completed)); set({ items, isLoading: false }); } catch (e) { set({ isLoading: false, error: toUserMessage(e) }); } },
 toggleItem: async (item) => { if (get().togglingIds.has(item.id)) return; set({ togglingIds: new Set(get().togglingIds).add(item.id) }); const previous = get().items; try { if (item.type === 'habit') await routineService.toggleCompletion(item.sourceId); else if (item.type === 'todo') { if (item.completed) await todoService.uncomplete(item.sourceId); else await todoService.complete(item.sourceId); } else { return; } await get().load(); refreshRoutineWidget(); } catch (e) { set({ items: previous, error: toUserMessage(e) }); } finally { const next = new Set(get().togglingIds); next.delete(item.id); set({ togglingIds: next }); } },
 loadArchivedHabits: async () => { try { set({ archivedHabits: await routineService.getArchivedHabits() }); } catch (e) { set({ error: toUserMessage(e) }); } },
 restoreHabit: async (id) => { await routineService.restoreHabit(id); await get().loadArchivedHabits(); },
 archiveHabit: async (id) => { await routineService.archiveHabit(id); await get().load(); refreshRoutineWidget(); },
 deleteHabit: async (id) => { await routineService.deleteHabit(id); await get().load(); refreshRoutineWidget(); },
 archiveSkill: async (id) => { await skillsService.archiveSkill(id); await get().load(); refreshRoutineWidget(); },
 deleteSkill: async (id) => { await skillsService.deleteSkill(id); await get().load(); refreshRoutineWidget(); },
 archiveTodo: async (id) => { await todoService.archiveTodo(id); await get().load(); refreshRoutineWidget(); },
 deleteTodo: async (id) => { await todoService.deleteTodo(id); await get().load(); refreshRoutineWidget(); },
 reorderActiveItems: async (orderedActiveItems) => { const completed = get().items.filter((i) => i.completed); set({ items: [...orderedActiveItems, ...completed] }); const habitIds = orderedActiveItems.filter((i) => i.type === 'habit').map((i) => i.sourceId); const skillIds = orderedActiveItems.filter((i) => i.type === 'skill').map((i) => i.sourceId); const todoIds = orderedActiveItems.filter((i) => i.type === 'todo').map((i) => i.sourceId); try { await Promise.all([habitIds.length ? routineService.reorder(habitIds) : Promise.resolve(), skillIds.length ? skillsService.reorder(skillIds) : Promise.resolve(), todoIds.length ? todoService.reorder(todoIds) : Promise.resolve()]); await get().load(); } catch (e) { set({ error: toUserMessage(e) }); await get().load(); } },
}));

export function selectDailyProgress(items: RoutineDisplayItem[]) { const total = items.length; const completed = items.filter((i) => i.completed).length; return { completed, total, percentage: total === 0 ? 0 : completed / total }; }
