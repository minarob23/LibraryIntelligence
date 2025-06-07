import { localStorage_storage } from './localStorage';

export const initializeSampleData = () => {
  // Check if data already exists
  const existingBooks = localStorage_storage.getBooks();
  if (existingBooks.length > 0) {
    return; // Data already exists, don't overwrite
  }

  // Sample Books
  const sampleBooks = [
    {
      coverImage: '/src/assets/book-covers/cover1.svg',
      name: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      publisher: 'Scribner',
      bookCode: 'TGG001',
      copies: 3,
      description: 'A classic American novel set in the Jazz Age.',
      totalPages: 180,
      cabinet: 'A',
      shelf: '1',
      num: '001',
      publishedDate: '1925-04-10',
      genres: 'Fiction, Classic',
      comments: 'Popular among students'
    },
    {
      coverImage: '/src/assets/book-covers/cover2.svg',
      name: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      publisher: 'J.B. Lippincott & Co.',
      bookCode: 'TKM002',
      copies: 2,
      description: 'A gripping tale of racial injustice and childhood innocence.',
      totalPages: 281,
      cabinet: 'A',
      shelf: '1',
      num: '002',
      publishedDate: '1960-07-11',
      genres: 'Fiction, Drama',
      comments: 'Award-winning novel'
    },
    {
      coverImage: '/src/assets/book-covers/cover3.svg',
      name: '1984',
      author: 'George Orwell',
      publisher: 'Secker & Warburg',
      bookCode: 'NF1984',
      copies: 4,
      description: 'A dystopian social science fiction novel.',
      totalPages: 328,
      cabinet: 'B',
      shelf: '2',
      num: '003',
      publishedDate: '1949-06-08',
      genres: 'Fiction, Dystopian',
      comments: 'Highly influential work'
    }
  ];

  // Sample Borrowers
  const sampleBorrowers = [
    {
      name: 'John Smith',
      phone: '+1234567890',
      category: 'university',
      joinedDate: '2024-01-15',
      expiryDate: '2025-01-15',
      email: 'john.smith@email.com',
      address: '123 Main St, City',
      churchName: 'St. Mary Church',
      fatherOfConfession: 'Father Michael',
      studies: 'Computer Science',
      job: 'Student',
      hobbies: 'Reading, Programming',
      favoriteBooks: 'Science Fiction',
      additionalPhone: '+1234567891'
    },
    {
      name: 'Emily Johnson',
      phone: '+1234567892',
      category: 'graduate',
      joinedDate: '2024-02-20',
      expiryDate: '2025-02-20',
      email: 'emily.johnson@email.com',
      address: '456 Oak Ave, City',
      churchName: 'Holy Trinity Church',
      fatherOfConfession: 'Father John',
      studies: 'Literature',
      job: 'Teacher',
      hobbies: 'Writing, Reading',
      favoriteBooks: 'Classic Literature'
    }
  ];

  // Sample Librarians
  const sampleLibrarians = [
    {
      name: 'Sarah Wilson',
      phone: '+1234567893',
      appointmentDate: '2023-09-01',
      membershipStatus: 'active',
      email: 'sarah.wilson@library.com'
    }
  ];

  // Create sample data
  sampleBooks.forEach(book => localStorage_storage.createBook(book));
  sampleBorrowers.forEach(borrower => localStorage_storage.createBorrower(borrower));
  sampleLibrarians.forEach(librarian => localStorage_storage.createLibrarian(librarian));

  // Create some sample borrowings
  const books = localStorage_storage.getBooks();
  const borrowers = localStorage_storage.getBorrowers();

  if (books.length > 0 && borrowers.length > 0) {
    const borrowDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    localStorage_storage.createBorrowing({
      borrowerId: borrowers[0].id,
      bookId: books[0].id,
      borrowDate: borrowDate.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'borrowed'
    });

    localStorage_storage.createBorrowing({
      borrowerId: borrowers[1].id,
      bookId: books[1].id,
      borrowDate: '2024-05-01',
      dueDate: '2024-05-15',
      returnDate: '2024-05-14',
      status: 'returned',
      rating: 5
    });
  }

  console.log('Sample data initialized in localStorage');
};