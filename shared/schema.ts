
import { pgTable, serial, text, integer, timestamp, date, boolean, real } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Books table
export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  author: text("author").notNull(),
  coverImage: text("cover_image").notNull(),
  publisher: text("publisher").notNull(),
  bookCode: text("book_code").notNull().unique(),
  index: text("index"),
  copies: integer("copies").notNull().default(1),
  description: text("description"),
  totalPages: integer("total_pages"),
  cabinet: text("cabinet"),
  shelf: text("shelf"),
  num: text("num"),
  addedDate: date("added_date").default(sql`CURRENT_DATE`),
  publishedDate: date("published_date"),
  genres: text("genres"),
  tags: text("tags"),
  tableOfContents: text("table_of_contents"),
  quotes: text("quotes"),
  comments: text("comments"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Borrowers table
export const borrowers = pgTable("borrowers", {
  id: serial("id").primaryKey(),
  memberId: text("member_id").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  category: text("category").notNull(),
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

// Librarians table
export const librarians = pgTable("librarians", {
  id: serial("id").primaryKey(),
  librarianId: text("librarian_id").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  appointmentDate: date("appointment_date").notNull(),
  membershipStatus: text("membership_status").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Borrowings table
export const borrowings = pgTable("borrowings", {
  id: serial("id").primaryKey(),
  borrowerId: integer("borrower_id").notNull().references(() => borrowers.id),
  librarianId: integer("librarian_id").notNull().references(() => librarians.id),
  bookId: integer("book_id").references(() => books.id),
  researchId: integer("research_id").references(() => researchPapers.id),
  borrowDate: date("borrow_date").notNull(),
  dueDate: date("due_date").notNull(),
  returnDate: date("return_date"),
  status: text("status").notNull(),
  rating: integer("rating"),
  review: text("review"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Quotes table
export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").notNull().references(() => books.id),
  content: text("content").notNull(),
  page: integer("page"),
  chapter: text("chapter"),
  author: text("author"),
  tags: text("tags"),
  isFavorite: boolean("is_favorite").default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Book Index table
export const bookIndex = pgTable("book_index", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").notNull().references(() => books.id),
  title: text("title").notNull(),
  page: integer("page"),
  level: integer("level").default(0),
  order: integer("order"),
  parentId: integer("parent_id"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Feedback table
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  name: text("name"),
  phone: text("phone"),
  email: text("email"),
  stage: text("stage").notNull(),
  membershipStatus: text("membership_status").notNull(),
  type: text("type").notNull(),
  message: text("message").notNull(),
  submittedAt: timestamp("submitted_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  status: text("status").default("pending"),
});

// Membership Applications table
export const membershipApplications = pgTable("membership_applications", {
  id: serial("id").primaryKey(),
  memberId: text("member_id").notNull(),
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

// Research papers table
export const researchPapers = pgTable("research_papers", {
  id: serial("id").primaryKey(),
  coverImage: text("cover_image").notNull(),
  name: text("name").notNull(),
  author: text("author").notNull(),
  publisher: text("publisher").notNull(),
  researchCode: text("research_code").notNull().unique(),
  copies: integer("copies").notNull().default(1),
  description: text("description"),
  totalPages: integer("total_pages"),
  publishedDate: date("published_date"),
  keywords: text("keywords"),
  abstract: text("abstract"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Create schemas with proper Zod handling
export const insertBookSchema = z.object({
  name: z.string(),
  author: z.string(),
  coverImage: z.string(),
  publisher: z.string(),
  bookCode: z.string(),
  index: z.string().nullable().optional(),
  copies: z.number().default(1),
  description: z.string().optional(),
  totalPages: z.number().optional(),
  cabinet: z.string().optional(),
  shelf: z.string().optional(),
  num: z.string().optional(),
  addedDate: z.string().optional(),
  publishedDate: z.string().optional(),
  genres: z.string().optional(),
  tags: z.string().optional(),
  tableOfContents: z.string().optional(),
  quotes: z.string().optional(),
  comments: z.string().optional(),
});

export const insertResearchPaperSchema = z.object({
  name: z.string(),
  author: z.string(),
  coverImage: z.string(),
  publisher: z.string(),
  researchCode: z.string(),
  copies: z.number().optional().default(1),
  description: z.string().optional(),
  totalPages: z.number().optional(),
  publishedDate: z.string().optional(),
  keywords: z.string().optional(),
  abstract: z.string().optional(),
});

export const insertLibrarianSchema = z.object({
  name: z.string(),
  librarianId: z.string(),
  phone: z.string(),
  appointmentDate: z.string(),
  membershipStatus: z.string(),
  email: z.string().optional(),
});

export const insertBorrowerSchema = z.object({
  category: z.string(),
  name: z.string(),
  additionalPhone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  churchName: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  expiryDate: z.string(),
  fatherOfConfession: z.string().nullable().optional(),
  favoriteBooks: z.string().nullable().optional(),
  hobbies: z.string().nullable().optional(),
  job: z.string().nullable().optional(),
  joinedDate: z.string(),
  memberId: z.string(),
  phone: z.string(),
  studies: z.string().nullable().optional(),
});

export const insertBorrowingSchema = z.object({
  borrowerId: z.number(),
  bookId: z.number().nullable().optional(),
  rating: z.number().nullable().optional(),
  librarianId: z.number(),
  researchId: z.number().nullable().optional(),
  borrowDate: z.string(),
  dueDate: z.string(),
  returnDate: z.string().nullable().optional(),
  status: z.string(),
  review: z.string().nullable().optional(),
});

export const insertQuoteSchema = z.object({
  bookId: z.number(),
  content: z.string(),
  author: z.string().nullable().optional(),
  tags: z.string().nullable().optional(),
  page: z.number().nullable().optional(),
  chapter: z.string().nullable().optional(),
  isFavorite: z.boolean().nullable().optional(),
});

export const insertBookIndexSchema = z.object({
  bookId: z.number(),
  title: z.string(),
  order: z.number().nullable().optional(),
  page: z.number().nullable().optional(),
  level: z.number().nullable().optional(),
  parentId: z.number().nullable().optional(),
});

// Export type definitions
export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof books.$inferSelect;

export type InsertResearchPaper = z.infer<typeof insertResearchPaperSchema>;
export type ResearchPaper = typeof researchPapers.$inferSelect;

export type InsertLibrarian = z.infer<typeof insertLibrarianSchema>;
export type Librarian = typeof librarians.$inferSelect;

export type InsertBorrower = z.infer<typeof insertBorrowerSchema>;
export type Borrower = typeof borrowers.$inferSelect;

export type InsertBorrowing = z.infer<typeof insertBorrowingSchema>;
export type Borrowing = typeof borrowings.$inferSelect;

export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = typeof quotes.$inferSelect;

export type InsertBookIndex = z.infer<typeof insertBookIndexSchema>;
export type BookIndex = typeof bookIndex.$inferSelect;

export type Feedback = typeof feedback.$inferSelect;
export type MembershipApplication = typeof membershipApplications.$inferSelect;
