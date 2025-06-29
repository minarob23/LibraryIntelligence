import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Users, Repeat, Plus, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import StatsCard from '@/components/dashboard/stats-card';
import ChartContainer from '@/components/dashboard/chart-container';
import PopularBooks from '@/components/dashboard/popular-books';
import TopBorrowers from '@/components/dashboard/top-borrowers';
import BorrowingTrends from '@/components/dashboard/borrowing-trends';
import BookRecommendations from '@/components/dashboard/book-recommendations';
import BorrowForm from '@/components/forms/borrow-form';
import MembershipForm from '@/components/forms/membership-form';

const Dashboard = () => {
  const queryClient = useQueryClient();
  const [openBorrowDialog, setOpenBorrowDialog] = useState(false);
  const [openMemberDialog, setOpenMemberDialog] = useState(false);

  // Prevent any automatic data manipulation on mount
  useEffect(() => {
    // Only run once to prevent data corruption on refresh
    const hasRun = sessionStorage.getItem('dashboard-initialized');
    if (!hasRun) {
      sessionStorage.setItem('dashboard-initialized', 'true');
    }
  }, []);

  const refreshData = () => {
    // Invalidate specific queries instead of full page reload
    queryClient.invalidateQueries({ queryKey: ['/api/books'] });
    queryClient.invalidateQueries({ queryKey: ['/api/borrowers'] });
    queryClient.invalidateQueries({ queryKey: ['/api/borrowings'] });
    queryClient.invalidateQueries({ queryKey: ['/api/research'] });
    queryClient.invalidateQueries({ queryKey: ['/api/dashboard/most-borrowed-books'] });
    queryClient.invalidateQueries({ queryKey: ['/api/dashboard/borrower-distribution'] });
    queryClient.invalidateQueries({ queryKey: ['/api/dashboard/member-growth'] });
    queryClient.invalidateQueries({ queryKey: ['/api/dashboard/popular-books'] });
    queryClient.invalidateQueries({ queryKey: ['/api/dashboard/top-borrowers'] });
  };

  // Fetch dashboard statistics with error handling
  const { data: books } = useQuery({ 
    queryKey: ['/api/books'],
    retry: 1,
    onError: (error) => console.log('Books query error:', error),
  });

  const { data: borrowers } = useQuery({ 
    queryKey: ['/api/borrowers'],
    retry: 1,
    onError: (error) => console.log('Borrowers query error:', error),
  });

  const { data: memberGrowthData } = useQuery({ 
    queryKey: ['/api/dashboard/member-growth'],
    retry: 1,
    onError: (error) => console.log('Member growth query error:', error),
  });

  const { data: borrowings } = useQuery({ 
    queryKey: ['/api/borrowings'],
    retry: 1,
    onError: (error) => console.log('Borrowings query error:', error),
  });

  const { data: research } = useQuery({ 
    queryKey: ['/api/research'],
    retry: 1,
    onError: (error) => console.log('Research query error:', error),
  });

  const { data: mostBorrowedBooks } = useQuery({ 
    queryKey: ['/api/dashboard/most-borrowed-books'],
    retry: 1,
    onError: (error) => console.log('Most borrowed books query error:', error),
  });

  const { data: borrowerDistribution } = useQuery({ 
    queryKey: ['/api/dashboard/borrower-distribution'],
    retry: 1,
    onError: (error) => console.log('Borrower distribution query error:', error),
  });

  // Format borrower growth data for chart by category
  const formatBorrowerGrowth = () => {
    const growthBorrowers = memberGrowthData || borrowers;
    if (!growthBorrowers) return [];

    const monthlyGrowth: { month: string; [key: string]: any }[] = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const categories = ['Primary', 'Middle', 'Secondary', 'University', 'Graduate'];

    // Initialize last 6 months with 0 for each category
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      const categoryData: any = { month: monthKey };
      categories.forEach(category => {
        categoryData[category] = 0;
      });
      monthlyGrowth.push(categoryData);
    }

    // Count new borrowers by category for each month
    if (growthBorrowers && Array.isArray(growthBorrowers)) {
      growthBorrowers.forEach((borrower: any) => {
        if (borrower.joinedDate) {
          const joinedDate = new Date(borrower.joinedDate);
          const borrowerMonth = joinedDate.getMonth();
          const borrowerYear = joinedDate.getFullYear();

          // Only count borrowers from the last 6 months
          const cutoffDate = new Date();
          cutoffDate.setMonth(cutoffDate.getMonth() - 5);
          cutoffDate.setDate(1);

          if (joinedDate >= cutoffDate) {
            // Find the matching month in our data
            const monthKey = `${monthNames[borrowerMonth]} ${borrowerYear}`;
            const monthData = monthlyGrowth.find(m => m.month === monthKey);

            if (monthData) {
              const category = borrower.category || 'primary';
              const categoryKey = category.charAt(0).toUpperCase() + category.slice(1);
              if (categories.includes(categoryKey)) {
                monthData[categoryKey] = (monthData[categoryKey] || 0) + 1;
              }
            }
          }
        }
      });
    }

    return monthlyGrowth;
  };

  // Format borrower distribution data for chart
  const formatBorrowerDistribution = () => {
    if (!borrowerDistribution) return [];

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

  return (
    <div>
      <div className="mb-6 animate-slide-up">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400">Overview of library statistics and activities</p>
          </div>
          <div className="flex gap-3">
            <Dialog open={openBorrowDialog} onOpenChange={setOpenBorrowDialog}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Borrow
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                  <DialogTitle>New Borrowing Record</DialogTitle>
                </DialogHeader>
                <BorrowForm 
                  onSuccess={() => setOpenBorrowDialog(false)} 
                  onCancel={() => setOpenBorrowDialog(false)} 
                />
              </DialogContent>
            </Dialog>

            <Dialog open={openMemberDialog} onOpenChange={setOpenMemberDialog}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Users className="mr-2 h-4 w-4" />
                  New Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle>Membership Registration</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto pr-2">
                  <MembershipForm 
                    onSuccess={() => setOpenMemberDialog(false)} 
                    onCancel={() => setOpenMemberDialog(false)} 
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatsCard
            title="Books Borrowed"
            value={borrowings?.length || 0}
            icon={<Repeat className="h-6 w-6 text-purple-500 dark:text-purple-400" />}
            change={{ value: borrowings?.length || 0, trend: borrowings?.length > 0 ? 'up' : 'down', text: 'total' }}
            iconColor="text-purple-500 dark:text-purple-400"
          />

          <StatsCard
            title="Active Borrowers"
            value={borrowers?.filter(borrower => {
              const expiryDate = new Date(borrower.expiryDate);
              const today = new Date();
              return expiryDate >= today;
            }).length || 0}
            icon={<Users className="h-6 w-6 text-green-500 dark:text-green-400" />}
            change={{ 
              value: borrowers?.filter(borrower => {
                const expiryDate = new Date(borrower.expiryDate);
                const today = new Date();
                return expiryDate >= today;
              }).length || 0, 
              trend: borrowers?.filter(borrower => {
                const expiryDate = new Date(borrower.expiryDate);
                const today = new Date();
                return expiryDate >= today;
              }).length > 0 ? 'up' : 'down', 
              text: 'active members' 
            }}
            iconColor="text-green-500 dark:text-green-400"
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <PopularBooks />
        <TopBorrowers />
      </div>

      {/* Categories & Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {!borrowerDistribution?.length ? (
          <Card className="p-6">
            <CardTitle>Borrower Categories</CardTitle>
            <div className="flex items-center justify-center h-[400px] text-gray-500 dark:text-gray-400">
              No category data available
            </div>
          </Card>
        ) : (
          <ChartContainer
            title="Borrower Categories"
            type="pie"
            data={formatBorrowerDistribution()}
            nameKey="name"
            dataKey="value"
            colors={['#22C55E', '#3B82F6', '#F59E0B', '#A855F7', '#EC4899']}
            height={400}
          />
        )}

        {!memberGrowthData?.length && !borrowers?.length ? (
          <Card className="p-6">
            <CardTitle>Member's Growth</CardTitle>
            <div className="flex items-center justify-center h-[400px] text-gray-500 dark:text-gray-400">
              No growth data available
            </div>
          </Card>
        ) : (
          <ChartContainer
            title="Member's Growth"
            type="bar"
            data={formatBorrowerGrowth()}
            nameKey="month"
            categories={['Primary', 'Middle', 'Secondary', 'University', 'Graduate']}
            colors={[
              '#22C55E',
              '#3B82F6',
              '#F59E0B',
              '#A855F7',
              '#EC4899'
            ]}
            height={400}
          />
        )}
      </div>

      {/* Book Recommendations */}
      <div className="mb-6">
        <BookRecommendations />
      </div>

      {/* Borrowing Trends */}
      <div>
        <BorrowingTrends />
      </div>
    </div>
  );
};

export default Dashboard;