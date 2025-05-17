
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '@shared/schema';

// Initialize SQLite database for dashboard
const dashboardSqlite = new Database('dashboard.db');
export const dashboardDb = drizzle(dashboardSqlite, { schema });

// Create dashboard tables
const createDashboardTables = async () => {
  // Popular books stats
  dashboardSqlite.exec(`
    CREATE TABLE IF NOT EXISTS popular_books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      popularity_score REAL NOT NULL,
      times_borrowed INTEGER NOT NULL,
      average_rating REAL,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Top borrowers stats
  dashboardSqlite.exec(`
    CREATE TABLE IF NOT EXISTS top_borrowers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      borrower_id INTEGER NOT NULL,
      borrow_count INTEGER NOT NULL,
      last_borrowed_at TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Borrower distribution stats
  dashboardSqlite.exec(`
    CREATE TABLE IF NOT EXISTS borrower_distribution (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      count INTEGER NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Most borrowed books stats
  dashboardSqlite.exec(`
    CREATE TABLE IF NOT EXISTS most_borrowed_books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      borrow_count INTEGER NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
};

// Initialize tables
createDashboardTables();
