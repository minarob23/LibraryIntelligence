import { useQuery } from '@tanstack/react-query';
import { BookOpen, Star, TrendingUp, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Book {
  id: number;
  name: string;
  title?: string;
  author: string;
  genres?: string;
  tags?: string;
  coverImage?: string;
}

interface Borrower {
  id: number;
  name: string;
  favoriteBooks?: string;
}

interface Borrowing {
  id: number;
  bookId: number;
  borrowerId: number;
  borrowDate: string;
  status: string;
  rating?: number;
}

const BookRecommendations = () => {
  const { data: books = [] } = useQuery<Book[]>({ 
    queryKey: ['/api/books'],
    retry: 1,
  });

  const { data: borrowers = [] } = useQuery<Borrower[]>({ 
    queryKey: ['/api/borrowers'],
    retry: 1,
  });

  const { data: borrowings = [] } = useQuery<Borrowing[]>({ 
    queryKey: ['/api/borrowings'],
    retry: 1,
  });

  // Helper function to get book borrowing stats
  const getBookStats = (bookId: number) => {
    const bookBorrowings = borrowings?.filter((b: Borrowing) => b.bookId === bookId) || [];
    const timesBorrowed = bookBorrowings.length;
    const avgRating = bookBorrowings.filter(b => b.rating).length > 0 
      ? bookBorrowings.reduce((sum, b) => sum + (b.rating || 0), 0) / bookBorrowings.filter(b => b.rating).length
      : 0;

    return { timesBorrowed, avgRating };
  };

  // Extract genres and favorite books from borrowers
  const extractGenresAndFavorites = () => {
    if (!borrowers) return { genrePreferences: {}, favoriteAuthors: new Set(), favoriteBooks: new Set() };

    const genrePreferences: { [key: string]: number } = {};
    const favoriteAuthors = new Set<string>();
    const favoriteBooks = new Set<string>();

    borrowers.forEach((borrower: Borrower) => {
      if (borrower.favoriteBooks) {
        const favorites = borrower.favoriteBooks.toLowerCase();

        // Extract potential author names and book titles
        const words = favorites.split(/[,\n\r]+/).map(item => item.trim()).filter(item => item.length > 0);

        words.forEach(item => {
          favoriteBooks.add(item);
          // Check if it might be an author (simple heuristic: contains common author indicators)
          if (item.includes('author') || item.includes('writer') || item.split(' ').length <= 3) {
            favoriteAuthors.add(item.replace(/author|writer/gi, '').trim());
          }
        });
      }
    });

    // Extract genre preferences from borrowing history
    if (books && borrowings) {
      borrowings.forEach((borrowing: Borrowing) => {
        const book = books.find((b: Book) => b.id === borrowing.bookId);
        if (book?.genres) {
          book.genres.split(',').forEach((genre: string) => {
            const trimmedGenre = genre.trim().toLowerCase();
            genrePreferences[trimmedGenre] = (genrePreferences[trimmedGenre] || 0) + 1;
          });
        }
      });
    }

    return { genrePreferences, favoriteAuthors, favoriteBooks };
  };

  // Generate recommendations based on preferences
  const generateRecommendations = () => {
    if (!books) return [];

    const { genrePreferences, favoriteAuthors, favoriteBooks } = extractGenresAndFavorites();

    // Score books based on multiple factors
    const scoredBooks = books.map((book: Book) => {
      let score = 0;
      const stats = getBookStats(book.id);

      // Base popularity score (30% weight)
      score += stats.timesBorrowed * 2;

      // Rating score (25% weight)
      if (stats.avgRating > 0) {
        score += stats.avgRating * 1.5;
      }

      // Genre preference matching (35% weight)
      if (book.genres) {
        const bookGenres = book.genres.split(',').map((g: string) => g.trim().toLowerCase());
        bookGenres.forEach(genre => {
          if (genrePreferences[genre]) {
            score += genrePreferences[genre] * 3;
          }
        });
      }

      // Author preference matching (40% weight - highest priority)
      if (book.author) {
        const bookAuthors = book.author.toLowerCase();
        favoriteAuthors.forEach(favAuthor => {
          if (bookAuthors.includes(favAuthor.toLowerCase()) && favAuthor.length > 2) {
            score += 15; // High bonus for favorite authors
          }
        });
      }

      // Favorite book title matching (35% weight)
      if (book.name) {
        const bookTitle = book.name.toLowerCase();
        favoriteBooks.forEach(favBook => {
          if (bookTitle.includes(favBook.toLowerCase()) || favBook.toLowerCase().includes(bookTitle)) {
            score += 12; // High bonus for similar titles
          }
        });
      }

      // Keyword matching in tags (20% weight)
      if (book.tags) {
        const bookTags = book.tags.toLowerCase();
        favoriteBooks.forEach(favorite => {
          if (bookTags.includes(favorite.toLowerCase())) {
            score += 5;
          }
        });
      }

      // Recent books get slight penalty to promote variety
      const isRecentlyBorrowed = borrowings?.some((b: Borrowing) => 
        b.bookId === book.id && 
        new Date(b.borrowDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      );

      if (isRecentlyBorrowed) {
        score *= 0.8;
      }

      return {
        ...book,
        recommendationScore: Math.round(score),
        matchReasons: getMatchReasons(book, genrePreferences, favoriteAuthors, favoriteBooks)
      };
    });

    // Filter out books with very low scores and sort by score
    return scoredBooks
      .filter(book => book.recommendationScore > 0)
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 6);
  };

  // Get reasons why a book was recommended
  const getMatchReasons = (book: Book, genrePreferences: { [key: string]: number }, favoriteAuthors: Set<string>, favoriteBooks: Set<string>) => {
    const reasons: string[] = [];

    // Check genre matches
    if (book.genres) {
      const bookGenres = book.genres.split(',').map((g: string) => g.trim().toLowerCase());
      const matchingGenres = bookGenres.filter(genre => genrePreferences[genre]);
      if (matchingGenres.length > 0) {
        reasons.push(`Popular in ${matchingGenres[0]} genre`);
      }
    }

    // Check author matches
    if (book.author) {
      const bookAuthors = book.author.toLowerCase();
      const matchingAuthors = Array.from(favoriteAuthors).filter(author => 
        bookAuthors.includes(author.toLowerCase()) && author.length > 2
      );
      if (matchingAuthors.length > 0) {
        reasons.push(`Favorite author: ${book.author.split(',')[0]}`);
      }
    }

    // Check rating
    const stats = getBookStats(book.id);
    if (stats.avgRating >= 8) {
      reasons.push('Highly rated');
    }

    if (stats.timesBorrowed >= 5) {
      reasons.push('Popular choice');
    }

    return reasons.slice(0, 2); // Limit to 2 reasons for clean display
  };

  const recommendations = generateRecommendations();

  if (!recommendations.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Book Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No recommendations available yet. Add member preferences and borrowing history to get personalized suggestions.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          Personalized Book Recommendations
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Based on member preferences, favorite authors, and popular genres
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((book, index) => {
            const stats = getBookStats(book.id);
            const isBorrowed = borrowings?.some((b: Borrowing) => b.bookId === book.id && b.status === 'borrowed');

            return (
              <div key={book.id} className="group relative">
                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600">
                  {/* Recommendation Badge */}
                  <div className="absolute -top-2 -right-2 z-10">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg">
                      #{index + 1}
                    </Badge>
                  </div>

                  <div className="flex gap-3">
                    {/* Book Cover */}
                    <div className="flex-shrink-0">
                      <img 
                        src={book.coverImage || '/src/assets/book-covers/cover1.svg'} 
                        alt={book.name}
                        className="w-16 h-20 object-cover rounded border border-gray-200 dark:border-gray-600"
                      />
                    </div>

                    {/* Book Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm line-clamp-2 text-gray-900 dark:text-gray-100 mb-1">
                        {book.name}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">
                        {book.author}
                      </p>

                      {/* Recommendation Score */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3 text-red-500" />
                          <span className="text-xs font-medium text-red-600 dark:text-red-400">
                            {book.recommendationScore}
                          </span>
                        </div>

                        {stats.avgRating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {stats.avgRating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Match Reasons */}
                      <div className="space-y-1 mb-3">
                        {book.matchReasons.map((reason: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            {reason}
                          </Badge>
                        ))}
                      </div>

                      {/* Status */}
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={isBorrowed ? "destructive" : "default"}
                          className={`text-xs ${isBorrowed 
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' 
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          }`}
                        >
                          {isBorrowed ? 'Borrowed' : 'Available'}
                        </Badge>

                        <span className="text-xs text-gray-500">
                          {stats.timesBorrowed}x borrowed
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h5 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
            Recommendation Algorithm
          </h5>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            These recommendations are based on member favorite books, preferred genres from borrowing history, 
            author preferences, book ratings, and popularity scores. Books are ranked by relevance to member interests.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookRecommendations;