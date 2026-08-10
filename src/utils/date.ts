import { format, isToday, startOfDay } from 'date-fns';

/**
 * All timestamps use local device time (docs/02-Product/02-Feature-Specifications.md).
 * Daily identity is derived from local calendar date, never UTC.
 */
export function todayKey(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd');
}

export function isSameLocalDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function isTodayLocal(date: Date): boolean {
  return isToday(date);
}

export function greetingForTime(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function now(): number {
  return Date.now();
}
