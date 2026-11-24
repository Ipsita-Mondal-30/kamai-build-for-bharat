import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

// One SQLite file. Set KAMAI_DATA_DIR to a persistent disk when deploying.
export const DATA_DIR = process.env.KAMAI_DATA_DIR || path.join(process.cwd(), "data");

const g = globalThis as unknown as { __kamaiDb?: DatabaseSync };

export function db(): DatabaseSync {
  if (g.__kamaiDb) return g.__kamaiDb;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const d = new DatabaseSync(path.join(DATA_DIR, "kamai.db"));
  d.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY, role TEXT NOT NULL CHECK (role IN ('vendor','lender','insurer')),
      name TEXT NOT NULL, phone TEXT NOT NULL UNIQUE, pin_salt TEXT NOT NULL, pin_hash TEXT NOT NULL,
      city TEXT, biz TEXT, demo INTEGER NOT NULL DEFAULT 0, vouches INTEGER NOT NULL DEFAULT 0, util INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), seq INTEGER NOT NULL,
      date TEXT NOT NULL, type TEXT NOT NULL CHECK (type IN ('sale','purchase','expense')), amt INTEGER NOT NULL,
      src TEXT NOT NULL, log_date TEXT NOT NULL, prev TEXT NOT NULL, hash TEXT NOT NULL,
      UNIQUE (user_id, seq)
    );
    CREATE INDEX IF NOT EXISTS entries_user ON entries(user_id, date);
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), amount INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL, decided_at TEXT
    );
    CREATE TABLE IF NOT EXISTS claims (
      id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), date TEXT NOT NULL,
      rain REAL NOT NULL, expected INTEGER NOT NULL, actual INTEGER NOT NULL, payout INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'filed', filed_at TEXT NOT NULL, UNIQUE (user_id, date)
    );
    CREATE TABLE IF NOT EXISTS rain (city TEXT NOT NULL, date TEXT NOT NULL, mm REAL NOT NULL, PRIMARY KEY (city, date));
    CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT NOT NULL);
  `);
  g.__kamaiDb = d;
  return d;
}

export function tx<T>(fn: () => T): T {
  const d = db();
  d.exec("BEGIN");
  try { const r = fn(); d.exec("COMMIT"); return r; } catch (e) { d.exec("ROLLBACK"); throw e; }
}
