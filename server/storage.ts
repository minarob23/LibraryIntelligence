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
      borrowCount: sql<number>`COUNT(*) as borrowCount`,
      avgRating: sql<number>`AVG(CAST(rating as FLOAT)) as avgRating`,
      lastBorrowed: sql<string>`MAX(borrowDate) as lastBorrowed`,
      returnRate: sql<number>`SUM(CASE WHEN returnDate IS NOT NULL THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as returnRate`
    })
    .from(borrowings)
    .where(sql`${borrowings.bookId} IS NOT NULL`)
    .groupBy(sql`${borrowings.bookId}`);

    const booksWithScores = await Promise.all(result.map(async (row) => {
      const book = await this.getBook(row.bookId!);
      
      // Calculate popularity score components
      const borrowScore = Math.min(row.borrowCount / 10, 1) * 4; // Max 4 points
      const ratingScore = (row.avgRating || 0) / 2; // Max 5 points
      const daysSinceLastBorrow = Math.floor((Date.now() - new Date(row.lastBorrowed).getTime()) / (1000 * 3600 * 24));
      const recencyScore = Math.max(0, 1 - daysSinceLastBorrow / 30) * 1; // Max 1 point

      // Calculate final popularity score
      const popularityScore = Number((borrowScore + ratingScore + recencyScore).toFixed(1));
      
      return { 
        ...book, 
        popularityScore,
        borrowCount: row.borrowCount,
        avgRating: row.avgRating ? Number(row.avgRating.toFixed(1)) : null,
        returnRate: Number(row.returnRate.toFixed(1))
      };
    }));

    return booksWithScores
      .sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0))
      .slice(0, limit);
  }

  async getTopBorrowers(limit: number = 4) {
    const result = await this.db.select({
      borrowerId: borrowings.borrowerId,
      borrowCount: sql<number>`COUNT(*) as borrowCount`,
      avgRating: sql<number>`AVG(CAST(rating as FLOAT)) as avgRating`,
      lastBorrowed: sql<string>`MAX(borrowDate) as lastBorrowed`,
      firstBorrowed: sql<string>`MIN(borrowDate) as firstBorrowed`,
      returnRate: sql<number>`SUM(CASE WHEN returnDate IS NOT NULL THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as returnRate`
    })
    .from(borrowings)
    .groupBy(sql`${borrowings.borrowerId}`);

    const borrowersWithScores = await Promise.all(result.map(async (row) => {
      const borrower = await this.getBorrower(row.borrowerId!);
      
      // Calculate engagement score components
      const daysSinceFirstBorrow = Math.floor((Date.now() - new Date(row.firstBorrowed).getTime()) / (1000 * 3600 * 24)) + 1;
      const frequencyScore = Math.min(row.borrowCount / daysSinceFirstBorrow * 7, 1) * 4; // Max 4 points
      
      const daysSinceLastBorrow = Math.floor((Date.now() - new Date(row.lastBorrowed).getTime()) / (1000 * 3600 * 24));
      const recencyScore = Math.max(0, 1 - daysSinceLastBorrow / 30) * 4; // Max 4 points
      
      const returnScore = (row.returnRate / 100) * 2; // Max 2 points

      // Calculate final engagement score
      const engagementScore = Number((frequencyScore + recencyScore + returnScore).toFixed(1));
      
      return { 
        ...borrower, 
        engagementScore,
        borrowCount: row.borrowCount,
        avgRating: row.avgRating ? Number(row.avgRating.toFixed(1)) : null,
        returnRate: Number(row.returnRate.toFixed(1))
      };
    }));

    return borrowersWithScores
      .sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0))
      .slice(0, limit);
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
      // Create a final backup before resetting
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = 'backups';
      
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
      }
      
      // Backup both databases with final timestamp
      if (fs.existsSync('library.db')) {
        fs.copyFileSync('library.db', `${backupDir}/library-final-${timestamp}.db`);
      }
      if (fs.existsSync('dashboard.db')) {
        fs.copyFileSync('dashboard.db', `${backupDir}/dashboard-final-${timestamp}.db`);
      }

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

  async restoreDatabase() {
    try {
      // Get latest backup files
      const backupDir = 'backups';
      const backupFiles = fs.readdirSync(backupDir)
        .filter(file => file.startsWith('library-'))
        .sort()
        .reverse();

      if (backupFiles.length > 0) {
        const latestBackup = backupFiles[0];
        fs.copyFileSync(`${backupDir}/${latestBackup}`, 'library.db');
      }
    } catch (error) {
      console.error('Error restoring database:', error);
      throw error;
    }
  }
}

export const storage = new Storage();