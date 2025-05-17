
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { 
  books,
  researchPapers,
  librarians,
  borrowers,
  borrowings,
  membershipApplications
} from '@shared/schema';

// Initialize SQLite database
const sqlite = new Database('library.db');
export const db = drizzle(sqlite);

// Export tables
export {
  books,
  researchPapers,
  librarians,
  borrowers,
  borrowings,
  membershipApplications
};

// Create all required tables
const createTables = async () => {
  // Books table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cover_image TEXT NOT NULL,
      name TEXT NOT NULL,
      author TEXT NOT NULL,
      publisher TEXT NOT NULL,
      book_code TEXT UNIQUE NOT NULL,
      copies INTEGER NOT NULL DEFAULT 1,
      description TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Research papers table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS research_papers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cover_image TEXT NOT NULL,
      name TEXT NOT NULL,
      author TEXT NOT NULL,
      publisher TEXT NOT NULL,
      research_code TEXT UNIQUE NOT NULL,
      copies INTEGER NOT NULL DEFAULT 1,
      description TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Librarians table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS librarians (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      appointment_date DATE NOT NULL,
      membership_status TEXT NOT NULL CHECK (membership_status IN ('active', 'inactive', 'temporary')),
      email TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Borrowers table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS borrowers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('primary', 'middle', 'secondary', 'university', 'graduate')),
      joined_date DATE NOT NULL,
      expiry_date DATE NOT NULL,
      email TEXT,
      address TEXT,
      church_name TEXT,
      father_of_confession TEXT,
      studies TEXT,
      job TEXT,
      hobbies TEXT,
      favorite_books TEXT,
      additional_phone TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Borrowings table with foreign key constraints
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS borrowings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      borrower_id INTEGER NOT NULL,
      librarian_id INTEGER NOT NULL,
      book_id INTEGER,
      research_id INTEGER,
      borrow_date DATE NOT NULL,
      due_date DATE NOT NULL,
      return_date DATE,
      status TEXT NOT NULL CHECK (status IN ('borrowed', 'returned', 'overdue')),
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (borrower_id) REFERENCES borrowers(id) ON DELETE CASCADE,
      FOREIGN KEY (librarian_id) REFERENCES librarians(id) ON DELETE CASCADE,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
      FOREIGN KEY (research_id) REFERENCES research_papers(id) ON DELETE CASCADE,
      CHECK ((book_id IS NOT NULL AND research_id IS NULL) OR (book_id IS NULL AND research_id IS NOT NULL))
    )
  `);
};

// Initialize tables
createTables();
