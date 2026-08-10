export type RoutineItemType = 'habit' | 'skill' | 'todo';

/** Unified item shown in the Routine screen — habits, active skills, pending to-dos. */
export interface RoutineDisplayItem {
  id: string;
  sourceId: string;
  type: RoutineItemType;
  title: string;
  icon: string;
  completed: boolean;
  metadata?: string;
}

export interface DailyProgress {
  completed: number;
  total: number;
  percentage: number;
}
