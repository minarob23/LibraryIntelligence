import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Edit, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
  });

  const { data: borrowings } = useQuery({ 
    queryKey: ['/api/borrowings'],
  });

  const handleDelete = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/books/${id}`);
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      toast({
        title: 'Success',
        description: 'Book deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting book:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete book. Please try again.',
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
          </div>
        </div>
      ),
    },
    {
      key: 'author',
      header: 'Author',
      cell: (row: any) => row.author,
    },
    {
      key: 'publisher',
      header: 'Publisher',
      cell: (row: any) => row.publisher,
    },
    {
      key: 'bookCode',
      header: 'Code',
      cell: (row: any) => row.bookCode,
    },
    {
      key: 'copies',
      header: 'Copies',
      cell: (row: any) => row.copies,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row: any) => {
        const isBorrowed = borrowings?.some((b: any) => b.bookId === row.id && b.status === 'borrowed');
        
        if (isBorrowed) {
          return (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
              Borrowed
            </Badge>
          );
        } else {
          return (
            <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              Available
            </Badge>
          );
        }
      },
    },
  ];

  const [selectedPublisher, setSelectedPublisher] = useState('all');
  const [selectedAuthor, setSelectedAuthor] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');

  // Get unique authors from books
  const authors = [...new Set(books?.map(book => book.author) || [])];
  const publishers = [...new Set(books?.map(book => book.publisher) || [])];

  const [filterType, setFilterType] = useState('publisher');
  const [filterValue, setFilterValue] = useState('all');

  const filterComponent = (
    <div className="flex items-center gap-4">
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

  // Filter books based on availability
  const filteredBooks = books?.filter(book => {
    const isBorrowed = borrowings?.some((b: any) => b.bookId === book.id && b.status === 'borrowed');
    return selectedAvailability === 'all' || 
      (selectedAvailability === 'borrowed' && isBorrowed) ||
      (selectedAvailability === 'available' && !isBorrowed);
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
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Add New Book</DialogTitle>
              <DialogDescription>
                Add a new book to the library collection. Fill out the form below with the book details.
              </DialogDescription>
            </DialogHeader>
            <BookForm onSuccess={() => setOpenAddDialog(false)} onCancel={() => setOpenAddDialog(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      <DataTable
        data={filteredBooks || []}
        columns={columns}
        searchable={true}
        filterComponent={filterComponent}
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
              <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                  <DialogTitle>Edit Book</DialogTitle>
                  <DialogDescription>
                    Update the book details. Fill out the form below with the updated information.
                  </DialogDescription>
                </DialogHeader>
                {editingBook && (
                  <BookForm 
                    book={editingBook} 
                    onSuccess={() => setOpenEditDialog(false)} 
                    onCancel={() => setOpenEditDialog(false)} 
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
          totalItems: books?.length || 0,
          itemsPerPage: 10,
          currentPage: 1,
          onPageChange: () => {},
        }}
      />
    </div>
  );
};

export default BooksPage;
