// Run with: npx tsx scripts/seed.ts
// This creates sample matches with squads for testing

import Database from "better-sqlite3";
import { v4 as uuid } from "uuid";
import path from "path";

const DB_PATH = path.join(process.cwd(), "coinxi.db");
const db = new Database(DB_PATH);
db.pragma("foreign_keys = ON");

// Create tables if they don't exist
db.prepare(`CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY, external_id TEXT, team_a TEXT NOT NULL, team_b TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'T20', start_time TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'upcoming',
  squad_data TEXT, scorecard_data TEXT, is_manual INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`).run();

// Sample IPL matches
const sampleMatches = [
  {
    teamA: "RCB",
    teamB: "MI",
    format: "T20",
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // tomorrow
    squad: {
      teamA: [
        { playerId: "rcb1", playerName: "Virat Kohli", role: "batsman", team: "RCB" },
        { playerId: "rcb2", playerName: "Faf du Plessis", role: "batsman", team: "RCB" },
        { playerId: "rcb3", playerName: "Glenn Maxwell", role: "allrounder", team: "RCB" },
        { playerId: "rcb4", playerName: "Dinesh Karthik", role: "wicketkeeper", team: "RCB" },
        { playerId: "rcb5", playerName: "Wanindu Hasaranga", role: "bowler", team: "RCB" },
        { playerId: "rcb6", playerName: "Harshal Patel", role: "bowler", team: "RCB" },
        { playerId: "rcb7", playerName: "Mohammed Siraj", role: "bowler", team: "RCB" },
        { playerId: "rcb8", playerName: "Rajat Patidar", role: "batsman", team: "RCB" },
      ],
      teamB: [
        { playerId: "mi1", playerName: "Rohit Sharma", role: "batsman", team: "MI" },
        { playerId: "mi2", playerName: "Suryakumar Yadav", role: "batsman", team: "MI" },
        { playerId: "mi3", playerName: "Ishan Kishan", role: "wicketkeeper", team: "MI" },
        { playerId: "mi4", playerName: "Hardik Pandya", role: "allrounder", team: "MI" },
        { playerId: "mi5", playerName: "Jasprit Bumrah", role: "bowler", team: "MI" },
        { playerId: "mi6", playerName: "Tim David", role: "allrounder", team: "MI" },
        { playerId: "mi7", playerName: "Piyush Chawla", role: "bowler", team: "MI" },
        { playerId: "mi8", playerName: "Tilak Varma", role: "batsman", team: "MI" },
      ],
    },
  },
  {
    teamA: "CSK",
    teamB: "KKR",
    format: "T20",
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // day after tomorrow
    squad: {
      teamA: [
        { playerId: "csk1", playerName: "Ruturaj Gaikwad", role: "batsman", team: "CSK" },
        { playerId: "csk2", playerName: "Devon Conway", role: "batsman", team: "CSK" },
        { playerId: "csk3", playerName: "MS Dhoni", role: "wicketkeeper", team: "CSK" },
        { playerId: "csk4", playerName: "Ravindra Jadeja", role: "allrounder", team: "CSK" },
        { playerId: "csk5", playerName: "Deepak Chahar", role: "bowler", team: "CSK" },
        { playerId: "csk6", playerName: "Tushar Deshpande", role: "bowler", team: "CSK" },
        { playerId: "csk7", playerName: "Moeen Ali", role: "allrounder", team: "CSK" },
        { playerId: "csk8", playerName: "Shivam Dube", role: "allrounder", team: "CSK" },
      ],
      teamB: [
        { playerId: "kkr1", playerName: "Shreyas Iyer", role: "batsman", team: "KKR" },
        { playerId: "kkr2", playerName: "Venkatesh Iyer", role: "allrounder", team: "KKR" },
        { playerId: "kkr3", playerName: "Andre Russell", role: "allrounder", team: "KKR" },
        { playerId: "kkr4", playerName: "Sunil Narine", role: "allrounder", team: "KKR" },
        { playerId: "kkr5", playerName: "Varun Chakravarthy", role: "bowler", team: "KKR" },
        { playerId: "kkr6", playerName: "Nitish Rana", role: "batsman", team: "KKR" },
        { playerId: "kkr7", playerName: "Rahmanullah Gurbaz", role: "wicketkeeper", team: "KKR" },
        { playerId: "kkr8", playerName: "Mitchell Starc", role: "bowler", team: "KKR" },
      ],
    },
  },
  {
    teamA: "DC",
    teamB: "GT",
    format: "T20",
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    squad: {
      teamA: [
        { playerId: "dc1", playerName: "David Warner", role: "batsman", team: "DC" },
        { playerId: "dc2", playerName: "Rishabh Pant", role: "wicketkeeper", team: "DC" },
        { playerId: "dc3", playerName: "Axar Patel", role: "allrounder", team: "DC" },
        { playerId: "dc4", playerName: "Kuldeep Yadav", role: "bowler", team: "DC" },
        { playerId: "dc5", playerName: "Anrich Nortje", role: "bowler", team: "DC" },
        { playerId: "dc6", playerName: "Mitchell Marsh", role: "allrounder", team: "DC" },
        { playerId: "dc7", playerName: "Prithvi Shaw", role: "batsman", team: "DC" },
        { playerId: "dc8", playerName: "Ishant Sharma", role: "bowler", team: "DC" },
      ],
      teamB: [
        { playerId: "gt1", playerName: "Shubman Gill", role: "batsman", team: "GT" },
        { playerId: "gt2", playerName: "Sai Sudharsan", role: "batsman", team: "GT" },
        { playerId: "gt3", playerName: "Rashid Khan", role: "bowler", team: "GT" },
        { playerId: "gt4", playerName: "Mohammed Shami", role: "bowler", team: "GT" },
        { playerId: "gt5", playerName: "Wriddhiman Saha", role: "wicketkeeper", team: "GT" },
        { playerId: "gt6", playerName: "Rahul Tewatia", role: "allrounder", team: "GT" },
        { playerId: "gt7", playerName: "David Miller", role: "batsman", team: "GT" },
        { playerId: "gt8", playerName: "Josh Little", role: "bowler", team: "GT" },
      ],
    },
  },
];

console.log("Seeding CoinXI database...\n");

for (const match of sampleMatches) {
  const id = uuid();
  db.prepare(`INSERT OR IGNORE INTO matches (id, team_a, team_b, format, start_time, squad_data, is_manual, status)
    VALUES (?, ?, ?, ?, ?, ?, 1, 'upcoming')`).run(
    id, match.teamA, match.teamB, match.format, match.startTime, JSON.stringify(match.squad)
  );
  console.log(`Created match: ${match.teamA} vs ${match.teamB} (ID: ${id})`);
}

// Make the first registered user an admin
const firstUser = db.prepare("SELECT id, username FROM users ORDER BY created_at LIMIT 1").get() as any;
if (firstUser) {
  db.prepare("UPDATE users SET is_admin = 1 WHERE id = ?").run(firstUser.id);
  console.log(`\nMade "${firstUser.username}" an admin`);
} else {
  console.log("\nNo users found yet. The first user to register will need to be made admin manually.");
  console.log("After registering, run: npx tsx scripts/seed.ts");
}

// Seed exchange trading pairs
console.log('\nSeeding trading pairs...')

db.prepare(`CREATE TABLE IF NOT EXISTS trading_pairs (
  id TEXT PRIMARY KEY,
  base_asset TEXT NOT NULL,
  quote_asset TEXT NOT NULL,
  last_price TEXT NOT NULL DEFAULT '0',
  volume_24h TEXT NOT NULL DEFAULT '0',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(base_asset, quote_asset)
)`).run()

const pairs = [
  { id: 'BTC-USDC', baseAsset: 'BTC', quoteAsset: 'USDC', lastPrice: '65000' },
  { id: 'ETH-USDC', baseAsset: 'ETH', quoteAsset: 'USDC', lastPrice: '3200' },
  { id: 'SOL-USDC', baseAsset: 'SOL', quoteAsset: 'USDC', lastPrice: '145' },
]

for (const pair of pairs) {
  db.prepare(
    `INSERT OR IGNORE INTO trading_pairs (id, base_asset, quote_asset, last_price)
     VALUES (?, ?, ?, ?)`
  ).run(pair.id, pair.baseAsset, pair.quoteAsset, pair.lastPrice)
  console.log(`Seeded pair: ${pair.baseAsset}/${pair.quoteAsset} (ID: ${pair.id})`)
}

console.log("\nDone! Start the app with: npm run dev");
db.close();
