import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Edit, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import LibrarianForm from '@/components/forms/librarian-form';
import { apiRequest, queryClient } from '@/lib/queryClient';

const LibrariansPage = () => {
  const { toast } = useToast();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [editingLibrarian, setEditingLibrarian] = useState<any>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const { data: librarians, isLoading } = useQuery<any[]>({ 
    queryKey: ['/api/librarians'],
  });

  const handleDelete = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/librarians/${id}`);
      queryClient.invalidateQueries({ queryKey: ['/api/librarians'] });
      toast({
        title: 'Success',
        description: 'Librarian deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting librarian:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete librarian. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Get initials from a name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Get status badge based on membership status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            Active
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            Inactive
          </Badge>
        );
      case 'temporary':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            Temporary
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

  const columns = [
    {
      key: 'librarianId',
      header: 'Librarian ID',
      cell: (row: any) => (
        <div className="font-mono text-sm font-medium">
          {row.librarianId || `LIB-${row.id.toString().padStart(3, '0')}`}
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Librarian Details',
      cell: (row: any) => (
        <div className="flex items-center">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-800 dark:from-blue-900 dark:to-indigo-900 dark:text-blue-100 font-semibold">
              {getInitials(row.name)}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{row.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {row.email || 'No email provided'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact Information',
      cell: (row: any) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">📞</span>
            <span className="ml-2 font-mono">{row.phone}</span>
          </div>
          {row.email && (
            <div className="flex items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">✉️</span>
              <span className="ml-2 text-blue-600 dark:text-blue-400 truncate max-w-[200px]">
                {row.email}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'appointmentDate',
      header: 'Service Details',
      cell: (row: any) => {
        const appointmentDate = new Date(row.appointmentDate);
        const yearsOfService = Math.floor((new Date().getTime() - appointmentDate.getTime()) / (1000 * 60 * 60 * 24 * 365));

        return (
          <div className="space-y-1">
            <div className="text-sm font-medium">
              Appointed: {appointmentDate.toLocaleDateString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {yearsOfService > 0 ? `${yearsOfService} year${yearsOfService !== 1 ? 's' : ''} of service` : 'Less than 1 year'}
            </div>
          </div>
        );
      },
    },
    {
      key: 'membershipStatus',
      header: 'Employment Status',
      cell: (row: any) => (
        <div className="space-y-2">
          {getStatusBadge(row.membershipStatus)}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {row.membershipStatus === 'active' ? 'Full-time staff' : 
             row.membershipStatus === 'temporary' ? 'Contract basis' : 
             'Not currently active'}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex justify-between items-center animate-slide-up">
        <div>
          <h2 className="text-2xl font-bold">Librarians Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Browse and manage library staff</p>
        </div>
        <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Librarian
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Add New Librarian</DialogTitle>
              <DialogDescription>
                Add a new staff member to the library system. Fill out the form below with the librarian details.
              </DialogDescription>
            </DialogHeader>
            <LibrarianForm onSuccess={() => setOpenAddDialog(false)} onCancel={() => setOpenAddDialog(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        data={librarians || []}
        columns={columns}
        searchable={true}
        loading={isLoading}
        actions={(row) => (
          <>
            <Dialog open={openEditDialog && editingLibrarian?.id === row.id} onOpenChange={(open) => {
              setOpenEditDialog(open);
              if (!open) setEditingLibrarian(null);
            }}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="text-primary-500 hover:text-primary-600" onClick={() => {
                  setEditingLibrarian(row);
                  setOpenEditDialog(true);
                }}>
                  <Edit size={16} className="mr-1" /> Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                  <DialogTitle>Edit Librarian</DialogTitle>
                  <DialogDescription>
                    Update the librarian details. Fill out the form below with the updated information.
                  </DialogDescription>
                </DialogHeader>
                {editingLibrarian && (
                  <LibrarianForm 
                    librarian={editingLibrarian} 
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
                    This action cannot be undone. This will permanently delete librarian
                    "{row.name}" from the library records.
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
          totalItems: librarians?.length || 0,
          itemsPerPage: 10,
          currentPage: 1,
          onPageChange: () => {},
        }}
      />
    </div>
  );
};

export default LibrariansPage;