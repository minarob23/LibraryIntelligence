import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Users, Repeat, FileText } from 'lucide-react';
import StatsCard from '@/components/dashboard/stats-card';
import ChartContainer from '@/components/dashboard/chart-container';
import PopularBooks from '@/components/dashboard/popular-books';
import TopBorrowers from '@/components/dashboard/top-borrowers';
import BorrowingTrends from '@/components/dashboard/borrowing-trends';

const Dashboard = () => {
  const queryClient = useQueryClient();

  // Refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/most-borrowed-books'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/borrower-distribution'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/popular-books'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/top-borrowers'] });
    }, 30000);

    return () => clearInterval(interval);
  }, [queryClient]);

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/books'] });
    queryClient.invalidateQueries({ queryKey: ['/api/borrowers'] });
    queryClient.invalidateQueries({ queryKey: ['/api/borrowings'] });
    queryClient.invalidateQueries({ queryKey: ['/api/research'] });
    queryClient.invalidateQueries({ queryKey: ['/api/dashboard/most-borrowed-books'] });
    queryClient.invalidateQueries({ queryKey: ['/api/dashboard/borrower-distribution'] });
  };

  // Fetch dashboard statistics
  const { data: books } = useQuery({ 
    queryKey: ['/api/books'],
  });

  const { data: borrowers } = useQuery({ 
    queryKey: ['/api/borrowers'],
  });

  const { data: borrowings } = useQuery({ 
    queryKey: ['/api/borrowings'],
  });

  const { data: research } = useQuery({ 
    queryKey: ['/api/research'],
  });

  const { data: mostBorrowedBooks } = useQuery({ 
    queryKey: ['/api/dashboard/most-borrowed-books'],
  });

  const { data: borrowerDistribution } = useQuery({ 
    queryKey: ['/api/dashboard/borrower-distribution'],
  });

  // Format borrower growth data for chart
  const formatBorrowerGrowth = () => {
    if (!borrowers) return [];

    const monthlyGrowth = new Map();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Initialize last 6 months with 0
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      monthlyGrowth.set(monthKey, 0);
    }

    // Count borrowers per month based on join date
    borrowers.forEach((borrower: any) => {
      const date = new Date(borrower.joinedDate);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      if (monthlyGrowth.has(monthKey)) {
        monthlyGrowth.set(monthKey, monthlyGrowth.get(monthKey) + 1);
      }
    });

    return Array.from(monthlyGrowth.entries()).map(([month, count]) => ({
      month,
      count
    }));
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

  // Format most borrowed books data for chart
  const formatMostBorrowedBooks = () => {
    if (!mostBorrowedBooks) return [];

    return mostBorrowedBooks.map((book: any) => ({
      name: book.name,
      value: book.borrowCount,
    }));
  };

  return (
    <div>
      <div className="mb-6 animate-slide-up">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-gray-600 dark:text-gray-400">Overview of library statistics and activities</p>
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
            value={borrowers?.length || 0}
            icon={<Users className="h-6 w-6 text-green-500 dark:text-green-400" />}
            change={{ value: borrowers?.length || 0, trend: borrowers?.length > 0 ? 'up' : 'down', text: 'total' }}
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
        <ChartContainer
          title="Borrower Categories"
          type="doughnut"
          data={formatBorrowerDistribution()}
          nameKey="name"
          dataKey="value"
          colors={['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899']}
        />

        <ChartContainer
          title="Borrower's Growth"
          type="line"
          data={formatBorrowerGrowth()}
          nameKey="month"
          dataKey="count"
        />
      </div>

      {/* Borrowing Trends */}
      <div>
        <BorrowingTrends />
      </div>
    </div>
  );
};

export default Dashboard;