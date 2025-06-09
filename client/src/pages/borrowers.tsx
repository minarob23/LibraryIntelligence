import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Edit, Trash2, Plus, RefreshCw, Search, Trophy, Star, TrendingUp } from 'lucide-react';
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
import { Input } from "@/components/ui/input"

const categories = [
  { value: 'all', label: 'All' },
  { value: 'primary', label: 'Primary' },
  { value: 'middle', label: 'Middle' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'university', label: 'University' },
  { value: 'graduate', label: 'Graduate' },
];

// Top Borrowers by Engagement Score Component
const TopBorrowersEngagement = () => {
  const { data: allBorrowers } = useQuery({ queryKey: ['/api/borrowers'] });
  const { data: borrowings } = useQuery({ queryKey: ['/api/borrowings'] });

  const calculateEngagementScore = (borrowerId: number): number => {
    try {
      const userBorrowings = borrowings?.filter((b: any) => b.borrowerId === borrowerId) || [];
      
      if (!userBorrowings.length) return 0;

      const totalBorrowings = userBorrowings.length;
      const activeBorrowings = userBorrowings.filter(b => b.status === 'borrowed').length;
      const returnedBorrowings = userBorrowings.filter(b => b.status === 'returned');
      const ratedBorrowings = userBorrowings.filter(b => b.rating).length;

      const onTimeBorrowings = returnedBorrowings.filter(b => {
        const returnDate = new Date(b.returnDate);
        const dueDate = new Date(b.dueDate);
        return returnDate <= dueDate;
      }).length;

      // Calculate scores (max 10 points total)
      const frequencyScore = Math.min(totalBorrowings / 3, 1) * 3; // max 3 points
      const timelinessScore = returnedBorrowings.length > 0 
        ? (onTimeBorrowings / returnedBorrowings.length) * 3 
        : 0; // max 3 points
      const ratingScore = (ratedBorrowings / totalBorrowings) * 2; // max 2 points
      const activityScore = (activeBorrowings / Math.max(1, totalBorrowings)) * 2; // max 2 points

      const totalScore = frequencyScore + timelinessScore + ratingScore + activityScore;
      return Number(Math.min(totalScore, 10).toFixed(2));
    } catch (error) {
      console.error('Error calculating engagement score:', error);
      return 0;
    }
  };

  const topBorrowers = allBorrowers
    ?.map((borrower: any) => ({
      ...borrower,
      engagementScore: calculateEngagementScore(borrower.id),
      totalBorrowings: borrowings?.filter((b: any) => b.borrowerId === borrower.id).length || 0
    }))
    .sort((a: any, b: any) => b.engagementScore - a.engagementScore)
    .slice(0, 10) || [];

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 dark:text-green-400';
    if (score >= 6) return 'text-blue-600 dark:text-blue-400';
    if (score >= 4) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 8) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    if (score >= 6) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    if (score >= 4) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold">Top Borrowers by Engagement Score</h3>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          <TrendingUp className="h-3 w-3 mr-1" />
          Top 10
        </Badge>
      </div>
      
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4" />
          <span>Engagement score is calculated based on borrowing frequency, return timeliness, rating participation, and current activity (max 10 points)</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 font-medium text-gray-700 dark:text-gray-300">Rank</th>
              <th className="text-left py-2 font-medium text-gray-700 dark:text-gray-300">Borrower</th>
              <th className="text-left py-2 font-medium text-gray-700 dark:text-gray-300">Category</th>
              <th className="text-left py-2 font-medium text-gray-700 dark:text-gray-300">Total Books</th>
              <th className="text-left py-2 font-medium text-gray-700 dark:text-gray-300">Engagement Score</th>
              <th className="text-left py-2 font-medium text-gray-700 dark:text-gray-300">Performance</th>
            </tr>
          </thead>
          <tbody>
            {topBorrowers.map((borrower: any, index: number) => (
              <tr key={borrower.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="py-3">
                  <div className="flex items-center">
                    {index === 0 && <Trophy className="h-4 w-4 text-yellow-500 mr-1" />}
                    {index === 1 && <Trophy className="h-4 w-4 text-gray-400 mr-1" />}
                    {index === 2 && <Trophy className="h-4 w-4 text-amber-600 mr-1" />}
                    <span className="font-medium">#{index + 1}</span>
                  </div>
                </td>
                <td className="py-3">
                  <div className="flex items-center">
                    <Avatar>
                      <AvatarFallback className={getAvatarColor(borrower.category)}>
                        {getInitials(borrower.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <div className="text-sm font-medium">{borrower.name}</div>
                      <div className="text-xs text-gray-500">ID: {borrower.memberId || `BRW-${borrower.id}`}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3">
                  <span className="capitalize text-sm">{borrower.category}</span>
                </td>
                <td className="py-3">
                  <span className="text-sm font-medium">{borrower.totalBorrowings}</span>
                </td>
                <td className="py-3">
                  <div className="flex items-center space-x-2">
                    <span className={`text-lg font-bold ${getScoreColor(borrower.engagementScore)}`}>
                      {borrower.engagementScore}
                    </span>
                    <span className="text-xs text-gray-500">/ 10</span>
                  </div>
                </td>
                <td className="py-3">
                  <Badge variant="outline" className={getScoreBadge(borrower.engagementScore)}>
                    {borrower.engagementScore >= 8 ? 'Excellent' : 
                     borrower.engagementScore >= 6 ? 'Good' : 
                     borrower.engagementScore >= 4 ? 'Average' : 'Needs Improvement'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {topBorrowers.length === 0 && (
        <div className="text-center py-8">
          <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400">No borrowing data available for engagement scoring</p>
        </div>
      )}
    </div>
  );
};

// Calculate days until expiry
const getDaysUntilExpiry = (expiryDate: string) => {
  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
              <div className="mt-6 space-y-6">
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

                <TopBorrowersEngagement />
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default BorrowersPage;