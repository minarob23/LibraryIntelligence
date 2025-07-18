import { useState } from 'react';
import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Edit, Trash2, Plus, RefreshCw, Search, Calendar, User, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataTable from '@/components/tables/data-table';
import BorrowForm from '@/components/forms/borrow-form';
import ReturnBookForm from '@/components/forms/return-book-form';
import BorrowingTrends from '@/components/dashboard/borrowing-trends';
import MostBorrowedBooksChart from '@/components/dashboard/most-borrowed-books-chart';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { localStorage_storage } from '@/lib/localStorage';
import { Input } from "@/components/ui/input";

const BorrowingManagement = () => {
  const { toast } = useToast();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingBorrowing, setEditingBorrowing] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Fetch borrowings data
  const { data: borrowings, isLoading } = useQuery<any[]>({ 
    queryKey: ['/api/borrowings'],
    refetchInterval: 2000, // Refetch every 2 seconds for real-time updates
  });

  const { data: books } = useQuery<any[]>({ 
    queryKey: ['/api/books'],
    refetchInterval: 2000, // Refetch every 2 seconds for real-time updates
  });

  const { data: borrowers } = useQuery<any[]>({ 
    queryKey: ['/api/borrowers'],
    refetchInterval: 2000, // Refetch every 2 seconds for real-time updates
  });

  const { data: librarians } = useQuery<any[]>({ 
    queryKey: ['/api/librarians'],
    refetchInterval: 2000, // Refetch every 2 seconds for real-time updates
  });

  // Debug logging
  React.useEffect(() => {
    console.log('Borrowings raw data:', borrowings);
    console.log('Borrowers raw data:', borrowers);
    console.log('Books raw data:', books);
  }, [borrowings, borrowers, books]);



  // Helper function to find borrower by ID
  const findBorrowerById = (borrowerId: any) => {
    if (!borrowerId || !borrowers || !Array.isArray(borrowers) || !borrowers.length) return null;
    return borrowers.find((b: any) => 
      b && b.id === borrowerId
    );
  };

  // Helper function to find book by ID
  const findBookById = (bookId: any) => {
    if (!bookId || !books || !Array.isArray(books) || !books.length) return null;
    return books.find((b: any) => 
      b && b.id === bookId
    );
  };

  // Filter borrowings based on search and status
  const filteredBorrowings = Array.isArray(borrowings) ? borrowings.filter((borrowing: any) => {
    // Skip if borrowing data is completely invalid
    if (!borrowing || (!borrowing.borrowerId && !borrowing.bookId)) {
      return false;
    }

    const borrower = findBorrowerById(borrowing.borrowerId);
    const book = findBookById(borrowing.bookId);

    const matchesSearch = !searchTerm || 
      borrower?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (borrowing.id && borrowing.id.toString().includes(searchTerm)) ||
      (borrowing.borrowerId && borrowing.borrowerId.toString().includes(searchTerm)) ||
      (borrowing.bookId && borrowing.bookId.toString().includes(searchTerm));

    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'active' && !borrowing.returnDate) ||
      (selectedStatus === 'returned' && borrowing.returnDate) ||
      (selectedStatus === 'overdue' && !borrowing.returnDate && borrowing.dueDate && new Date(borrowing.dueDate) < new Date());

    return matchesSearch && matchesStatus;
  }) : [];

  // Get status badge
  const getStatusBadge = (borrowing: any) => {
    if (!borrowing) {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">Unknown</Badge>;
    }

    if (borrowing.returnDate) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Returned</Badge>;
    }

    if (!borrowing.dueDate) {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">No Due Date</Badge>;
    }

    try {
      const dueDate = new Date(borrowing.dueDate);
      const today = new Date();

      if (dueDate < today) {
        return <Badge variant="destructive">Overdue</Badge>;
      }

      return <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Active</Badge>;
    } catch {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">Invalid Date</Badge>;
    }
  };

  // Get initials from a name
  const getInitials = (name: string) => {
    if (!name) return 'N/A';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Delete borrowing record
  const handleDelete = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/borrowings/${id}`);

      await queryClient.invalidateQueries({ queryKey: ['/api/borrowings'] });

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

  // Return book
  const handleReturn = async (id: number) => {
    try {
      // Update the borrowing record with return date directly in localStorage
      const updatedBorrowing = localStorage_storage.updateBorrowing(id, {
        returnDate: new Date().toISOString(),
        status: 'returned'
      });

      const result = await updatedBorrowing;
      if (result) {
        await queryClient.invalidateQueries({ queryKey: ['/api/borrowings'] });

        toast({
          title: 'Success',
          description: 'Book returned successfully',
        });
      } else {
        throw new Error('Borrowing record not found');
      }
    } catch (error) {
      console.error('Error returning book:', error);
      toast({
        title: 'Error',
        description: 'Failed to return book. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const statusTabs = [
    { value: 'all', label: 'All', count: Array.isArray(borrowings) ? borrowings.length : 0 },
    { value: 'active', label: 'Active', count: Array.isArray(borrowings) ? borrowings.filter((b: any) => !b.returnDate).length : 0 },
    { value: 'returned', label: 'Returned', count: Array.isArray(borrowings) ? borrowings.filter((b: any) => b.returnDate).length : 0 },
    { value: 'overdue', label: 'Overdue', count: Array.isArray(borrowings) ? borrowings.filter((b: any) => !b.returnDate && new Date(b.dueDate) < new Date()).length : 0 },
  ];

  const columns = [
    {
      key: 'id',
      header: 'ID',
      cell: (row: any) => row?.id ? `BRW-${row.id}` : 'N/A',
    },
    {
      key: 'borrower',
      header: 'Borrower',
      cell: (row: any) => {
        console.log('Borrower cell - row data:', row);
        if (!row) return 'Unknown';

        const borrower = findBorrowerById(row.borrowerId);
        console.log('Found borrower:', borrower, 'for borrowerId:', row.borrowerId);

        return borrower ? (
          <div className="flex items-center">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                {getInitials(borrower.name)}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <div className="text-sm font-medium">{borrower.name}</div>
              <div className="text-xs text-gray-500">{borrower.category}</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center text-red-500">
            <span className="text-sm">Unknown Borrower</span>
            <span className="text-xs text-gray-400 ml-1">(ID: {row.borrowerId})</span>
          </div>
        );
      },
    },
    {
      key: 'book',
      header: 'Book',
      cell: (row: any) => {
        console.log('Book cell - row data:', row);
        if (!row) return 'Unknown';

        const book = findBookById(row.bookId);
        console.log('Found book:', book, 'for bookId:', row.bookId);

        return book ? (
          <div>
            <div className="text-sm font-medium">{book.title || book.name}</div>
            <div className="text-xs text-gray-500">{book.author}</div>
          </div>
        ) : (
          <div className="text-red-500">
            <div className="text-sm font-medium">Unknown Book</div>
            <div className="text-xs text-gray-400">(ID: {row.bookId})</div>
          </div>
        );
      },
    },
    {
      key: 'borrowDate',
      header: 'Borrow Date',
      cell: (row: any) => {
        if (!row?.borrowDate) return <span className="text-gray-400">-</span>;
        try {
          const borrowDate = new Date(row.borrowDate);
          const today = new Date();
          const timeDiff = today.getTime() - borrowDate.getTime();
          const daysAgo = Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60 * 24)));

          return (
            <div className="flex flex-col">
              <span className="font-medium">
                {borrowDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {daysAgo === 0 ? 'Today' : `${daysAgo} days ago`}
              </span>
            </div>
          );
        } catch {
          return <span className="text-gray-400">-</span>;
        }
      },
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      cell: (row: any) => {
        if (!row?.dueDate) return <span className="text-gray-400">-</span>;
        try {
          const dueDate = new Date(row.dueDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Reset time to start of day
          dueDate.setHours(0, 0, 0, 0); // Reset time to start of day
          const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          return (
            <div className="flex flex-col">
              <span className="font-medium">
                {dueDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
              <span className={`text-xs ${
                daysUntilDue < 0 
                  ? 'text-red-500 dark:text-red-400' 
                  : daysUntilDue <= 3 
                    ? 'text-yellow-600 dark:text-yellow-400' 
                    : 'text-green-600 dark:text-green-400'
              }`}>
                {daysUntilDue < 0 
                  ? `Overdue by ${Math.abs(daysUntilDue)} days`
                  : daysUntilDue === 0
                    ? 'Due today'
                    : `${daysUntilDue} days left`
                }
              </span>
            </div>
          );
        } catch {
          return <span className="text-gray-400">-</span>;
        }
      },
    },
    {
      key: 'returnDate',
      header: 'Return Date',
      cell: (row: any) => {
        if (!row?.returnDate) {
          return (
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <Calendar className="h-4 w-4 mr-1" />
              <span className="text-sm">Not returned</span>
            </div>
          );
        }
        try {
          const returnDate = new Date(row.returnDate);
          const today = new Date();
          const timeDiff = today.getTime() - returnDate.getTime();
          const daysAgo = Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60 * 24)));

          return (
            <div className="flex flex-col">
              <span className="font-medium text-green-700 dark:text-green-400">
                {returnDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {daysAgo === 0 ? 'Today' : `${daysAgo} days ago`}
              </span>
            </div>
          );
        } catch {
          return <span className="text-gray-400">-</span>;
        }
      },
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row: any) => row ? getStatusBadge(row) : '-',
    },
    {
      key: 'rating',
      header: 'Rating',
      cell: (row: any) => {
        if (!row) return <span className="text-gray-400 text-sm">-</span>;

        if (row.returnDate && row.rating) {
          return (
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">★</span>
              <span className="text-sm font-medium">{row.rating}/10</span>
            </div>
          );
        }
        return <span className="text-gray-400 text-sm">-</span>;
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row: any) => {
        if (!row) return null;

        return (
          <div className="flex items-center gap-2">
            <Dialog open={openEditDialog && editingBorrowing?.id === row.id} onOpenChange={(open) => {
              if (!open) {
                setOpenEditDialog(false);
                setEditingBorrowing(null);
              }
            }}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary-500 hover:text-primary-600"
                  onClick={() => {
                    setEditingBorrowing(row);
                    setOpenEditDialog(true);
                  }}
                >
                  <Edit size={16} className="mr-1" /> Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Edit Borrowing</DialogTitle>
                  <DialogDescription>
                    Update the borrowing details.
                  </DialogDescription>
                </DialogHeader>
                <BorrowForm 
                  borrowing={row}
                  onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['/api/borrowings'] });
                    setOpenEditDialog(false);
                    setEditingBorrowing(null);
                  }}
                  onCancel={() => {
                    setOpenEditDialog(false);
                    setEditingBorrowing(null);
                  }}
                />
              </DialogContent>
            </Dialog>

            {!row.returnDate && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                    <BookOpen size={16} className="mr-1" /> Return
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Return Book</DialogTitle>
                    <DialogDescription>
                      Return the book and rate your reading experience.
                    </DialogDescription>
                  </DialogHeader>
                  <ReturnBookForm 
                    borrowing={row}
                    onSuccess={() => {
                      queryClient.invalidateQueries({ queryKey: ['/api/borrowings'] });
                    }}
                  />
                </DialogContent>
              </Dialog>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                  <Trash2 size={16} className="mr-1" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the borrowing record.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(row.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  const actions = [
    {
      label: 'Return Book',
      icon: <BookOpen size={16} />,
      onClick: (row: any) => handleReturn(row.id),
      show: (row: any) => !row.returnDate,
      variant: 'default' as const,
    },
    {
      label: 'Delete',
      icon: <Trash2 size={16} />,
      onClick: (row: any) => handleDelete(row.id),
      variant: 'destructive' as const,
      requireConfirm: true,
      confirmTitle: 'Delete Borrowing Record',
      confirmDescription: 'Are you sure you want to delete this borrowing record? This action cannot be undone.',
    },
  ];

  const formatBorrowings = (borrowings: any[]) => {
    return borrowings.map(borrowing => ({
      ...borrowing,
      borrowerName: borrowing.borrower?.name || 'Unknown',
      bookTitle: borrowing.book?.title || 'Unknown',
      borrowDate: borrowing.borrowDate ? new Date(borrowing.borrowDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : 'N/A',
      returnDate: borrowing.returnDate ? new Date(borrowing.returnDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : 'Not returned',
      status: borrowing.returnDate ? 'Returned' : 'Borrowed'
    }));
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 animate-slide-up">
        <h2 className="text-2xl font-bold">Borrowing Management</h2>
        <p className="text-gray-600 dark:text-gray-400">Track and manage book borrowings</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search borrowings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                New Borrowing
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>New Borrowing Record</DialogTitle>
                <DialogDescription>
                  Create a new borrowing record. Fill out the form below.
                </DialogDescription>
              </DialogHeader>
              <BorrowForm 
                onSuccess={() => setOpenAddDialog(false)} 
                onCancel={() => setOpenAddDialog(false)} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          {statusTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
              {tab.label}
              <Badge variant="secondary" className="ml-1">{tab.count}</Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {statusTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <DataTable
              data={filteredBorrowings}
              columns={columns}
              loading={isLoading}
              
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* Borrowed Books Section */}
      <Card className="border-none shadow-lg bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-300 dark:to-white bg-clip-text text-transparent flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
              <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            Borrowed Books
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400">
            Analytics and trends for borrowed books in the library
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="order-1">
              <MostBorrowedBooksChart />
            </div>
            <div className="order-2">
              <BorrowingTrends />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BorrowingManagement;