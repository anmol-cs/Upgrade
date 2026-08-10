import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const todos = sqliteTable(
  'todos',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    notes: text('notes'),
    priority: integer('priority').notNull().default(0),
    dueDate: integer('due_date'),
    completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
    completedAt: integer('completed_at'),
    archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => ({
    completedIdx: index('todos_completed_idx').on(table.completed),
    priorityIdx: index('todos_priority_idx').on(table.priority),
  })
);

export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
