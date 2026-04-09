import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from '@/db/schema'

/** Raw DDL for all tables needed in tests (mirrors schema.ts exactly). */
const DDL = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    coin_balance INTEGER NOT NULL DEFAULT 5000,
    last_daily_refill INTEGER,
    login_streak INTEGER NOT NULL DEFAULT 0,
    is_admin INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS wallets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
    total_balance TEXT NOT NULL DEFAULT '0',
    available_balance TEXT NOT NULL DEFAULT '0',
    locked_balance TEXT NOT NULL DEFAULT '0',
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS wallet_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    amount TEXT NOT NULL,
    type TEXT NOT NULL,
    order_id TEXT,
    description TEXT,
    balance_before TEXT NOT NULL,
    balance_after TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS trading_pairs (
    id TEXT PRIMARY KEY,
    base_asset TEXT NOT NULL,
    quote_asset TEXT NOT NULL,
    last_price TEXT NOT NULL DEFAULT '0',
    volume_24h TEXT NOT NULL DEFAULT '0',
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(base_asset, quote_asset)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    pair_id TEXT NOT NULL REFERENCES trading_pairs(id),
    side TEXT NOT NULL,
    type TEXT NOT NULL,
    price TEXT,
    quantity TEXT NOT NULL,
    filled_quantity TEXT NOT NULL DEFAULT '0',
    status TEXT NOT NULL DEFAULT 'open',
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS trades (
    id TEXT PRIMARY KEY,
    buy_order_id TEXT NOT NULL REFERENCES orders(id),
    sell_order_id TEXT NOT NULL REFERENCES orders(id),
    pair_id TEXT NOT NULL REFERENCES trading_pairs(id),
    price TEXT NOT NULL,
    quantity TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
`

export type TestDb = ReturnType<typeof drizzle<typeof schema>>

export function createTestDb() {
  const sqlite = new Database(':memory:')
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')
  sqlite.exec(DDL)
  const db = drizzle(sqlite, { schema })
  return { db, sqlite }
}

/** Insert a minimal user row for FK satisfaction. */
export function seedUser(
  sqlite: Database.Database,
  id: string,
  username = 'testuser',
) {
  sqlite
    .prepare(
      `INSERT OR IGNORE INTO users (id, username, password_hash)
       VALUES (?, ?, 'hash')`,
    )
    .run(id, username)
}

/** Insert a trading pair row. */
export function seedTradingPair(
  sqlite: Database.Database,
  id: string,
  baseAsset = 'BTC',
  quoteAsset = 'USDC',
  lastPrice = '50000',
) {
  sqlite
    .prepare(
      `INSERT OR IGNORE INTO trading_pairs (id, base_asset, quote_asset, last_price)
       VALUES (?, ?, ?, ?)`,
    )
    .run(id, baseAsset, quoteAsset, lastPrice)
}
