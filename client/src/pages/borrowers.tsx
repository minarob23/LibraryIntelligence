import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Edit, Trash2, Plus, RefreshCw, Search } from 'lucide-react';
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
import BorrowerForm from '@/components/forms/borrower-form';
import ChartContainer from '@/components/dashboard/chart-container';
import TopBorrowers from '@/components/dashboard/top-borrowers';
import TopBorrowersByEngagement from '@/components/dashboard/top-borrowers-engagement';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Input } from "@/components/ui/input"

const categories = [
  { value: 'all', label: 'All' },
  { value: 'primary', label: 'Primary' },
  { value: 'middle', label: 'Middle' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'university', label: 'University' },
  { value: 'graduate', label: 'Graduate' },
];

// Calculate days until expiry
const getDaysUntilExpiry = (expiryDate: string) => {
  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Calculate engagement score
const calculateEngagementScore = (borrowerId: number): number => {
  try {
    // For this simplified version, we'll use a mock calculation
    // You can integrate with actual borrowing data if available
    const mockScore = Math.random() * 10;
    return Number(mockScore.toFixed(1));
  } catch (error) {
    console.error('Error calculating engagement score:', error);
    return 0;
  }
};

const BorrowersPage = () => {
  const { toast } = useToast();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [editingBorrower, setEditingBorrower] = useState<any>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showExpired, setShowExpired] = useState(false);

  const { data: allBorrowers, isLoading, refetch: refetchBorrowers } = useQuery({ 
    queryKey: ['/api/borrowers'],
    refetchOnWindowFocus: true,
  });

  // Filter borrowers based on selected category and search term
  const filteredBorrowers = allBorrowers?.filter(borrower => {
    const searchTermLower = searchTerm.toLowerCase();
    const nameLower = borrower.name.toLowerCase();

    const matchesSearchTerm =
      nameLower.includes(searchTermLower) ||
      borrower.phone.includes(searchTermLower) ||
      `BRW-${borrower.id}`.includes(searchTermLower);

    if (!matchesSearchTerm) return false;

    if (showExpired) {
      const daysUntilExpiry = getDaysUntilExpiry(borrower.expiryDate);
      return daysUntilExpiry < 0;
    }

    if (selectedCategory === 'all') return true;
    return borrower.category === selectedCategory;
  });


  const { data: borrowerDistribution } = useQuery({ 
    queryKey: ['/api/dashboard/borrower-distribution'],
    refetchInterval: 1000, // Refetch every 1 second
  });

  const handleDelete = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/borrowers/${id}`);
      await queryClient.invalidateQueries({ queryKey: ['/api/borrowers'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/dashboard/borrower-distribution'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/dashboard/top-borrowers'] });
      toast({
        title: 'Success',
        description: 'Borrower deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting borrower:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete borrower. Please try again.',
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

      await queryClient.invalidateQueries({ queryKey: ['/api/borrowers'] });

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
    if (!borrowerDistribution || !Array.isArray(borrowerDistribution)) {
      // Fallback: calculate distribution from current borrowers if API data is not available
      if (!allBorrowers || !Array.isArray(allBorrowers)) return [];

      const categoryCount = allBorrowers.reduce((acc: any, borrower: any) => {
        const category = borrower.category || 'unknown';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      const categoryMap = {
        'primary': 'Primary',
        'middle': 'Middle', 
        'secondary': 'Secondary',
        'university': 'University',
        'graduate': 'Graduate'
      };

      return Object.entries(categoryCount).map(([category, count]) => ({
        name: categoryMap[category] || category,
        value: count
      }));
    }

    const categoryMap = {
      'primary': 'Primary',
      'middle': 'Middle', 
      'secondary': 'Secondary',
      'university': 'University',
      'graduate': 'Graduate'
    };

    return borrowerDistribution.map((item: any) => ({
      name: categoryMap[item.category] || item.category,
      value: item.count
    }));
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
      header: 'Member ID',
      cell: (row: any) => row.memberId || row.id || `BRW-${row.id}`,
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
      cell: (row: any) => (
        <div className="flex flex-col">
          <span className="capitalize font-medium">{row.category}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {row.category === 'primary' && 'Elementary School'}
            {row.category === 'middle' && 'Middle School'}
            {row.category === 'secondary' && 'High School'}
            {row.category === 'university' && 'University Student'}
            {row.category === 'graduate' && 'Graduate Student'}
          </span>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      cell: (row: any) => row.phone,
    },
    {
      key: 'joinedDate',
      header: 'Joined Date',
      cell: (row: any) => (
        <div className="flex flex-col">
          <span className="font-medium">
            {new Date(row.joinedDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {Math.floor((new Date().getTime() - new Date(row.joinedDate).getTime()) / (1000 * 60 * 60 * 24))} days ago
          </span>
        </div>
      ),
    },
    {
      key: 'expiryDate',
      header: 'Membership Expiry',
      cell: (row: any) => {
        const expiryDate = new Date(row.expiryDate);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {expiryDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
            <span className={`text-xs ${
              daysUntilExpiry < 0 
                ? 'text-red-500 dark:text-red-400' 
                : daysUntilExpiry < 30 
                  ? 'text-yellow-600 dark:text-yellow-400' 
                  : 'text-green-600 dark:text-green-400'
            }`}>
              {daysUntilExpiry < 0 
                ? `Expired ${Math.abs(daysUntilExpiry)} days ago`
                : daysUntilExpiry === 0
                  ? 'Expires today'
                  : `${daysUntilExpiry} days remaining`
              }
            </span>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row: any) => getStatusBadge(row.expiryDate),
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex justify-between items-center animate-slide-up">
        <div>
          <h2 className="text-2xl font-bold">Borrowers Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Browse and manage library borrowers</p>
        </div>
        <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add New Borrower
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0 pb-2">
              <DialogTitle>Add New Borrower</DialogTitle>
              <DialogDescription>
                Add a new borrower to the library system. Fill out the form below with the borrower details.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto pr-2">
              <BorrowerForm 
                onSuccess={async () => {
                  setOpenAddDialog(false);
                  // Force immediate data refresh
                  setTimeout(async () => {
                    await refetchBorrowers();
                  }, 100);
                }} 
                onCancel={() => setOpenAddDialog(false)} 
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Top Borrowers Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopBorrowers />
            <TopBorrowersByEngagement />
          </div>
        </div>
        <div className="xl:col-span-1">
          <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-700 to-pink-700 dark:from-purple-300 dark:to-pink-300 bg-clip-text text-transparent flex items-center gap-2">
                <div className="p-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                Top Borrowers (Graduate)
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Graduate students with highest engagement scores
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredBorrowers?.filter(borrower => borrower.category === 'graduate')
                  .sort((a, b) => {
                    const scoreA = calculateEngagementScore(a.id);
                    const scoreB = calculateEngagementScore(b.id);
                    return scoreB - scoreA;
                  })
                  .slice(0, 5)
                  .map((borrower, index) => {
                    const engagementScore = calculateEngagementScore(borrower.id);
                    const daysUntilExpiry = getDaysUntilExpiry(borrower.expiryDate);
                    return (
                      <div key={borrower.id} className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900' :
                            index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700' :
                            index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-orange-900' :
                            'bg-gradient-to-r from-purple-400 to-pink-400 text-white'
                          }`}>
                            {index + 1}
                          </div>
                          <Avatar>
                            <AvatarFallback className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-purple-700 dark:text-purple-300">
                              {getInitials(borrower.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">{borrower.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">ID: {borrower.id}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {engagementScore.toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">engagement</div>
                          {getStatusBadge(borrower.expiryDate)}
                        </div>
                      </div>
                    );
                  })}
                {(!filteredBorrowers?.filter(borrower => borrower.category === 'graduate').length || 
                  filteredBorrowers?.filter(borrower => borrower.category === 'graduate').length === 0) && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="p-4 bg-white/40 dark:bg-gray-800/40 rounded-lg border border-dashed border-purple-300 dark:border-purple-700">
                      <div className="text-purple-400 mb-2">
                        <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                        </svg>
                      </div>
                      <p className="text-sm">No graduate borrowers found</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={setSelectedCategory} className="mb-6">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
          {categories.map((category) => {
            const count = category.value === 'all' 
              ? allBorrowers?.length || 0
              : allBorrowers?.filter(borrower => borrower.category === category.value).length || 0;

            return (
              <TabsTrigger key={category.value} value={category.value}>
                {category.label} ({count})
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.value} value={category.value}>
            <h3 className="text-lg font-semibold mb-4 capitalize">
              {category.value === 'all' ? 'All Categories' : `${category.value} Stage`}
            </h3>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="relative max-w-xs w-full md:w-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant={showExpired ? "secondary" : "outline"}
                onClick={() => setShowExpired(!showExpired)}
                className="whitespace-nowrap"
              >
                {showExpired ? "Show All" : "Show Expired Only"}
              </Button>
            </div>

            <DataTable
              data={filteredBorrowers || []}
              columns={columns}
              searchable={false}
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
                    <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-hidden flex flex-col">
                      <DialogHeader className="flex-shrink-0 pb-2">
                        <DialogTitle>Edit Borrower</DialogTitle>
                      </DialogHeader>
                      <div className="flex-1 overflow-y-auto pr-2">
                        <BorrowerForm 
                          borrower={editingBorrower}
                          onSuccess={async () => {
                            setOpenEditDialog(false);
                            setEditingBorrower(null);
                            // Force immediate data refresh
                            setTimeout(async () => {
                              await refetchBorrowers();
                            }, 100);
                          }}
                          onCancel={() => {
                            setOpenEditDialog(false);
                            setEditingBorrower(null);
                          }}
                        />
                      </div>
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
                totalItems: filteredBorrowers?.length || 0,
                itemsPerPage: 10,
                currentPage: 1,
                onPageChange: () => {},
              }}
            />

            {category.value === 'all' && (
              <div className="mt-6">
                {formatBorrowerDistribution().length > 0 ? (
                  <ChartContainer
                    title="Borrowers Distribution by Category"
                    type="bar"
                    data={formatBorrowerDistribution()}
                    nameKey="name"
                    dataKey="value"
                    colors={[
                      '#22C55E',  // Green for Primary
                      '#EF4444',  // Red for Middle
                      '#F59E0B',  // Orange for Secondary
                      '#6366F1',  // Indigo for University
                      '#EC4899'   // Pink for Graduate
                    ]}
                    height={350}
                  />
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 h-[350px] flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">Borrowers Distribution by Category</h3>
                      <p className="text-gray-500 dark:text-gray-400">No borrower data available for chart display</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default BorrowersPage;