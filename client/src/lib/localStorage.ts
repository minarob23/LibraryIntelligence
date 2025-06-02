
interface StorageData {
  books: any[];
  borrowers: any[];
  librarians: any[];
  borrowings: any[];
  membershipApplications: any[];
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
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : this.getDefaultData();
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return this.getDefaultData();
    }
  }

  private saveData(data: StorageData): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private generateId(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  // Books
  getBooks() {
    return this.getData().books;
  }

  getBook(id: number) {
    const data = this.getData();
    return data.books.find(book => book.id === id);
  }

  createBook(book: any) {
    const data = this.getData();
    const newBook = {
      ...book,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      addedDate: new Date().toISOString().split('T')[0]
    };
    data.books.push(newBook);
    this.saveData(data);
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
  getBorrowers() {
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

  createBorrower(borrower: any) {
    const data = this.getData();
    const newBorrower = {
      ...borrower,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    data.borrowers.push(newBorrower);
    this.saveData(data);
    return newBorrower;
  }

  updateBorrower(id: number, borrowerUpdate: any) {
    const data = this.getData();
    const index = data.borrowers.findIndex(borrower => borrower.id === id);
    if (index !== -1) {
      data.borrowers[index] = { ...data.borrowers[index], ...borrowerUpdate };
      this.saveData(data);
      return data.borrowers[index];
    }
    return null;
  }

  deleteBorrower(id: number) {
    const data = this.getData();
    const index = data.borrowers.findIndex(borrower => borrower.id === id);
    if (index !== -1) {
      data.borrowers.splice(index, 1);
      this.saveData(data);
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
      data.librarians[index] = { ...data.librarians[index], ...librarianUpdate };
      this.saveData(data);
      return data.librarians[index];
    }
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
  getBorrowings() {
    return this.getData().borrowings;
  }

  getBorrowing(id: number) {
    const data = this.getData();
    return data.borrowings.find(borrowing => borrowing.id === id);
  }

  getBorrowingsByBorrowerId(borrowerId: number) {
    const data = this.getData();
    return data.borrowings.filter(borrowing => borrowing.borrowerId === borrowerId);
  }

  createBorrowing(borrowing: any) {
    const data = this.getData();
    const newBorrowing = {
      ...borrowing,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    data.borrowings.push(newBorrowing);
    this.saveData(data);
    return newBorrowing;
  }

  updateBorrowing(id: number, borrowingUpdate: any) {
    const data = this.getData();
    const index = data.borrowings.findIndex(borrowing => borrowing.id === id);
    if (index !== -1) {
      data.borrowings[index] = { ...data.borrowings[index], ...borrowingUpdate };
      this.saveData(data);
      return data.borrowings[index];
    }
    return null;
  }

  deleteBorrowing(id: number) {
    const data = this.getData();
    const index = data.borrowings.findIndex(borrowing => borrowing.id === id);
    if (index !== -1) {
      data.borrowings.splice(index, 1);
      this.saveData(data);
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

  // Dashboard methods
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

  exportData() {
    return this.getData();
  }

  importData(data: StorageData) {
    this.saveData(data);
  }
}

export const localStorage_storage = new LocalStorage();
