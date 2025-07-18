import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import coverImage1 from '@/assets/book-covers/cover1.svg';

type FilterType = 'rating' | 'random' | 'borrowed' | 'popularity';

interface Book {
  id: number;
  name: string;
  title?: string;
  author: string;
  coverImage?: string;
  popularityScore?: number;
  rating?: string;
  timesBorrowed?: number;
}

interface Borrowing {
  id: number;
  bookId: number;
  borrowDate: string;
  rating?: number;
}

const PopularBooks = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterType>('popularity');

  const { data: books, isLoading } = useQuery<Book[]>({
    queryKey: ['/api/books'],
    refetchInterval: false, // Disable automatic refetching
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    onError: (error) => console.log('Popular books query error:', error),
  });

  const { data: borrowings } = useQuery<Borrowing[]>({ 
    queryKey: ['/api/borrowings'],
    retry: 1,
    onError: (error) => console.log('Borrowings query error:', error),
    // Remove onSuccess to prevent cascade invalidations
  });

  const calculatePopularityScore = (bookId: number) => {
    try {
      // Get all borrowings
      const allBorrowings = borrowings || [];
      const bookBorrowings = allBorrowings.filter((b: Borrowing) => b.bookId === bookId);
      
      if (!bookBorrowings.length) return 0;

      // Calculate base metrics
      const timesBorrowed = bookBorrowings.length;
      const ratings = bookBorrowings.filter(b => b.rating).map(b => b.rating!);
      const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
      
      // Get latest borrow date
      const borrowDates = bookBorrowings.map(b => new Date(b.borrowDate).getTime());
      const lastBorrowedDate = new Date(Math.max(...borrowDates));
      const daysSinceLastBorrow = Math.floor((new Date().getTime() - lastBorrowedDate.getTime()) / (1000 * 3600 * 24));

      // Store in localStorage
      const popularityData = JSON.parse(localStorage.getItem('bookPopularity') || '{}');
      popularityData[bookId] = {
        timesBorrowed,
        lastBorrowedDate: lastBorrowedDate.toISOString(),
        avgRating,
        updated: new Date().toISOString()
      };
      localStorage.setItem('bookPopularity', JSON.stringify(popularityData));

      // Calculate weighted score
      // 40% for borrow frequency, 30% for recency, 30% for ratings
      const borrowScore = Math.min(timesBorrowed / 5, 1) * 4; // Max 4 points for 5+ borrows
      const recencyScore = Math.max(0, 3 - (daysSinceLastBorrow / 30)); // Max 3 points, decreases over time
      const ratingScore = (avgRating / 5) * 3; // Max 3 points for 5-star rating

      const totalScore = borrowScore + recencyScore + ratingScore;
      return Number(Math.min(totalScore, 10).toFixed(1));
    } catch (error) {
      console.error('Error calculating popularity score:', error);
      return 0;
    }
  };

  const getAverageRating = (bookId: number) => {
    if (!borrowings) return null;
    const bookBorrowings = borrowings.filter((b: Borrowing) => b.bookId === bookId && b.rating);
    if (bookBorrowings.length === 0) return null;
    const totalRating = bookBorrowings.reduce((sum: number, b: Borrowing) => sum + (b.rating || 0), 0);
    return (totalRating / bookBorrowings.length).toFixed(1);
  };

  const sortBooks = (books: Book[]) => {
    if (!books) return [];

    const booksWithScore = books.map(book => {
      const averageRating = getAverageRating(book.id);

      return {
        ...book,
        popularityScore: calculatePopularityScore(book.id),
        rating: averageRating
      };
    });

    switch (filter) {
      case 'popularity':
        return [...booksWithScore].sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0));
      case 'borrowed':
        return [...booksWithScore].sort((a, b) => (b.timesBorrowed || 0) - (a.timesBorrowed || 0));
      case 'rating':
        return [...booksWithScore].sort((a, b) => {
          const ratingA = parseFloat(a.rating || '0');
          const ratingB = parseFloat(b.rating || '0');
          return ratingB - ratingA;
        });
      default:
        return booksWithScore;
    }
  };

  const sortedBooks = sortBooks(books);

  const handleFilterChange = (value: string) => {
    setFilter(value as FilterType);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const remainingStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarFull key={`full-${i}`} />);
    }
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" />);
    }
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<StarEmpty key={`empty-${i}`} />);
    }

    return stars;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Popular Books</CardTitle>
          <Select value={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Popularity Score</SelectItem>
              <SelectItem value="borrowed">Times Borrowed</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="flex space-x-3">
                <Skeleton className="w-16 h-24" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2 w-20" />
                </div>
              </div>
            ))
          ) : !sortedBooks?.length ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No books data available
            </div>
          ) : (
            sortedBooks?.map((book: Book) => (
              <div key={book.id} className="flex space-x-3">
                <img 
                  className="w-16 h-24 object-cover rounded shadow-sm border border-gray-200 dark:border-gray-700" 
                  src={book.coverImage || '/placeholder-cover.jpg'} 
                  alt={`Cover of ${book.name}`}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = coverImage1;
                  }}
                />
                <div>
                  <h4 className="font-medium">{book.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{book.author}</p>
                  {(
                    <div className="mt-3">
                      {filter === 'popularity' && (
                        <div className="flex items-center gap-2">
                          <div className={`${
                            book.popularityScore >= 0 
                              ? "bg-blue-100 dark:bg-blue-900/50" 
                              : "bg-red-100 dark:bg-red-900/50"
                            } rounded-lg px-4 py-2`}>
                            <div className={`text-2xl font-bold ${
                              book.popularityScore >= 0
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-red-600 dark:text-red-400"
                            }`}>
                              {book.popularityScore}
                            </div>
                            <div className={`text-xs font-medium ${
                              book.popularityScore >= 0
                                ? "text-blue-600/80 dark:text-blue-400/80"
                                : "text-red-600/80 dark:text-red-400/80"
                            }`}>
                              Popularity Score
                            </div>
                          </div>
                        </div>
                      )}
                      {filter === 'borrowed' && (
                        <div className="flex items-center gap-2">
                          <div className="bg-purple-100 dark:bg-purple-900/50 rounded-lg px-4 py-2">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              {book.timesBorrowed || 0}
                            </div>
                            <div className="text-xs text-purple-600/80 dark:text-purple-400/80 font-medium">
                              Times Borrowed
                            </div>
                          </div>
                        </div>
                      )}
                      {filter === 'rating' && (
                        <div className="flex items-center gap-2">
                          <div className="bg-gradient-to-r from-yellow-100/80 to-amber-100/80 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-lg px-4 py-3 w-full backdrop-blur-sm">
                            {book.rating !== null ? (
                              <>
                                <div className="flex items-center justify-between">
                                  <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                                    {Number(book.rating).toFixed(1)}
                                  </div>
                                  <div className="flex text-yellow-500 dark:text-yellow-400 transform hover:scale-105 transition-transform">
                                    {renderStars(parseFloat(book.rating) / 2)}
                                  </div>
                                </div>
                                <div className="text-xs text-yellow-700/90 dark:text-yellow-300/90 font-medium mt-1 tracking-wide">
                                  Rating Score
                                </div>
                              </>
                            ) : (
                              <div className="text-sm text-yellow-700/90 dark:text-yellow-300/90 font-medium text-center py-2">
                                not rated yet
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const StarFull = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const StarHalf = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    <path d="M12 17.27V5.6L9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="none" />
  </svg>
);

const StarEmpty = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

export default PopularBooks;