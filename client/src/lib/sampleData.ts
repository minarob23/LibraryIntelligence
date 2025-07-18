import { localStorage_storage } from './localStorage';

export const initializeSampleData = () => {
  // First, aggressively clean any corrupted data
  console.log('Running immediate corruption cleanup...');
  localStorage_storage.cleanCorruptedData();

  // Check if we still have corrupted data after cleanup
  const borrowings = localStorage_storage.getBorrowings();
  const hasCorruption = borrowings.some(b => {
    if (!b || typeof b !== 'object') return true;
    const keys = Object.keys(b);
    return keys.some(key => !isNaN(parseInt(key)) && key.length <= 3);
  });

  if (hasCorruption) {
    console.log('Corruption detected, forcing complete reset...');
    localStorage_storage.forceResetData();
    return;
  }

  // Check if data already exists and is valid
  const existingBooks = localStorage_storage.getBooks();
  const existingBorrowers = localStorage_storage.getBorrowers();

  // Check if we have valid data
  const hasValidBooks = existingBooks.length > 0 && existingBooks.every(b => b && b.id && (b.title || b.name));
  const hasValidBorrowers = existingBorrowers.length > 0 && existingBorrowers.every(b => b && b.id && b.name);

  if (hasValidBooks && hasValidBorrowers) {
    console.log('Valid data already exists, skipping initialization');
    return; // Valid data already exists, don't overwrite
  }

  // Sample Books
  const sampleBooks = [
    {
      coverImage: '/src/assets/book-covers/cover1.svg',
      title: 'The Great Gatsby',
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
      title: 'To Kill a Mockingbird',
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
      title: '1984',
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
      librarianId: 'LIB-001',
      name: 'Sarah Wilson',
      phone: '+1234567893',
      appointmentDate: '2023-09-01',
      membershipStatus: 'active',
      email: 'sarah.wilson@library.com'
    }
  ];

  // Sample Research Papers
  const sampleResearchPapers = [
    {
      name: 'Machine Learning in Library Systems',
      author: 'Dr. Jane Smith',
      publisher: 'Academic Press',
      researchCode: 'RES001',
      copies: 5,
      coverImage: '/src/assets/book-covers/cover1.svg',
    },
    {
      name: 'Digital Transformation in Libraries',
      author: 'Prof. John Doe',
      publisher: 'Tech Publishers',
      researchCode: 'RES002',
      copies: 3,
      coverImage: '/src/assets/book-covers/cover2.svg',
    },
    {
      name: 'Information Science and Modern Society',
      author: 'Dr. Alice Brown',
      publisher: 'Knowledge House',
      researchCode: 'RES003',
      copies: 7,
      coverImage: '/src/assets/book-covers/cover3.svg',
    }
  ];

  // Sample Borrowings
  const sampleBorrowings = [
    {
      borrowerId: 1,
      bookId: 1,
      borrowDate: '2024-01-20',
      dueDate: '2024-02-03',
      status: 'borrowed'
    },
    {
      borrowerId: 2,
      bookId: 2,
      borrowDate: '2024-02-15',
      dueDate: '2024-03-01',
      status: 'borrowed'
    }
  ];

  // Create sample data
  // sampleBooks.forEach(book => localStorage_storage.createBook(book));
  // sampleBorrowers.forEach(borrower => localStorage_storage.createBorrower(borrower));
  // sampleLibrarians.forEach(librarian => localStorage_storage.createLibrarian(librarian));

  // // Create some sample borrowings
  // const books = localStorage_storage.getBooks();
  // const borrowers = localStorage_storage.getBorrowers();

  // if (books.length > 0 && borrowers.length > 0) {
  //   const borrowDate = new Date();
  //   const dueDate = new Date();
  //   dueDate.setDate(dueDate.getDate() + 14);

  //   localStorage_storage.createBorrowing({
  //     borrowerId: borrowers[0].id,
  //     bookId: books[0].id,
  //     borrowDate: borrowDate.toISOString().split('T')[0],
  //     dueDate: dueDate.toISOString().split('T')[0],
  //     status: 'borrowed'
  //   });

  //   localStorage_storage.createBorrowing({
  //     borrowerId: borrowers[1].id,
  //     bookId: books[1].id,
  //     borrowDate: '2024-05-01',
  //     dueDate: '2024-05-15',
  //     returnDate: '2024-05-14',
  //     status: 'returned',
  //     rating: 5
  //   });
  // }

  // console.log('Sample data initialized in localStorage');
  // Initialize sample librarians if none exist
  // if (!localStorage.getItem('librarians')) {
  //   const sampleLibrarians = [
  //     {
  //       id: 1,
  //       librarianId: 'LIB001',
  //       name: 'Sarah Johnson',
  //       phone: '+1234567890',
  //       appointmentDate: '2023-01-15',
  //       membershipStatus: 'active',
  //       email: 'sarah@library.com',
  //       createdAt: new Date().toISOString()
  //     },
  //     {
  //       id: 2,
  //       librarianId: 'LIB002',
  //       name: 'Michael Chen',
  //       phone: '+1234567891',
  //       appointmentDate: '2023-02-20',
  //       membershipStatus: 'active',
  //       email: 'michael@library.com',
  //       createdAt: new Date().toISOString()
  //     }
  //   ];
  //   localStorage.setItem('librarians', JSON.stringify(sampleLibrarians));
  // }

  // Initialize sample research papers if none exist
  // if (!localStorage.getItem('research_papers')) {
  //   const sampleResearch = [
  //     {
  //       id: 1,
  //       name: 'Machine Learning in Library Systems',
  //       author: 'Dr. Jane Smith',
  //       publisher: 'Academic Press',
  //       researchCode: 'RES001',
  //       copies: 5,
  //       coverImage: '/src/assets/book-covers/cover1.svg',
  //       createdAt: new Date().toISOString()
  //     },
  //     {
  //       id: 2,
  //       name: 'Digital Transformation in Libraries',
  //       author: 'Prof. John Doe',
  //       publisher: 'Tech Publishers',
  //       researchCode: 'RES002',
  //       copies: 3,
  //       coverImage: '/src/assets/book-covers/cover2.svg',
  //       createdAt: new Date().toISOString()
  //     },
  //     {
  //       id: 3,
  //       name: 'Information Science and Modern Society',
  //       author: 'Dr. Alice Brown',
  //       publisher: 'Knowledge House',
  //       researchCode: 'RES003',
  //       copies: 7,
  //       coverImage: '/src/assets/book-covers/cover3.svg',
  //       createdAt: new Date().toISOString()
  //     }
  //   ];
  //   localStorage.setItem('research_papers', JSON.stringify(sampleResearch));
  // }
  try {
    console.log('Initializing sample data...');

    // First, ensure we have a default librarian
    const existingData = localStorage_storage.getData();
    let defaultLibrarianId: string;

    if (!existingData.librarians || existingData.librarians.length === 0) {
      // Create a default librarian first
      const defaultLibrarian = {
        name: 'Default Librarian',
        email: 'librarian@library.com',
        phone: '555-0100',
        department: 'General',
        shift: 'day' as const,
        startDate: '2024-01-01'
      };
      const createdLibrarian = localStorage_storage.createLibrarian(defaultLibrarian);
      defaultLibrarianId = createdLibrarian.id;
      console.log('Created default librarian with ID:', defaultLibrarianId);
    } else {
      defaultLibrarianId = existingData.librarians[0].id;
      console.log('Using existing librarian with ID:', defaultLibrarianId);
    }

    // Create additional librarians
    sampleLibrarians.forEach(librarian => {
      try {
        localStorage_storage.createLibrarian(librarian);
      } catch (error) {
        console.log('Librarian already exists or error creating:', error);
      }
    });

    // Create borrowers
    sampleBorrowers.forEach(borrower => {
      try {
        localStorage_storage.createBorrower(borrower);
      } catch (error) {
        console.log('Borrower already exists or error creating:', error);
      }
    });

    // Create books
    sampleBooks.forEach(book => {
      try {
        localStorage_storage.createBook(book);
      } catch (error) {
        console.log('Book already exists or error creating:', error);
      }
    });



    // Create borrowings with proper relationship IDs
    const validBorrowerIds = sampleBorrowers.map(b => b.id);
    const validBookIds = sampleBooks.map(b => b.id);

    // Filter borrowings to only include valid relationships
    const validBorrowings = sampleBorrowings.filter(borrowing => {
      const borrowerExists = validBorrowerIds.includes(borrowing.borrowerId);
      const bookExists = validBookIds.includes(borrowing.bookId);
      return borrowerExists && bookExists;
    });

    validBorrowings.forEach(borrowing => {
      try {
        const borrowingWithLibrarian = {
          ...borrowing,
          librarianId: defaultLibrarianId
        };
        console.log('Creating borrowing with librarianId:', defaultLibrarianId);
        localStorage_storage.createBorrowing(borrowingWithLibrarian);
      } catch (error) {
        console.log('Borrowing already exists or error creating:', error);
      }
    });

    console.log('Sample data initialized successfully');
  } catch (error) {
    console.error('Error initializing sample data:', error);
    throw error;
  }
};

// Sample data for testing
export const sampleBooks: any[] = [
  {
    id: 1,
    name: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    publisher: 'HarperCollins',
    bookCode: 'BK001',
    copies: 3,
    coverImage: '/src/assets/book-covers/cover1.svg',
  },
]