import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function initializeDb() {
  const db = await open({
    filename: './library.db',
    driver: sqlite3.Database
  });

  // Create all tables in library.db
  await db.exec(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      phone TEXT,
      email TEXT,
      stage TEXT NOT NULL,
      membershipStatus TEXT NOT NULL,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      submittedAt TEXT NOT NULL,
      status TEXT DEFAULT 'pending'
    );

    CREATE TABLE IF NOT EXISTS quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      author TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS book_index (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bookId INTEGER,
      location TEXT,
      description TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (bookId) REFERENCES books (id)
    );

    CREATE TABLE IF NOT EXISTS research_papers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      author TEXT NOT NULL,
      publisher TEXT,
      researchCode TEXT,
      copies INTEGER DEFAULT 1,
      coverImage TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      title TEXT,
      author TEXT,
      isbn TEXT,
      genre TEXT,
      publishedYear INTEGER,
      totalPages INTEGER,
      availableCopies INTEGER DEFAULT 1,
      coverImage TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS borrowers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      category TEXT,
      membershipStatus TEXT DEFAULT 'active',
      joinedDate TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS librarians (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      department TEXT,
      shift TEXT,
      startDate TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS borrowings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bookId INTEGER,
      borrowerId INTEGER,
      librarianId INTEGER,
      borrowDate TEXT NOT NULL,
      dueDate TEXT NOT NULL,
      returnDate TEXT,
      status TEXT DEFAULT 'borrowed',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (bookId) REFERENCES books (id),
      FOREIGN KEY (borrowerId) REFERENCES borrowers (id),
      FOREIGN KEY (librarianId) REFERENCES librarians (id)
    );
  `);

  await db.exec(`
      CREATE TABLE IF NOT EXISTS membership_applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        memberId TEXT NOT NULL,
        name TEXT NOT NULL,
        stage TEXT NOT NULL,
        birthdate TEXT NOT NULL,
        phone TEXT NOT NULL,
        additionalPhone TEXT,
        email TEXT NOT NULL,
        address TEXT NOT NULL,
        organizationName TEXT,
        emergencyContact TEXT,
        studies TEXT,
        job TEXT,
        hobbies TEXT,
        favoriteBooks TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

  console.log('✅ All tables created successfully');
  return db;
}