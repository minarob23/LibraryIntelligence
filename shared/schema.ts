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
  comments: text("comments"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Quotes table
export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").notNull(),
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
  bookId: integer("book_id").notNull(),
  title: text("title").notNull(),
  page: integer("page"),
  level: integer("level").default(1), // 1 for main chapters, 2 for subsections, etc.
  parentId: integer("parent_id"),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertBookSchema = createInsertSchema(books).omit({
  id: true,
  createdAt: true,
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  createdAt: true,
});

export const insertBookIndexSchema = createInsertSchema(bookIndex).omit({
  id: true,
  createdAt: true,
});

// Librarians table
export const librarians = pgTable("librarians", {
  id: serial("id").primaryKey(),
  librarianId: text("librarian_id").notNull(),
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
  memberId: text("member_id").notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  category: text("category").notNull().$type<'primary' | 'middle' | 'secondary' | 'university' | 'graduate'>(),
  joinedDate: date("joined_date").notNull(),
  expiryDate: date("expiry_date").notNull(),
  email: text("email"),
  address: text("address"),
  organizationName: text("organization_name"),
  emergencyContact: text("emergency_contact"),
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
  researchId: integer("research_id"),
  borrowDate: date("borrow_date").notNull(),
  dueDate: date("due_date").notNull(),
  returnDate: date("return_date"),
  status: text("status").notNull().$type<'borrowed' | 'returned' | 'overdue'>(),
  rating: integer("rating"),
  review: text("review"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertBorrowingSchema = createInsertSchema(borrowings).omit({
  id: true,
  createdAt: true,
});

export const membershipApplicationSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  stage: z.enum(['primary', 'middle', 'secondary', 'university', 'graduate']),
  birthdate: z.string(),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  additionalPhone: z.string().optional(),
  email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  organizationName: z.string().optional(),
  emergencyContact: z.string().optional(),
  studies: z.string().optional(),
  job: z.string().optional(),
  hobbies: z.string().optional(),
  favoriteBooks: z.string().optional()
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
  organizationName: text("organization_name"),
  emergencyContact: text("emergency_contact"),
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

export const insertResearchPaperSchema = createInsertSchema(researchPapers).omit({
  id: true,
  createdAt: true,
});

// Types
export type Book = typeof books.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;

export type ResearchPaper = typeof researchPapers.$inferSelect;
export type InsertResearchPaper = z.infer<typeof insertResearchPaperSchema>;

export type Librarian = typeof librarians.$inferSelect;
export type InsertLibrarian = z.infer<typeof insertLibrarianSchema>;

export type Borrower = typeof borrowers.$inferSelect;
export type InsertBorrower = z.infer<typeof insertBorrowerSchema>;

export type Borrowing = typeof borrowings.$inferSelect;
export type InsertBorrowing = z.infer<typeof insertBorrowingSchema>;

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;

export type BookIndex = typeof bookIndex.$inferSelect;
export type InsertBookIndex = z.infer<typeof insertBookIndexSchema>;

export type LibraryHours = {
  [key: string]: { open: string; close: string };
};

export type MembershipApplication = z.infer<typeof membershipApplicationSchema>;