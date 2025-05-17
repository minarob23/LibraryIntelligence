import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { 
  books,
  researchPapers,
  librarians,
  borrowers,
  borrowings,
  membershipApplicationSchema,
  membershipApplications
} from '@shared/schema';
import { sql } from 'drizzle-orm';
import * as fs from 'fs';
import { setupBackup } from './backup';
import {
  type InsertBookSchema,
  type InsertBorrowerSchema,
  type InsertLibrarianSchema,
  type InsertResearchPaperSchema,
  type InsertBorrowingSchema,
  type MembershipApplicationSchema
} from '@shared/schema';

const libraryDb = new Database('library.db');
const dashboardDb = new Database('dashboard.db');

class Storage {
  private db = drizzle(libraryDb);
  private dashboardDb = drizzle(dashboardDb);

  // Books
  async getBooks() {
    return await this.db.select().from(books);
  }

  async getBook(id: number) {
    const results = await this.db
      .select()
      .from(books)
      .where(sql`${books.id} = ${id}`);
    return results[0];
  }

  async createBook(book: InsertBookSchema) {
    const result = await this.db.insert(books).values(book);
    return this.getBook(Number(result.lastInsertRowid));
  }

  async updateBook(id: number, book: Partial<InsertBookSchema>) {
    await this.db.update(books).set(book).where(sql`${books.id} = ${id}`);
    return this.getBook(id);
  }

  async deleteBook(id: number) {
    const result = await this.db.delete(books).where(sql`${books.id} = ${id}`);
    return result.changes > 0;
  }

  // Research Papers
  async getResearchPapers() {
    return await this.db.select().from(researchPapers);
  }

  async getResearchPaper(id: number) {
    const results = await this.db
      .select()
      .from(researchPapers)
      .where(sql`${researchPapers.id} = ${id}`);
    return results[0];
  }

  async createResearchPaper(paper: InsertResearchPaperSchema) {
    const result = await this.db.insert(researchPapers).values(paper);
    return this.getResearchPaper(Number(result.lastInsertRowid));
  }

  async updateResearchPaper(id: number, paper: Partial<InsertResearchPaperSchema>) {
    await this.db.update(researchPapers).set(paper).where(sql`${researchPapers.id} = ${id}`);
    return this.getResearchPaper(id);
  }

  async deleteResearchPaper(id: number) {
    const result = await this.db.delete(researchPapers).where(sql`${researchPapers.id} = ${id}`);
    return result.changes > 0;
  }

  // Librarians
  async getLibrarians() {
    return await this.db.select().from(librarians);
  }

  async getLibrarian(id: number) {
    const results = await this.db
      .select()
      .from(librarians)
      .where(sql`${librarians.id} = ${id}`);
    return results[0];
  }

  async createLibrarian(librarian: InsertLibrarianSchema) {
    const result = await this.db.insert(librarians).values(librarian);
    return this.getLibrarian(Number(result.lastInsertRowid));
  }

  async updateLibrarian(id: number, librarian: Partial<InsertLibrarianSchema>) {
    await this.db.update(librarians).set(librarian).where(sql`${librarians.id} = ${id}`);
    return this.getLibrarian(id);
  }

  async deleteLibrarian(id: number) {
    const result = await this.db.delete(librarians).where(sql`${librarians.id} = ${id}`);
    return result.changes > 0;
  }

  // Borrowers
  async getBorrowers() {
    return await this.db.select().from(borrowers);
  }

  async getBorrowersByCategory(category: string) {
    return await this.db
      .select()
      .from(borrowers)
      .where(sql`${borrowers.category} = ${category}`);
  }

  async getBorrower(id: number) {
    const results = await this.db
      .select()
      .from(borrowers)
      .where(sql`${borrowers.id} = ${id}`);
    return results[0];
  }

  async createBorrower(borrower: InsertBorrowerSchema) {
    const result = await this.db.insert(borrowers).values(borrower);
    return this.getBorrower(Number(result.lastInsertRowid));
  }

  async updateBorrower(id: number, borrower: Partial<InsertBorrowerSchema>) {
    await this.db.update(borrowers).set(borrower).where(sql`${borrowers.id} = ${id}`);
    return this.getBorrower(id);
  }

  async deleteBorrower(id: number) {
    const result = await this.db.delete(borrowers).where(sql`${borrowers.id} = ${id}`);
    return result.changes > 0;
  }

  // Borrowings
  async getBorrowings() {
    return await this.db.select().from(borrowings);
  }

  async getBorrowingsByBorrowerId(borrowerId: number) {
    return await this.db
      .select()
      .from(borrowings)
      .where(sql`${borrowings.borrowerId} = ${borrowerId}`);
  }

  async getBorrowing(id: number) {
    const results = await this.db
      .select()
      .from(borrowings)
      .where(sql`${borrowings.id} = ${id}`);
    return results[0];
  }

  async createBorrowing(borrowing: InsertBorrowingSchema) {
    const result = await this.db.insert(borrowings).values(borrowing);
    return this.getBorrowing(Number(result.lastInsertRowid));
  }

  async updateBorrowing(id: number, borrowing: Partial<InsertBorrowingSchema>) {
    await this.db.update(borrowings).set(borrowing).where(sql`${borrowings.id} = ${id}`);
    return this.getBorrowing(id);
  }

  async deleteBorrowing(id: number) {
    const result = await this.db.delete(borrowings).where(sql`${borrowings.id} = ${id}`);
    return result.changes > 0;
  }

  // Dashboard Data
  async getMostBorrowedBooks(limit: number = 5) {
    const result = await this.db.select({
      bookId: borrowings.bookId,
      borrowCount: sql<number>`count(*) as borrowCount`
    })
    .from(borrowings)
    .where(sql`${borrowings.bookId} IS NOT NULL`)
    .groupBy(sql`${borrowings.bookId}`)
    .orderBy(sql`borrowCount DESC`)
    .limit(limit);

    return Promise.all(result.map(async row => {
      const book = await this.getBook(row.bookId!);
      return { ...book, borrowCount: Number(row.borrowCount) };
    }));
  }

  async getPopularBooks(limit: number = 4) {
    const result = await this.db.select({
      bookId: borrowings.bookId,
      timesBorrowed: sql<number>`count(*) as timesBorrowed`
    })
    .from(borrowings)
    .where(sql`${borrowings.bookId} IS NOT NULL`)
    .groupBy(sql`${borrowings.bookId}`)
    .orderBy(sql`timesBorrowed DESC`)
    .limit(limit);

    return Promise.all(result.map(async row => {
      const book = await this.getBook(row.bookId!);
      return { ...book, timesBorrowed: Number(row.timesBorrowed) };
    }));
  }

  async getTopBorrowers(limit: number = 5) {
    const result = await this.db.select({
      borrowerId: borrowings.borrowerId,
      borrowCount: sql<number>`count(*) as borrowCount`
    })
    .from(borrowings)
    .groupBy(sql`${borrowings.borrowerId}`)
    .orderBy(sql`borrowCount DESC`)
    .limit(limit);

    return Promise.all(result.map(async row => {
      const borrower = await this.getBorrower(row.borrowerId);
      return { ...borrower, borrowCount: Number(row.borrowCount) };
    }));
  }

  async getBorrowerDistribution() {
    const result = await this.db.select({
      category: borrowers.category,
      count: sql<number>`count(*) as count`
    })
    .from(borrowers)
    .groupBy(sql`${borrowers.category}`);

    // Transform result to match expected format
    return result.map(row => ({
      category: row.category,
      count: Number(row.count)
    }));
  }

  // Membership Applications
  async createMembershipApplication(application: MembershipApplicationSchema) {
    const result = await this.db.insert(membershipApplications).values(application);
    
    // Create a borrower record from the application
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    
    await this.createBorrower({
      name: application.name,
      phone: application.phone,
      category: application.stage === 'librarian' ? 'graduate' : application.stage,
      joinedDate: new Date().toISOString().split('T')[0],
      expiryDate: oneYearFromNow.toISOString().split('T')[0],
      email: application.email,
      address: application.address,
      churchName: application.churchName,
      fatherOfConfession: application.fatherOfConfession,
      studies: application.studies,
      job: application.job,
      hobbies: application.hobbies,
      favoriteBooks: application.favoriteBooks,
      additionalPhone: application.additionalPhone
    });

    return {
      id: Number(result.lastInsertRowid),
      ...application
    };
  }

  // Database Management
  async resetDatabase() {
    try {
      // Create a backup before resetting
      setupBackup();

      // Close current database connections
      libraryDb.close();
      dashboardDb.close();

      // Delete the database files
      if (fs.existsSync('library.db')) {
        fs.unlinkSync('library.db');
      }
      if (fs.existsSync('dashboard.db')) {
        fs.unlinkSync('dashboard.db');
      }

      // Remove any backup files
      if (fs.existsSync('backups')) {
        const backupFiles = fs.readdirSync('backups');
        backupFiles.forEach(file => {
          fs.unlinkSync(`backups/${file}`);
        });
      }
    } finally {
      // Recreate both databases with fresh connections
      const newLibraryDb = new Database('library.db');
      const newDashboardDb = new Database('dashboard.db');

      // Update the class instance database connections
      this.db = drizzle(newLibraryDb);
      this.dashboardDb = drizzle(newDashboardDb);
    }
  }
}

export const storage = new Storage();