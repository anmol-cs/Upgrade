-- 0000_initial.sql
CREATE TABLE IF NOT EXISTS routines (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  icon TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  archived INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS routine_completions (
  id TEXT PRIMARY KEY NOT NULL,
  routine_id TEXT NOT NULL REFERENCES routines(id),
  completed_on TEXT NOT NULL,
  completed_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS routine_completions_completed_on_idx ON routine_completions(completed_on);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS routine_completions_routine_id_idx ON routine_completions(routine_id);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  icon TEXT,
  category TEXT,
  target_minutes INTEGER,
  state TEXT NOT NULL DEFAULT 'inactive',
  started_at INTEGER,
  completed_at INTEGER,
  archived INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS skill_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  skill_id TEXT NOT NULL REFERENCES skills(id),
  duration_minutes INTEGER NOT NULL,
  notes TEXT,
  completed_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS skill_sessions_skill_id_idx ON skill_sessions(skill_id);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS todos (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  priority INTEGER NOT NULL DEFAULT 0,
  due_date INTEGER,
  completed INTEGER NOT NULL DEFAULT 0,
  completed_at INTEGER,
  archived INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS todos_completed_idx ON todos(completed);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS todos_priority_idx ON todos(priority);
