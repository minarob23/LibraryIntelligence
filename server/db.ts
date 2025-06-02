import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { 
  books,
  librarians,
  borrowers,
  borrowings,
  membershipApplicationSchema
} from '@shared/schema';

// Initialize SQLite database
const sqlite = new Database('library.db');
export const db = drizzle(sqlite);

// Export tables
export {
  books,
  librarians,
  borrowers,
  borrowings,
  membershipApplicationSchema
};

// Create all required tables
const createTables = () => {
  // Membership Applications table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS membership_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      stage TEXT NOT NULL,
      birthdate TEXT NOT NULL,
      phone TEXT NOT NULL,
      additional_phone TEXT,
      email TEXT NOT NULL,
      address TEXT NOT NULL,
      church_name TEXT,
      father_of_confession TEXT,
      studies TEXT,
      job TEXT,
      hobbies TEXT,
      favorite_books TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

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
      total_pages INTEGER,
      cabinet TEXT,
      shelf TEXT,
      num TEXT,
      added_date DATE DEFAULT (date('now')),
      published_date DATE,
      genres TEXT,
      comments TEXT,
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

  // Borrowings table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS borrowings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      borrower_id INTEGER NOT NULL,
      book_id INTEGER NOT NULL,
      borrow_date DATE NOT NULL,
      due_date DATE NOT NULL,
      return_date DATE,
      status TEXT NOT NULL CHECK (status IN ('borrowed', 'returned', 'overdue')),
      rating INTEGER CHECK (rating >= 1 AND rating <= 5),
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (borrower_id) REFERENCES borrowers(id) ON DELETE CASCADE,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    )
  `);
};

// Initialize tables
createTables();
import { sql } from 'drizzle-orm';

// Membership Applications table
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const membershipApplications = sqliteTable("membership_applications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  stage: text("stage").notNull(),
  birthdate: text("birthdate").notNull(),
  phone: text("phone").notNull(),
  additionalPhone: text("additional_phone"),
  email: text("email").notNull(),
  address: text("address").notNull(),
  churchName: text("church_name"),
  fatherOfConfession: text("father_of_confession"),
  studies: text("studies"),
  job: text("job"),
  hobbies: text("hobbies"),
  favoriteBooks: text("favorite_books"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});