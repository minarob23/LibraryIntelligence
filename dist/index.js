// server/index.ts
import express2 from "express";

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorModal from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorModal()
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./client/src"),
      "@shared": path.resolve(import.meta.dirname, "./shared")
    }
  },
  root: "./client",
  base: "./",
  server: {
    host: "0.0.0.0",
    port: 5173
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: void 0
      }
    },
    // Ensure assets are properly resolved in Electron
    assetsDir: "assets",
    sourcemap: false
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2) {
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: {
      middlewareMode: true,
      hmr: {
        port: 5e3,
        host: "0.0.0.0",
        clientPort: 5e3
      },
      allowedHosts: [
        ".replit.dev",
        "localhost",
        "127.0.0.1"
      ]
    },
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/routes.ts
import sqlite32 from "sqlite3";
import { open as open2 } from "sqlite";

// server/db.ts
import sqlite3 from "sqlite3";
import { open } from "sqlite";
async function initializeDb() {
  const db2 = await open({
    filename: "./library.db",
    driver: sqlite3.Database
  });
  await db2.exec(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      phone TEXT,
      email TEXT,
      stage TEXT NOT NULL,
      membershipStatus TEXT NOT NULL,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      submittedAt TEXT NOT NULL,
      status TEXT DEFAULT 'pending'
    );

    CREATE TABLE IF NOT EXISTS quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      author TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS book_index (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bookId INTEGER,
      location TEXT,
      description TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (bookId) REFERENCES books (id)
    );

    CREATE TABLE IF NOT EXISTS research_papers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      author TEXT NOT NULL,
      publisher TEXT,
      researchCode TEXT,
      copies INTEGER DEFAULT 1,
      coverImage TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      title TEXT,
      author TEXT,
      isbn TEXT,
      genre TEXT,
      publishedYear INTEGER,
      totalPages INTEGER,
      availableCopies INTEGER DEFAULT 1,
      coverImage TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS borrowers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      category TEXT,
      membershipStatus TEXT DEFAULT 'active',
      joinedDate TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS librarians (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      department TEXT,
      shift TEXT,
      startDate TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS borrowings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bookId INTEGER,
      borrowerId INTEGER,
      librarianId INTEGER,
      borrowDate TEXT NOT NULL,
      dueDate TEXT NOT NULL,
      returnDate TEXT,
      status TEXT DEFAULT 'borrowed',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (bookId) REFERENCES books (id),
      FOREIGN KEY (borrowerId) REFERENCES borrowers (id),
      FOREIGN KEY (librarianId) REFERENCES librarians (id)
    );
  `);
}

// server/routes.ts
var db;
async function setupRoutes(app2) {
  db = await open2({
    filename: "./library.db",
    driver: sqlite32.Database
  });
  try {
    await initializeDb();
    console.log("\u2705 Database initialized successfully");
  } catch (error) {
    console.error("\u274C Database initialization error:", error);
  }
  app2.get("/api/feedback", async (req, res) => {
    try {
      const feedbacks = await db.all(`
        SELECT * FROM feedback 
        ORDER BY submittedAt DESC
      `);
      res.json(feedbacks);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });
  app2.post("/api/feedback", async (req, res) => {
    try {
      const { name, phone, email, stage, membershipStatus, type, message, submittedAt, status } = req.body;
      const result = await db.run(`
        INSERT INTO feedback (name, phone, email, stage, membershipStatus, type, message, submittedAt, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [name || null, phone || null, email || null, stage, membershipStatus, type, message, submittedAt, status || "pending"]);
      res.json({ id: result.lastID, ...req.body });
    } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(500).json({ error: "Failed to create feedback" });
    }
  });
  app2.put("/api/feedback/:id", async (req, res) => {
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
      console.error("Error updating feedback:", error);
      res.status(500).json({ error: "Failed to update feedback" });
    }
  });
  app2.delete("/api/feedback/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.run("DELETE FROM feedback WHERE id = ?", [id]);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting feedback:", error);
      res.status(500).json({ error: "Failed to delete feedback" });
    }
  });
  app2.get("/api/books", async (req, res) => {
    try {
      const books = await db.all("SELECT * FROM books ORDER BY createdAt DESC");
      res.json(books);
    } catch (error) {
      console.error("Error fetching books:", error);
      res.status(500).json({ error: "Failed to fetch books" });
    }
  });
  app2.post("/api/books", async (req, res) => {
    try {
      const { name, title, author, isbn, genre, publishedYear, totalPages, availableCopies, coverImage } = req.body;
      const result = await db.run(`
        INSERT INTO books (name, title, author, isbn, genre, publishedYear, totalPages, availableCopies, coverImage, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [name || title, title || name, author, isbn, genre, publishedYear, totalPages, availableCopies, coverImage, (/* @__PURE__ */ new Date()).toISOString()]);
      res.json({ id: result.lastID, ...req.body });
    } catch (error) {
      console.error("Error creating book:", error);
      res.status(500).json({ error: "Failed to create book" });
    }
  });
  app2.put("/api/books/:id", async (req, res) => {
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
      console.error("Error updating book:", error);
      res.status(500).json({ error: "Failed to update book" });
    }
  });
  app2.delete("/api/books/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.run("DELETE FROM books WHERE id = ?", [id]);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting book:", error);
      res.status(500).json({ error: "Failed to delete book" });
    }
  });
  app2.get("/api/borrowers", async (req, res) => {
    try {
      const borrowers = await db.all("SELECT * FROM borrowers ORDER BY createdAt DESC");
      res.json(borrowers);
    } catch (error) {
      console.error("Error fetching borrowers:", error);
      res.status(500).json({ error: "Failed to fetch borrowers" });
    }
  });
  app2.post("/api/borrowers", async (req, res) => {
    try {
      const { name, phone, email, category, membershipStatus, joinedDate } = req.body;
      const result = await db.run(`
        INSERT INTO borrowers (name, phone, email, category, membershipStatus, joinedDate, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [name, phone, email, category, membershipStatus, joinedDate, (/* @__PURE__ */ new Date()).toISOString()]);
      res.json({ id: result.lastID, ...req.body });
    } catch (error) {
      console.error("Error creating borrower:", error);
      res.status(500).json({ error: "Failed to create borrower" });
    }
  });
  app2.put("/api/borrowers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, phone, email, category, membershipStatus, joinedDate } = req.body;
      await db.run(`
        UPDATE borrowers 
        SET name = ?, phone = ?, email = ?, category = ?, membershipStatus = ?, joinedDate = ?
        WHERE id = ?
      `, [name, phone, email, category, membershipStatus, joinedDate, id]);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating borrower:", error);
      res.status(500).json({ error: "Failed to update borrower" });
    }
  });
  app2.delete("/api/borrowers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.run("DELETE FROM borrowers WHERE id = ?", [id]);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting borrower:", error);
      res.status(500).json({ error: "Failed to delete borrower" });
    }
  });
  app2.get("/api/librarians", async (req, res) => {
    try {
      const librarians = await db.all("SELECT * FROM librarians ORDER BY createdAt DESC");
      res.json(librarians);
    } catch (error) {
      console.error("Error fetching librarians:", error);
      res.status(500).json({ error: "Failed to fetch librarians" });
    }
  });
  app2.post("/api/librarians", async (req, res) => {
    try {
      const { name, email, phone, department, shift, startDate } = req.body;
      const result = await db.run(`
        INSERT INTO librarians (name, email, phone, department, shift, startDate, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [name, email, phone, department, shift, startDate, (/* @__PURE__ */ new Date()).toISOString()]);
      res.json({ id: result.lastID, ...req.body });
    } catch (error) {
      console.error("Error creating librarian:", error);
      res.status(500).json({ error: "Failed to create librarian" });
    }
  });
  app2.put("/api/librarians/:id", async (req, res) => {
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
      console.error("Error updating librarian:", error);
      res.status(500).json({ error: "Failed to update librarian" });
    }
  });
  app2.delete("/api/librarians/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.run("DELETE FROM librarians WHERE id = ?", [id]);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting librarian:", error);
      res.status(500).json({ error: "Failed to delete librarian" });
    }
  });
  app2.get("/api/borrowings", async (req, res) => {
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
      console.error("Error fetching borrowings:", error);
      res.status(500).json({ error: "Failed to fetch borrowings" });
    }
  });
  app2.post("/api/borrowings", async (req, res) => {
    try {
      const { bookId, borrowerId, librarianId, borrowDate, dueDate, returnDate, status } = req.body;
      const result = await db.run(`
        INSERT INTO borrowings (bookId, borrowerId, librarianId, borrowDate, dueDate, returnDate, status, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [bookId, borrowerId, librarianId, borrowDate, dueDate, returnDate, status, (/* @__PURE__ */ new Date()).toISOString()]);
      res.json({ id: result.lastID, ...req.body });
    } catch (error) {
      console.error("Error creating borrowing:", error);
      res.status(500).json({ error: "Failed to create borrowing" });
    }
  });
  app2.put("/api/borrowings/:id", async (req, res) => {
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
      console.error("Error updating borrowing:", error);
      res.status(500).json({ error: "Failed to update borrowing" });
    }
  });
  app2.delete("/api/borrowings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.run("DELETE FROM borrowings WHERE id = ?", [id]);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting borrowing:", error);
      res.status(500).json({ error: "Failed to delete borrowing" });
    }
  });
  app2.get("/api/dashboard/stats", async (req, res) => {
    try {
      const totalBooks = await db.get("SELECT COUNT(*) as count FROM books");
      const totalBorrowers = await db.get("SELECT COUNT(*) as count FROM borrowers");
      const totalBorrowings = await db.get("SELECT COUNT(*) as count FROM borrowings WHERE returnDate IS NULL");
      const totalLibrarians = await db.get("SELECT COUNT(*) as count FROM librarians");
      res.json({
        totalBooks: totalBooks.count,
        totalBorrowers: totalBorrowers.count,
        activeBorrowings: totalBorrowings.count,
        totalLibrarians: totalLibrarians.count
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });
  app2.post("/api/reset-database", async (req, res) => {
    console.log("\u{1F504} Starting database reset...");
    res.setHeader("Content-Type", "application/json");
    try {
      if (!db) {
        console.error("\u274C Database connection not established");
        const errorResponse = {
          success: false,
          error: "Database connection not established",
          details: "The database connection is not available"
        };
        console.log("Sending error response:", errorResponse);
        return res.status(500).json(errorResponse);
      }
      try {
        await db.get("SELECT 1");
        console.log("\u2705 Database connection verified");
      } catch (dbError) {
        console.error("\u274C Database connection test failed:", dbError);
        const errorResponse = {
          success: false,
          error: "Database connection test failed",
          details: dbError?.message || "Unknown database error"
        };
        console.log("Sending db test error response:", errorResponse);
        return res.status(500).json(errorResponse);
      }
      await db.run("DELETE FROM borrowings").catch((err) => {
        console.log("borrowings table cleared or does not exist:", err.message);
      });
      await db.run("DELETE FROM books").catch((err) => {
        console.log("books table cleared or does not exist:", err.message);
      });
      await db.run("DELETE FROM borrowers").catch((err) => {
        console.log("borrowers table cleared or does not exist:", err.message);
      });
      await db.run("DELETE FROM librarians").catch((err) => {
        console.log("librarians table cleared or does not exist:", err.message);
      });
      await db.run("DELETE FROM feedback").catch((err) => {
        console.log("feedback table cleared or does not exist:", err.message);
      });
      await db.run("DELETE FROM research_papers").catch((err) => {
        console.log("research_papers table cleared or does not exist:", err.message);
      });
      await db.run("DELETE FROM book_index").catch((err) => {
        console.log("book_index table cleared or does not exist:", err.message);
      });
      await db.run("DELETE FROM quotes").catch((err) => {
        console.log("quotes table cleared or does not exist:", err.message);
      });
      console.log("\u2705 All tables cleared");
      const sampleBooks = [
        {
          name: "To Kill a Mockingbird",
          title: "To Kill a Mockingbird",
          author: "Harper Lee",
          isbn: "9780061120084",
          genre: "Fiction",
          publishedYear: 1960,
          totalPages: 281,
          availableCopies: 5,
          coverImage: "/src/assets/book-covers/cover1.svg"
        },
        {
          name: "1984",
          title: "1984",
          author: "George Orwell",
          isbn: "9780451524935",
          genre: "Dystopian Fiction",
          publishedYear: 1949,
          totalPages: 328,
          availableCopies: 3,
          coverImage: "/src/assets/book-covers/cover2.svg"
        },
        {
          name: "Pride and Prejudice",
          title: "Pride and Prejudice",
          author: "Jane Austen",
          isbn: "9780141439518",
          genre: "Romance",
          publishedYear: 1813,
          totalPages: 279,
          availableCopies: 4,
          coverImage: "/src/assets/book-covers/cover3.svg"
        }
      ];
      const sampleBorrowers = [
        {
          name: "John Smith",
          phone: "1234567890",
          email: "john.smith@email.com",
          category: "University",
          membershipStatus: "active",
          joinedDate: "2024-01-15"
        },
        {
          name: "Jane Doe",
          phone: "0987654321",
          email: "jane.doe@email.com",
          category: "High School",
          membershipStatus: "active",
          joinedDate: "2024-02-20"
        }
      ];
      const sampleLibrarians = [
        {
          name: "Sarah Johnson",
          email: "sarah.johnson@library.com",
          phone: "5551234567",
          department: "Reference",
          shift: "morning",
          startDate: "2023-09-01"
        },
        {
          name: "Michael Brown",
          email: "michael.brown@library.com",
          phone: "5559876543",
          department: "Circulation",
          shift: "evening",
          startDate: "2023-10-15"
        }
      ];
      for (const book of sampleBooks) {
        await db.run(`
          INSERT INTO books (name, title, author, isbn, genre, publishedYear, totalPages, availableCopies, coverImage, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [book.name, book.title, book.author, book.isbn, book.genre, book.publishedYear, book.totalPages, book.availableCopies, book.coverImage, (/* @__PURE__ */ new Date()).toISOString()]);
      }
      for (const borrower of sampleBorrowers) {
        await db.run(`
          INSERT INTO borrowers (name, phone, email, category, membershipStatus, joinedDate, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [borrower.name, borrower.phone, borrower.email, borrower.category, borrower.membershipStatus, borrower.joinedDate, (/* @__PURE__ */ new Date()).toISOString()]);
      }
      for (const librarian of sampleLibrarians) {
        await db.run(`
          INSERT INTO librarians (name, email, phone, department, shift, startDate, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [librarian.name, librarian.email, librarian.phone, librarian.department, librarian.shift, librarian.startDate, (/* @__PURE__ */ new Date()).toISOString()]);
      }
      const sampleResearch = [
        {
          name: "Machine Learning in Library Systems",
          author: "Dr. Jane Smith",
          publisher: "Academic Press",
          researchCode: "RES001",
          copies: 5,
          coverImage: "/src/assets/book-covers/cover4.svg"
        }
      ];
      for (const research of sampleResearch) {
        await db.run(`
          INSERT INTO research_papers (name, author, publisher, researchCode, copies, coverImage, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [research.name, research.author, research.publisher, research.researchCode, research.copies, research.coverImage, (/* @__PURE__ */ new Date()).toISOString()]);
      }
      console.log("\u2705 Sample data inserted successfully");
      const successResponse = {
        success: true,
        message: "Database reset successfully with sample data"
      };
      console.log("Sending success response:", successResponse);
      res.status(200).json(successResponse);
    } catch (error) {
      console.error("\u274C Error resetting database:", error);
      console.error("Full error:", error);
      if (!res.headersSent) {
        try {
          const errorResponse = {
            success: false,
            error: "Failed to reset database",
            details: error?.message || "Unknown error occurred",
            stack: process.env.NODE_ENV === "development" ? error?.stack : void 0
          };
          console.log("Sending catch error response:", errorResponse);
          res.status(500).json(errorResponse);
        } catch (jsonError) {
          console.error("\u274C Error sending JSON response:", jsonError);
          const fallbackResponse = JSON.stringify({
            success: false,
            error: "Internal Server Error - Failed to reset database",
            details: "JSON response error"
          });
          res.status(500).send(fallbackResponse);
        }
      } else {
        console.log("Headers already sent, cannot send error response");
      }
    }
  });
}

// server/index.ts
var app = express2();
app.use(express2.json({ limit: "50mb" }));
app.use(express2.urlencoded({ limit: "50mb", extended: true }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      const logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      log(logLine);
    }
  });
  next();
});
(async () => {
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app);
  } else {
    serveStatic(app);
  }
  await setupRoutes(app);
  console.log("\u{1F680} API routes initialized");
  const tryPort = (port) => {
    return new Promise((resolve, reject) => {
      const server = app.listen(port, "0.0.0.0", () => {
        log(`serving on port ${port}`);
        resolve(port);
      });
      server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
          resolve(tryPort(port + 1));
        } else {
          reject(err);
        }
      });
    });
  };
  await tryPort(5e3);
})();
