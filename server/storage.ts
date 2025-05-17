import { 
  InsertBook, Book, 
  InsertResearchPaper, ResearchPaper, 
  InsertLibrarian, Librarian, 
  InsertBorrower, Borrower, 
  InsertBorrowing, Borrowing, 
  MembershipApplication,
} from "@shared/schema";

import { db } from './db';
import * as schema from '@shared/schema';
import { eq, sql } from 'drizzle-orm';
import { books, researchPapers, librarians, borrowers, borrowings } from '@shared/schema';
import Database from 'better-sqlite3';
import fs from 'fs';

export interface IStorage {
  // Book CRUD
  getBooks(): Promise<Book[]>;
  getBook(id: number): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: number, book: Partial<InsertBook>): Promise<Book | undefined>;
  deleteBook(id: number): Promise<boolean>;

  // Research Paper CRUD
  getResearchPapers(): Promise<ResearchPaper[]>;
  getResearchPaper(id: number): Promise<ResearchPaper | undefined>;
  createResearchPaper(research: InsertResearchPaper): Promise<ResearchPaper>;
  updateResearchPaper(id: number, research: Partial<InsertResearchPaper>): Promise<ResearchPaper | undefined>;
  deleteResearchPaper(id: number): Promise<boolean>;

  // Librarian CRUD
  getLibrarians(): Promise<Librarian[]>;
  getLibrarian(id: number): Promise<Librarian | undefined>;
  createLibrarian(librarian: InsertLibrarian): Promise<Librarian>;
  updateLibrarian(id: number, librarian: Partial<InsertLibrarian>): Promise<Librarian | undefined>;
  deleteLibrarian(id: number): Promise<boolean>;

  // Borrower CRUD
  getBorrowers(): Promise<Borrower[]>;
  getBorrower(id: number): Promise<Borrower | undefined>;
  getBorrowersByCategory(category: string): Promise<Borrower[]>;
  createBorrower(borrower: InsertBorrower): Promise<Borrower>;
  updateBorrower(id: number, borrower: Partial<InsertBorrower>): Promise<Borrower | undefined>;
  deleteBorrower(id: number): Promise<boolean>;

  // Borrowing CRUD
  getBorrowings(): Promise<Borrowing[]>;
  getBorrowing(id: number): Promise<Borrowing | undefined>;
  createBorrowing(borrowing: InsertBorrowing): Promise<Borrowing>;
  updateBorrowing(id: number, borrowing: Partial<InsertBorrowing>): Promise<Borrowing | undefined>;
  deleteBorrowing(id: number): Promise<boolean>;

  // Get borrowed books/research for a borrower
  getBorrowingsByBorrowerId(borrowerId: number): Promise<Borrowing[]>;

  // Dashboard data
  getMostBorrowedBooks(limit?: number): Promise<any[]>;
  getPopularBooks(limit?: number): Promise<any[]>;
  getTopBorrowers(limit?: number): Promise<any[]>;
  getBorrowerDistribution(): Promise<any>;

  // Membership application
  createMembershipApplication(application: MembershipApplication): Promise<Borrower | Librarian>;

  resetDatabase(): Promise<void>;
}


import { dashboardDb } from './dashboard-db';

export class DatabaseStorage implements IStorage {
  // Helper method to sync dashboard data
  private async syncDashboardData() {
    // Sync popular books
    const popularBooks = await this.getPopularBooks();
    await dashboardDb.delete(schema.popularBooks);
    await dashboardDb.insert(schema.popularBooks).values(popularBooks);

    // Sync top borrowers
    const topBorrowers = await this.getTopBorrowers();
    await dashboardDb.delete(schema.topBorrowers);
    await dashboardDb.insert(schema.topBorrowers).values(topBorrowers);

    // Sync borrower distribution
    const distribution = await this.getBorrowerDistribution();
    await dashboardDb.delete(schema.borrowerDistribution);
    await dashboardDb.insert(schema.borrowerDistribution).values(
      Object.entries(distribution).map(([category, count]) => ({
        category,
        count
      }))
    );

    // Sync most borrowed books
    const mostBorrowed = await this.getMostBorrowedBooks();
    await dashboardDb.delete(schema.mostBorrowedBooks);
    await dashboardDb.insert(schema.mostBorrowedBooks).values(
      mostBorrowed.map(book => ({
        bookId: book.id,
        borrowCount: book.borrowCount
      }))
    );
  }

  // Main database operations
  async getBooks(): Promise<Book[]> {
    return db.select().from(books);
  }
  async getBook(id: number): Promise<Book | undefined> {
    const result = await db.select().from(books).where(eq(books.id, id));
    return result[0];
  }
  async createBook(book: InsertBook): Promise<Book> {
    const result = await db.insert(books).values(book).returning();
    return result[0];
  }
  async updateBook(id: number, book: Partial<InsertBook>): Promise<Book | undefined> {
    const result = await db.update(books)
      .set(book)
      .where(eq(books.id, id))
      .returning();
    return result[0];
  }
  async deleteBook(id: number): Promise<boolean> {
    const result = await db.delete(books)
      .where(eq(books.id, id))
      .returning();
    return result.length > 0;
  }
  async getResearchPapers(): Promise<ResearchPaper[]> {
    return db.select().from(researchPapers);
  }
  async getResearchPaper(id: number): Promise<ResearchPaper | undefined> {
    const result = await db.select().from(researchPapers).where(eq(researchPapers.id, id));
    return result[0];
  }
  async createResearchPaper(research: InsertResearchPaper): Promise<ResearchPaper> {
    const result = await db.insert(researchPapers).values(research).returning();
    return result[0];
  }
  async updateResearchPaper(id: number, research: Partial<InsertResearchPaper>): Promise<ResearchPaper | undefined> {
    const result = await db.update(researchPapers)
      .set(research)
      .where(eq(researchPapers.id, id))
      .returning();
    return result[0];
  }
  async deleteResearchPaper(id: number): Promise<boolean> {
    const result = await db.delete(researchPapers)
      .where(eq(researchPapers.id, id))
      .returning();
    return result.length > 0;
  }
  async getLibrarians(): Promise<Librarian[]> {
    return db.select().from(librarians);
  }
  async getLibrarian(id: number): Promise<Librarian | undefined> {
    const result = await db.select().from(librarians).where(eq(librarians.id, id));
    return result[0];
  }
  async createLibrarian(librarian: InsertLibrarian): Promise<Librarian> {
    const result = await db.insert(librarians).values(librarian).returning();
    return result[0];
  }
  async updateLibrarian(id: number, librarian: Partial<InsertLibrarian>): Promise<Librarian | undefined> {
    const result = await db.update(librarians)
      .set(librarian)
      .where(eq(librarians.id, id))
      .returning();
    return result[0];
  }
  async deleteLibrarian(id: number): Promise<boolean> {
    const result = await db.delete(librarians)
      .where(eq(librarians.id, id))
      .returning();
    return result.length > 0;
  }
  async getBorrowers(): Promise<Borrower[]> {
    return db.select().from(borrowers);
  }
  async getBorrower(id: number): Promise<Borrower | undefined> {
    const result = await db.select().from(borrowers).where(eq(borrowers.id, id));
    return result[0];
  }
  async getBorrowersByCategory(category: string): Promise<Borrower[]> {
    return db.select().from(borrowers).where(eq(borrowers.category, category));
  }
  async createBorrower(borrower: InsertBorrower): Promise<Borrower> {
    const result = await db.insert(borrowers).values(borrower).returning();
    return result[0];
  }
  async updateBorrower(id: number, borrower: Partial<InsertBorrower>): Promise<Borrower | undefined> {
    const result = await db.update(borrowers)
      .set(borrower)
      .where(eq(borrowers.id, id))
      .returning();
    return result[0];
  }
  async deleteBorrower(id: number): Promise<boolean> {
    const result = await db.delete(borrowers)
      .where(eq(borrowers.id, id))
      .returning();
    return result.length > 0;
  }
  async getBorrowings(): Promise<Borrowing[]> {
    return db.select().from(borrowings);
  }
  async getBorrowing(id: number): Promise<Borrowing | undefined> {
    const result = await db.select().from(borrowings).where(eq(borrowings.id, id));
    return result[0];
  }
  async createBorrowing(borrowing: InsertBorrowing): Promise<Borrowing> {
    const result = await db.insert(borrowings).values(borrowing).returning();
    return result[0];
  }
  async updateBorrowing(id: number, borrowing: Partial<InsertBorrowing>): Promise<Borrowing | undefined> {
    const result = await db.update(borrowings)
      .set(borrowing)
      .where(eq(borrowings.id, id))
      .returning();
    return result[0];
  }
  async deleteBorrowing(id: number): Promise<boolean> {
    const result = await db.delete(borrowings)
      .where(eq(borrowings.id, id))
      .returning();
    return result.length > 0;
  }
  async getBorrowingsByBorrowerId(borrowerId: number): Promise<Borrowing[]> {
    return db.select().from(borrowings).where(eq(borrowings.borrowerId, borrowerId));
  }
  async getMostBorrowedBooks(limit: number = 5): Promise<any[]> {
    const result = await db.select({
      bookId: borrowings.bookId,
      count: sql`count(*)`.as('count')
    })
    .from(borrowings)
    .where(sql`book_id IS NOT NULL`)
    .groupBy(borrowings.bookId)
    .orderBy(sql`count DESC`)
    .limit(limit);

    return Promise.all(result.map(async (row) => {
      const book = await this.getBook(row.bookId!);
      return { ...book, borrowCount: Number(row.count) };
    }));
  }

  async getPopularBooks(limit: number = 4): Promise<any[]> {
    const books = await db.select().from(schema.books).limit(limit);
    const borrowings = await db.select().from(schema.borrowings);

    return books.map(book => {
      const bookBorrowings = borrowings.filter(b => b.bookId === book.id);
      const timesBorrowed = bookBorrowings.length;
      const lastBorrowed = bookBorrowings.length > 0 
        ? Math.max(...bookBorrowings.map(b => new Date(b.borrowDate).getTime()))
        : new Date().getTime();
      const daysSinceLastBorrow = Math.floor((new Date().getTime() - lastBorrowed) / (1000 * 60 * 60 * 24));

      const bookBorrowingsWithRatings = bookBorrowings.filter(b => b.rating);
      const avgRating = bookBorrowingsWithRatings.length > 0
        ? bookBorrowingsWithRatings.reduce((sum, b) => sum + (b.rating || 0), 0) / bookBorrowingsWithRatings.length
        : 0;

      const completedBorrowings = bookBorrowings.filter(b => b.returnDate);
      const onTimeBorrowings = completedBorrowings.filter(b => new Date(b.returnDate) <= new Date(b.dueDate));
      const returnRate = completedBorrowings.length > 0 
        ? onTimeBorrowings.length / completedBorrowings.length
        : 0;

      // Weight factors (starting from negative)
      const baseScore = -50; // Start from negative base
      const borrowingFactor = timesBorrowed * 10; // Positive contribution
      const recencyFactor = 100 - daysSinceLastBorrow; // Can be negative or positive
      const ratingFactor = avgRating * 20; // Positive contribution
      const returnFactor = returnRate * 50; // Positive contribution

      // Combined score with weights (starting from negative)
      const popularityScore = Number((baseScore + 
                                    (borrowingFactor * 0.3 + 
                                     recencyFactor * 0.3 + 
                                     ratingFactor * 0.2 + 
                                     returnFactor * 0.2) / 10).toFixed(1));

      const averageRating = bookBorrowingsWithRatings.length > 0
        ? (bookBorrowingsWithRatings.reduce((sum, b) => sum + b.rating!, 0) / bookBorrowingsWithRatings.length).toFixed(1)
        : null;

      return {
        ...book,
        timesBorrowed,
        popularityScore,
        rating: averageRating
      };
    });
  }

  async getTopBorrowers(limit: number = 5): Promise<any[]> {
    const result = await db.select({
      borrowerId: borrowings.borrowerId,
      count: sql`count(*)`.as('count')
    })
    .from(borrowings)
    .groupBy(borrowings.borrowerId)
    .orderBy(sql`count DESC`)
    .limit(limit);

    return Promise.all(result.map(async (row) => {
      const borrower = await this.getBorrower(row.borrowerId);
      return { ...borrower, borrowCount: Number(row.count) };
    }));
  }

  async getBorrowerDistribution(): Promise<any> {
    const result = await db.select({
      category: borrowers.category,
      count: sql`count(*)`.as('count')
    })
    .from(borrowers)
    .groupBy(borrowers.category);

    return result.reduce((acc, row) => {
      acc[row.category] = Number(row.count);
      return acc;
    }, {} as Record<string, number>);
  }
  async resetDatabase(): Promise<void> {
    try {
      // Close existing database connections
      await db.delete(books).execute();
      await db.delete(researchPapers).execute();
      await db.delete(librarians).execute();
      await db.delete(borrowers).execute();
      await db.delete(borrowings).execute();

      // Delete all records from dashboard database
      await dashboardDb.delete(schema.popularBooks).execute();
      await dashboardDb.delete(schema.topBorrowers).execute();
      await dashboardDb.delete(schema.borrowerDistribution).execute();
      await dashboardDb.delete(schema.mostBorrowedBooks).execute();

      // Delete the database files if they exist
      if (fs.existsSync('library.db')) {
        fs.unlinkSync('library.db');
      }
      if (fs.existsSync('dashboard.db')) {
        fs.unlinkSync('dashboard.db');
      }

      // Remove any backup files
      if (fs.existsSync('backups')) {
        const backupFiles = fs.readdirSync('backups');
        for (const file of backupFiles) {
          fs.unlinkSync(`backups/${file}`);
        }
      }
    } finally {
      // Recreate both databases with fresh connections
      const sqlite = new Database('library.db');
      const dashboardSqlite = new Database('dashboard.db');

    // Recreate library tables
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

    // Recreate dashboard tables
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

    dashboardSqlite.exec(`
      CREATE TABLE IF NOT EXISTS top_borrowers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        borrower_id INTEGER NOT NULL,
        borrow_count INTEGER NOT NULL,
        last_borrowed_at TEXT,
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);

    dashboardSqlite.exec(`
      CREATE TABLE IF NOT EXISTS borrower_distribution (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        count INTEGER NOT NULL,
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);

    dashboardSqlite.exec(`
      CREATE TABLE IF NOT EXISTS most_borrowed_books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER NOT NULL,
        borrow_count INTEGER NOT NULL,
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);
  }

  async createMembershipApplication(application: MembershipApplication): Promise<Borrower | Librarian> {
    if (application.stage === 'librarian') {
      return this.createLibrarian({
        name: application.name,
        phone: application.phone,
        email: application.email,
        appointmentDate: new Date().toISOString().split('T')[0],
        membershipStatus: 'active'
      });
    } else {
      return this.createBorrower({
        name: application.name,
        phone: application.phone,
        email: application.email,
        category: application.stage as any,
        joinedDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        address: application.address,
        churchName: application.churchName,
        fatherOfConfession: application.fatherOfConfession,
        studies: application.studies,
        job: application.job,
        hobbies: application.hobbies,
        favoriteBooks: application.favoriteBooks,
        additionalPhone: application.additionalPhone
      });
    }
  }
}

export const storage = new DatabaseStorage();