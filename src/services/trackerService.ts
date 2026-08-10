import {
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  addMonths,
  addQuarters,
  addYears,
  format,
} from 'date-fns';
import { routineRepository } from '@/database/repositories/routineRepository';
import { skillsRepository } from '@/database/repositories/skillsRepository';
import { todayKey } from '@/utils/date';

export type TrackerPeriod = 'month' | 'quarter' | 'year';

export interface TrackerDayColumn {
  dateKey: string;
  dayLabel: string; // e.g. "14"
  monthLabel: string; // e.g. "Jul"
  isFirstOfMonth: boolean;
  isToday: boolean;
}

export interface TrackerRow {
  id: string;
  type: 'habit' | 'skill';
  title: string;
  icon: string;
  cells: boolean[]; // aligned 1:1 with days
}

export interface TrackerGrid {
  days: TrackerDayColumn[];
  rows: TrackerRow[];
  rangeLabel: string;
}

/** Computes the [start, end] window for a period anchored at a given date. */
function getPeriodRange(period: TrackerPeriod, anchor: Date): { start: Date; end: Date; label: string } {
  switch (period) {
    case 'month':
      return { start: startOfMonth(anchor), end: endOfMonth(anchor), label: format(anchor, 'MMMM yyyy') };
    case 'quarter': {
      const start = startOfQuarter(anchor);
      const end = endOfQuarter(anchor);
      const q = Math.floor(start.getMonth() / 3) + 1;
      return { start, end, label: `Q${q} ${format(anchor, 'yyyy')}` };
    }
    case 'year':
      return { start: startOfYear(anchor), end: endOfYear(anchor), label: format(anchor, 'yyyy') };
  }
}

export function shiftAnchor(period: TrackerPeriod, anchor: Date, direction: 1 | -1): Date {
  switch (period) {
    case 'month':
      return addMonths(anchor, direction);
    case 'quarter':
      return addQuarters(anchor, direction);
    case 'year':
      return addYears(anchor, direction);
  }
}

/**
 * Habit-tracker grid: X for a completed day, blank for a skipped day — mirrors the
 * paper tracker format (Activity rows x day-of-period columns) requested alongside
 * docs/07-Modules/04-Insights-Module.md ("Skill history", "Habit consistency").
 *
 * Includes archived items only if they have at least one completion in the period,
 * so historical data isn't lost but empty archived rows don't clutter the grid.
 */
export async function getTrackerGrid(period: TrackerPeriod, anchor: Date = new Date()): Promise<TrackerGrid> {
  const { start, end, label } = getPeriodRange(period, anchor);
  const today = todayKey();

  const dateObjs = eachDayOfInterval({ start, end });
  const days: TrackerDayColumn[] = dateObjs.map((d, i) => {
    const dateKey = format(d, 'yyyy-MM-dd');
    return {
      dateKey,
      dayLabel: format(d, 'd'),
      monthLabel: format(d, 'MMM'),
      isFirstOfMonth: i === 0 || d.getDate() === 1,
      isToday: dateKey === today,
    };
  });

  const startKey = format(start, 'yyyy-MM-dd');
  const endKey = format(end, 'yyyy-MM-dd');

  const [habits, skills, completions] = await Promise.all([
    routineRepository.list(true),
    skillsRepository.list(true),
    routineRepository.getAllCompletionsInRange(startKey, endKey),
  ]);

  const sessionLists = await Promise.all(skills.map((skill) => skillsRepository.getSessions(skill.id)));
  const sessions = sessionLists.flat();

  const habitCompletionSet = new Set(completions.map((c) => `${c.routineId}|${c.completedOn}`));
  const skillCompletionSet = new Set(
    sessions.map((s) => `${s.skillId}|${format(new Date(s.completedAt), 'yyyy-MM-dd')}`)
  );

  const habitRows: TrackerRow[] = habits
    .filter((h) => !h.archived || days.some((d) => habitCompletionSet.has(`${h.id}|${d.dateKey}`)))
    .map((h) => ({
      id: h.id,
      type: 'habit' as const,
      title: h.title,
      icon: h.icon ?? 'CheckCircle2',
      cells: days.map((d) => habitCompletionSet.has(`${h.id}|${d.dateKey}`)),
    }));

  const skillRows: TrackerRow[] = skills
    .filter((s) => !s.archived || days.some((d) => skillCompletionSet.has(`${s.id}|${d.dateKey}`)))
    .map((s) => ({
      id: s.id,
      type: 'skill' as const,
      title: s.title,
      icon: s.icon ?? 'Sparkles',
      cells: days.map((d) => skillCompletionSet.has(`${s.id}|${d.dateKey}`)),
    }));

  return { days, rows: [...habitRows, ...skillRows], rangeLabel: label };
}
