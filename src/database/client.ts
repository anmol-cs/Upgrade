import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

const DB_NAME = 'upgrade.db';

const expoDb = openDatabaseSync(DB_NAME, { enableChangeListener: true });

/** Shared Drizzle client instance. Presentation layer must never import this directly. */
export const db = drizzle(expoDb, { schema });

export type Database = typeof db;
