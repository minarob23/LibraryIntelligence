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
  
  // Reset database
  resetDatabase(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async resetDatabase(): Promise<void> {
    // Delete the database file
    const fs = require('fs');
    if (fs.existsSync('library.db')) {
      fs.unlinkSync('library.db');
    }
    
    // Recreate tables
    const createTables = require('./db').createTables;
    await createTables();
  }


export class DatabaseStorage implements IStorage {
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
    return books.map(book => ({ ...book, rating: (Math.random() * 2 + 3).toFixed(1) }));
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