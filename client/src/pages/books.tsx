import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen, 
  Users, 
  Calendar, 
  Filter,
  X,
  Download,
  Upload,
  RefreshCw,
  FileSpreadsheet,
  BarChart3,
  TrendingUp,
  Eye,
  EyeOff,
  Grid3X3,
  List,
  Settings,
  ChevronDown,
  Star,
  FileText,
  Clock
} from 'lucide-react';
import { Book, Borrowing } from '@/../../shared/schema';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import DataTable from '@/components/tables/data-table';
import BookForm from '@/components/forms/book-form';
import BookRecommendations from '@/components/dashboard/book-recommendations';
import ImportBooksForm from '@/components/forms/import-books-form';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { exportToExcel, exportToCSV, exportLibraryWithStatistics, generateLibraryStatistics, exportLibraryWithStatisticsToPDF } from '@/lib/utils/export';
import { ScrollArea } from '@/components/ui/scroll-area';

const BooksPage = () => {
  const { toast } = useToast();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [editingBook, setEditingBook] = useState<any>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: books, isLoading } = useQuery({ 
    queryKey: ['/api/books'],
    refetchInterval: 2000, // Refetch every 2 seconds for real-time updates
  });

  const { data: borrowings } = useQuery({ 
    queryKey: ['/api/borrowings'],
    refetchInterval: 2000, // Refetch every 2 seconds for real-time updates
  });

  // Helper functions
  const getBookBorrowings = (bookId: number): Borrowing[] => {
    return Array.isArray(borrowings) ? borrowings.filter((b: Borrowing) => b.bookId === bookId) : [];
  };

  const getTimesBorrowed = (bookId: number): number => {
    return getBookBorrowings(bookId).length;
  };

  const getLastBorrowedDate = (bookId: number): Date | null => {
    const bookBorrowings = getBookBorrowings(bookId);
    if (bookBorrowings.length === 0) return null;

    const dates = bookBorrowings.map((b: Borrowing) => new Date(b.borrowDate));
    return new Date(Math.max(...dates.map(d => d.getTime())));
  };

  const getAverageRating = (bookId: number): string | null => {
    const bookBorrowings = getBookBorrowings(bookId).filter((b: Borrowing) => b.rating);
    if (bookBorrowings.length === 0) return null;

    const sum = bookBorrowings.reduce((acc: number, b: Borrowing) => acc + (b.rating || 0), 0);
    return (sum / bookBorrowings.length).toFixed(1);
  };

  const getPopularityScore = (bookId: number) => {
    const timesBorrowed = getTimesBorrowed(bookId);
    const avgRating = getAverageRating(bookId);
    const lastBorrowed = getLastBorrowedDate(bookId);

    if (timesBorrowed === 0) return 0;

    // Base score from borrowing frequency (max 50 points)
    let score = Math.min(timesBorrowed * 10, 50);

    // Add rating bonus (max 30 points)
    if (avgRating) {
      score += parseFloat(avgRating) * 6;
    }

    // Add recency bonus (max 20 points)
    if (lastBorrowed) {
      const daysSince = Math.floor((new Date().getTime() - lastBorrowed.getTime()) / (1000 * 60 * 60 * 24));
      const recencyBonus = Math.max(0, 20 - (daysSince / 7));
      score += recencyBonus;
    }

    return Math.round(score);
  };

  const handleDelete = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/books/${id}`);
      await queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/dashboard/popular-books'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/dashboard/most-borrowed-books'] });
      toast({
        title: 'Success',
        description: 'Book deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting book:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete book. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const columns = [
    {
      key: 'coverImage',
      header: 'Book',
      cell: (row: any) => {
        // Check if the title contains Arabic characters
        const arabicRegex = /[\u0600-\u06FF\u0750-\u077F]/;
        const hasArabic = arabicRegex.test(row.name || '');

        return (
          <div className="flex items-center space-x-3">
            <div className="h-12 w-9 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 rounded-md flex items-center justify-center shadow-sm">
              <img 
                className="h-full w-full object-cover rounded-md" 
                src={row.coverImage} 
                alt={`Cover of ${row.name}`} 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.parentElement) {
                    e.currentTarget.parentElement.innerHTML = '<BookOpen class="h-5 w-5 text-blue-600 dark:text-blue-300" />';
                  }
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className={`font-medium text-gray-900 dark:text-gray-100 truncate ${
                hasArabic ? 'text-right font-arabic' : 'text-left'
              }`} dir={hasArabic ? 'rtl' : 'ltr'}>
                {row.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {row.author}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'author',
      header: 'Author',
      cell: (row: any) => (
        <div className="flex flex-wrap gap-1">
          {row.author.split(',').map((author: string, index: number) => (
            <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              {author.trim()}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'publisher',
      header: 'Publisher',
      cell: (row: any) => (
        <div className="flex flex-wrap gap-1">
          {row.publisher.split(',').map((publisher: string, index: number) => (
            <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              {publisher.trim()}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'genres',
      header: 'Genres',
      cell: (row: any) => row.genres ? (
        <div className="flex flex-wrap gap-1">
          {row.genres.split(',').map((genre: string, index: number) => (
            <Badge key={index} variant="secondary" className="text-xs bg-purple-100 text-purple-800">
              {genre.trim()}
            </Badge>
          ))}
        </div>
      ) : (
        <span className="text-gray-500 text-xs">No genres</span>
      ),
    },
    {
      key: 'bookCode',
      header: 'Book Code',
      cell: (row: any) => (
        <div className="font-mono text-sm">{row.bookCode}</div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row: any) => {
        const isBorrowed = Array.isArray(borrowings) ? borrowings.some((b: any) => b.bookId === row.id && b.status === 'borrowed') : false;
        const timesBorrowed = getTimesBorrowed(row.id);
        const lastBorrowed = getLastBorrowedDate(row.id);

        return (
          <div className="space-y-2">
            {/* Beautiful Status Badge */}
            <div className="flex items-center gap-2">
              {isBorrowed ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-700">
                  <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse shadow-sm"></div>
                  <span className="text-red-700 dark:text-red-300 font-semibold text-xs">Borrowed</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700">
                  <div className="h-2 w-2 bg-green-500 rounded-full shadow-sm"></div>
                  <span className="text-green-700 dark:text-green-300 font-semibold text-xs">Available</span>
                </div>
              )}
            </div>

            {/* Borrowing History */}
            {timesBorrowed > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg px-2 py-1.5 border border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  📊 {timesBorrowed} time{timesBorrowed !== 1 ? 's' : ''} borrowed
                </div>
                {lastBorrowed && (
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                    🕒 Last: {new Date(lastBorrowed).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'rating',
      header: 'Rating & Score',
      cell: (row: any) => {
        const avgRating = getAverageRating(row.id);
        const popularityScore = getPopularityScore(row.id);

        return (
          <div className="space-y-1">
            <div className="flex items-center">
              <Star className="h-3 w-3 text-yellow-400 mr-1" />
              <span className="text-sm">
                {avgRating ? `${avgRating}/10` : 'Not rated'}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Score: {popularityScore}
            </div>
          </div>
        );
      },
    },
    {
      key: 'copies',
      header: 'Copies',
      cell: (row: any) => row.copies,
    },
  ];

  const [selectedPublisher, setSelectedPublisher] = useState('all');
  const [selectedAuthor, setSelectedAuthor] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');

  // Get unique authors, publishers, genres, and tags from books
  const authors = [...new Set(Array.isArray(books) ? books.map((book: any) => book.author) : [])];
  const publishers = [...new Set(Array.isArray(books) ? books.map((book: any) => book.publisher) : [])];
  const genres = [...new Set(Array.isArray(books) ? books.flatMap((book: any) =>
    book.genres ? book.genres.split(',').map((g: string) => g.trim()) : []
  ) : [])];
  const tags = [...new Set(Array.isArray(books) ? books.flatMap((book: any) =>
    book.tags ? book.tags.split(',').map((t: string) => t.trim()) : []
  ) : [])];

  const [filterType, setFilterType] = useState('publisher');
  const [filterValue, setFilterValue] = useState('all');

  // Reset to first page when filters change
  const handleFilterChange = (type: string, value: string) => {
    if (type === 'type') {
      setFilterType(value);
      setFilterValue('all');
    } else {
      setFilterValue(value);
    }
    setCurrentPage(1);
  };

  const filterComponent = (
    <div className="flex items-center gap-4">
      <Select value={filterType} onValueChange={(value) => handleFilterChange('type', value)}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Filter by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="publisher">Publisher</SelectItem>
          <SelectItem value="author">Author</SelectItem>
          <SelectItem value="genres">Genres</SelectItem>
          <SelectItem value="tags">Tags</SelectItem>
          <SelectItem value="code">Book Code</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filterValue} onValueChange={(value) => handleFilterChange('value', value)}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder={`Select ${filterType}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All {filterType}s</SelectItem>
          {filterType === 'publisher' && publishers.filter(pub => pub !== 'All Publishers' && pub.trim() !== '').map(pub => (
            <SelectItem key={pub} value={pub}>{pub}</SelectItem>
          ))}
          {filterType === 'author' && authors.filter(author => author.trim() !== '').map(author => (
            <SelectItem key={author} value={author}>{author}</SelectItem>
          ))}
          {filterType === 'genres' && genres.filter(genre => genre.trim() !== '').map(genre => (
            <SelectItem key={genre} value={genre}>{genre}</SelectItem>
          ))}
          {filterType === 'tags' && tags.filter(tag => tag.trim() !== '').map(tag => (
            <SelectItem key={tag} value={tag}>
              <div className="flex items-center gap-1">
                🏷️ {tag}
              </div>
            </SelectItem>
          ))}
          {filterType === 'code' && Array.isArray(books) && books.filter((book: any) => book.bookCode && book.bookCode.trim() !== '').map((book: any) => (
            <SelectItem key={book.bookCode} value={book.bookCode}>{book.bookCode}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedAvailability} onValueChange={(value) => {
        setSelectedAvailability(value);
        setCurrentPage(1);
      }}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Availability" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="available">Available</SelectItem>
          <SelectItem value="borrowed">Borrowed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  // Filter books based on selections
  const filteredBooks = Array.isArray(books) ? books.filter((book: any) => {
    const isBorrowed = Array.isArray(borrowings) ? borrowings.some((b: any) => b.bookId === book.id && b.status === 'borrowed') : false;
    const availabilityMatch = selectedAvailability === 'all' || 
      (selectedAvailability === 'borrowed' && isBorrowed) ||
      (selectedAvailability === 'available' && !isBorrowed);

    let filterMatch = true;
    if (filterValue !== 'all' && filterType === 'publisher' && book.publisher !== 'All Publishers') {
      filterMatch = book.publisher === filterValue;
    } else if (filterValue !== 'all') {
      switch (filterType) {
        case 'author':
          filterMatch = book.author === filterValue;
          break;
        case 'genres':
          filterMatch = book.genres && book.genres.split(',').map((g: string) => g.trim()).includes(filterValue);
          break;
        case 'tags':
          filterMatch = book.tags && book.tags.split(',').map((t: string) => t.trim()).includes(filterValue);
          break;
        case 'code':
          filterMatch = book.bookCode === filterValue;
          break;
      }
    }

    return filterMatch && availabilityMatch;
  });

  // Custom empty state messages
  const getEmptyMessage = () => {
    if (selectedAvailability === 'available' && filteredBooks?.length === 0) {
      return "All books matching these filters are currently borrowed";
    }
    if (selectedAvailability === 'borrowed' && filteredBooks?.length === 0) {
      return "All books matching these filters are currently available";
    }
    return "No books found matching the selected filters";
  };

  // Get filtered books for different sections
  const borrowedBooks = Array.isArray(filteredBooks) ? filteredBooks.filter((book: any) =>
    Array.isArray(borrowings) && borrowings.some((b: any) => b.bookId === book.id && b.status === 'borrowed')
  ) : [];

  const mostBorrowedBooks = Array.isArray(books) ? [...books]
    .sort((a: any, b: any) => getBookBorrowings(b.id).length - getBookBorrowings(a.id).length)
    .slice(0, 6) : [];

  const popularBooks = Array.isArray(books) ? [...books]
    .filter((book: any) => getBookBorrowings(book.id).length > 0)
    .slice(0, 6) : [];

  const topRatedBooks = Array.isArray(books) ? [...books]
    .filter(book => getAverageRating(book.id) !== null)
    .sort((a, b) => parseFloat(getAverageRating(b.id) || '0') - parseFloat(getAverageRating(a.id) || '0'))
    .slice(0, 20) : [];

    const handleExport = () => {
      if (!books || !Array.isArray(books) || books.length === 0) {
        toast({
          title: 'No Data',
          description: 'No books available to export.',
          variant: 'destructive',
        });
        return;
      }

      const stats = exportLibraryWithStatistics(books, Array.isArray(borrowings) ? borrowings : []);

      toast({
        title: '📊 Export Successful',
        description: `Library data exported with ${stats.totalBooks} books and comprehensive statistics.`,
      });
    };

    const handleQuickExport = () => {
      if (!books || !Array.isArray(books) || books.length === 0) {
        toast({
          title: 'No Data',
          description: 'No books available to export.',
          variant: 'destructive',
        });
        return;
      }

      const exportData = books.map(book => ({
        Name: book.name,
        Author: book.author,
        Publisher: book.publisher,
        'Book Code': book.bookCode,
        Cabinet: book.cabinet,
        Shelf: book.shelf,
        Number: book.num,
        Copies: book.copies,
        Genres: book.genres,
        Tags: book.tags,
        Description: book.description,
        'Total Pages': book.totalPages,
        'Published Date': book.publishedDate,
        Comments: book.comments,
      }));

      exportToCSV(exportData, `books-${new Date().toISOString().split('T')[0]}.csv`);
      toast({
        title: 'Export Successful',
        description: 'Books data has been exported to CSV file.',
      });
    };

// Library Export Dialog Component
  const LibraryExportDialog = ({ books, borrowings, onExport }: { books: any[], borrowings: any[], onExport: () => void }) => {
    const stats = generateLibraryStatistics(books || [], borrowings || []);

    const handleEnhancedExport = () => {
      exportLibraryWithStatistics(books, borrowings);
      toast({
        title: '📊 Enhanced Export Complete',
        description: `Library exported with comprehensive statistics for ${stats.totalBooks} books.`,
      });
      onExport();
    };

    const handleEnhancedPDFExport = () => {
      exportLibraryWithStatisticsToPDF(books, borrowings);
      toast({
        title: '📊 Enhanced Export Complete',
        description: `Library exported with comprehensive statistics for ${stats.totalBooks} books.`,
      });
      onExport();
    };

    return (
      <div className="space-y-6">
        {/* Statistics Overview */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-lg border border-green-200 dark:border-green-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            Library Statistics Overview
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.totalBooks}</div>
              <div className="text-sm text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1">
                <BookOpen className="h-3 w-3" />
                Total Books
              </div>
            </div>

            <div className="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.availableBooks}</div>
              <div className="text-sm text-green-600 dark:text-green-400">Available ({stats.availableRate}%)</div>
            </div>

            <div className="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.borrowedBooks}</div>
              <div className="text-sm text-orange-600 dark:text-orange-400">Borrowed ({stats.borrowedRate}%)</div>
            </div>

            <div className="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.recentlyAdded}</div>
              <div className="text-sm text-purple-600 dark:text-purple-400 flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" />
                Recently Added
              </div>
            </div>
          </div>

          {/* Top Genres */}
          {stats.topGenres.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Top Genres:</h4>
              <div className="flex flex-wrap gap-2">
                {stats.topGenres.map(({ genre, count }, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {genre} ({count})
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Export Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Export Options</h3>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-start gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-lg">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-blue-800 dark:text-blue-300">Enhanced Export with Statistics</h4>
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                  Complete library export including detailed statistics, availability status, and trends analysis.
                </p>
                <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1 mb-4">
                  <li>• Comprehensive book inventory with availability status</li>
                  <li>• Statistical overview (Available, Borrowed, Total rates)</li>
                  <li>• Recently added books tracking</li>
                  <li>• Top genres analysis</li>
                  <li>• Export date and generation timestamp</li>
                </ul>
                <Button 
                  onClick={handleEnhancedPDFExport}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Export to PDF
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-700">
            <div className="flex items-start gap-3">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-2 rounded-lg">
                <FileSpreadsheet className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-emerald-800 dark:text-emerald-300">Export Library Books (Excel Format)</h4>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-3">
                  Complete book records in Excel format with detailed information and proper formatting.
                </p>
                <ul className="text-xs text-emerald-700 dark:text-emerald-400 space-y-1 mb-4">
                  <li>• Complete Book Records with categorized columns</li>
                  <li>• Author Details and Publisher Information</li>
                  <li>• Storage Location Data (Cabinet, Shelf, Number)</li>
                  <li>• Reference Codes and ISBN information</li>
                  <li>• Excel-optimized formatting for analysis</li>
                </ul>
                <Button 
                  onClick={() => {
                    if (books && books.length > 0) {
                      exportToExcel(books, `library-books-complete-${new Date().toISOString().split('T')[0]}`);
                      toast({
                        title: "📊 Excel Export Successful",
                        description: `Successfully exported ${books.length} books to Excel file with complete details`,
                      });
                      onExport();
                    } else {
                      toast({
                        title: "📚 No Books Available",
                        description: "No books available to export. Please add some books first.",
                        variant: "destructive",
                      });
                    }
                  }}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export to Excel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex justify-between items-center animate-slide-up">
        <div>
          <h2 className="text-2xl font-bold">Books Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Browse and manage the library's book collection</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Dialog open={openImportDialog} onOpenChange={setOpenImportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700">
                <Upload className="mr-2 h-4 w-4" /> Import Data
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] relative z-50 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-blue-600" />
                  Import Books Data
                </DialogTitle>
                <DialogDescription>
                  Import books from CSV or Excel files to your library collection
                </DialogDescription>
              </DialogHeader>
              <ImportBooksForm onSuccess={() => setOpenImportDialog(false)} />
            </DialogContent>
          </Dialog>

          <Dialog open={openExportDialog} onOpenChange={setOpenExportDialog}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Export with Stats
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col relative z-50 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Export Library Data with Statistics
                </DialogTitle>
                <DialogDescription>
                  Export your complete library collection with comprehensive statistics and insights
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto pr-4">
                <LibraryExportDialog 
                  books={Array.isArray(books) ? books : []}                  borrowings={Array.isArray(borrowings) ? borrowings : []} 
                  onExport={() => setOpenExportDialog(false)} 
                />
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={openAddDialog} onOpenChange={(open) => {
            setOpenAddDialog(open);
            if (!open) setEditingBook(undefined);
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add New Book
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto relative z-50 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <DialogHeader>
                <DialogTitle>{editingBook ? 'Duplicate Book' : 'Add New Book'}</DialogTitle>
                <DialogDescription>
                  {editingBook ? 'Review and modify the details for the duplicated book' : 'Add a new book to the library collection. Fill out the form below with the book details.'}
                </DialogDescription>
              </DialogHeader>
              <div className="pr-4">
                <BookForm 
                  index={(Array.isArray(books) ? books.length : 0) + 1}
                  book={editingBook}
                  onSuccess={() => {
                    setOpenAddDialog(false);
                    setEditingBook(undefined);
                  }} 
                  onCancel={() => setOpenAddDialog(false)} 
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">All Books ({Array.isArray(books) ? books.length : 0})</TabsTrigger>
          <TabsTrigger value="borrowed">Borrowed ({borrowedBooks.length})</TabsTrigger>
          <TabsTrigger value="most-borrowed">Most Borrowed ({mostBorrowedBooks.length})</TabsTrigger>
          <TabsTrigger value="popular">Popular ({popularBooks.length})</TabsTrigger>
          <TabsTrigger value="top-rated">Top Rated ({topRatedBooks.length})</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="gallery">Gallery ({Array.isArray(books) ? books.length : 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            {filterComponent}
          </div>
          <div className="w-full overflow-x-auto">
            <DataTable
              data={filteredBooks || []}
              columns={columns}
              searchable={true}
              loading={isLoading}
              
              actions={(row) => (
              <>
                <Dialog open={openEditDialog && editingBook?.id === row.id} onOpenChange={(open) => {
                  setOpenEditDialog(open);
                  if (!open) setEditingBook(null);
                }}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="text-primary-500 hover:text-primary-600" onClick={() => {
                      setEditingBook(row);
                      setOpenEditDialog(true);
                    }}>
                      <Edit size={16} className="mr-1" /> Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Book</DialogTitle>
                      <DialogDescription>
                        Update the book details. Fill out the form below with the updated information.
                      </DialogDescription>
                    </DialogHeader>
                    {editingBook && (
                      <BookForm 
                        book={editingBook} 
                        onSuccess={() => {
                          setOpenEditDialog(false);
                          setEditingBook(null);
                        }} 
                        onCancel={() => {
                          setOpenEditDialog(false);
                          setEditingBook(null);
                        }} 
                      />
                    )}
                  </DialogContent>
                </Dialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" className="text-red-500 hover:text-red-600 ml-3">
                      <Trash2 size={16} className="mr-1" />
                      <span>Delete</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the book
                        "{row.name}" from the library collection.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(row.id)} className="bg-red-500 hover:bg-red-600">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
            pagination={{
              totalItems: filteredBooks?.length || 0,
              itemsPerPage: itemsPerPage,
              currentPage: currentPage,
              onPageChange: setCurrentPage,
            }}
          />
          </div>
        </TabsContent>

        <TabsContent value="borrowed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Currently Borrowed Books</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={borrowedBooks}
                columns={columns}
                searchable={true}
                loading={isLoading}
                
                actions={(row) => (
                  <Dialog open={openEditDialog && editingBook?.id === row.id} onOpenChange={(open) => {
                    setOpenEditDialog(open);
                    if (!open) {
                      setEditingBook(null);
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="text-primary-500 hover:text-primary-600" onClick={() => {
                        setEditingBook(row);
                        setOpenEditDialog(true);
                      }}>
                        <Edit size={16} className="mr-1" /> Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Book</DialogTitle>
                        <DialogDescription>
                          Update the book details. Fill out the form below with the updated information.
                        </DialogDescription>
                      </DialogHeader>
                      {editingBook && (
                        <BookForm 
                          book={editingBook} 
                          onSuccess={() => {
                            setOpenEditDialog(false);
                            setEditingBook(null);
                          }} 
                          onCancel={() => {
                            setOpenEditDialog(false);
                            setEditingBook(null);
                          }} 
                        />
                      )}
                    </DialogContent>
                  </Dialog>
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="most-borrowed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Borrowed Books</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={mostBorrowedBooks}
                columns={columns}
                searchable={true}
                loading={isLoading}
                
                actions={(row) => (
                  <Dialog open={openEditDialog && editingBook?.id === row.id} onOpenChange={(open) => {
                    setOpenEditDialog(open);
                    if (!open) {
                      setEditingBook(null);
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="text-primary-500 hover:text-primary-600" onClick={() => {
                        setEditingBook(row);
                        setOpenEditDialog(true);
                      }}>
                        <Edit size={16} className="mr-1" /> Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Book</DialogTitle>
                        <DialogDescription>
                          Update the book details. Fill out the form below with the updated information.
                        </DialogDescription>
                      </DialogHeader>
                      {editingBook && (
                        <BookForm 
                          book={editingBook} 
                          onSuccess={() => {
                            setOpenEditDialog(false);
                            setEditingBook(null);
                          }} 
                          onCancel={() => {
                            setOpenEditDialog(false);
                            setEditingBook(null);
                          }} 
                        />
                      )}
                    </DialogContent>
                  </Dialog>
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Popular Books by Score</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={popularBooks}
                columns={columns}
                searchable={true}
                loading={isLoading}
                
                actions={(row) => (
                  <Dialog open={openEditDialog && editingBook?.id === row.id} onOpenChange={(open) => {
                    setOpenEditDialog(open);
                    if (!open) {
                      setEditingBook(null);
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="text-primary-500 hover:text-primary-600" onClick={() => {
                        setEditingBook(row);
                        setOpenEditDialog(true);
                      }}>
                        <Edit size={16} className="mr-1" /> Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Book</DialogTitle>
                        <DialogDescription>
                          Update the book details. Fill out the form below with the updated information.
                        </DialogDescription>
                      </DialogHeader>
                      {editingBook && (
                        <BookForm 
                          book={editingBook} 
                          onSuccess={() => {
                            setOpenEditDialog(false);
                            setEditingBook(null);
                          }} 
                          onCancel={() => {
                            setOpenEditDialog(false);
                            setEditingBook(null);
                          }} 
                        />
                      )}
                    </DialogContent>
                  </Dialog>
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top-rated" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Rated Books</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={topRatedBooks}
                columns={columns}
                searchable={true}
                loading={isLoading}
                
                actions={(row) => (
                  <Dialog open={openEditDialog && editingBook?.id === row.id} onOpenChange={(open) => {
                    setOpenEditDialog(open);
                    if (!open) {
                      setEditingBook(null);
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="text-primary-500 hover:text-primary-600" onClick={() => {
                        setEditingBook(row);
                        setOpenEditDialog(true);
                      }}>
                        <Edit size={16} className="mr-1" /> Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Book</DialogTitle>
                        <DialogDescription>
                          Update the book details. Fill out the form below with the updated information.
                        </DialogDescription>
                      </DialogHeader>
                      {editingBook && (
                        <BookForm 
                          book={editingBook} 
                          onSuccess={() => {
                            setOpenEditDialog(false);
                            setEditingBook(null);
                          }} 
                          onCancel={() => {
                            setOpenEditDialog(false);
                            setEditingBook(null);
                          }} 
                        />
                      )}
                    </DialogContent>
                  </Dialog>
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <BookRecommendations />
        </TabsContent>

        <TabsContent value="gallery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Books Gallery</CardTitle>
              <div className="flex items-center gap-4">
                {filterComponent}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {Array.from({ length: 12 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : filteredBooks && filteredBooks.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredBooks.map((book) => {
                    const isBorrowed = Array.isArray(borrowings) ? borrowings.some((b: any) => b.bookId === book.id && b.status === 'borrowed') : false;
                    const avgRating = getAverageRating(book.id);
                    const timesBorrowed = getTimesBorrowed(book.id);

                    return (
                      <div key={book.id} className="group relative cursor-pointer">
                        <div className="aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 border-2 border-transparent group-hover:border-blue-500 transition-all duration-300 group-hover:shadow-lg">
                          <img 
                            src={book.coverImage} 
                            alt={`Cover of ${book.name}`}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />

                          {/* Status Badge */}
                          <div className="absolute top-2 left-2">
                            {isBorrowed ? (
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs">
                                Borrowed
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs">
                                Available
                              </Badge>
                            )}
                          </div>

                          {/* Rating Badge */}
                          {avgRating && (
                            <div className="absolute top-2 right-2">
                              <div className="flex items-center bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                                <Star className="h-3 w-3 text-yellow-400 mr-1 fill-current" />
                                {avgRating}
                              </div>
                            </div>
                          )}

                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="text-center text-white p-4">
                              <Button 
                                variant="secondary" 
                                size="sm"
                                onClick={() => {
                                  setEditingBook(book);
                                  setOpenEditDialog(true);
                                }}
                                className="mb-2 w-full"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <div className="text-xs space-y-1">
                                <div>Code: {book.bookCode}</div>
                                <div>Copies: {book.copies}</div>
                                <div>Borrowed: {timesBorrowed}x</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Book Info */}
                        <div className="mt-2 space-y-1">
                          <h4 className="font-semibold text-sm line-clamp-2 text-gray-900 dark:text-gray-100">
                            {book.name}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                            {book.author}
                          </p>
                          {book.genres && (
                            <div className="flex flex-wrap gap-1 mb-1">
                              {book.genres.split(',').slice(0, 2).map((genre: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                                  {genre.trim()}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {book.tags && (
                            <div className="flex flex-wrap gap-1">
                              {book.tags.split(',').slice(0, 2).map((tag: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs bg-gradient-to-r from-orange-100 to-pink-100 text-orange-800 dark:from-orange-900/30 dark:to-pink-900/30 dark:text-orange-300">
                                  🏷️ {tag.trim()}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">No books found</div>
                  <p className="text-gray-400 dark:text-gray-500">{getEmptyMessage()}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BooksPage;