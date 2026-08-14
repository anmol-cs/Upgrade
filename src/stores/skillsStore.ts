import { create } from 'zustand';
import { skillsService } from '@/services/skillsService';
import { toUserMessage } from '@/utils/errors';
import { refreshRoutineWidget } from '@/widgets/refreshWidget';
import type { Skill } from '@/database/schema';

interface SkillsState {
  active: Skill[];
  inactive: Skill[];
  completed: Skill[];
  archived: Skill[];
  isLoading: boolean;
  error: string | null;

  load: () => Promise<void>;
  create: (title: string, targetMinutes?: number) => Promise<void>;
  activate: (id: string) => Promise<void>;
  deactivate: (id: string) => Promise<void>;
  complete: (id: string, minutes: number) => Promise<void>;
  archive: (id: string) => Promise<void>;
  restore: (id: string) => Promise<void>;
  reorder: (orderedIds: string[]) => Promise<void>;
  logSession: (id: string, minutes: number, notes?: string) => Promise<void>;
}

export const useSkillsStore = create<SkillsState>((set, get) => ({
  active: [],
  inactive: [],
  completed: [],
  archived: [],
  isLoading: false,
  error: null,

  load: async () => {
    set({ isLoading: true, error: null });
    try {
      const [active, inactive, completed, archived] = await Promise.all([
        skillsService.getActiveSkills(),
        skillsService.getInactiveSkills(),
        skillsService.getCompletedSkills(),
        skillsService.getArchivedSkills(),
      ]);
      set({ active, inactive, completed, archived, isLoading: false });
    } catch (e) {
      set({ isLoading: false, error: toUserMessage(e) });
    }
  },

  create: async (title, targetMinutes) => {
    try {
      await skillsService.createSkill(title, targetMinutes);
      await get().load();
    } catch (e) {
      set({ error: toUserMessage(e) });
      throw e;
    }
  },

  activate: async (id) => {
    await skillsService.activate(id);
    await get().load();
    refreshRoutineWidget();
  },

  deactivate: async (id) => {
    await skillsService.deactivate(id);
    await get().load();
    refreshRoutineWidget();
  },

  complete: async (id, minutes) => {
    await skillsService.completeSkill(id, minutes);
    await get().load();
    refreshRoutineWidget();
  },

  archive: async (id) => {
    await skillsService.archiveSkill(id);
    await get().load();
    refreshRoutineWidget();
  },

  restore: async (id) => {
    await skillsService.restoreSkill(id);
    await get().load();
    refreshRoutineWidget();
  },

  reorder: async (orderedIds) => {
    const previous = get().active;
    const reordered = orderedIds
      .map((id) => previous.find((s) => s.id === id))
      .filter((s): s is (typeof previous)[number] => Boolean(s));
    set({ active: reordered });
    try {
      await skillsService.reorder(orderedIds);
    } catch (e) {
      set({ error: toUserMessage(e) });
      await get().load();
    }
  },

  logSession: async (id, minutes, notes) => {
    await skillsService.logSession(id, minutes, notes);
    await get().load();
  },
}));
