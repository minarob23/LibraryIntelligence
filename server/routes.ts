import express from 'express';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { initializeDb } from './db';

let db: Database<sqlite3.Database, sqlite3.Statement>;

export async function setupRoutes(app: express.Application) {
  // Initialize database connection
  db = await open({
    filename: './library.db',
    driver: sqlite3.Database
  });

  try {
    await initializeDb();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }

// Feedback routes
  app.get('/api/feedback', async (req, res) => {
    try {
      const feedbacks = await db.all(`
        SELECT * FROM feedback 
        ORDER BY submittedAt DESC
      `);
      res.json(feedbacks);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      res.status(500).json({ error: 'Failed to fetch feedback' });
    }
  });

  app.post('/api/feedback', async (req, res) => {
    try {
      const { name, phone, email, stage, membershipStatus, type, message, submittedAt, status } = req.body;

      const result = await db.run(`
        INSERT INTO feedback (name, phone, email, stage, membershipStatus, type, message, submittedAt, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [name || null, phone || null, email || null, stage, membershipStatus, type, message, submittedAt, status || 'pending']);

      res.json({ id: result.lastID, ...req.body });
    } catch (error) {
      console.error('Error creating feedback:', error);
      res.status(500).json({ error: 'Failed to create feedback' });
    }
  });

  app.put('/api/feedback/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      await db.run(`
        UPDATE feedback 
        SET status = ?
        WHERE id = ?
      `, [status, id]);

      res.json({ success: true });
    } catch (error) {
      console.error('Error updating feedback:', error);
      res.status(500).json({ error: 'Failed to update feedback' });
    }
  });

  app.delete('/api/feedback/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.run('DELETE FROM feedback WHERE id = ?', [id]);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting feedback:', error);
      res.status(500).json({ error: 'Failed to delete feedback' });
    }
  });

  // Books routes
  app.get('/api/books', async (req, res) => {
    try {
      const books = await db.all('SELECT * FROM books ORDER BY createdAt DESC');
      res.json(books);
    } catch (error) {
      console.error('Error fetching books:', error);
      res.status(500).json({ error: 'Failed to fetch books' });
    }
  });

  app.post('/api/books', async (req, res) => {
    try {
      const { name, title, author, isbn, genre, publishedYear, totalPages, availableCopies, coverImage } = req.body;

      const result = await db.run(`
        INSERT INTO books (name, title, author, isbn, genre, publishedYear, totalPages, availableCopies, coverImage, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [name || title, title || name, author, isbn, genre, publishedYear, totalPages, availableCopies, coverImage, new Date().toISOString()]);

      res.json({ id: result.lastID, ...req.body });
    } catch (error) {
      console.error('Error creating book:', error);
      res.status(500).json({ error: 'Failed to create book' });
    }
  });

  app.put('/api/books/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, title, author, isbn, genre, publishedYear, totalPages, availableCopies, coverImage } = req.body;

      await db.run(`
        UPDATE books 
        SET name = ?, title = ?, author = ?, isbn = ?, genre = ?, publishedYear = ?, totalPages = ?, availableCopies = ?, coverImage = ?
        WHERE id = ?
      `, [name || title, title || name, author, isbn, genre, publishedYear, totalPages, availableCopies, coverImage, id]);

      res.json({ success: true });
    } catch (error) {
      console.error('Error updating book:', error);
      res.status(500).json({ error: 'Failed to update book' });
    }
  });

  app.delete('/api/books/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.run('DELETE FROM books WHERE id = ?', [id]);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting book:', error);
      res.status(500).json({ error: 'Failed to delete book' });
    }
  });

  // Borrowers routes
  app.get('/api/borrowers', async (req, res) => {
    try {
      const borrowers = await db.all('SELECT * FROM borrowers ORDER BY createdAt DESC');
      res.json(borrowers);
    } catch (error) {
      console.error('Error fetching borrowers:', error);
      res.status(500).json({ error: 'Failed to fetch borrowers' });
    }
  });

  app.post('/api/borrowers', async (req, res) => {
    try {
      const { memberId, name, phone, email, category, membershipStatus, joinedDate, expiryDate, address, organizationName, emergencyContact, studies, job, hobbies, favoriteBooks, additionalPhone } = req.body;

      const result = await db.run(`
        INSERT INTO borrowers (memberId, name, phone, email, category, membershipStatus, joinedDate, expiryDate, address, organizationName, emergencyContact, studies, job, hobbies, favoriteBooks, additionalPhone, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [memberId, name, phone, email, category, membershipStatus || 'active', joinedDate, expiryDate, address, organizationName, emergencyContact, studies, job, hobbies, favoriteBooks, additionalPhone, new Date().toISOString()]);

      res.json({ id: result.lastID, ...req.body });
    } catch (error) {
      console.error('Error creating borrower:', error);
      res.status(500).json({ error: 'Failed to create borrower' });
    }
  });

  app.put('/api/borrowers/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, phone, email, category, membershipStatus, joinedDate, address, organizationName, emergencyContact, studies, job, hobbies, favoriteBooks, additionalPhone } = req.body;

      await db.run(`
        UPDATE borrowers 
        SET name = ?, phone = ?, email = ?, category = ?, membershipStatus = ?, joinedDate = ?, address = ?, organizationName = ?, emergencyContact = ?, studies = ?, job = ?, hobbies = ?, favoriteBooks = ?, additionalPhone = ?
        WHERE id = ?
      `, [name, phone, email, category, membershipStatus, joinedDate, address, organizationName, emergencyContact, studies, job, hobbies, favoriteBooks, additionalPhone, id]);

      res.json({ success: true });
    } catch (error) {
      console.error('Error updating borrower:', error);
      res.status(500).json({ error: 'Failed to update borrower' });
    }
  });

  app.delete('/api/borrowers/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.run('DELETE FROM borrowers WHERE id = ?', [id]);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting borrower:', error);
      res.status(500).json({ error: 'Failed to delete borrower' });
    }
  });

  // Librarians routes
  app.get('/api/librarians', async (req, res) => {
    try {
      const librarians = await db.all('SELECT * FROM librarians ORDER BY createdAt DESC');
      res.json(librarians);
    } catch (error) {
      console.error('Error fetching librarians:', error);
      res.status(500).json({ error: 'Failed to fetch librarians' });
    }
  });

  app.post('/api/librarians', async (req, res) => {
    try {
      const { name, email, phone, department, shift, startDate } = req.body;

      const result = await db.run(`
        INSERT INTO librarians (name, email, phone, department, shift, startDate, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [name, email, phone, department, shift, startDate, new Date().toISOString()]);

      res.json({ id: result.lastID, ...req.body });
    } catch (error) {
      console.error('Error creating librarian:', error);
      res.status(500).json({ error: 'Failed to create librarian' });
    }
  });

  app.put('/api/librarians/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, phone, department, shift, startDate } = req.body;

      await db.run(`
        UPDATE librarians 
        SET name = ?, email = ?, phone = ?, department = ?, shift = ?, startDate = ?
        WHERE id = ?
      `, [name, email, phone, department, shift, startDate, id]);

      res.json({ success: true });
    } catch (error) {
      console.error('Error updating librarian:', error);
      res.status(500).json({ error: 'Failed to update librarian' });
    }
  });

  app.delete('/api/librarians/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.run('DELETE FROM librarians WHERE id = ?', [id]);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting librarian:', error);
      res.status(500).json({ error: 'Failed to delete librarian' });
    }
  });

  // Borrowings routes
  app.get('/api/borrowings', async (req, res) => {
    try {
      const borrowings = await db.all(`
        SELECT b.*, bk.title as bookTitle, br.name as borrowerName, l.name as librarianName
        FROM borrowings b
        LEFT JOIN books bk ON b.bookId = bk.id
        LEFT JOIN borrowers br ON b.borrowerId = br.id
        LEFT JOIN librarians l ON b.librarianId = l.id
        ORDER BY b.borrowDate DESC
      `);
      res.json(borrowings);
    } catch (error) {
      console.error('Error fetching borrowings:', error);
      res.status(500).json({ error: 'Failed to fetch borrowings' });
    }
  });

  app.post('/api/borrowings', async (req, res) => {
    try {
      const { bookId, borrowerId, librarianId, borrowDate, dueDate, returnDate, status } = req.body;

      const result = await db.run(`
        INSERT INTO borrowings (bookId, borrowerId, librarianId, borrowDate, dueDate, returnDate, status, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [bookId, borrowerId, librarianId, borrowDate, dueDate, returnDate, status, new Date().toISOString()]);

      res.json({ id: result.lastID, ...req.body });
    } catch (error) {
      console.error('Error creating borrowing:', error);
      res.status(500).json({ error: 'Failed to create borrowing' });
    }
  });

  app.put('/api/borrowings/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { bookId, borrowerId, librarianId, borrowDate, dueDate, returnDate, status } = req.body;

      await db.run(`
        UPDATE borrowings 
        SET bookId = ?, borrowerId = ?, librarianId = ?, borrowDate = ?, dueDate = ?, returnDate = ?, status = ?
        WHERE id = ?
      `, [bookId, borrowerId, librarianId, borrowDate, dueDate, returnDate, status, id]);

      res.json({ success: true });
    } catch (error) {
      console.error('Error updating borrowing:', error);
      res.status(500).json({ error: 'Failed to update borrowing' });
    }
  });

  app.delete('/api/borrowings/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.run('DELETE FROM borrowings WHERE id = ?', [id]);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting borrowing:', error);
      res.status(500).json({ error: 'Failed to delete borrowing' });
    }
  });

  // Membership Application routes
  app.post('/api/membership-application', async (req, res) => {
    try {
      const { id, name, stage, birthdate, phone, additionalPhone, email, address, organizationName, emergencyContact, studies, job, hobbies, favoriteBooks } = req.body;

      const result = await db.run(`
        INSERT INTO membership_applications (memberId, name, stage, birthdate, phone, additionalPhone, email, address, organizationName, emergencyContact, studies, job, hobbies, favoriteBooks, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [id, name, stage, birthdate, phone, additionalPhone, email, address, organizationName, emergencyContact, studies, job, hobbies, favoriteBooks, new Date().toISOString()]);

      res.json({ id: result.lastID, ...req.body });
    } catch (error) {
      console.error('Error creating membership application:', error);
      res.status(500).json({ error: 'Failed to create membership application' });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/stats', async (req, res) => {
    try {
      const totalBooks = await db.get('SELECT COUNT(*) as count FROM books');
      const totalBorrowers = await db.get('SELECT COUNT(*) as count FROM borrowers');
      const totalBorrowings = await db.get('SELECT COUNT(*) as count FROM borrowings WHERE returnDate IS NULL');
      const totalLibrarians = await db.get('SELECT COUNT(*) as count FROM librarians');

      res.json({
        totalBooks: totalBooks.count,
        totalBorrowers: totalBorrowers.count,
        activeBorrowings: totalBorrowings.count,
        totalLibrarians: totalLibrarians.count
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
  });

  // Reset database route
  app.post('/api/reset-database', async (req, res) => {
    console.log('🔄 Starting database reset...');

    // Set response headers early
    res.setHeader('Content-Type', 'application/json');

    try {
      // Ensure database is connected
      if (!db) {
        console.error('❌ Database connection not established');
        const errorResponse = {
          success: false,
          error: 'Database connection not established',
          details: 'The database connection is not available'
        };
        console.log('Sending error response:', errorResponse);
        return res.status(500).json(errorResponse);
      }

      // Test database connection
      try {
        await db.get('SELECT 1');
        console.log('✅ Database connection verified');
      } catch (dbError) {
        console.error('❌ Database connection test failed:', dbError);
        const errorResponse = {
          success: false,
          error: 'Database connection test failed',
          details: dbError?.message || 'Unknown database error'
        };
        console.log('Sending db test error response:', errorResponse);
        return res.status(500).json(errorResponse);
      }

      // Clear all tables with proper error handling
      await db.run('DELETE FROM borrowings').catch((err) => {
        console.log('borrowings table cleared or does not exist:', err.message);
      });
      await db.run('DELETE FROM books').catch((err) => {
        console.log('books table cleared or does not exist:', err.message);
      });
      await db.run('DELETE FROM borrowers').catch((err) => {
        console.log('borrowers table cleared or does not exist:', err.message);
      });
      await db.run('DELETE FROM librarians').catch((err) => {
        console.log('librarians table cleared or does not exist:', err.message);
      });
      await db.run('DELETE FROM feedback').catch((err) => {
        console.log('feedback table cleared or does not exist:', err.message);
      });
      await db.run('DELETE FROM book_index').catch((err) => {
        console.log('book_index table cleared or does not exist:', err.message);
      });
      await db.run('DELETE FROM quotes').catch((err) => {
        console.log('quotes table cleared or does not exist:', err.message);
      });

      console.log('✅ All tables cleared');

      // Insert sample data
      // Sample Books
      const sampleBooks = [
        {
          name: 'To Kill a Mockingbird',
          title: 'To Kill a Mockingbird',
          author: 'Harper Lee',
          isbn: '9780061120084',
          genre: 'Fiction',
          publishedYear: 1960,
          totalPages: 281,
          availableCopies: 5,
          coverImage: '/src/assets/book-covers/cover1.svg'
        },
        {
          name: '1984',
          title: '1984',
          author: 'George Orwell',
          isbn: '9780451524935',
          genre: 'Dystopian Fiction',
          publishedYear: 1949,
          totalPages: 328,
          availableCopies: 3,
          coverImage: '/src/assets/book-covers/cover2.svg'
        },
        {
          name: 'Pride and Prejudice',
          title: 'Pride and Prejudice',
          author: 'Jane Austen',
          isbn: '9780141439518',
          genre: 'Romance',
          publishedYear: 1813,
          totalPages: 279,
          availableCopies: 4,
          coverImage: '/src/assets/book-covers/cover3.svg'
        }
      ];

      // Sample Borrowers
      const sampleBorrowers = [
        {
          name: 'John Smith',
          phone: '1234567890',
          email: 'john.smith@email.com',
          category: 'University',
          membershipStatus: 'active',
          joinedDate: '2024-01-15'
        },
        {
          name: 'Jane Doe',
          phone: '0987654321',
          email: 'jane.doe@email.com',
          category: 'High School',
          membershipStatus: 'active',
          joinedDate: '2024-02-20'
        }
      ];

      // Sample Librarians
      const sampleLibrarians = [
        {
          name: 'Sarah Johnson',
          email: 'sarah.johnson@library.com',
          phone: '5551234567',
          department: 'Reference',
          shift: 'morning',
          startDate: '2023-09-01'
        },
        {
          name: 'Michael Brown',
          email: 'michael.brown@library.com',
          phone: '5559876543',
          department: 'Circulation',
          shift: 'evening',
          startDate: '2023-10-15'
        }
      ];

      // Insert sample books
      for (const book of sampleBooks) {
        await db.run(`
          INSERT INTO books (name, title, author, isbn, genre, publishedYear, totalPages, availableCopies, coverImage, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [book.name, book.title, book.author, book.isbn, book.genre, book.publishedYear, book.totalPages, book.availableCopies, book.coverImage, new Date().toISOString()]);
      }

      // Insert sample borrowers
      for (const borrower of sampleBorrowers) {
        await db.run(`
          INSERT INTO borrowers (name, phone, email, category, membershipStatus, joinedDate, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [borrower.name, borrower.phone, borrower.email, borrower.category, borrower.membershipStatus, borrower.joinedDate, new Date().toISOString()]);
      }

      // Insert sample librarians
      for (const librarian of sampleLibrarians) {
        await db.run(`
          INSERT INTO librarians (name, email, phone, department, shift, startDate, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [librarian.name, librarian.email, librarian.phone, librarian.department, librarian.shift, librarian.startDate, new Date().toISOString()]);
      }

      console.log('✅ Sample data inserted successfully');

      const successResponse = { 
        success: true, 
        message: 'Database reset successfully with sample data' 
      };
      console.log('Sending success response:', successResponse);
      res.status(200).json(successResponse);

    } catch (error) {
      console.error('❌ Error resetting database:', error);
      console.error('Full error:', error);

      // Ensure we always send a proper JSON response
      if (!res.headersSent) {
        try {
          const errorResponse = { 
            success: false,
            error: 'Failed to reset database',
            details: error?.message || 'Unknown error occurred',
            stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
          };
          console.log('Sending catch error response:', errorResponse);
          res.status(500).json(errorResponse);
        } catch (jsonError) {
          console.error('❌ Error sending JSON response:', jsonError);
          const fallbackResponse = JSON.stringify({
            success: false,
            error: 'Internal Server Error - Failed to reset database',
            details: 'JSON response error'
          });
          res.status(500).send(fallbackResponse);
        }
      } else {
        console.log('Headers already sent, cannot send error response');
      }
    }
  });
}