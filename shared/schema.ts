import { z } from "zod";

// Educational stage enum
export const educationalStageValues = ['primary', 'middle', 'secondary', 'university', 'graduate'] as const;
export type EducationalStage = typeof educationalStageValues[number];

// Membership status enum
export const membershipStatusValues = ['active', 'inactive', 'temporary'] as const;
export type MembershipStatus = typeof membershipStatusValues[number];

// Books interface
export interface Book {
  id: number;
  coverImage: string;
  name: string;
  title?: string;
  author: string;
  publisher: string;
  bookCode: string;
  index?: string;
  copies: number;
  description?: string;
  totalPages?: number;
  cabinet?: string;
  shelf?: string;
  num?: string;
  addedDate?: string;
  publishedDate?: string;
  genres?: string;
  tags?: string;
  comments?: string;
  createdAt: string;
}

// Interface definitions
export interface Quote {
  id: number;
  bookId: number;
  content: string;
  page?: number;
  chapter?: string;
  author?: string;
  tags?: string;
  isFavorite: boolean;
  createdAt: string;
}

export interface BookIndex {
  id: number;
  bookId: number;
  title: string;
  page?: number;
  level: number;
  parentId?: number;
  order: number;
  createdAt: string;
}

export interface ResearchPaper {
  id: number;
  title: string;
  authors: string;
  abstract?: string;
  keywords?: string;
  publicationDate?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  pdfPath?: string;
  category?: string;
  language: string;
  coverImage: string;
  createdAt: string;
}

export interface Librarian {
  id: number;
  librarianId: string;
  name: string;
  phone: string;
  appointmentDate: string;
  membershipStatus: MembershipStatus;
  email?: string;
  createdAt: string;
}

export interface Borrower {
  id: number;
  memberId: string;
  name: string;
  phone: string;
  category: EducationalStage;
  joinedDate: string;
  expiryDate: string;
  email?: string;
  address?: string;
  organizationName?: string;
  emergencyContact?: string;
  studies?: string;
  job?: string;
  hobbies?: string;
  favoriteBooks?: string;
  additionalPhone?: string;
  createdAt: string;
}

export interface Borrowing {
  id: number;
  borrowerId: number;
  librarianId: number;
  bookId?: number;
  researchId?: number;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'borrowed' | 'returned' | 'overdue';
  rating?: number;
  review?: string;
  createdAt: string;
}

export interface MembershipApplication {
  id: number;
  memberId: string;
  name: string;
  stage: string;
  birthdate: string;
  phone: string;
  additionalPhone?: string;
  email: string;
  address: string;
  organizationName?: string;
  emergencyContact?: string;
  studies?: string;
  job?: string;
  hobbies?: string;
  favoriteBooks?: string;
  createdAt: string;
}

// Schema definitions
export const insertBookSchema = z.object({
  coverImage: z.string(),
  name: z.string(),
  author: z.string(),
  publisher: z.string(),
  bookCode: z.string(),
  index: z.string().optional(),
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
  comments: z.string().optional(),
});

export const insertQuoteSchema = z.object({
  bookId: z.number(),
  content: z.string(),
  page: z.number().optional(),
  chapter: z.string().optional(),
  author: z.string().optional(),
  tags: z.string().optional(),
  isFavorite: z.boolean().default(false),
});

export const insertBookIndexSchema = z.object({
  bookId: z.number(),
  title: z.string(),
  page: z.number().optional(),
  level: z.number().default(1),
  parentId: z.number().optional(),
  order: z.number().default(0),
});

export const insertResearchPaperSchema = z.object({
  title: z.string(),
  authors: z.string(),
  abstract: z.string().optional(),
  keywords: z.string().optional(),
  publicationDate: z.string().optional(),
  journal: z.string().optional(),
  volume: z.string().optional(),
  issue: z.string().optional(),
  pages: z.string().optional(),
  doi: z.string().optional(),
  url: z.string().optional(),
  pdfPath: z.string().optional(),
  category: z.string().optional(),
  language: z.string().default("English"),
  coverImage: z.string().default("/src/assets/book-covers/cover1.svg"),
});

export const insertLibrarianSchema = z.object({
  librarianId: z.string(),
  name: z.string(),
  phone: z.string(),
  appointmentDate: z.string(),
  membershipStatus: z.enum(['active', 'inactive', 'temporary']),
  email: z.string().optional(),
});

export const insertBorrowerSchema = z.object({
  memberId: z.string(),
  name: z.string(),
  phone: z.string(),
  category: z.enum(['primary', 'middle', 'secondary', 'university', 'graduate']),
  joinedDate: z.string(),
  expiryDate: z.string(),
  email: z.string().optional(),
  address: z.string().optional(),
  organizationName: z.string().optional(),
  emergencyContact: z.string().optional(),
  studies: z.string().optional(),
  job: z.string().optional(),
  hobbies: z.string().optional(),
  favoriteBooks: z.string().optional(),
  additionalPhone: z.string().optional(),
});

export const insertBorrowingSchema = z.object({
  borrowerId: z.number(),
  librarianId: z.number(),
  bookId: z.number().optional(),
  researchId: z.number().optional(),
  borrowDate: z.string(),
  dueDate: z.string(),
  returnDate: z.string().optional(),
  status: z.enum(['borrowed', 'returned', 'overdue']),
  rating: z.number().optional(),
  review: z.string().optional(),
});

export const membershipApplicationSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  stage: z.enum(['primary', 'middle', 'secondary', 'university', 'graduate']),
  birthdate: z.string().min(1, "Birthdate is required"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  additionalPhone: z.string().optional().or(z.literal('')),
  email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  organizationName: z.string().optional().or(z.literal('')),
  emergencyContact: z.string().optional().or(z.literal('')),
  studies: z.string().optional().or(z.literal('')),
  job: z.string().optional().or(z.literal('')),
  hobbies: z.string().optional().or(z.literal('')),
  favoriteBooks: z.string().optional().or(z.literal(''))
});

// Type exports
export type InsertBook = z.infer<typeof insertBookSchema>;
export type InsertResearchPaper = z.infer<typeof insertResearchPaperSchema>;
export type InsertLibrarian = z.infer<typeof insertLibrarianSchema>;
export type InsertBorrower = z.infer<typeof insertBorrowerSchema>;
export type InsertBorrowing = z.infer<typeof insertBorrowingSchema>;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type InsertBookIndex = z.infer<typeof insertBookIndexSchema>;

export type LibraryHours = {
  [key: string]: { open: string; close: string };
};