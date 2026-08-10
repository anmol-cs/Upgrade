import { db } from './client';
import migrations from './migrations/migrations';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';

/**
 * Runs pending migrations on app startup.
 * docs/06-Implementation/06-Database-Implementation.md
 *
 * How the .sql files in ./migrations get executed, and a real bug this
 * project hit because of it: drizzle-orm's expo-sqlite migrator (see
 * node_modules/drizzle-orm/expo-sqlite/migrator.js, function
 * readMigrationFiles) takes each migration's raw SQL text and splits it on
 * the literal marker "--> statement-breakpoint" to get individual
 * executable statements. drizzle-kit normally inserts that marker
 * automatically between every DDL statement when it generates migrations;
 * since these migrations were hand-written instead, the marker has to be
 * added by hand too, between every statement in any .sql file that has
 * more than one.
 *
 * The first version of this project's migrations shipped with none of those
 * markers, so the migrator treated an entire multi-statement file as one
 * statement — SQLite rejects that at execution time. This is exactly why
 * app/_layout.tsx shows "We could not open your data" if this function
 * throws: a broken migration is the single most likely cause, and neither
 * bundling nor type-checking can catch it, since neither one actually
 * executes a migration.
 *
 * A second, sneakier version of the same bug: an explanatory *comment* in
 * one of the .sql files once spelled out the marker text literally, which
 * meant the naive string-split matched inside the comment too and
 * corrupted the migration around it. Lesson: keep the .sql files themselves
 * free of prose, and only ever write "--> statement-breakpoint" as an
 * actual separator between two real statements — never in a description of
 * one, and never anywhere but here, in a .ts file the migrator never reads.
 */
export async function runMigrations(): Promise<void> {
  await migrate(db, migrations);
}
