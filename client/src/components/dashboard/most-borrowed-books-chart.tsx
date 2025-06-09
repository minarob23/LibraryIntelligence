
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/lib/hooks/use-theme';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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
    
    // Get last 6 months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = [];
    const today = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      monthlyData.push({
        month: monthKey,
      });
    }

    // Count borrowings per book per month
    const bookBorrowCounts: { [bookId: string]: { [month: string]: number } } = {};
    
    borrowings.forEach((borrowing: any) => {
      if (!borrowing.borrowDate || !borrowing.bookId) return;
      
      const borrowDate = new Date(borrowing.borrowDate);
      const monthKey = `${monthNames[borrowDate.getMonth()]} ${borrowDate.getFullYear()}`;
      
      if (!bookBorrowCounts[borrowing.bookId]) {
        bookBorrowCounts[borrowing.bookId] = {};
      }
      
      if (!bookBorrowCounts[borrowing.bookId][monthKey]) {
        bookBorrowCounts[borrowing.bookId][monthKey] = 0;
      }
      
      bookBorrowCounts[borrowing.bookId][monthKey]++;
    });

    // Get top 5 most borrowed books
    const bookTotals = Object.entries(bookBorrowCounts).map(([bookId, monthData]) => ({
      bookId,
      total: Object.values(monthData).reduce((sum: number, count: number) => sum + count, 0)
    }));

    const topBooks = bookTotals
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // Add book data to monthly data
    monthlyData.forEach(monthData => {
      topBooks.forEach(({ bookId }) => {
        const book = books.find((b: any) => b.id === parseInt(bookId));
        if (book) {
          const bookName = book.title || book.name || `Unknown Book`;
          const shortName = bookName.length > 25 ? bookName.substring(0, 25) + '...' : bookName;
          
          monthData[shortName] = bookBorrowCounts[bookId]?.[monthData.month] || 0;
        }
      });
    });

    return monthlyData;
  };

  const chartData = getMostBorrowedBooksData();
  const colors = ['#22C55E', '#3B82F6', '#F59E0B', '#A855F7', '#EC4899'];

  // Get the book names for the legend (excluding 'month')
  const bookNames = chartData.length > 0 
    ? Object.keys(chartData[0]).filter(key => key !== 'month')
    : [];

  return !borrowings?.length || !books?.length ? (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Most Borrowed Books Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-[350px] text-gray-500 dark:text-gray-400">
          No borrowing data available
        </div>
      </CardContent>
    </Card>
  ) : (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Most Borrowed Books Trends</CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Monthly borrowing trends for top 5 most borrowed books
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#f1f1f1'} />
            <XAxis 
              dataKey="month" 
              tick={{ fill: theme === 'dark' ? '#9CA3AF' : '#6B7280', fontSize: 12 }} 
              axisLine={{ stroke: theme === 'dark' ? '#4B5563' : '#E5E7EB' }}
            />
            <YAxis 
              tick={{ fill: theme === 'dark' ? '#9CA3AF' : '#6B7280', fontSize: 12 }} 
              axisLine={{ stroke: theme === 'dark' ? '#4B5563' : '#E5E7EB' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: theme === 'dark' ? '#1F2937' : '#FFF',
                borderColor: theme === 'dark' ? '#4B5563' : '#E5E7EB',
                color: theme === 'dark' ? '#F9FAFB' : '#111827',
                fontSize: '12px'
              }} 
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              wrapperStyle={{ fontSize: '12px' }}
              formatter={(value) => <span style={{ color: theme === 'dark' ? '#E5E7EB' : '#4B5563' }}>{value}</span>}
            />
            {bookNames.map((bookName, index) => (
              <Area
                key={bookName}
                type="monotone"
                dataKey={bookName}
                stackId="1"
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.6}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default MostBorrowedBooksChart;
