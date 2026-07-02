import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

/**
 * Players table (read-only at runtime).
 * Generated once from the CSV with `npm run seed`; the .sqlite file is committed.
 */
export const players = sqliteTable('players', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  age: integer('age').notNull(),
  photo: text('photo').notNull().default(''),
  nationality: text('nationality').notNull().default(''),
  flag: text('flag').notNull().default(''),
  overall: integer('overall').notNull(),
  potential: integer('potential').notNull().default(0),
  club: text('club').notNull().default(''),
  clubLogo: text('club_logo').notNull().default(''),
  value: integer('value').notNull().default(0),
  wage: integer('wage').notNull().default(0),
  preferredFoot: text('preferred_foot').notNull().default(''),
  position: text('position').notNull().default(''),
  heightCm: integer('height_cm').notNull().default(0),
  weightLbs: real('weight_lbs').notNull().default(0),
  bestOverallRating: integer('best_overall_rating').notNull().default(0),
});

export type PlayerRow = typeof players.$inferSelect;
