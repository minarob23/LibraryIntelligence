import { 
  InsertBook, Book, 
  InsertResearchPaper, ResearchPaper, 
  InsertLibrarian, Librarian, 
  InsertBorrower, Borrower, 
  InsertBorrowing, Borrowing, 
  MembershipApplication
} from "@shared/schema";

// Storage interface
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

// Memory storage implementation
export class MemStorage implements IStorage {
  private books: Map<number, Book> = new Map();
  private researchPapers: Map<number, ResearchPaper> = new Map();
  private librarians: Map<number, Librarian> = new Map();
  private borrowers: Map<number, Borrower> = new Map();
  private borrowings: Map<number, Borrowing> = new Map();
  
  private bookId = 1;
  private researchId = 1;
  private librarianId = 1;
  private borrowerId = 1;
  private borrowingId = 1;

  constructor() {
    // Initialize with sample data
    this.seedData();
  }

  private seedData() {
    // We'll add sample data for testing later
  }

  // Book CRUD
  async getBooks(): Promise<Book[]> {
    return Array.from(this.books.values());
  }

  async getBook(id: number): Promise<Book | undefined> {
    return this.books.get(id);
  }

  async createBook(book: InsertBook): Promise<Book> {
    const id = this.bookId++;
    const now = new Date();
    const newBook: Book = { id, ...book, createdAt: now };
    this.books.set(id, newBook);
    return newBook;
  }

  async updateBook(id: number, book: Partial<InsertBook>): Promise<Book | undefined> {
    const existingBook = this.books.get(id);
    if (!existingBook) return undefined;
    
    const updatedBook = { ...existingBook, ...book };
    this.books.set(id, updatedBook);
    return updatedBook;
  }

  async deleteBook(id: number): Promise<boolean> {
    return this.books.delete(id);
  }

  // Research Paper CRUD
  async getResearchPapers(): Promise<ResearchPaper[]> {
    return Array.from(this.researchPapers.values());
  }

  async getResearchPaper(id: number): Promise<ResearchPaper | undefined> {
    return this.researchPapers.get(id);
  }

  async createResearchPaper(research: InsertResearchPaper): Promise<ResearchPaper> {
    const id = this.researchId++;
    const now = new Date();
    const newResearch: ResearchPaper = { id, ...research, createdAt: now };
    this.researchPapers.set(id, newResearch);
    return newResearch;
  }

  async updateResearchPaper(id: number, research: Partial<InsertResearchPaper>): Promise<ResearchPaper | undefined> {
    const existingResearch = this.researchPapers.get(id);
    if (!existingResearch) return undefined;
    
    const updatedResearch = { ...existingResearch, ...research };
    this.researchPapers.set(id, updatedResearch);
    return updatedResearch;
  }

  async deleteResearchPaper(id: number): Promise<boolean> {
    return this.researchPapers.delete(id);
  }

  // Librarian CRUD
  async getLibrarians(): Promise<Librarian[]> {
    return Array.from(this.librarians.values());
  }

  async getLibrarian(id: number): Promise<Librarian | undefined> {
    return this.librarians.get(id);
  }

  async createLibrarian(librarian: InsertLibrarian): Promise<Librarian> {
    const id = this.librarianId++;
    const now = new Date();
    const newLibrarian: Librarian = { id, ...librarian, createdAt: now };
    this.librarians.set(id, newLibrarian);
    return newLibrarian;
  }

  async updateLibrarian(id: number, librarian: Partial<InsertLibrarian>): Promise<Librarian | undefined> {
    const existingLibrarian = this.librarians.get(id);
    if (!existingLibrarian) return undefined;
    
    const updatedLibrarian = { ...existingLibrarian, ...librarian };
    this.librarians.set(id, updatedLibrarian);
    return updatedLibrarian;
  }

  async deleteLibrarian(id: number): Promise<boolean> {
    return this.librarians.delete(id);
  }

  // Borrower CRUD
  async getBorrowers(): Promise<Borrower[]> {
    return Array.from(this.borrowers.values());
  }

  async getBorrower(id: number): Promise<Borrower | undefined> {
    return this.borrowers.get(id);
  }

  async getBorrowersByCategory(category: string): Promise<Borrower[]> {
    return Array.from(this.borrowers.values()).filter(borrower => borrower.category === category);
  }

  async createBorrower(borrower: InsertBorrower): Promise<Borrower> {
    const id = this.borrowerId++;
    const now = new Date();
    const newBorrower: Borrower = { id, ...borrower, createdAt: now };
    this.borrowers.set(id, newBorrower);
    return newBorrower;
  }

  async updateBorrower(id: number, borrower: Partial<InsertBorrower>): Promise<Borrower | undefined> {
    const existingBorrower = this.borrowers.get(id);
    if (!existingBorrower) return undefined;
    
    const updatedBorrower = { ...existingBorrower, ...borrower };
    this.borrowers.set(id, updatedBorrower);
    return updatedBorrower;
  }

  async deleteBorrower(id: number): Promise<boolean> {
    return this.borrowers.delete(id);
  }

  // Borrowing CRUD
  async getBorrowings(): Promise<Borrowing[]> {
    return Array.from(this.borrowings.values());
  }

  async getBorrowing(id: number): Promise<Borrowing | undefined> {
    return this.borrowings.get(id);
  }

  async createBorrowing(borrowing: InsertBorrowing): Promise<Borrowing> {
    const id = this.borrowingId++;
    const now = new Date();
    const newBorrowing: Borrowing = { id, ...borrowing, createdAt: now };
    this.borrowings.set(id, newBorrowing);
    return newBorrowing;
  }

  async updateBorrowing(id: number, borrowing: Partial<InsertBorrowing>): Promise<Borrowing | undefined> {
    const existingBorrowing = this.borrowings.get(id);
    if (!existingBorrowing) return undefined;
    
    const updatedBorrowing = { ...existingBorrowing, ...borrowing };
    this.borrowings.set(id, updatedBorrowing);
    return updatedBorrowing;
  }

  async deleteBorrowing(id: number): Promise<boolean> {
    return this.borrowings.delete(id);
  }

  // Get borrowed books/research for a borrower
  async getBorrowingsByBorrowerId(borrowerId: number): Promise<Borrowing[]> {
    return Array.from(this.borrowings.values()).filter(borrowing => borrowing.borrowerId === borrowerId);
  }

  // Dashboard data
  async getMostBorrowedBooks(limit: number = 5): Promise<any[]> {
    const bookBorrowings = new Map<number, number>();
    
    // Count borrowings for each book
    for (const borrowing of this.borrowings.values()) {
      if (borrowing.bookId) {
        const count = bookBorrowings.get(borrowing.bookId) || 0;
        bookBorrowings.set(borrowing.bookId, count + 1);
      }
    }
    
    // Sort and get top books
    const sortedBooks = Array.from(bookBorrowings.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
    
    // Get book details
    return Promise.all(
      sortedBooks.map(async ([bookId, count]) => {
        const book = await this.getBook(bookId);
        return { ...book, borrowCount: count };
      })
    );
  }

  async getPopularBooks(limit: number = 4): Promise<any[]> {
    const books = await this.getBooks();
    // For simplicity, return random books
    return books
      .sort(() => Math.random() - 0.5)
      .slice(0, limit)
      .map(book => ({ ...book, rating: (Math.random() * 2 + 3).toFixed(1) }));
  }

  async getTopBorrowers(limit: number = 5): Promise<any[]> {
    const borrowerCounts = new Map<number, number>();
    
    // Count borrowings for each borrower
    for (const borrowing of this.borrowings.values()) {
      const count = borrowerCounts.get(borrowing.borrowerId) || 0;
      borrowerCounts.set(borrowing.borrowerId, count + 1);
    }
    
    // Sort and get top borrowers
    const sortedBorrowers = Array.from(borrowerCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
    
    // Get borrower details
    return Promise.all(
      sortedBorrowers.map(async ([borrowerId, count]) => {
        const borrower = await this.getBorrower(borrowerId);
        return { ...borrower, borrowCount: count };
      })
    );
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
      const librarian: InsertLibrarian = {
        name: application.name,
        phone: application.phone,
        email: application.email,
        appointmentDate: new Date().toISOString().split('T')[0],
        membershipStatus: 'active'
      };
      return this.createLibrarian(librarian);
    } else {
      const borrower: InsertBorrower = {
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
      };
      return this.createBorrower(borrower);
    }
  }
}

export const storage = new MemStorage();
