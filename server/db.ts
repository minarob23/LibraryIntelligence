
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

// Insert sample data
const insertSampleData = async () => {
  // Sample Books
  sqlite.exec(`
    INSERT OR IGNORE INTO books (cover_image, name, author, publisher, book_code, copies, description)
    VALUES 
    ('/src/assets/book-covers/cover1.svg', 'The Great Gatsby', 'F. Scott Fitzgerald', 'Scribner', 'BK001', 3, 'A classic American novel'),
    ('/src/assets/book-covers/cover2.svg', '1984', 'George Orwell', 'Secker and Warburg', 'BK002', 2, 'A dystopian social science fiction'),
    ('/src/assets/book-covers/cover3.svg', 'Pride and Prejudice', 'Jane Austen', 'T. Egerton', 'BK003', 4, 'A romantic novel');
  `);

  // Sample Research Papers
  sqlite.exec(`
    INSERT OR IGNORE INTO research_papers (cover_image, name, author, publisher, research_code, copies, description)
    VALUES 
    ('/src/assets/book-covers/cover4.svg', 'Modern Physics', 'Dr. John Smith', 'Science Publishing', 'RP001', 1, 'Research on quantum mechanics'),
    ('/src/assets/book-covers/cover5.svg', 'Ancient History', 'Dr. Sarah Johnson', 'History Press', 'RP002', 2, 'Study of ancient civilizations');
  `);

  // Sample Librarians
  sqlite.exec(`
    INSERT OR IGNORE INTO librarians (name, phone, appointment_date, membership_status, email)
    VALUES 
    ('John Doe', '123-456-7890', '2023-01-01', 'active', 'john@library.com'),
    ('Jane Smith', '098-765-4321', '2023-02-15', 'active', 'jane@library.com');
  `);

  // Sample Borrowers
  sqlite.exec(`
    INSERT OR IGNORE INTO borrowers (name, phone, category, joined_date, expiry_date, email, church_name)
    VALUES 
    ('Michael Brown', '111-222-3333', 'university', '2023-03-01', '2024-03-01', 'michael@email.com', 'St. Mary Church'),
    ('Sarah Wilson', '444-555-6666', 'graduate', '2023-04-15', '2024-04-15', 'sarah@email.com', 'St. Mark Church'),
    ('David Lee', '777-888-9999', 'secondary', '2023-05-01', '2024-05-01', 'david@email.com', 'St. George Church');
  `);

  // Sample Borrowings
  sqlite.exec(`
    INSERT OR IGNORE INTO borrowings (borrower_id, librarian_id, book_id, borrow_date, due_date, status)
    VALUES 
    (1, 1, 1, '2023-12-01', '2023-12-15', 'borrowed'),
    (2, 2, 2, '2023-12-05', '2023-12-19', 'borrowed'),
    (3, 1, 3, '2023-12-10', '2023-12-24', 'borrowed');
  `);
};

insertSampleData();
