import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertBookSchema, 
  insertResearchPaperSchema, 
  insertLibrarianSchema, 
  insertBorrowerSchema, 
  insertBorrowingSchema,
  membershipApplicationSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handling middleware for Zod validation errors
  const handleZodError = (err: unknown, res: Response) => {
    if (err instanceof ZodError) {
      const validationError = fromZodError(err);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: validationError.details 
      });
    }

    console.error('Unexpected error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  };

  // Books Routes
  app.get('/api/books', async (req, res) => {
    try {
      const books = await storage.getBooks();
      res.json(books);
    } catch (err) {
      console.error('Error fetching books:', err);
      res.status(500).json({ message: 'Error fetching books' });
    }
  });

  app.get('/api/books/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const book = await storage.getBook(id);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      res.json(book);
    } catch (err) {
      console.error('Error fetching book:', err);
      res.status(500).json({ message: 'Error fetching book' });
    }
  });

  app.post('/api/books', async (req, res) => {
    try {
      const bookData = insertBookSchema.parse(req.body);
      const book = await storage.createBook(bookData);
      res.status(201).json(book);
    } catch (err) {
      return handleZodError(err, res);
    }
  });

  app.put('/api/books/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const bookData = insertBookSchema.partial().parse(req.body);
      const book = await storage.updateBook(id, bookData);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      res.json(book);
    } catch (err) {
      return handleZodError(err, res);
    }
  });

  app.delete('/api/books/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBook(id);
      if (!success) {
        return res.status(404).json({ message: 'Book not found' });
      }
      res.status(204).end();
    } catch (err) {
      console.error('Error deleting book:', err);
      res.status(500).json({ message: 'Error deleting book' });
    }
  });

  // Research Papers Routes
  app.get('/api/research', async (req, res) => {
    try {
      const papers = await storage.getResearchPapers();
      res.json(papers);
    } catch (err) {
      console.error('Error fetching research papers:', err);
      res.status(500).json({ message: 'Error fetching research papers' });
    }
  });

  app.get('/api/research/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const paper = await storage.getResearchPaper(id);
      if (!paper) {
        return res.status(404).json({ message: 'Research paper not found' });
      }
      res.json(paper);
    } catch (err) {
      console.error('Error fetching research paper:', err);
      res.status(500).json({ message: 'Error fetching research paper' });
    }
  });

  app.post('/api/research', async (req, res) => {
    try {
      const paperData = insertResearchPaperSchema.parse(req.body);
      const paper = await storage.createResearchPaper(paperData);
      res.status(201).json(paper);
    } catch (err) {
      return handleZodError(err, res);
    }
  });

  app.put('/api/research/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const paperData = insertResearchPaperSchema.partial().parse(req.body);
      const paper = await storage.updateResearchPaper(id, paperData);
      if (!paper) {
        return res.status(404).json({ message: 'Research paper not found' });
      }
      res.json(paper);
    } catch (err) {
      return handleZodError(err, res);
    }
  });

  app.delete('/api/research/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteResearchPaper(id);
      if (!success) {
        return res.status(404).json({ message: 'Research paper not found' });
      }
      res.status(204).end();
    } catch (err) {
      console.error('Error deleting research paper:', err);
      res.status(500).json({ message: 'Error deleting research paper' });
    }
  });

  // Librarians Routes
  app.get('/api/librarians', async (req, res) => {
    try {
      const librarians = await storage.getLibrarians();
      res.json(librarians);
    } catch (err) {
      console.error('Error fetching librarians:', err);
      res.status(500).json({ message: 'Error fetching librarians' });
    }
  });

  app.get('/api/librarians/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const librarian = await storage.getLibrarian(id);
      if (!librarian) {
        return res.status(404).json({ message: 'Librarian not found' });
      }
      res.json(librarian);
    } catch (err) {
      console.error('Error fetching librarian:', err);
      res.status(500).json({ message: 'Error fetching librarian' });
    }
  });

  app.post('/api/librarians', async (req, res) => {
    try {
      const librarianData = insertLibrarianSchema.parse(req.body);
      const librarian = await storage.createLibrarian(librarianData);
      res.status(201).json(librarian);
    } catch (err) {
      return handleZodError(err, res);
    }
  });

  app.put('/api/librarians/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const librarianData = insertLibrarianSchema.partial().parse(req.body);
      const librarian = await storage.updateLibrarian(id, librarianData);
      if (!librarian) {
        return res.status(404).json({ message: 'Librarian not found' });
      }
      res.json(librarian);
    } catch (err) {
      return handleZodError(err, res);
    }
  });

  app.delete('/api/librarians/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteLibrarian(id);
      if (!success) {
        return res.status(404).json({ message: 'Librarian not found' });
      }
      res.status(204).end();
    } catch (err) {
      console.error('Error deleting librarian:', err);
      res.status(500).json({ message: 'Error deleting librarian' });
    }
  });

  // Borrowers Routes
  app.get('/api/borrowers', async (req, res) => {
    try {
      const { category } = req.query;
      let borrowers;

      if (category && typeof category === 'string') {
        borrowers = await storage.getBorrowersByCategory(category);
      } else {
        borrowers = await storage.getBorrowers();
      }

      res.json(borrowers);
    } catch (err) {
      console.error('Error fetching borrowers:', err);
      res.status(500).json({ message: 'Error fetching borrowers' });
    }
  });

  app.get('/api/borrowers/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const borrower = await storage.getBorrower(id);
      if (!borrower) {
        return res.status(404).json({ message: 'Borrower not found' });
      }
      res.json(borrower);
    } catch (err) {
      console.error('Error fetching borrower:', err);
      res.status(500).json({ message: 'Error fetching borrower' });
    }
  });

  app.post('/api/borrowers', async (req, res) => {
    try {
      const borrowerData = insertBorrowerSchema.parse(req.body);
      const borrower = await storage.createBorrower(borrowerData);
      res.status(201).json(borrower);
    } catch (err) {
      return handleZodError(err, res);
    }
  });

  app.put('/api/borrowers/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const borrowerData = insertBorrowerSchema.partial().parse(req.body);
      const borrower = await storage.updateBorrower(id, borrowerData);
      if (!borrower) {
        return res.status(404).json({ message: 'Borrower not found' });
      }
      res.json(borrower);
    } catch (err) {
      return handleZodError(err, res);
    }
  });

  app.delete('/api/borrowers/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBorrower(id);
      if (!success) {
        return res.status(404).json({ message: 'Borrower not found' });
      }
      res.status(204).end();
    } catch (err) {
      console.error('Error deleting borrower:', err);
      res.status(500).json({ message: 'Error deleting borrower' });
    }
  });

  // Borrowings Routes
  app.get('/api/borrowings', async (req, res) => {
    try {
      const { borrowerId } = req.query;
      let borrowings;

      if (borrowerId && typeof borrowerId === 'string') {
        borrowings = await storage.getBorrowingsByBorrowerId(parseInt(borrowerId));
      } else {
        borrowings = await storage.getBorrowings();
      }

      res.json(borrowings);
    } catch (err) {
      console.error('Error fetching borrowings:', err);
      res.status(500).json({ message: 'Error fetching borrowings' });
    }
  });

  app.get('/api/borrowings/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const borrowing = await storage.getBorrowing(id);
      if (!borrowing) {
        return res.status(404).json({ message: 'Borrowing record not found' });
      }
      res.json(borrowing);
    } catch (err) {
      console.error('Error fetching borrowing record:', err);
      res.status(500).json({ message: 'Error fetching borrowing record' });
    }
  });

  app.post('/api/borrowings', async (req, res) => {
    try {
      const borrowingData = insertBorrowingSchema.parse(req.body);

      // Validate that either bookId or researchId is provided, but not both
      if ((!borrowingData.bookId && !borrowingData.researchId) || 
          (borrowingData.bookId && borrowingData.researchId)) {
        return res.status(400).json({ 
          message: 'Either bookId or researchId must be provided, but not both' 
        });
      }

      const borrowing = await storage.createBorrowing(borrowingData);
      res.status(201).json(borrowing);
    } catch (err) {
      return handleZodError(err, res);
    }
  });

  app.put('/api/borrowings/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const borrowingData = insertBorrowingSchema.partial().parse(req.body);
      const borrowing = await storage.updateBorrowing(id, borrowingData);
      if (!borrowing) {
        return res.status(404).json({ message: 'Borrowing record not found' });
      }
      res.json(borrowing);
    } catch (err) {
      return handleZodError(err, res);
    }
  });

  app.delete('/api/borrowings/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBorrowing(id);
      if (!success) {
        return res.status(404).json({ message: 'Borrowing record not found' });
      }
      res.status(204).end();
    } catch (err) {
      console.error('Error deleting borrowing record:', err);
      res.status(500).json({ message: 'Error deleting borrowing record' });
    }
  });

  // Dashboard Data Routes
  app.get('/api/dashboard/most-borrowed-books', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const books = await storage.getMostBorrowedBooks(limit);
      res.json(books);
    } catch (err) {
      console.error('Error fetching most borrowed books:', err);
      res.status(500).json({ message: 'Error fetching most borrowed books' });
    }
  });

  app.get('/api/dashboard/popular-books', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;
      const books = await storage.getPopularBooks(limit);
      res.json(books);
    } catch (err) {
      console.error('Error fetching popular books:', err);
      res.status(500).json({ message: 'Error fetching popular books' });
    }
  });

  app.get('/api/dashboard/top-borrowers', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const borrowers = await storage.getTopBorrowers(limit);
      res.json(borrowers);
    } catch (err) {
      console.error('Error fetching top borrowers:', err);
      res.status(500).json({ message: 'Error fetching top borrowers' });
    }
  });

  app.get('/api/dashboard/borrower-distribution', async (req, res) => {
    try {
      const distribution = await storage.getBorrowerDistribution();
      res.json(distribution);
    } catch (err) {
      console.error('Error fetching borrower distribution:', err);
      res.status(500).json({ message: 'Error fetching borrower distribution' });
    }
  });

  app.post('/api/reset-database', async (req, res) => {
    try {
      await storage.resetDatabase();
      res.json({ message: 'All systems and databases have been reset successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to reset database' });
    }
  });

  // Membership Application Route
  app.post('/api/membership-application', async (req, res) => {
    try {
      const applicationData = membershipApplicationSchema.parse(req.body);
      const result = await storage.createMembershipApplication(applicationData);
      res.status(201).json(result);
    } catch (err) {
      return handleZodError(err, res);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}