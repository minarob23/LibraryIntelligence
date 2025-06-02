import { pgTable, text, serial, integer, boolean, date, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// Enums
export const educationalStageEnum = pgEnum('educational_stage', ['primary', 'middle', 'secondary', 'university', 'graduate']);
export const membershipStatusEnum = pgEnum('membership_status', ['active', 'inactive', 'temporary']);

// Books table
export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  coverImage: text("cover_image").notNull(),
  name: text("name").notNull(),
  author: text("author").notNull(),
  publisher: text("publisher").notNull(),
  bookCode: text("book_code").notNull().unique(),
  copies: integer("copies").notNull().default(1),
  description: text("description"),
  totalPages: integer("total_pages"),
  cabinet: text("cabinet"),
  shelf: text("shelf"),
  num: text("num"),
  addedDate: date("added_date").default(sql`CURRENT_DATE`),
  publishedDate: date("published_date"),
  genres: text("genres"),
  comments: text("comments"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertBookSchema = createInsertSchema(books).omit({
  id: true,
  createdAt: true,
});

// Librarians table
export const librarians = pgTable("librarians", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  appointmentDate: date("appointment_date").notNull(),
  membershipStatus: text("membership_status").notNull().$type<'active' | 'inactive' | 'temporary'>(),
  email: text("email"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertLibrarianSchema = createInsertSchema(librarians).omit({
  id: true,
  createdAt: true,
});

// Borrowers table
export const borrowers = pgTable("borrowers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  category: text("category").notNull().$type<'primary' | 'middle' | 'secondary' | 'university' | 'graduate'>(),
  joinedDate: date("joined_date").notNull(),
  expiryDate: date("expiry_date").notNull(),
  email: text("email"),
  address: text("address"),
  churchName: text("church_name"),
  fatherOfConfession: text("father_of_confession"),
  studies: text("studies"),
  job: text("job"),
  hobbies: text("hobbies"),
  favoriteBooks: text("favorite_books"),
  additionalPhone: text("additional_phone"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertBorrowerSchema = createInsertSchema(borrowers).omit({
  id: true,
  createdAt: true,
});

// Borrowing table - connects books, librarians, and borrowers
export const borrowings = pgTable("borrowings", {
  id: serial("id").primaryKey(),
  borrowerId: integer("borrower_id").notNull(),
  librarianId: integer("librarian_id").notNull(),
  bookId: integer("book_id"),
  borrowDate: date("borrow_date").notNull(),
  dueDate: date("due_date").notNull(),
  returnDate: date("return_date"),
  status: text("status").notNull().$type<'borrowed' | 'returned' | 'overdue'>(),
  rating: integer("rating"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertBorrowingSchema = createInsertSchema(borrowings).omit({
  id: true,
  createdAt: true,
});

export const membershipApplicationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  stage: z.enum(['primary', 'middle', 'secondary', 'university', 'graduate', 'librarian']),
  birthdate: z.string(),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  additionalPhone: z.string().optional(),
  email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  churchName: z.string().optional(),
  fatherOfConfession: z.string().optional(),
  studies: z.string().optional(),
  job: z.string().optional(),
  hobbies: z.string().optional(),
  favoriteBooks: z.string().optional()
});

// Membership Applications table
export const membershipApplications = pgTable("membership_applications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  stage: text("stage").notNull(),
  birthdate: text("birthdate").notNull(),
  phone: text("phone").notNull(),
  additionalPhone: text("additional_phone"),
  email: text("email").notNull(),
  address: text("address").notNull(),
  churchName: text("church_name"),
  fatherOfConfession: text("father_of_confession"),
  studies: text("studies"),
  job: text("job"),
  hobbies: text("hobbies"),
  favoriteBooks: text("favorite_books"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Types
export type Book = typeof books.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;

export type Librarian = typeof librarians.$inferSelect;
export type InsertLibrarian = z.infer<typeof insertLibrarianSchema>;

export type Borrower = typeof borrowers.$inferSelect;
export type InsertBorrower = z.infer<typeof insertBorrowerSchema>;

export type Borrowing = typeof borrowings.$inferSelect;
export type InsertBorrowing = z.infer<typeof insertBorrowingSchema>;

export type LibraryHours = {
  [key: string]: { open: string; close: string };
};

export type MembershipApplication = z.infer<typeof membershipApplicationSchema>;