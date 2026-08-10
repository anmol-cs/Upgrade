import { insightsRepository } from '@/database/repositories/insightsRepository';
import { format, subDays } from 'date-fns';

export interface HeatmapDay {
  date: string;
  count: number;
}

export interface InsightsSummary {
  totalCompletions: number;
  currentActiveRoutines: number;
  completedTodos: number;
  totalPracticeMinutes: number;
  heatmap: HeatmapDay[];
}

/**
 * docs/07-Modules/04-Insights-Module.md
 * Reflective, non-judgmental analytics. No streaks, no gamification metrics.
 */
export const insightsService = {
  async getSummary(daysBack = 90): Promise<InsightsSummary> {
    const [completions, sessions, completedTodos, activeRoutines] = await Promise.all([
      insightsRepository.getAllCompletions(),
      insightsRepository.getAllSkillSessions(),
      insightsRepository.getCompletedTodosCount(),
      insightsRepository.getActiveRoutineCount(),
    ]);

    const countByDate = new Map<string, number>();
    for (const c of completions) {
      countByDate.set(c.completedOn, (countByDate.get(c.completedOn) ?? 0) + 1);
    }

    const heatmap: HeatmapDay[] = [];
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      heatmap.push({ date, count: countByDate.get(date) ?? 0 });
    }

    const totalPracticeMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);

    return {
      totalCompletions: completions.length,
      currentActiveRoutines: activeRoutines,
      completedTodos,
      totalPracticeMinutes,
      heatmap,
    };
  },

  /** Consistency = fraction of the trailing window with at least one completion. */
  async getWeeklyConsistency(): Promise<number> {
    const summary = await this.getSummary(7);
    const activeDays = summary.heatmap.filter((d) => d.count > 0).length;
    return activeDays / 7;
  },
};
