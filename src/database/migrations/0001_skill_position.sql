-- 0001_skill_position.sql
-- Forward-only migration. Never edit after release. docs/04-Architecture/04-Database-Schema.md
-- Adds ordering support to skills, matching routines.position, so the unified
-- Routine screen can drag-and-drop reorder active skills alongside habits.

ALTER TABLE skills ADD COLUMN position INTEGER NOT NULL DEFAULT 0;
