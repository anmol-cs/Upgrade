import { create } from 'zustand';
import { todoService } from '@/services/todoService';
import { toUserMessage } from '@/utils/errors';
import { refreshRoutineWidget } from '@/widgets/refreshWidget';
import type { Todo } from '@/database/schema';

interface TodoState { active: Todo[]; archived: Todo[]; isLoading: boolean; error: string | null; load: () => Promise<void>; create: (title: string, priority?: number) => Promise<void>; complete: (id: string) => Promise<void>; uncomplete: (id: string) => Promise<void>; archive: (id: string) => Promise<void>; delete: (id: string) => Promise<void>; restore: (id: string) => Promise<void>; reorder: (orderedIds: string[]) => Promise<void>; }
export const useTodoStore = create<TodoState>((set, get) => ({
 active: [], archived: [], isLoading: false, error: null,
 load: async () => { set({ isLoading: true, error: null }); try { const [active, archived] = await Promise.all([todoService.getActiveTodos(), todoService.getArchivedTodos()]); set({ active, archived, isLoading: false }); } catch (e) { set({ isLoading: false, error: toUserMessage(e) }); } },
 create: async (title, priority) => { try { await todoService.createTodo(title, { priority }); await get().load(); refreshRoutineWidget(); } catch (e) { set({ error: toUserMessage(e) }); throw e; } },
 complete: async (id) => { await todoService.complete(id); await get().load(); refreshRoutineWidget(); },
 uncomplete: async (id) => { await todoService.uncomplete(id); await get().load(); refreshRoutineWidget(); },
 archive: async (id) => { await todoService.archiveTodo(id); await get().load(); refreshRoutineWidget(); },
 delete: async (id) => { await todoService.deleteTodo(id); await get().load(); refreshRoutineWidget(); },
 restore: async (id) => { await todoService.restoreFromArchive(id); await get().load(); refreshRoutineWidget(); },
 reorder: async (orderedIds) => { const previous = get().active; set({ active: orderedIds.map((id) => previous.find((t) => t.id === id)).filter((t): t is Todo => Boolean(t)) }); try { await todoService.reorder(orderedIds); await get().load(); } catch (e) { set({ error: toUserMessage(e) }); await get().load(); } },
}));
