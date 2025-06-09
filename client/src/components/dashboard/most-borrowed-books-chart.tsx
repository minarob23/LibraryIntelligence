
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/lib/hooks/use-theme';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const MostBorrowedBooksChart = () => {
  const { theme } = useTheme();
  
  const { data: borrowings } = useQuery({ 
    queryKey: ['/api/borrowings'],
  });

  const { data: books } = useQuery({ 
    queryKey: ['/api/books'],
  });

  const getMostBorrowedBooksData = () => {
    if (!borrowings || !books) return [];
    
    // Count borrowings per book (last 6 months)
    const bookBorrowCounts: { [bookId: string]: number } = {};
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    borrowings.forEach((borrowing: any) => {
      if (!borrowing.borrowDate || !borrowing.bookId) return;
      
      const borrowDate = new Date(borrowing.borrowDate);
      if (borrowDate >= sixMonthsAgo) {
        if (!bookBorrowCounts[borrowing.bookId]) {
          bookBorrowCounts[borrowing.bookId] = 0;
        }
        bookBorrowCounts[borrowing.bookId]++;
      }
    });

    // Get top 8 most borrowed books
    const bookData = Object.entries(bookBorrowCounts)
      .map(([bookId, count]) => {
        const book = books.find((b: any) => b.id === parseInt(bookId));
        if (book) {
          const bookName = book.title || book.name || `Unknown Book`;
          // Truncate long titles for better display
          const displayName = bookName.length > 30 ? bookName.substring(0, 30) + '...' : bookName;
          
          return {
            name: displayName,
            fullName: bookName,
            borrowCount: count,
            author: book.author || 'Unknown Author'
          };
        }
        return null;
      })
      .filter(item => item !== null)
      .sort((a, b) => b.borrowCount - a.borrowCount)
      .slice(0, 8);

    return bookData;
  };

  const chartData = getMostBorrowedBooksData();
  const colors = ['#22C55E', '#3B82F6', '#F59E0B', '#A855F7', '#EC4899', '#10B981', '#8B5CF6', '#F97316'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{data.fullName}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">by {data.author}</p>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
            {data.borrowCount} borrowings
          </p>
        </div>
      );
    }
    return null;
  };

  return !borrowings?.length || !books?.length ? (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Most Borrowed Books</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-[400px] text-gray-500 dark:text-gray-400">
          No borrowing data available
        </div>
      </CardContent>
    </Card>
  ) : (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Most Borrowed Books</CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Top borrowed books in the last 6 months
        </p>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[400px] text-gray-500 dark:text-gray-400">
            No books borrowed in the last 6 months
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              layout="horizontal"
              margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#f1f1f1'} />
              <XAxis 
                type="number"
                tick={{ fill: theme === 'dark' ? '#9CA3AF' : '#6B7280', fontSize: 12 }} 
                axisLine={{ stroke: theme === 'dark' ? '#4B5563' : '#E5E7EB' }}
              />
              <YAxis 
                type="category"
                dataKey="name"
                tick={{ fill: theme === 'dark' ? '#9CA3AF' : '#6B7280', fontSize: 11 }}
                axisLine={{ stroke: theme === 'dark' ? '#4B5563' : '#E5E7EB' }}
                width={120}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="borrowCount" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default MostBorrowedBooksChart;
