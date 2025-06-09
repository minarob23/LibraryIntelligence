
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/lib/hooks/use-theme';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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
    
    // Count borrowings per book
    const bookBorrowCounts: { [bookId: string]: number } = {};
    
    borrowings.forEach((borrowing: any) => {
      if (!borrowing.bookId) return;
      
      if (!bookBorrowCounts[borrowing.bookId]) {
        bookBorrowCounts[borrowing.bookId] = 0;
      }
      
      bookBorrowCounts[borrowing.bookId]++;
    });

    // Get top 8 most borrowed books for better visualization
    const bookData = Object.entries(bookBorrowCounts)
      .map(([bookId, count]) => {
        const book = books.find((b: any) => b.id === parseInt(bookId));
        if (book) {
          const bookName = book.title || book.name || `Unknown Book`;
          const shortName = bookName.length > 20 ? bookName.substring(0, 20) + '...' : bookName;
          
          return {
            name: shortName,
            fullName: bookName,
            borrowCount: count,
            category: book.category || 'General'
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => b.borrowCount - a.borrowCount)
      .slice(0, 8);

    return bookData;
  };

  const chartData = getMostBorrowedBooksData();

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{data.fullName}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Category: {data.category}</p>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
            Borrowed: {data.borrowCount} times
          </p>
        </div>
      );
    }
    return null;
  };

  return !borrowings?.length || !books?.length ? (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          Most Borrowed Books
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-[350px] text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="mt-2">No borrowing data available</p>
          </div>
        </div>
      </CardContent>
    </Card>
  ) : (
    <Card className="h-full border-none shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-blue-900">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-lg">
            <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          Most Borrowed Books
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Top performing books ranked by borrowing frequency
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart 
            data={chartData} 
            margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
            barCategoryGap="15%"
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} 
              opacity={0.3}
            />
            <XAxis 
              dataKey="name" 
              tick={{ 
                fill: theme === 'dark' ? '#9CA3AF' : '#6B7280', 
                fontSize: 11,
                angle: -45,
                textAnchor: 'end'
              }} 
              axisLine={{ stroke: theme === 'dark' ? '#4B5563' : '#D1D5DB' }}
              tickLine={{ stroke: theme === 'dark' ? '#4B5563' : '#D1D5DB' }}
              height={60}
            />
            <YAxis 
              tick={{ 
                fill: theme === 'dark' ? '#9CA3AF' : '#6B7280', 
                fontSize: 12 
              }} 
              axisLine={{ stroke: theme === 'dark' ? '#4B5563' : '#D1D5DB' }}
              tickLine={{ stroke: theme === 'dark' ? '#4B5563' : '#D1D5DB' }}
              label={{ 
                value: 'Times Borrowed', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: theme === 'dark' ? '#9CA3AF' : '#6B7280' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="borrowCount" 
              radius={[4, 4, 0, 0]}
              fill="url(#colorGradient)"
            >
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#1E40AF" />
                </linearGradient>
              </defs>
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default MostBorrowedBooksChart;
