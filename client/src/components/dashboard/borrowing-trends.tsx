
import { useQuery } from '@tanstack/react-query';
import ChartContainer from './chart-container';
import { Card, CardTitle } from '@/components/ui/card';

import { Borrowing } from '@/../../shared/schema';

const BorrowingTrends = () => {
  const { data: borrowings } = useQuery<Borrowing[]>({ 
    queryKey: ['/api/borrowings'],
  });

  const getMonthlyData = () => {
    if (!borrowings || !Array.isArray(borrowings)) return [];
    
    const monthlyData = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize last 6 months with 0
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      monthlyData.push({
        name: monthKey,
        borrowed: 0,
        returned: 0
      });
    }

    // Count borrowings per month
    borrowings.forEach((borrowing: Borrowing) => {
      if (!borrowing || !borrowing.borrowDate) return;
      
      const borrowDate = new Date(borrowing.borrowDate);
      
      // Ensure the date is valid
      if (isNaN(borrowDate.getTime())) return;
      
      const monthKey = `${monthNames[borrowDate.getMonth()]} ${borrowDate.getFullYear()}`;
      const monthData = monthlyData.find(data => data.name === monthKey);
      if (monthData) {
        monthData.borrowed++;
        if (borrowing.returnDate) {
          monthData.returned++;
        }
      }
    });

    return monthlyData;
  };

  const monthlyData = getMonthlyData();
  
  return !(borrowings as any[])?.length ? (
    <Card className="p-6">
      <CardTitle>Borrowing Trends</CardTitle>
      <div className="flex items-center justify-center h-[350px] text-gray-500 dark:text-gray-400">
        No borrowing data available
      </div>
    </Card>
  ) : (
    <ChartContainer
      title="Borrowing Trends"
      type="line"
      data={monthlyData}
      nameKey="name"
      categories={['borrowed']}
      colors={['#3B82F6']}
      height={350}
    />
  );
};

export default BorrowingTrends;
