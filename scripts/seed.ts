import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { parse } from 'csv-parse/sync';

/**
 * Generates data/futbolle.sqlite from the FIFA23 CSV.
 * Run once with `npm run seed`; the resulting .sqlite is committed.
 *
 * CSV column indexes (column 0 is an unnamed index that we drop):
 *  1 ID · 2 Name · 3 Age · 4 Photo · 5 Nationality · 6 Flag · 7 Overall
 *  8 Potential · 9 Club · 10 Club Logo · 11 Value(£) · 12 Wage(£)
 *  14 Preferred Foot · 21 Position · 25 Height(cm.) · 26 Weight(lbs.)
 *  29 Best Overall Rating
 */

const CSV_PATH = path.join(process.cwd(), 'CLEAN_FIFA23_official_data.csv');
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'futbolle.sqlite');

const toInt = (v: unknown): number => {
  const n = Math.round(Number.parseFloat(String(v)));
  return Number.isFinite(n) ? n : 0;
};

const toReal = (v: unknown): number => {
  const n = Number.parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
};

const str = (v: unknown): string => String(v ?? '').trim();

function main(): void {
  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(`CSV not found at ${CSV_PATH}`);
  }

  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(DB_PATH)) {
    fs.rmSync(DB_PATH);
  }

  const content = fs.readFileSync(CSV_PATH, 'utf8');
  const rows: string[][] = parse(content, {
    skip_empty_lines: true,
    from_line: 2, // skip the header
    relax_column_count: true,
  });

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE players (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      photo TEXT NOT NULL DEFAULT '',
      nationality TEXT NOT NULL DEFAULT '',
      flag TEXT NOT NULL DEFAULT '',
      overall INTEGER NOT NULL,
      potential INTEGER NOT NULL DEFAULT 0,
      club TEXT NOT NULL DEFAULT '',
      club_logo TEXT NOT NULL DEFAULT '',
      value INTEGER NOT NULL DEFAULT 0,
      wage INTEGER NOT NULL DEFAULT 0,
      preferred_foot TEXT NOT NULL DEFAULT '',
      position TEXT NOT NULL DEFAULT '',
      height_cm INTEGER NOT NULL DEFAULT 0,
      weight_lbs REAL NOT NULL DEFAULT 0,
      best_overall_rating INTEGER NOT NULL DEFAULT 0
    );
  `);

  const insert = db.prepare(`
    INSERT OR IGNORE INTO players (
      id, name, age, photo, nationality, flag, overall, potential,
      club, club_logo, value, wage, preferred_foot, position,
      height_cm, weight_lbs, best_overall_rating
    ) VALUES (
      @id, @name, @age, @photo, @nationality, @flag, @overall, @potential,
      @club, @club_logo, @value, @wage, @preferred_foot, @position,
      @height_cm, @weight_lbs, @best_overall_rating
    )
  `);

  let inserted = 0;
  let skipped = 0;

  const insertAll = db.transaction((records: string[][]) => {
    for (const r of records) {
      const id = toInt(r[1]);
      const name = str(r[2]);
      // Rows without id or name are useless for the game.
      if (!id || !name) {
        skipped += 1;
        continue;
      }
      const result = insert.run({
        id,
        name,
        age: toInt(r[3]),
        photo: str(r[4]),
        nationality: str(r[5]),
        flag: str(r[6]),
        overall: toInt(r[7]),
        potential: toInt(r[8]),
        club: str(r[9]),
        club_logo: str(r[10]),
        value: toInt(r[11]),
        wage: toInt(r[12]),
        preferred_foot: str(r[14]),
        position: str(r[21]),
        height_cm: toInt(r[25]),
        weight_lbs: toReal(r[26]),
        best_overall_rating: toInt(r[29]),
      });
      if (result.changes > 0) inserted += 1;
      else skipped += 1; // duplicate id ignored
    }
  });

  insertAll(rows);
  db.close();

  console.log(`✅ Seed complete → ${DB_PATH}`);
  console.log(`   Players inserted: ${inserted}`);
  console.log(`   Rows skipped (missing id/name or duplicate): ${skipped}`);
}

main();
