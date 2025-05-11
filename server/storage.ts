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
    return db.getCollection('researchPapers');
  }
  async getResearchPaper(id: number): Promise<ResearchPaper | undefined> {
    return db.getCollection('researchPapers').find(rp => rp.id === id);
  }
  async createResearchPaper(research: InsertResearchPaper): Promise<ResearchPaper> {
    const researchPapers = db.getCollection('researchPapers');
    const newResearchPaper = { ...research, id: researchPapers.length + 1 };
    researchPapers.push(newResearchPaper);
    db.setCollection('researchPapers', researchPapers);
    return newResearchPaper;
  }
  async updateResearchPaper(id: number, research: Partial<InsertResearchPaper>): Promise<ResearchPaper | undefined> {
    const researchPapers = db.getCollection('researchPapers');
    const index = researchPapers.findIndex(rp => rp.id === id);
    if (index === -1) return undefined;
    researchPapers[index] = { ...researchPapers[index], ...research };
    db.setCollection('researchPapers', researchPapers);
    return researchPapers[index];
  }
  async deleteResearchPaper(id: number): Promise<boolean> {
    const researchPapers = db.getCollection('researchPapers');
    const index = researchPapers.findIndex(rp => rp.id === id);
    if (index === -1) return false;
    researchPapers.splice(index, 1);
    db.setCollection('researchPapers', researchPapers);
    return true;
  }
  async getLibrarians(): Promise<Librarian[]> {
    return db.getCollection('librarians');
  }
  async getLibrarian(id: number): Promise<Librarian | undefined> {
    return db.getCollection('librarians').find(l => l.id === id);
  }
  async createLibrarian(librarian: InsertLibrarian): Promise<Librarian> {
    const librarians = db.getCollection('librarians');
    const newLibrarian = { ...librarian, id: librarians.length + 1 };
    librarians.push(newLibrarian);
    db.setCollection('librarians', librarians);
    return newLibrarian;
  }
  async updateLibrarian(id: number, librarian: Partial<InsertLibrarian>): Promise<Librarian | undefined> {
    const librarians = db.getCollection('librarians');
    const index = librarians.findIndex(l => l.id === id);
    if (index === -1) return undefined;
    librarians[index] = { ...librarians[index], ...librarian };
    db.setCollection('librarians', librarians);
    return librarians[index];
  }
  async deleteLibrarian(id: number): Promise<boolean> {
    const librarians = db.getCollection('librarians');
    const index = librarians.findIndex(l => l.id === id);
    if (index === -1) return false;
    librarians.splice(index, 1);
    db.setCollection('librarians', librarians);
    return true;
  }
  async getBorrowers(): Promise<Borrower[]> {
    return db.getCollection('borrowers');
  }
  async getBorrower(id: number): Promise<Borrower | undefined> {
    return db.getCollection('borrowers').find(b => b.id === id);
  }
  async getBorrowersByCategory(category: string): Promise<Borrower[]> {
    return db.getCollection('borrowers').filter(b => b.category === category);
  }
  async createBorrower(borrower: InsertBorrower): Promise<Borrower> {
    const borrowers = db.getCollection('borrowers');
    const newBorrower = { ...borrower, id: borrowers.length + 1 };
    borrowers.push(newBorrower);
    db.setCollection('borrowers', borrowers);
    return newBorrower;
  }
  async updateBorrower(id: number, borrower: Partial<InsertBorrower>): Promise<Borrower | undefined> {
    const borrowers = db.getCollection('borrowers');
    const index = borrowers.findIndex(b => b.id === id);
    if (index === -1) return undefined;
    borrowers[index] = { ...borrowers[index], ...borrower };
    db.setCollection('borrowers', borrowers);
    return borrowers[index];
  }
  async deleteBorrower(id: number): Promise<boolean> {
    const borrowers = db.getCollection('borrowers');
    const index = borrowers.findIndex(b => b.id === id);
    if (index === -1) return false;
    borrowers.splice(index, 1);
    db.setCollection('borrowers', borrowers);
    return true;
  }
  async getBorrowings(): Promise<Borrowing[]> {
    return db.getCollection('borrowings');
  }
  async getBorrowing(id: number): Promise<Borrowing | undefined> {
    return db.getCollection('borrowings').find(b => b.id === id);
  }
  async createBorrowing(borrowing: InsertBorrowing): Promise<Borrowing> {
    const borrowings = db.getCollection('borrowings');
    const newBorrowing = { ...borrowing, id: borrowings.length + 1 };
    borrowings.push(newBorrowing);
    db.setCollection('borrowings', borrowings);
    return newBorrowing;
  }
  async updateBorrowing(id: number, borrowing: Partial<InsertBorrowing>): Promise<Borrowing | undefined> {
    const borrowings = db.getCollection('borrowings');
    const index = borrowings.findIndex(b => b.id === id);
    if (index === -1) return undefined;
    borrowings[index] = { ...borrowings[index], ...borrowing };
    db.setCollection('borrowings', borrowings);
    return borrowings[index];
  }
  async deleteBorrowing(id: number): Promise<boolean> {
    const borrowings = db.getCollection('borrowings');
    const index = borrowings.findIndex(b => b.id === id);
    if (index === -1) return false;
    borrowings.splice(index, 1);
    db.setCollection('borrowings', borrowings);
    return true;
  }
  async getBorrowingsByBorrowerId(borrowerId: number): Promise<Borrowing[]> {
    return db.getCollection('borrowings').filter(b => b.borrowerId === borrowerId);
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