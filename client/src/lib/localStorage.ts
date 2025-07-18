interface StorageData {
  books: any[];
  borrowers: any[];
  librarians: any[];
  borrowings: any[];
  membershipApplications: any[];
}

interface Book {
  id: number;
  name: string;
  title?: string;
  author: string;
  genres?: string;
  [key: string]: any;
}

interface Borrower {
  id: number;
  name: string;
  [key: string]: any;
}

interface Borrowing {
  id: number;
  bookId: number;
  borrowerId: number;
  status: string;
  [key: string]: any;
}

class LocalStorage {
  private storageKey = 'library-management-data';

  private getDefaultData(): StorageData {
    return {
      books: [],
      borrowers: [],
      librarians: [],
      borrowings: [],
      membershipApplications: []
    };
  }

  private getData(): StorageData {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) {
        return this.getDefaultData();
      }

      const data = JSON.parse(stored);

      // Ensure all required arrays exist
      return {
        books: Array.isArray(data.books) ? data.books : [],
        borrowers: Array.isArray(data.borrowers) ? data.borrowers : [],
        librarians: Array.isArray(data.librarians) ? data.librarians : [],
        borrowings: Array.isArray(data.borrowings) ? data.borrowings : [],
        membershipApplications: Array.isArray(data.membershipApplications) ? data.membershipApplications : []
      };
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      localStorage.removeItem(this.storageKey);
      return this.getDefaultData();
    }
  }

  private saveData(data: StorageData): void {
    try {
      const cleanData = this.validateAndCleanData(data);
      localStorage.setItem(this.storageKey, JSON.stringify(cleanData));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private generateId(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  // Books
  getBooks(): Book[] {
    return this.getData().books;
  }

  getBook(id: number) {
    const data = this.getData();
    return data.books.find(book => book.id === id);
  }

  async createBook(book: any) {
    const data = this.getData();
    const newBook = {
      ...book,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      addedDate: new Date().toISOString().split('T')[0]
    };
    data.books.push(newBook);
    this.saveData(data);

    // Sync with database
    await syncWithDatabase('books', newBook);

    return newBook;
  }

  updateBook(id: number, bookUpdate: any) {
    const data = this.getData();
    const index = data.books.findIndex(book => book.id === id);
    if (index !== -1) {
      data.books[index] = { ...data.books[index], ...bookUpdate };
      this.saveData(data);
      return data.books[index];
    }
    return null;
  }

  deleteBook(id: number) {
    const data = this.getData();
    const index = data.books.findIndex(book => book.id === id);
    if (index !== -1) {
      data.books.splice(index, 1);
      this.saveData(data);
      return true;
    }
    return false;
  }

  // Borrowers
  getBorrowers(): Borrower[] {
    return this.getData().borrowers;
  }

  getBorrower(id: number) {
    const data = this.getData();
    return data.borrowers.find(borrower => borrower.id === id);
  }

  getBorrowersByCategory(category: string) {
    const data = this.getData();
    return data.borrowers.filter(borrower => borrower.category === category);
  }

  async createBorrower(borrower: any) {
    const data = this.getData();
    const newId = this.generateId();
    const now = new Date();
    const newBorrower = {
      ...borrower,
      id: newId,
      memberId: borrower.memberId || borrower.id || `BRW-${newId}`,
      createdAt: now.toISOString(),
      joinedDate: borrower.joinedDate || now.toISOString().split('T')[0],
      expiryDate: borrower.expiryDate || new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    data.borrowers.push(newBorrower);
    this.saveData(data);

    // Sync with database
    await syncWithDatabase('borrowers', newBorrower);

    return newBorrower;
  }

  async updateBorrower(id: number, updates: any): Promise<any> {
    const data = this.getData();
    const index = data.borrowers.findIndex((b: any) => b.id === id);
    if (index !== -1) {
      data.borrowers[index] = { 
        ...data.borrowers[index], 
        ...updates,
        // Preserve the original id
        id: data.borrowers[index].id
      };
      this.saveData(data);

      // Sync with database
      await syncWithDatabase('borrowers', data.borrowers[index], 'PUT', id);

      return data.borrowers[index];
    }
    throw new Error('Borrower not found');
  }

  async deleteBorrower(id: number) {
    const data = this.getData();
    const index = data.borrowers.findIndex(borrower => borrower.id === id);
    if (index !== -1) {
      data.borrowers.splice(index, 1);
      this.saveData(data);

      // Sync with database
      await syncWithDatabase('borrowers', null, 'DELETE', id);

      return true;
    }
    return false;
  }

  // Librarians
  getLibrarians() {
    return this.getData().librarians;
  }

  getLibrarian(id: number) {
    const data = this.getData();
    return data.librarians.find(librarian => librarian.id === id);
  }

  createLibrarian(librarian: any) {
    const data = this.getData();
    const newLibrarian = {
      ...librarian,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    data.librarians.push(newLibrarian);
    this.saveData(data);
    return newLibrarian;
  }

  updateLibrarian(id: number, librarianUpdate: any) {
    const data = this.getData();
    const index = data.librarians.findIndex(librarian => librarian.id === id);
    if (index !== -1) {
      // Ensure we preserve the ID and merge all other fields including librarianId
      const updatedLibrarian = { 
        ...data.librarians[index], 
        ...librarianUpdate,
        id: id // Preserve the original ID
      };
      data.librarians[index] = updatedLibrarian;
      this.saveData(data);
      console.log('Librarian updated successfully:', updatedLibrarian);
      return updatedLibrarian;
    }
    console.error('Librarian not found for update:', id);
    return null;
  }

  deleteLibrarian(id: number) {
    const data = this.getData();
    const index = data.librarians.findIndex(librarian => librarian.id === id);
    if (index !== -1) {
      data.librarians.splice(index, 1);
      this.saveData(data);
      return true;
    }
    return false;
  }

  // Borrowings
  getBorrowings(): Borrowing[] {
    const data = this.getData();
    return data.borrowings || [];
  }

  getBorrowing(id: number) {
    const data = this.getData();
    return data.borrowings.find(borrowing => borrowing.id === id);
  }

  getBorrowingsByBorrowerId(borrowerId: number) {
    const data = this.getData();
    return data.borrowings.filter(borrowing => borrowing.borrowerId === borrowerId);
  }

  async createBorrowing(borrowingData: any): Promise<any> {
    const data = this.getData();

    // Parse the data if it's a string
    let parsedData = borrowingData;
    if (typeof borrowingData === 'string') {
      try {
        parsedData = JSON.parse(borrowingData);
      } catch (error) {
        console.error('Failed to parse borrowing data:', error);
        throw new Error('Invalid borrowing data format');
      }
    }

    // Validate the parsed data
    if (!parsedData || typeof parsedData !== 'object' || Array.isArray(parsedData)) {
      throw new Error('Invalid borrowing data structure');
    }

    // Ensure required fields are present and valid
    if (!parsedData.borrowerId) {
      throw new Error('Missing borrowerId');
    }

    if (!parsedData.librarianId) {
      console.error('Missing librarianId for borrowing:', parsedData);
      throw new Error('Missing librarianId');
    }

    // Validate that the librarian exists
    const librarianExists = data.librarians.some(lib => lib.id === parsedData.librarianId);
    if (!librarianExists) {
      console.error('Invalid librarianId:', parsedData.librarianId);
      throw new Error(`Librarian with ID ${parsedData.librarianId} does not exist`);
    }

    // For book-only borrowing, only bookId is required
    if (!parsedData.bookId && !parsedData.researchId) {
      throw new Error('Must specify either bookId or researchId');
    }

    const newBorrowing = {
      ...parsedData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };

    data.borrowings = data.borrowings || [];
    data.borrowings.push(newBorrowing);
    this.saveData(data);

    // Sync with database
    await syncWithDatabase('borrowings', newBorrowing);

    return newBorrowing;
  }

  async updateBorrowing(id: number, borrowingUpdate: any) {
    const data = this.getData();
    const index = data.borrowings.findIndex(borrowing => borrowing.id === id);
    if (index !== -1) {
      data.borrowings[index] = { ...data.borrowings[index], ...borrowingUpdate };
      this.saveData(data);

      // Sync with database
      await syncWithDatabase('borrowings', data.borrowings[index], 'PUT', id);

      return data.borrowings[index];
    }
    return null;
  }

  async deleteBorrowing(id: number) {
    const data = this.getData();
    const index = data.borrowings.findIndex(borrowing => borrowing.id === id);
    if (index !== -1) {
      data.borrowings.splice(index, 1);
      this.saveData(data);

      // Sync with database
      await syncWithDatabase('borrowings', null, 'DELETE', id);

      return true;
    }
    return false;
  }

  // Membership Applications
  createMembershipApplication(application: any) {
    const data = this.getData();
    const newApplication = {
      ...application,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    data.membershipApplications.push(newApplication);
    this.saveData(data);
    return newApplication;
  }

  // Research methods
  getResearchPapers() {
    return JSON.parse(localStorage.getItem('research_papers') || '[]');
  }

  createResearchPaper(data: any) {
    const papers = this.getResearchPapers();
    const newPaper = {
      id: Date.now(),
      ...data,
      createdAt: new Date().toISOString()
    };
    papers.push(newPaper);
    localStorage.setItem('research_papers', JSON.stringify(papers));
    return newPaper;
  }

  // Feedback methods
  getFeedback() {
    const feedback = localStorage.getItem('feedback');
    return feedback ? JSON.parse(feedback) : [];
  }

  createFeedback(data: any) {
    const feedback = this.getFeedback();
    const newFeedback = {
      id: Date.now(),
      ...data,
      submittedAt: new Date().toISOString(),
      status: data.status || 'pending'
    };
    feedback.push(newFeedback);
    localStorage.setItem('feedback', JSON.stringify(feedback));
    return newFeedback;
  }

  updateFeedback(id: number, data: any) {
    const feedback = this.getFeedback();
    const index = feedback.findIndex((f: any) => f.id === id);
    if (index !== -1) {
      feedback[index] = { ...feedback[index], ...data };
      localStorage.setItem('feedback', JSON.stringify(feedback));
      return feedback[index];
    }
    throw new Error('Feedback not found');
  }

  deleteFeedback(id: number) {
    const feedback = this.getFeedback();
    const filtered = feedback.filter((f: any) => f.id !== id);
    localStorage.setItem('feedback', JSON.stringify(filtered));
    return { success: true };
  }

  // Dashboard methods
  getDashboardStats() {
    const books = this.getBooks();
    const borrowers = this.getBorrowers();
    const borrowings = this.getBorrowings();
    const librarians = this.getLibrarians();

    const totalBooks = books.length;
    const totalBorrowers = borrowers.length;
    const totalLibrarians = librarians.length;

    const activeBorrowings = borrowings.filter(b => b.status === 'borrowed').length;
    const overdueBorrowings = borrowings.filter(b => b.status === 'overdue').length;

    return {
      totalBooks,
      totalBorrowers,
      totalLibrarians,
      activeBorrowings,
      overdueBorrowings
    };
  }

  // Dashboard analytics - read-only, no data manipulation
  getMostBorrowedBooksAnalytics(limit: number = 5) {
    return this.getMostBorrowedBooks(limit);
  }

  getPopularBooksAnalytics(limit: number = 4) {
    return this.getPopularBooks(limit);
  }

  getTopBorrowersAnalytics(limit: number = 5) {
    return this.getTopBorrowers(limit);
  }

  getBorrowerDistributionAnalytics() {
    return this.getBorrowerDistribution();
  }

  getMostBorrowedBooks(limit: number = 5) {
    const data = this.getData();
    const borrowingCounts = data.borrowings.reduce((acc: any, borrowing: any) => {
      acc[borrowing.bookId] = (acc[borrowing.bookId] || 0) + 1;
      return acc;
    }, {});

    return data.books
      .map(book => ({
        ...book,
        borrowCount: borrowingCounts[book.id] || 0
      }))
      .sort((a, b) => b.borrowCount - a.borrowCount)
      .slice(0, limit);
  }

  getPopularBooks(limit: number = 4) {
    const data = this.getData();
    const borrowingCounts = data.borrowings.reduce((acc: any, borrowing: any) => {
      acc[borrowing.bookId] = (acc[borrowing.bookId] || 0) + 1;
      return acc;
    }, {});

    return data.books
      .map(book => ({
        ...book,
        timesBorrowed: borrowingCounts[book.id] || 0,
        popularityScore: borrowingCounts[book.id] || 0
      }))
      .sort((a, b) => b.popularityScore - a.popularityScore)
      .slice(0, limit);
  }

  getTopBorrowers(limit: number = 5) {
    const data = this.getData();
    const borrowingCounts = data.borrowings.reduce((acc: any, borrowing: any) => {
      acc[borrowing.borrowerId] = (acc[borrowing.borrowerId] || 0) + 1;
      return acc;
    }, {});

    return data.borrowers
      .map(borrower => ({
        ...borrower,
        borrowCount: borrowingCounts[borrower.id] || 0
      }))
      .sort((a, b) => b.borrowCount - a.borrowCount)
      .slice(0, limit);
  }

  getBorrowerDistribution() {
    const data = this.getData();
    const distribution = data.borrowers.reduce((acc: any, borrower: any) => {
      const category = borrower.category || 'unknown';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(distribution).map(([category, count]) => ({
      category,
      count
    }));
  }

  // Utility methods
  clearAllData() {
    localStorage.removeItem(this.storageKey);
  }

  aggressiveDataCleanup() {
    console.log('Running aggressive data cleanup...');

    try {
      const rawData = localStorage.getItem(this.storageKey);
      if (!rawData) {
        console.log('No data found, initializing fresh...');
        return this.getDefaultData();
      }

      let parsedData;
      try {
        parsedData = JSON.parse(rawData);
      } catch (e) {
        console.log('JSON parse failed, clearing storage...');
        localStorage.removeItem(this.storageKey);
        return this.getDefaultData();
      }

      // Check if any array contains corrupted data (objects with numeric keys)
      const hasCorruption = Object.values(parsedData).some((arr: any) => {
        if (!Array.isArray(arr)) return false;
        return arr.some((item: any) => {
          if (!item || typeof item !== 'object') return true;
          const keys = Object.keys(item);
          return keys.some(key => !isNaN(parseInt(key)) && key.length <= 3);
        });
      });

      if (hasCorruption) {
        console.log('Corruption detected, forcing complete reset...');
        localStorage.removeItem(this.storageKey);
        return this.getDefaultData();
      }

      console.log('Aggressive data cleanup complete.');
      return parsedData;
    } catch (error) {
      console.error('Error during aggressive cleanup:', error);
      localStorage.removeItem(this.storageKey);
      return this.getDefaultData();
    }
  }

  exportData() {
    return this.getData();
  }

  importData(data: StorageData) {
    this.saveData(data);
  }

  // Clean and initialize data
  cleanCorruptedData() {
    const data = this.getData();

    // More aggressive cleaning for borrowings
    const originalLength = data.borrowings.length;
    data.borrowings = data.borrowings.filter(borrowing => {
      // Check if borrowing is a proper object with required fields
      if (!borrowing || typeof borrowing !== 'object') {
        return false;
      }

      // Check if it's an array-like object (corrupted JSON string)
      if (Array.isArray(borrowing)) {
        return false;
      }

      // Check for numeric keys which indicate corrupted data
      const keys = Object.keys(borrowing);
      const hasNumericKeys = keys.some(key => !isNaN(parseInt(key)) && key.length <= 3);
      if (hasNumericKeys) {
        return false;
      }

      // Check if it has the expected structure of a borrowing object
      const hasValidStructure = 
        borrowing.hasOwnProperty('id') &&
        borrowing.hasOwnProperty('borrowerId') &&
        borrowing.hasOwnProperty('bookId') &&
        typeof borrowing.id === 'number' &&
        typeof borrowing.borrowerId === 'number' &&
        typeof borrowing.bookId === 'number';

      return hasValidStructure;
    });

    if (data.borrowings.length !== originalLength) {
      console.log(`Cleaned ${originalLength - data.borrowings.length} corrupted borrowing entries`);
      this.saveData(data);
    }

    // Also clean other data types with similar logic
    const borrowers = data.borrowers;
    const cleanBorrowers = borrowers.filter(borrower => {
      if (!borrower || typeof borrower !== 'object' || Array.isArray(borrower)) {
        return false;
      }

      const keys = Object.keys(borrower);
      const hasNumericKeys = keys.some(key => !isNaN(parseInt(key)) && key.length <= 3);
      if (hasNumericKeys) {
        return false;
      }

      return borrower.hasOwnProperty('id') &&
             borrower.hasOwnProperty('name') &&
             typeof borrower.id === 'number' &&
             typeof borrower.name === 'string';
    });

    if (cleanBorrowers.length !== borrowers.length) {
      console.log(`Cleaned ${borrowers.length - cleanBorrowers.length} corrupted borrower entries`);
      data.borrowers = cleanBorrowers;
      this.saveData(data);
    }

    const books = data.books;
    const cleanBooks = books.filter(book => {
      if (!book || typeof book !== 'object' || Array.isArray(book)) {
        return false;
      }

      const keys = Object.keys(book);
      const hasNumericKeys = keys.some(key => !isNaN(parseInt(key)) && key.length <= 3);
      if (hasNumericKeys) {
        return false;
      }

      return book.hasOwnProperty('id') &&
             (book.hasOwnProperty('name') || book.hasOwnProperty('title')) &&
             typeof book.id === 'number';
    });

    if (cleanBooks.length !== books.length) {
      console.log(`Cleaned ${books.length - cleanBooks.length} corrupted book entries`);
      data.books = cleanBooks;
      this.saveData(data);
    }
  }

  // Force reset all data and reinitialize
  forceResetData() {
    console.log('Force resetting all data...');

    // Clear everything multiple times to ensure it's gone
    localStorage.removeItem(this.storageKey);
    localStorage.clear();

    // Generate completely new IDs
    const baseId = Date.now();

    // Initialize with clean sample data
    const sampleData = {
      books: [
        {
          coverImage: "/src/assets/book-covers/cover1.svg",
          name: "The Great Gatsby",
          author: "F. Scott Fitzgerald",
          publisher: "Scribner",
          bookCode: "TGG001",
          copies: 3,
          description: "A classic American novel set in the Jazz Age.",
          totalPages: 180,
          cabinet: "A",
          shelf: "1",
          num: "001",
          publishedDate: "1925-04-10",
          genres: "Fiction, Classic",
          comments: "Popular among students",
          id: baseId,
          createdAt: new Date().toISOString(),
          addedDate: new Date().toISOString().split('T')[0]
        },
        {
          coverImage: "/src/assets/book-covers/cover2.svg",
          name: "To Kill a Mockingbird",
          author: "Harper Lee",
          publisher: "J.B. Lippincott & Co.",
          bookCode: "TKM002",
          copies: 2,
          description: "A gripping tale of racial injustice and childhood innocence.",
          totalPages: 281,
          cabinet: "A",
          shelf: "1",
          num: "002",
          publishedDate: "1960-07-11",
          genres: "Fiction, Drama",
          comments: "Award-winning novel",
          id: baseId + 1,
          createdAt: new Date().toISOString(),
          addedDate: new Date().toISOString().split('T')[0]
        }
      ],
      borrowers: [
        {
          name: "John Smith",
          phone: "+1234567890",
          category: "university",
          joinedDate: new Date().toISOString().split('T')[0],
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          email: "john.smith@email.com",
          address: "123 Main St, City",
          churchName: "St. Mary Church",
          fatherOfConfession: "Father Michael",
          studies: "Computer Science",
          job: "Student",
          hobbies: "Reading, Programming",
          favoriteBooks: "Science Fiction",
          additionalPhone: "+1234567891",
          id: baseId + 2,
          createdAt: new Date().toISOString()
        },
        {
          name: "Emily Johnson",
          phone: "+1234567892",
          category: "graduate",
          joinedDate: new Date().toISOString().split('T')[0],
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          email: "emily.johnson@email.com",
          address: "456 Oak Ave, City",
          churchName: "Holy Trinity Church",
          fatherOfConfession: "Father John",
          studies: "Literature",
          job: "Teacher",
          hobbies: "Writing, Reading",
          favoriteBooks: "Classic Literature",
          id: baseId + 3,
          createdAt: new Date().toISOString()
        }
      ],
      librarians: [],
      borrowings: [
        {
          borrowerId: baseId + 2,
          bookId: baseId,
          borrowDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: "borrowed",
          id: baseId + 4,
          createdAt: new Date().toISOString()
        }
      ],
      membershipApplications: []
    };

    // Save directly without validation to avoid recursion
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(sampleData));
    } catch (error) {
      console.error('Error saving reset data:', error);
    }

    console.log('Data reset complete with clean sample data');
  }

  // Validate data structure before saving
  private validateAndCleanData(data: StorageData): StorageData {
    const defaultSettings = {};
    const cleanData = {
      books: [] as any[],
      borrowers: [] as any[],
      librarians: [] as any[],
      borrowings: [] as any[],
      membershipApplications: [] as any[],
    };

    // Clean books
    if (Array.isArray(data.books)) {
      cleanData.books = data.books.filter((book: any) => 
        book && 
        typeof book === 'object' && 
        !Array.isArray(book) &&
        typeof book.id === 'number' &&
        (typeof book.name === 'string' || typeof book.title === 'string')
      );
    }

    // Clean borrowers
    if (Array.isArray(data.borrowers)) {
      cleanData.borrowers = data.borrowers.filter((borrower: any) => 
        borrower && 
        typeof borrower === 'object' && 
        !Array.isArray(borrower) &&
        typeof borrower.id === 'number' &&
        typeof borrower.name === 'string'
      );
    }

    // Clean librarians
    if (Array.isArray(data.librarians)) {
      cleanData.librarians = data.librarians.filter((librarian: any) => 
        librarian && 
        typeof librarian === 'object' && 
        !Array.isArray(librarian) &&
        typeof librarian.id === 'number'
      );
    }

    // Clean borrowings - be very strict here
    if (Array.isArray(data.borrowings)) {
      cleanData.borrowings = data.borrowings.filter((borrowing: any) => {
        if (!borrowing || typeof borrowing !== 'object' || Array.isArray(borrowing)) {
          return false;
        }

        // Check for numeric keys which indicate corrupted data
        const keys = Object.keys(borrowing);
        const hasNumericKeys = keys.some(key => !isNaN(parseInt(key)) && key.length <= 3);
        if (hasNumericKeys) {
          return false;
        }

        // Must have valid structure
        return typeof borrowing.id === 'number' &&
               typeof borrowing.borrowerId === 'number' &&
               typeof borrowing.bookId === 'number' &&
               typeof borrowing.borrowDate === 'string' &&
               typeof borrowing.dueDate === 'string' &&
               typeof borrowing.status === 'string';
      });
    }

    // Clean membership applications
    if (Array.isArray(data.membershipApplications)) {
      cleanData.membershipApplications = data.membershipApplications.filter((app: any) => 
        app && 
        typeof app === 'object' && 
        !Array.isArray(app) &&
        typeof app.id === 'number'
      );
    }

    return cleanData;
  }

  // Initialize with sample data if empty
  private initializeSampleData() {
    // First clean any corrupted data
    this.cleanCorruptedData();

    const data = this.getData();
    if (data.books.length === 0) {
      // Will be initialized by sampleData.ts
    }
  }

  private loadData(): StorageData {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);

        // Immediately clean corrupted borrowings if found
        if (data.borrowings && Array.isArray(data.borrowings)) {
          const originalLength = data.borrowings.length;
          data.borrowings = data.borrowings.filter((borrowing: any) => {
            if (!borrowing || typeof borrowing !== 'object' || Array.isArray(borrowing)) {
              return false;
            }

            const keys = Object.keys(borrowing);
            const hasNumericKeys = keys.some(key => !isNaN(parseInt(key)) && key.length <= 3);

            return !hasNumericKeys && 
                   typeof borrowing.id === 'number' &&
                   typeof borrowing.borrowerId === 'number' &&
                   typeof borrowing.bookId === 'number';
          });

          // If we cleaned data, save it immediately
          if (data.borrowings.length !== originalLength) {
            console.log(`Cleaned ${originalLength - data.borrowings.length} corrupted borrowing entries`);
            localStorage.setItem(this.storageKey, JSON.stringify(data));
          }
        }

        return data;
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }

    return this.getDefaultData();
  }

  private cleanupCorruption(): void {
    try {
      const keys = Object.keys(localStorage);
      let hasCorruption = false;

      keys.forEach(key => {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            JSON.parse(value);
          }
        } catch (error) {
          localStorage.removeItem(key);
          hasCorruption = true;
        }
      });

      // Only log if there was actual corruption
      if (hasCorruption) {
        console.log('Cleaned up corrupted localStorage entries');
      }
    } catch (error) {
      console.error('Error during corruption cleanup:', error);
    }
  }
}

// Function to safely get data from localStorage with error handling
const getStorageData = <T>(key: string, defaultValue: T): T => {
  try {
    if (typeof window === 'undefined') return defaultValue;

    const item = localStorage.getItem(key);
    if (!item) return defaultValue;

    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

// Dummy function for database sync, replace with actual implementation
async function syncWithDatabase(entityType: string, data: any, method: string = 'POST', id?: number) {
  console.log(`Syncing ${entityType} with database using ${method}:`, data, id);
  // Implement your actual database synchronization logic here
}

export const localStorage_storage = new LocalStorage();