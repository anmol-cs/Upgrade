-- 0003_skill_position_and_daily_sessions.sql
-- Skill position was added to the runtime schema earlier but was missing from
-- the initial migration chain. Daily completion is derived from skill_sessions,
-- so no additional completion table is required.
ALTER TABLE skills ADD COLUMN position INTEGER NOT NULL DEFAULT 0;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS skill_sessions_completed_at_idx ON skill_sessions(completed_at);
