import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Users, Repeat } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  // Format borrower growth data for chart by category
  const formatBorrowerGrowth = () => {
    if (!borrowers) return [];

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
        categoryData[category.toLowerCase()] = 0;
      });
      monthlyGrowth.push(categoryData);
    }

    // Count borrowers per month and category based on join date
    borrowers.forEach((borrower: any) => {
      const date = new Date(borrower.joinedDate);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      const monthData = monthlyGrowth.find(data => data.month === monthKey);
      if (monthData && borrower.category) {
        monthData[borrower.category.toLowerCase()]++;
      }
    });

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

        {!borrowers?.length ? (
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
            categories={['primary', 'middle', 'secondary', 'university', 'graduate']}
            colors={[
              '#22C55E',  // Green for Primary
              '#3B82F6',  // Blue for Middle 
              '#F59E0B',  // Amber for Secondary
              '#A855F7',  // Purple for University
              '#EC4899'   // Pink for Graduate
            ]}
            height={400}
          />
        )}
      </div>
            '#A855F7',  // Purple for University  
            '#EC4899'   // Pink for Graduate
          ]}
          height={400}
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