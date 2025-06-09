import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Edit, Trash2, Plus, Star } from 'lucide-react';
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
import { apiRequest, queryClient } from '@/lib/queryClient';

const BooksPage = () => {
  const { toast } = useToast();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [editingBook, setEditingBook] = useState<any>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const { data: books, isLoading } = useQuery({ 
    queryKey: ['/api/books'],
    refetchInterval: 2000, // Refetch every 2 seconds for real-time updates
  });

  const { data: borrowings } = useQuery({ 
    queryKey: ['/api/borrowings'],
    refetchInterval: 2000, // Refetch every 2 seconds for real-time updates
  });

  // Helper functions
  const getBookBorrowings = (bookId: number) => {
    return borrowings?.filter((b: any) => b.bookId === bookId) || [];
  };

  const getTimesBorrowed = (bookId: number) => {
    return getBookBorrowings(bookId).length;
  };

  const getLastBorrowedDate = (bookId: number) => {
    const bookBorrowings = getBookBorrowings(bookId);
    if (bookBorrowings.length === 0) return null;

    const dates = bookBorrowings.map((b: any) => new Date(b.borrowDate));
    return new Date(Math.max(...dates.map(d => d.getTime())));
  };

  const getAverageRating = (bookId: number) => {
    const bookBorrowings = getBookBorrowings(bookId).filter((b: any) => b.rating);
    if (bookBorrowings.length === 0) return null;

    const sum = bookBorrowings.reduce((acc: number, b: any) => acc + b.rating, 0);
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
      cell: (row: any) => (
        <div className="flex items-center">
          <img 
            className="h-12 w-9 object-cover mr-3 rounded" 
            src={row.coverImage} 
            alt={`Cover of ${row.name}`} 
          />
          <div>
            <div className="text-sm font-medium">{row.name}</div>
            <div className="text-xs text-gray-500">{row.genres}</div>
          </div>
        </div>
      ),
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
        const isBorrowed = borrowings?.some((b: any) => b.bookId === row.id && b.status === 'borrowed');
        const timesBorrowed = getTimesBorrowed(row.id);
        const lastBorrowed = getLastBorrowedDate(row.id);

        return (
          <div className="space-y-1">
            {isBorrowed ? (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                Borrowed
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                Available
              </Badge>
            )}
            <div className="text-xs text-gray-500">
              Times borrowed: {timesBorrowed}
            </div>
            {lastBorrowed && (
              <div className="text-xs text-gray-500">
                Last: {lastBorrowed.toLocaleDateString()}
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

  // Get unique authors, publishers, and genres from books
  const authors = [...new Set(books?.map(book => book.author) || [])];
  const publishers = [...new Set(books?.map(book => book.publisher) || [])];
  const genres = [...new Set(books?.flatMap(book => 
    book.genres ? book.genres.split(',').map((g: string) => g.trim()) : []
  ) || [])];

  const [filterType, setFilterType] = useState('publisher');
  const [filterValue, setFilterValue] = useState('all');

  const filterComponent = (
    <div className="flex items-center gap-4">
      <Select value={filterType} onValueChange={(value) => {
        setFilterType(value);
        setFilterValue('all');
      }}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Filter by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="publisher">Publisher</SelectItem>
          <SelectItem value="author">Author</SelectItem>
          <SelectItem value="genres">Genres</SelectItem>
          <SelectItem value="code">Book Code</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filterValue} onValueChange={setFilterValue}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder={`Select ${filterType}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All {filterType}s</SelectItem>
          {filterType === 'publisher' && publishers.map(pub => (
            <SelectItem key={pub} value={pub}>{pub}</SelectItem>
          ))}
          {filterType === 'author' && authors.map(author => (
            <SelectItem key={author} value={author}>{author}</SelectItem>
          ))}
          {filterType === 'genres' && genres.map(genre => (
            <SelectItem key={genre} value={genre}>{genre}</SelectItem>
          ))}
          {filterType === 'code' && books?.map(book => (
            <SelectItem key={book.bookCode} value={book.bookCode}>{book.bookCode}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
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
  const filteredBooks = books?.filter(book => {
    const isBorrowed = borrowings?.some((b: any) => b.bookId === book.id && b.status === 'borrowed');
    const availabilityMatch = selectedAvailability === 'all' || 
      (selectedAvailability === 'borrowed' && isBorrowed) ||
      (selectedAvailability === 'available' && !isBorrowed);

    let filterMatch = true;
    if (filterValue !== 'all') {
      switch (filterType) {
        case 'publisher':
          filterMatch = book.publisher === filterValue;
          break;
        case 'author':
          filterMatch = book.author === filterValue;
          break;
        case 'genres':
          filterMatch = book.genres && book.genres.split(',').map((g: string) => g.trim()).includes(filterValue);
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
  const borrowedBooks = filteredBooks?.filter(book => 
    borrowings?.some((b: any) => b.bookId === book.id && b.status === 'borrowed')
  ) || [];

  const mostBorrowedBooks = [...(books || [])]
    .sort((a, b) => getTimesBorrowed(b.id) - getTimesBorrowed(a.id))
    .filter(book => getTimesBorrowed(book.id) > 0)
    .slice(0, 20);

  const popularBooks = [...(books || [])]
    .sort((a, b) => getPopularityScore(b.id) - getPopularityScore(a.id))
    .filter(book => getPopularityScore(book.id) > 0)
    .slice(0, 20);

  const topRatedBooks = [...(books || [])]
    .filter(book => getAverageRating(book.id) !== null)
    .sort((a, b) => parseFloat(getAverageRating(b.id) || '0') - parseFloat(getAverageRating(a.id) || '0'))
    .slice(0, 20);

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex justify-between items-center animate-slide-up">
        <div>
          <h2 className="text-2xl font-bold">Books Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Browse and manage the library's book collection</p>
        </div>
        <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add New Book
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Add New Book</DialogTitle>
              <DialogDescription>
                Add a new book to the library collection. Fill out the form below with the book details.
              </DialogDescription>
            </DialogHeader>
            <BookForm 
              index={(books?.length || 0) + 1}
              onSuccess={() => setOpenAddDialog(false)} 
              onCancel={() => setOpenAddDialog(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All Books ({books?.length || 0})</TabsTrigger>
          <TabsTrigger value="borrowed">Borrowed ({borrowedBooks.length})</TabsTrigger>
          <TabsTrigger value="most-borrowed">Most Borrowed ({mostBorrowedBooks.length})</TabsTrigger>
          <TabsTrigger value="popular">Popular ({popularBooks.length})</TabsTrigger>
          <TabsTrigger value="top-rated">Top Rated ({topRatedBooks.length})</TabsTrigger>
          <TabsTrigger value="gallery">Gallery ({books?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            {filterComponent}
          </div>
          <DataTable
            data={filteredBooks || []}
            columns={columns}
            searchable={true}
            loading={isLoading}
            emptyMessage={getEmptyMessage()}
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
                  <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
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
                      <Trash2 size={16} className="mr-1" /> Delete
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
              itemsPerPage: 10,
              currentPage: 1,
              onPageChange: () => {},
            }}
          />
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
                emptyMessage="No books are currently borrowed"
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
                    <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
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
                emptyMessage="No borrowing data available"
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
                    <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
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
                emptyMessage="No popularity data available"
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
                    <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
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
                emptyMessage="No rating data available"
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
                    <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
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
                    const isBorrowed = borrowings?.some((b: any) => b.bookId === book.id && b.status === 'borrowed');
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
                            <div className="flex flex-wrap gap-1">
                              {book.genres.split(',').slice(0, 2).map((genre: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                                  {genre.trim()}
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