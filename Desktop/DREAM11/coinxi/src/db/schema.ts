import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  coinBalance: integer("coin_balance").notNull().default(5000),
  lastDailyRefill: text("last_daily_refill"),
  loginStreak: integer("login_streak").notNull().default(0),
  isAdmin: integer("is_admin", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const matches = sqliteTable("matches", {
  id: text("id").primaryKey(),
  externalId: text("external_id"),
  teamA: text("team_a").notNull(),
  teamB: text("team_b").notNull(),
  format: text("format", { enum: ["T20", "ODI", "Test"] }).notNull(),
  startTime: text("start_time").notNull(),
  status: text("status", { enum: ["upcoming", "live", "completed"] }).notNull().default("upcoming"),
  squadData: text("squad_data"), // JSON string
  scorecardData: text("scorecard_data"), // JSON string
  isManual: integer("is_manual", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const contests = sqliteTable("contests", {
  id: text("id").primaryKey(),
  matchId: text("match_id").notNull().references(() => matches.id),
  code: text("code").notNull().unique(),
  createdBy: text("created_by").notNull().references(() => users.id),
  mode: text("mode", { enum: ["fantasy", "predictions", "both"] }).notNull(),
  coinTier: integer("coin_tier").notNull(),
  status: text("status", { enum: ["open", "locked", "live", "completed", "expired"] }).notNull().default("open"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const contestEntries = sqliteTable("contest_entries", {
  id: text("id").primaryKey(),
  contestId: text("contest_id").notNull().references(() => contests.id),
  userId: text("user_id").notNull().references(() => users.id),
  fantasyTeam: text("fantasy_team"), // JSON string
  predictions: text("predictions"), // JSON string
  fantasyPoints: real("fantasy_points").notNull().default(0),
  predictionPoints: integer("prediction_points").notNull().default(0),
  finalRank: integer("final_rank"),
  coinsWon: integer("coins_won").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const leaderboardStats = sqliteTable("leaderboard_stats", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id).unique(),
  totalContests: integer("total_contests").notNull().default(0),
  topHalfFinishes: integer("top_half_finishes").notNull().default(0),
  totalFantasyPoints: real("total_fantasy_points").notNull().default(0),
  totalPredictionPoints: integer("total_prediction_points").notNull().default(0),
  currentWinStreak: integer("current_win_streak").notNull().default(0),
  bestWinStreak: integer("best_win_streak").notNull().default(0),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export const headToHead = sqliteTable("head_to_head", {
  id: text("id").primaryKey(),
  userAId: text("user_a_id").notNull().references(() => users.id),
  userBId: text("user_b_id").notNull().references(() => users.id),
  userAWins: integer("user_a_wins").notNull().default(0),
  userBWins: integer("user_b_wins").notNull().default(0),
  draws: integer("draws").notNull().default(0),
  lastContestId: text("last_contest_id"),
});

// ─── Exchange tables ──────────────────────────────────────────────────────────

export const wallets = sqliteTable("wallets", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id).unique(),
  totalBalance: text("total_balance").notNull().default("0"),
  availableBalance: text("available_balance").notNull().default("0"),
  lockedBalance: text("locked_balance").notNull().default("0"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const walletTransactions = sqliteTable("wallet_transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  amount: text("amount").notNull(),
  type: text("type", {
    enum: ["deposit", "withdrawal", "lock", "unlock", "debit", "refund"],
  }).notNull(),
  orderId: text("order_id"),
  description: text("description"),
  balanceBefore: text("balance_before").notNull(),
  balanceAfter: text("balance_after").notNull(),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const tradingPairs = sqliteTable("trading_pairs", {
  id: text("id").primaryKey(),
  baseAsset: text("base_asset").notNull(),
  quoteAsset: text("quote_asset").notNull(),
  lastPrice: text("last_price").notNull().default("0"),
  volume24h: text("volume_24h").notNull().default("0"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  pairId: text("pair_id").notNull().references(() => tradingPairs.id),
  side: text("side", { enum: ["buy", "sell"] }).notNull(),
  type: text("type", { enum: ["market", "limit"] }).notNull(),
  price: text("price"),                          // null for market orders
  quantity: text("quantity").notNull(),
  filledQuantity: text("filled_quantity").notNull().default("0"),
  status: text("status", {
    enum: ["open", "partial", "filled", "cancelled"],
  }).notNull().default("open"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const trades = sqliteTable("trades", {
  id: text("id").primaryKey(),
  buyOrderId: text("buy_order_id").notNull().references(() => orders.id),
  sellOrderId: text("sell_order_id").notNull().references(() => orders.id),
  pairId: text("pair_id").notNull().references(() => tradingPairs.id),
  price: text("price").notNull(),
  quantity: text("quantity").notNull(),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const coinTransactions = sqliteTable("coin_transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  type: text("type", {
    enum: ["welcome", "daily", "streak", "entry_fee", "winnings", "bankrupt_reset", "bonus"],
  }).notNull(),
  contestId: text("contest_id"),
  description: text("description"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});
