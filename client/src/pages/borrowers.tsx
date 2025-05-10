import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Edit, Trash2, Plus, RefreshCw } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataTable from '@/components/tables/data-table';
import BorrowerForm from '@/components/forms/borrower-form';
import ChartContainer from '@/components/dashboard/chart-container';
import { apiRequest, queryClient } from '@/lib/queryClient';

const categories = [
  { value: 'all', label: 'All' },
  { value: 'primary', label: 'Primary' },
  { value: 'middle', label: 'Middle' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'university', label: 'University' },
  { value: 'graduate', label: 'Graduate' },
];

const BorrowersPage = () => {
  const { toast } = useToast();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [editingBorrower, setEditingBorrower] = useState<any>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: borrowers, isLoading } = useQuery({ 
    queryKey: ['/api/borrowers', selectedCategory !== 'all' ? { category: selectedCategory } : undefined],
    refetchInterval: 1000, // Refetch every 1 second
  });

  const { data: borrowerDistribution } = useQuery({ 
    queryKey: ['/api/dashboard/borrower-distribution'],
    refetchInterval: 1000, // Refetch every 1 second
  });

  const handleDelete = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/borrowers/${id}`);
      queryClient.invalidateQueries({ queryKey: ['/api/borrowers'] });
      toast({
        title: 'Success',
        description: 'Borrower deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting borrower:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete borrower. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const renewMembership = async (borrower: any) => {
    try {
      // Set expiry date to one year from now
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

      await apiRequest('PUT', `/api/borrowers/${borrower.id}`, {
        ...borrower,
        expiryDate: oneYearFromNow.toISOString().split('T')[0],
      });

      queryClient.invalidateQueries({ queryKey: ['/api/borrowers'] });

      toast({
        title: 'Success',
        description: 'Membership renewed successfully',
      });
    } catch (error) {
      console.error('Error renewing membership:', error);
      toast({
        title: 'Error',
        description: 'Failed to renew membership. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Format borrower distribution data for chart
  const formatBorrowerDistribution = () => {
    if (!borrowerDistribution) return [];

    return [
      { name: 'Primary', value: borrowerDistribution.primary || 0 },
      { name: 'Middle', value: borrowerDistribution.middle || 0 },
      { name: 'Secondary', value: borrowerDistribution.secondary || 0 },
      { name: 'University', value: borrowerDistribution.university || 0 },
      { name: 'Graduate', value: borrowerDistribution.graduate || 0 },
    ];
  };

  // Get initials from a name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Get color for avatar based on category
  const getAvatarColor = (category: string) => {
    switch(category) {
      case 'primary':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'middle':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'secondary':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'university':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'graduate':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Calculate days until expiry
  const getDaysUntilExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Get status badge based on days until expiry
  const getStatusBadge = (expiryDate: string) => {
    const daysUntilExpiry = getDaysUntilExpiry(expiryDate);

    if (daysUntilExpiry < 0) {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          Expired
        </Badge>
      );
    } else if (daysUntilExpiry < 30) {
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          Expiring Soon
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          Active
        </Badge>
      );
    }
  };

  const columns = [
    {
      key: 'id',
      header: 'ID',
      cell: (row: any) => `BRW-${row.id}`,
    },
    {
      key: 'name',
      header: 'Name',
      cell: (row: any) => (
        <div className="flex items-center">
          <Avatar>
            <AvatarFallback className={getAvatarColor(row.category)}>
              {getInitials(row.name)}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <div className="text-sm font-medium">{row.name}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      cell: (row: any) => <span className="capitalize">{row.category}</span>,
    },
    {
      key: 'phone',
      header: 'Phone',
      cell: (row: any) => row.phone,
    },
    {
      key: 'joinedDate',
      header: 'Joined Date',
      cell: (row: any) => new Date(row.joinedDate).toLocaleDateString(),
    },
    {
      key: 'expiryDate',
      header: 'Membership Expiry',
      cell: (row: any) => new Date(row.expiryDate).toLocaleDateString(),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row: any) => getStatusBadge(row.expiryDate),
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-6 animate-slide-up">
        <h2 className="text-2xl font-bold">Borrowers Management</h2>
        <p className="text-gray-600 dark:text-gray-400">Browse and manage library borrowers</p>
      </div>

      <Tabs defaultValue="all" onValueChange={setSelectedCategory} className="mb-6">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
          {categories.map((category) => (
            <TabsTrigger key={category.value} value={category.value}>
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.value} value={category.value}>
            {category.value === 'all' && (
              <div className="mb-6">
                <ChartContainer
                  title="Borrowers Distribution by Category"
                  type="bar"
                  data={formatBorrowerDistribution()}
                  nameKey="name"
                  dataKey="value"
                  colors={['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899']}
                  height={350}
                />
              </div>
            )}

            <DataTable
              data={borrowers || []}
              columns={columns}
              searchable={true}
              loading={isLoading}
              actions={(row) => (
                <>
                  <Dialog open={openEditDialog && editingBorrower?.id === row.id} onOpenChange={(open) => {
                    setOpenEditDialog(open);
                    if (!open) setEditingBorrower(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="text-primary-500 hover:text-primary-600" onClick={() => {
                        setEditingBorrower(row);
                        setOpenEditDialog(true);
                      }}>
                        <Edit size={16} className="mr-1" /> Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px]">
                      <DialogHeader>
                        <DialogTitle>Edit Borrower</DialogTitle>
                        <DialogDescription>
                          Update the borrower details. Fill out the form below with the updated information.
                        </DialogDescription>
                      </DialogHeader>
                      {editingBorrower && (
                        <BorrowerForm 
                          borrower={editingBorrower} 
                          onSuccess={() => setOpenEditDialog(false)} 
                          onCancel={() => setOpenEditDialog(false)} 
                        />
                      )}
                    </DialogContent>
                  </Dialog>

                  {getDaysUntilExpiry(row.expiryDate) < 0 && (
                    <Button 
                      variant="ghost" 
                      className="text-green-500 hover:text-green-600 ml-3"
                      onClick={() => renewMembership(row)}
                    >
                      <RefreshCw size={16} className="mr-1" /> Renew
                    </Button>
                  )}

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
                          This action cannot be undone. This will permanently delete borrower
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
                totalItems: borrowers?.length || 0,
                itemsPerPage: 10,
                currentPage: 1,
                onPageChange: () => {},
              }}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default BorrowersPage;