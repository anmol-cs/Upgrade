-- 0002_unique_routine_completion.sql
-- Forward-only migration. Never edit after release. docs/04-Architecture/04-Database-Schema.md
-- Prevents two completion rows ever existing for the same routine on the same day,
-- even if a UI race (e.g. a rapid double-tap) sends two insert requests.

CREATE UNIQUE INDEX IF NOT EXISTS routine_completions_routine_id_completed_on_unique
  ON routine_completions (routine_id, completed_on);
