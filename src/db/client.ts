import path from 'node:path';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

const dbPath =
  process.env.DB_PATH ?? path.join(process.cwd(), 'data', 'futbolle.sqlite');

// Open read-only: players are never modified at runtime.
// fileMustExist throws a clear error if the .sqlite is missing (run `npm run seed`).
const sqlite = new Database(dbPath, { readonly: true, fileMustExist: true });

export const db = drizzle(sqlite, { schema });
