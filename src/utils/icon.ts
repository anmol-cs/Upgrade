/**
 * Automatic icon assignment. Users are never asked to choose icons
 * (docs/03-Design/01-Design-System.md — "Never require users to choose icons").
 * Keyword-matches a title to a Lucide icon name; falls back to a sensible default per type.
 */
const KEYWORD_MAP: Record<string, string> = {
  water: 'Droplet',
  drink: 'Droplet',
  run: 'Footprints',
  walk: 'Footprints',
  exercise: 'Dumbbell',
  workout: 'Dumbbell',
  gym: 'Dumbbell',
  read: 'BookOpen',
  book: 'BookOpen',
  meditate: 'Flower2',
  meditation: 'Flower2',
  sleep: 'Moon',
  journal: 'NotebookPen',
  write: 'NotebookPen',
  code: 'Code2',
  study: 'GraduationCap',
  learn: 'GraduationCap',
  language: 'Languages',
  guitar: 'Music',
  piano: 'Music',
  music: 'Music',
  clean: 'Sparkles',
  cook: 'ChefHat',
  eat: 'Utensils',
  stretch: 'Activity',
  yoga: 'Activity',
  call: 'Phone',
  email: 'Mail',
  pay: 'Wallet',
  bill: 'Wallet',
  shop: 'ShoppingCart',
  buy: 'ShoppingCart',
};

const TYPE_DEFAULTS: Record<'habit' | 'skill' | 'todo', string> = {
  habit: 'CheckCircle2',
  skill: 'Sparkles',
  todo: 'ListTodo',
};

export function assignIcon(title: string, type: 'habit' | 'skill' | 'todo'): string {
  const lower = title.toLowerCase();
  for (const [keyword, icon] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(keyword)) return icon;
  }
  return TYPE_DEFAULTS[type];
}
