# Futbolle — Backend

Backend for the **Futbolle** game (guess FIFA23 players, Poeltl-style).
Node.js + Express + TypeScript.

The backend is a **pure dataset provider**: it serves player search and a random
secret player, nothing else. **All game logic and validation live in the frontend**
(comparison, hints, blurred photo, difficulty, sound, dark mode, LocalStorage history).

## Running it

```bash
npm install
npm run seed   # generates data/futbolle.sqlite from the CSV (first time only)
npm run dev    # server with hot reload at http://localhost:3000
# or
npm start      # server without hot reload
```

The port is read from `process.env.PORT` (defaults to `3000`).

## Environment

A `.env` file is **optional** — both variables have defaults. See `.env.example`:

- `PORT` — server port (default `3000`; injected automatically on Render).
- `DB_PATH` — path to the players `.sqlite` (default `data/futbolle.sqlite`).

## Data

- `CLEAN_FIFA23_official_data.csv` → source (17,660 players).
- `npm run seed` cleans and dumps everything into `data/futbolle.sqlite`, which is
  **committed** to the repo. At runtime the database is opened **read-only**.
- Regenerate the database only if the CSV changes.

## API docs (Swagger)

- **`GET /api/docs`** → interactive Swagger UI (try the endpoints from the browser).
- **`GET /api/docs.json`** → raw OpenAPI 3.0 spec (importable into Postman/Insomnia).

## Endpoints

Base: `/api`

### `GET /api/players/search?q=&limit=8`
Partial name match (contains, case-insensitive). Returns **full player objects** so
the frontend has everything it needs to compare a guess locally. With `q` shorter
than 2 characters it returns `[]`. `limit` ranges from 1 to 25 (default 8).

### `GET /api/players/random`
Returns a **full random player**. The frontend uses it as the secret at game start.

Both endpoints return the same player shape:

```json
{
  "id": 158023,
  "name": "L. Messi",
  "age": 35,
  "photo": "https://cdn.sofifa.net/players/158/023/23_60.png",
  "nationality": "Argentina",
  "flag": "https://cdn.sofifa.net/flags/ar.png",
  "overall": 91,
  "potential": 91,
  "club": "Paris Saint-Germain",
  "clubLogo": "https://cdn.sofifa.net/teams/73/30.png",
  "value": 54000000,
  "wage": 195000,
  "preferredFoot": "Left",
  "position": "RW",
  "heightCm": 169,
  "weightLbs": 158.76,
  "bestOverallRating": 0
}
```

## How the frontend builds the game

1. Call `GET /api/players/random` → this is the **secret**; keep it in memory.
2. As the user types, call `GET /api/players/search?q=` → render the autocomplete.
3. On each guess, the frontend already has the full guessed player (from search) and
   the full secret, so it compares locally: `nationality`, `club`, `position` as exact
   matches; `age`, `overall`, `height` with higher/lower hints.
4. Optional features are all frontend: blurred `photo` revealed per failed attempt,
   difficulty selector (limit which attributes are shown), sounds, dark/light mode,
   and LocalStorage history (human name, win/loss, attempts, date/time, duration).

## Design notes

- **CSV parsed only once**: no per-request parsing. Players live in SQLite and are
  read on the fly.
- **Stateless backend**: no game state, no sessions. Every request is independent, so
  it scales trivially and survives restarts with zero side effects (ideal for Render).
- **Open CORS** (`*`) to consume from localhost or GitHub Pages.

## Deploy on Render

`render.yaml` is included. Build: `npm install` · Start: `npm start`. The `.sqlite`
ships in the repo, so no seed is needed during deploy.
