import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";

const DB_PATH = process.env.COINXI_DB_PATH || path.join(process.cwd(), "coinxi.db");

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

// Initialize tables
const initStatements = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    coin_balance INTEGER NOT NULL DEFAULT 5000,
    last_daily_refill TEXT,
    login_streak INTEGER NOT NULL DEFAULT 0,
    is_admin INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,
    external_id TEXT,
    team_a TEXT NOT NULL,
    team_b TEXT NOT NULL,
    format TEXT NOT NULL DEFAULT 'T20',
    start_time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'upcoming',
    squad_data TEXT,
    scorecard_data TEXT,
    is_manual INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS contests (
    id TEXT PRIMARY KEY,
    match_id TEXT NOT NULL REFERENCES matches(id),
    code TEXT NOT NULL UNIQUE,
    created_by TEXT NOT NULL REFERENCES users(id),
    mode TEXT NOT NULL DEFAULT 'fantasy',
    coin_tier INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS contest_entries (
    id TEXT PRIMARY KEY,
    contest_id TEXT NOT NULL REFERENCES contests(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    fantasy_team TEXT,
    predictions TEXT,
    fantasy_points REAL NOT NULL DEFAULT 0,
    prediction_points INTEGER NOT NULL DEFAULT 0,
    final_rank INTEGER,
    coins_won INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS leaderboard_stats (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
    total_contests INTEGER NOT NULL DEFAULT 0,
    top_half_finishes INTEGER NOT NULL DEFAULT 0,
    total_fantasy_points REAL NOT NULL DEFAULT 0,
    total_prediction_points INTEGER NOT NULL DEFAULT 0,
    current_win_streak INTEGER NOT NULL DEFAULT 0,
    best_win_streak INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS head_to_head (
    id TEXT PRIMARY KEY,
    user_a_id TEXT NOT NULL REFERENCES users(id),
    user_b_id TEXT NOT NULL REFERENCES users(id),
    user_a_wins INTEGER NOT NULL DEFAULT 0,
    user_b_wins INTEGER NOT NULL DEFAULT 0,
    draws INTEGER NOT NULL DEFAULT 0,
    last_contest_id TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS coin_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    amount INTEGER NOT NULL,
    type TEXT NOT NULL,
    contest_id TEXT,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
];

for (const stmt of initStatements) {
  sqlite.prepare(stmt).run();
}

// Exchange tables
const exchangeStatements = [
  `CREATE TABLE IF NOT EXISTS wallets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
    total_balance TEXT NOT NULL DEFAULT '0',
    available_balance TEXT NOT NULL DEFAULT '0',
    locked_balance TEXT NOT NULL DEFAULT '0',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS wallet_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    amount TEXT NOT NULL,
    type TEXT NOT NULL,
    order_id TEXT,
    description TEXT,
    balance_before TEXT NOT NULL,
    balance_after TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS trading_pairs (
    id TEXT PRIMARY KEY,
    base_asset TEXT NOT NULL,
    quote_asset TEXT NOT NULL,
    last_price TEXT NOT NULL DEFAULT '0',
    volume_24h TEXT NOT NULL DEFAULT '0',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    pair_id TEXT NOT NULL REFERENCES trading_pairs(id),
    side TEXT NOT NULL,
    type TEXT NOT NULL,
    price TEXT,
    quantity TEXT NOT NULL,
    filled_quantity TEXT NOT NULL DEFAULT '0',
    status TEXT NOT NULL DEFAULT 'open',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS trades (
    id TEXT PRIMARY KEY,
    buy_order_id TEXT NOT NULL REFERENCES orders(id),
    sell_order_id TEXT NOT NULL REFERENCES orders(id),
    pair_id TEXT NOT NULL REFERENCES trading_pairs(id),
    price TEXT NOT NULL,
    quantity TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
]

for (const stmt of exchangeStatements) {
  sqlite.prepare(stmt).run()
}

export { schema };
