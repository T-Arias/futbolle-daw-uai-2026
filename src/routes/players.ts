import { Router } from 'express';
import { and, eq, gte, like, or, sql } from 'drizzle-orm';
import { db } from '../db/client';
import { players } from '../db/schema';

const router = Router();

// Easier game: restrict the pool to well-known players (overall 80+)
// or any Argentine player. Applied to both endpoints so the universe is consistent.
const eligibleFilter = or(gte(players.overall, 80), eq(players.nationality, 'Argentina'));

/**
 * GET /api/players/search?q=&limit=8
 * Partial name match (contains, case-insensitive) within the eligible pool.
 * Returns full player objects so the frontend can compare a guess locally.
 * With `q` shorter than 2 characters it returns [].
 */
router.get('/search', (req, res) => {
  const q = String(req.query.q ?? '').trim();
  if (q.length < 2) {
    return res.json([]);
  }

  const rawLimit = Number.parseInt(String(req.query.limit ?? '8'), 10);
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 25) : 8;

  // SQLite LIKE is case-insensitive for ASCII. The value is parameterized (no injection).
  const rows = db
    .select()
    .from(players)
    .where(and(eligibleFilter, like(players.name, `%${q}%`)))
    .limit(limit)
    .all();

  res.json(rows);
});

/**
 * GET /api/players/random
 * Returns a full random player from the eligible pool, used as the secret at game start.
 * The frontend stores it and runs all game logic (comparison, hints, blur, difficulty).
 */
router.get('/random', (_req, res) => {
  const player = db
    .select()
    .from(players)
    .where(eligibleFilter)
    .orderBy(sql`RANDOM()`)
    .limit(1)
    .get();
  if (!player) {
    return res.status(500).json({ error: 'No players loaded in the database' });
  }

  res.json(player);
});

export default router;
