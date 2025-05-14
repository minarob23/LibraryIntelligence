import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Edit, Trash2, Plus, CheckCircle, CornerDownLeft } from 'lucide-react';
import { StarRating } from '@/components/ui/star-rating';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import BorrowForm from '@/components/forms/borrow-form';
import { apiRequest, queryClient } from '@/lib/queryClient';

const BorrowingPage = () => {
  const { toast } = useToast();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [editingBorrowing, setEditingBorrowing] = useState<any>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  
  const { data: borrowings, isLoading: isLoadingBorrowings } = useQuery({ 
    queryKey: ['/api/borrowings'],
  });
  
  const { data: borrowers } = useQuery({ 
    queryKey: ['/api/borrowers'],
  });
  
  const { data: librarians } = useQuery({ 
    queryKey: ['/api/librarians'],
  });
  
  const { data: books } = useQuery({ 
    queryKey: ['/api/books'],
  });
  
  const { data: researchPapers } = useQuery({ 
    queryKey: ['/api/research'],
  });

  const handleDelete = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/borrowings/${id}`);
      queryClient.invalidateQueries({ queryKey: ['/api/borrowings'] });
      toast({
        title: 'Success',
        description: 'Borrowing record deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting borrowing record:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete borrowing record. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const handleReturn = async (borrowing: any) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const updatedBorrowing = {
        ...borrowing,
        returnDate: today,
        status: 'returned',
        rating: borrowing.rating || 0
      };
      
      const response = await apiRequest('PUT', `/api/borrowings/${borrowing.id}`, updatedBorrowing);
      
      // Update local state and cache with the server response
      queryClient.setQueryData(['/api/borrowings'], (oldData: any[]) => {
        return oldData.map(b => b.id === borrowing.id ? response : b);
      });
      
      toast({
        title: 'Success',
        description: `Item returned successfully! You rated this ${borrowing.rating}/10`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Error returning item:', error);
      toast({
        title: 'Error',
        description: 'Failed to return item. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Get status badge based on borrowing status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'borrowed':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            Borrowed
          </Badge>
        );
      case 'returned':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            Returned
          </Badge>
        );
      case 'overdue':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            Overdue
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
            Unknown
          </Badge>
        );
    }
  };

  const mapBorrowingWithDetails = () => {
    if (!borrowings || !borrowers || !librarians || !books || !researchPapers) return [];
    
    const borrowersMap = new Map(borrowers.map((b: any) => [b.id, b]));
    const librariansMap = new Map(librarians.map((l: any) => [l.id, l]));
    const booksMap = new Map(books.map((b: any) => [b.id, b]));
    const researchMap = new Map(researchPapers.map((r: any) => [r.id, r]));
    
    return borrowings.map((borrowing: any) => {
      const borrower = borrowersMap.get(borrowing.borrowerId);
      const librarian = librariansMap.get(borrowing.librarianId);
      const book = borrowing.bookId ? booksMap.get(borrowing.bookId) : null;
      const research = borrowing.researchId ? researchMap.get(borrowing.researchId) : null;
      
      return {
        ...borrowing,
        borrowerName: borrower?.name || 'Unknown Borrower',
        librarianName: librarian?.name || 'Unknown Librarian',
        itemName: book?.name || research?.name || 'Unknown Item',
        itemType: book ? 'Book' : research ? 'Research' : 'Unknown',
      };
    });
  };

  const columns = [
    {
      key: 'id',
      header: 'ID',
      cell: (row: any) => `BRW-${row.id}`,
    },
    {
      key: 'borrowerName',
      header: 'Borrower',
      cell: (row: any) => row.borrowerName,
    },
    {
      key: 'librarianName',
      header: 'Librarian',
      cell: (row: any) => row.librarianName,
    },
    {
      key: 'itemType',
      header: 'Item Type',
      cell: (row: any) => row.itemType,
    },
    {
      key: 'itemName',
      header: 'Item Name',
      cell: (row: any) => row.itemName,
    },
    {
      key: 'borrowDate',
      header: 'Borrow Date',
      cell: (row: any) => new Date(row.borrowDate).toLocaleDateString(),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      cell: (row: any) => new Date(row.dueDate).toLocaleDateString(),
    },
    {
      key: 'returnDate',
      header: 'Return Date',
      cell: (row: any) => row.returnDate ? new Date(row.returnDate).toLocaleDateString() : 'Not returned',
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row: any) => getStatusBadge(row.status),
    },
    {
      key: 'rating',
      header: 'Rating',
      cell: (row: any) => (
        <span className="text-sm">
          {row.rating ? `${row.rating}/10` : 'Not rated yet'}
        </span>
      ),
    },
  ];

  const borrowingsWithDetails = mapBorrowingWithDetails();

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex justify-between items-center animate-slide-up">
        <div>
          <h2 className="text-2xl font-bold">Borrowing Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Track borrowed books and research papers</p>
        </div>
        <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Borrowing
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>New Borrowing Record</DialogTitle>
              <DialogDescription>
                Create a new borrowing record. Fill out the form below with the borrowing details.
              </DialogDescription>
            </DialogHeader>
            <BorrowForm onSuccess={() => setOpenAddDialog(false)} onCancel={() => setOpenAddDialog(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      <DataTable
        data={borrowingsWithDetails}
        columns={columns}
        searchable={true}
        loading={isLoadingBorrowings}
        actions={(row) => (
          <>
            {row.status === 'borrowed' && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-green-500 hover:text-green-600"
                  >
                    <CheckCircle size={16} className="mr-1" /> Return
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Rate Book</DialogTitle>
                    <DialogDescription>
                      Please rate this book before returning
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-6">
                    <div className="flex flex-col items-center gap-2">
                      <StarRating
                        value={row.rating || 0}
                        onChange={(newValue) => {
                          row.rating = newValue;
                          // Force a re-render
                          const newBorrowings = [...borrowings];
                          const index = newBorrowings.findIndex(b => b.id === row.id);
                          if (index !== -1) {
                            newBorrowings[index] = { ...row };
                            queryClient.setQueryData(['/api/borrowings'], newBorrowings);
                          }
                        }}
                        max={10}
                      />
                      <div className="text-sm text-muted-foreground">Click stars to rate</div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => handleReturn(row)}>
                      Submit & Return
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            
            <Dialog open={openEditDialog && editingBorrowing?.id === row.id} onOpenChange={(open) => {
              setOpenEditDialog(open);
              if (!open) setEditingBorrowing(null);
            }}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="text-primary-500 hover:text-primary-600 ml-2" onClick={() => {
                  setEditingBorrowing(row);
                  setOpenEditDialog(true);
                }}>
                  <Edit size={16} className="mr-1" /> Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                  <DialogTitle>Edit Borrowing Record</DialogTitle>
                  <DialogDescription>
                    Update the borrowing details. Fill out the form below with the updated information.
                  </DialogDescription>
                </DialogHeader>
                {editingBorrowing && (
                  <BorrowForm 
                    borrowing={{
                      ...editingBorrowing,
                      itemType: editingBorrowing.bookId ? 'book' : 'research',
                    }}
                    onSuccess={() => setOpenEditDialog(false)} 
                    onCancel={() => setOpenEditDialog(false)} 
                  />
                )}
              </DialogContent>
            </Dialog>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="text-red-500 hover:text-red-600 ml-2">
                  <Trash2 size={16} className="mr-1" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this borrowing record.
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
          totalItems: borrowingsWithDetails.length,
          itemsPerPage: 10,
          currentPage: 1,
          onPageChange: () => {},
        }}
      />
    </div>
  );
};

export default BorrowingPage;
