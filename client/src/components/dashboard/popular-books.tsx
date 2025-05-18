import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import coverImage1 from '@/assets/book-covers/cover1.svg';

type FilterType = 'rating' | 'random' | 'borrowed' | 'popularity';

const PopularBooks = () => {
  const [filter, setFilter] = useState<FilterType>('popularity');

  const { data: books, isLoading } = useQuery({
    queryKey: ['/api/dashboard/popular-books'],
    refetchInterval: 30000,
    staleTime: 0,
    cacheTime: 0
  });

  const { data: borrowings } = useQuery({ 
    queryKey: ['/api/borrowings'],
  });

  const calculatePopularityScore = (bookId: number) => {
    const borrowings = JSON.parse(localStorage.getItem('borrowings') || '[]');
    const bookBorrowings = borrowings.filter((b: any) => b.bookId === bookId);
    
    if (!bookBorrowings.length) return 0;

    // Weights for different factors
    const BORROW_WEIGHT = 0.4;
    const RECENCY_WEIGHT = 0.4;
    const RATING_WEIGHT = 0.2;

    // Calculate borrow score (0-1)
    const maxBorrows = 10; // Cap at 10 borrows
    const borrowScore = Math.min(bookBorrowings.length / maxBorrows, 1);

    // Calculate recency score (0-1)
    const lastBorrowDate = new Date(Math.max(...bookBorrowings.map(b => new Date(b.borrowDate).getTime())));
    const daysSinceLastBorrow = Math.floor((new Date().getTime() - lastBorrowDate.getTime()) / (1000 * 3600 * 24));
    const recencyScore = Math.max(0, 1 - (daysSinceLastBorrow / 30)); // 30 days baseline

    // Calculate rating score (0-1)
    const ratings = bookBorrowings.filter(b => b.rating).map(b => b.rating);
    const ratingScore = ratings.length ? (Math.min(ratings.reduce((a, b) => a + b, 0) / ratings.length, 5) / 5) : 0.5;

    // Calculate final score (0-10)
    const score = ((borrowScore * BORROW_WEIGHT) + 
                  (recencyScore * RECENCY_WEIGHT) + 
                  (ratingScore * RATING_WEIGHT)) * 10;

    return Number(score.toFixed(1));
  };

  const getAverageRating = (bookId: number) => {
    if (!borrowings) return null;
    const bookBorrowings = borrowings.filter((b: any) => b.bookId === bookId && b.rating);
    if (bookBorrowings.length === 0) return null;
    const totalRating = bookBorrowings.reduce((sum: number, b: any) => sum + b.rating, 0);
    return (totalRating / bookBorrowings.length).toFixed(1);
  };

  const sortBooks = (books: any[]) => {
    if (!books) return [];

    const localRatings = JSON.parse(localStorage.getItem('borrowingRatings') || '{}');

    const booksWithScore = books.map(book => {
      // Get all ratings for this book from localStorage
      const bookRatings = Object.entries(localRatings)
        .filter(([key, _]) => key.startsWith('borrowing_'))
        .map(([_, rating]) => Number(rating))
        .filter(rating => rating > 0);

      const averageRating = bookRatings.length > 0
        ? (bookRatings.reduce((sum, rating) => sum + rating, 0) / bookRatings.length).toFixed(1)
        : null;

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
            sortedBooks?.map((book: any) => (
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