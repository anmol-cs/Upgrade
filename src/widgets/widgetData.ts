import { routineService } from '@/services/routineService';
import { skillsService } from '@/services/skillsService';
import { todoService } from '@/services/todoService';

export interface WidgetItem {
  id: string;
  type: 'habit' | 'skill' | 'todo';
  sourceId: string;
  title: string;
  completed: boolean;
}

export interface WidgetData {
  completed: number;
  total: number;
  nextItems: WidgetItem[];
}

/**
 * docs/03-Design/06-Widgets.md — Content priority: today's progress, next actionable
 * item, active skill, highest-priority to-do. Read-only + local data only.
 */
export async function getWidgetData(): Promise<WidgetData> {
  const [habits, activeSkills, todos, completedIds] = await Promise.all([
    routineService.getActiveHabits(),
    skillsService.getActiveSkills(),
    todoService.getActiveTodos(),
    routineService.getCompletedIdsForToday(),
  ]);

  const items: WidgetItem[] = [
    ...habits.map((h) => ({
      id: `habit:${h.id}`,
      type: 'habit' as const,
      sourceId: h.id,
      title: h.title,
      completed: completedIds.has(h.id),
    })),
    ...activeSkills.map((s) => ({
      id: `skill:${s.id}`,
      type: 'skill' as const,
      sourceId: s.id,
      title: s.title,
      completed: false,
    })),
    ...todos.map((t) => ({
      id: `todo:${t.id}`,
      type: 'todo' as const,
      sourceId: t.id,
      title: t.title,
      completed: t.completed,
    })),
  ];

  const completed = items.filter((i) => i.completed).length;
  const nextItems = items.filter((i) => !i.completed).slice(0, 3);

  return { completed, total: items.length, nextItems };
}

/** Only habits and to-dos can be quick-completed from the widget; skills require the app. */
export async function toggleWidgetItem(item: Pick<WidgetItem, 'type' | 'sourceId'>): Promise<void> {
  if (item.type === 'habit') {
    await routineService.toggleCompletion(item.sourceId);
  } else if (item.type === 'todo') {
    await todoService.complete(item.sourceId);
  }
}
