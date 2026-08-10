import { create } from 'zustand';
import { insightsService, type InsightsSummary } from '@/services/insightsService';
import { toUserMessage } from '@/utils/errors';

interface InsightsState {
  summary: InsightsSummary | null;
  isLoading: boolean;
  error: string | null;
  load: () => Promise<void>;
}

export const useInsightsStore = create<InsightsState>((set) => ({
  summary: null,
  isLoading: false,
  error: null,

  load: async () => {
    set({ isLoading: true, error: null });
    try {
      const summary = await insightsService.getSummary();
      set({ summary, isLoading: false });
    } catch (e) {
      set({ isLoading: false, error: toUserMessage(e) });
    }
  },
}));
