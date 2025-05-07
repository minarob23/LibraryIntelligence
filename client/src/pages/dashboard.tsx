import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Users, Repeat, FileText } from 'lucide-react';
import StatsCard from '@/components/dashboard/stats-card';
import ChartContainer from '@/components/dashboard/chart-container';
import PopularBooks from '@/components/dashboard/popular-books';
import TopBorrowers from '@/components/dashboard/top-borrowers';

const Dashboard = () => {
  const queryClient = useQueryClient();

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
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-gray-600 dark:text-gray-400">Overview of library statistics and activities</p>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Books"
          value={books?.length || 0}
          icon={<BookOpen className="h-5 w-5 text-blue-500 dark:text-blue-400" />}
          change={{ value: books?.length || 0, trend: books?.length > 0 ? 'up' : 'down', text: 'total' }}
          iconColor="text-blue-500 dark:text-blue-400"
        />
        
        <StatsCard
          title="Active Borrowers"
          value={borrowers?.length || 0}
          icon={<Users className="h-5 w-5 text-green-500 dark:text-green-400" />}
          change={{ value: borrowers?.length || 0, trend: borrowers?.length > 0 ? 'up' : 'down', text: 'total' }}
          iconColor="text-green-500 dark:text-green-400"
        />
        
        <StatsCard
          title="Books Borrowed"
          value={borrowings?.length || 0}
          icon={<Repeat className="h-5 w-5 text-purple-500 dark:text-purple-400" />}
          change={{ value: borrowings?.length || 0, trend: borrowings?.length > 0 ? 'up' : 'down', text: 'total' }}
          iconColor="text-purple-500 dark:text-purple-400"
        />
        
        <StatsCard
          title="Research Papers"
          value={research?.length || 0}
          icon={<FileText className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />}
          change={{ value: research?.length || 0, trend: research?.length > 0 ? 'up' : 'down', text: 'total' }}
          iconColor="text-yellow-500 dark:text-yellow-400"
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartContainer
          title="Most Borrowed Books"
          type="bar"
          data={formatMostBorrowedBooks()}
          nameKey="name"
          dataKey="value"
        />
        
        <ChartContainer
          title="Borrower Categories"
          type="doughnut"
          data={formatBorrowerDistribution()}
          nameKey="name"
          dataKey="value"
          colors={['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899']}
        />
      </div>
      
      {/* Popular Books & Top Borrowers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PopularBooks />
        <TopBorrowers />
      </div>
    </div>
  );
};

export default Dashboard;
