
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '@shared/schema';

const sqlite = new Database('library.db');
export const db = drizzle(sqlite, { schema });

// Create tables if they don't exist
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Librarians table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS librarians (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      appointment_date DATE NOT NULL,
      membership_status TEXT NOT NULL,
      email TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Borrowers table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS borrowers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      category TEXT NOT NULL,
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Borrowings table
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
      status TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (borrower_id) REFERENCES borrowers(id),
      FOREIGN KEY (librarian_id) REFERENCES librarians(id),
      FOREIGN KEY (book_id) REFERENCES books(id),
      FOREIGN KEY (research_id) REFERENCES research_papers(id)
    )
  `);
};

createTables();
