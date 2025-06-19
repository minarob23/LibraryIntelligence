
export interface Book {
  id: number;
  title: string;
  author: string;
  publisher?: string;
  genres?: string;
  tags?: string;
  bookCode?: string;
  copies?: number;
  publishedDate?: string;
  coverImage?: string;
}

export interface Borrower {
  id: number;
  name: string;
  phone?: string;
  category: string;
  joinedDate?: string;
  favoriteAuthors?: string;
  favoriteBooks?: string;
  favoriteGenres?: string;
}

export interface Librarian {
  id: number;
  name: string;
  employmentStatus: string;
}

export interface Borrowing {
  id: number;
  bookId: number;
  borrowerId: number;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'borrowed' | 'returned';
  rating?: number;
  bookTitle?: string;
  researchId?: number;
}

export interface Research {
  id: number;
  title: string;
  author: string;
}

export interface Quote {
  id?: number;
  content: string;
  page?: number;
  chapter?: string;
  author?: string;
  tags?: string;
  isFavorite?: boolean;
}
