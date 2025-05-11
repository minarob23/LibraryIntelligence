import { 
  InsertBook, Book, 
  InsertResearchPaper, ResearchPaper, 
  InsertLibrarian, Librarian, 
  InsertBorrower, Borrower, 
  InsertBorrowing, Borrowing, 
  MembershipApplication,
} from "@shared/schema";

import { db } from './db';
import { books, researchPapers, librarians, borrowers, borrowings } from '@shared/schema';
import { eq } from 'drizzle-orm';

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
    const books = db.getCollection('books');
    const index = books.findIndex(b => b.id === id);
    if (index === -1) return undefined;
    books[index] = { ...books[index], ...book };
    db.setCollection('books', books);
    return books[index];
  }
  async deleteBook(id: number): Promise<boolean> {
    const books = db.getCollection('books');
    const index = books.findIndex(b => b.id === id);
    if (index === -1) return false;
    books.splice(index, 1);
    db.setCollection('books', books);
    return true;
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
    const borrowings = db.getCollection('borrowings');
    const bookCounts = new Map<number, number>();
    for (const borrowing of borrowings) {
      if (borrowing.bookId) {
        bookCounts.set(borrowing.bookId, (bookCounts.get(borrowing.bookId) || 0) + 1);
      }
    }
    const sortedBooks = Array.from(bookCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, limit);
    return Promise.all(sortedBooks.map(async ([bookId, count]) => ({ ...(await this.getBook(bookId))!, borrowCount: count })));
  }
  async getPopularBooks(limit: number = 4): Promise<any[]> {
    const books = await this.getBooks();
    return books.slice(0, limit).map(book => ({ ...book, rating: (Math.random() * 2 + 3).toFixed(1) }));
  }
  async getTopBorrowers(limit: number = 5): Promise<any[]> {
    const borrowings = db.getCollection('borrowings');
    const borrowerCounts = new Map<number, number>();
    for (const borrowing of borrowings) {
      borrowerCounts.set(borrowing.borrowerId, (borrowerCounts.get(borrowing.borrowerId) || 0) + 1);
    }
    const sortedBorrowers = Array.from(borrowerCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, limit);
    return Promise.all(sortedBorrowers.map(async ([borrowerId, count]) => ({ ...(await this.getBorrower(borrowerId))!, borrowCount: count })));
  }
  async getBorrowerDistribution(): Promise<any> {
    const borrowers = await this.getBorrowers();
    const categories = ['primary', 'middle', 'secondary', 'university', 'graduate'];
    const distribution = categories.reduce((acc, category) => {
      acc[category] = borrowers.filter(b => b.category === category).length;
      return acc;
    }, {} as Record<string, number>);
    return distribution;
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