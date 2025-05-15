
import { useQuery } from '@tanstack/react-query';
import ChartContainer from './chart-container';

const BorrowingTrends = () => {
  const { data: borrowings } = useQuery({ 
    queryKey: ['/api/borrowings'],
  });

  const getMonthlyData = () => {
    if (!borrowings) return [];
    
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
    borrowings.forEach((borrowing: any) => {
      const borrowDate = new Date(borrowing.borrowDate);
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

  return (
    <ChartContainer
      title="Borrowing Trends"
      type="line"
      data={getMonthlyData()}
      nameKey="name"
      categories={['borrowed', 'returned']}
      colors={['#3B82F6', '#10B981']}
      height={350}
    />
  );
};

export default BorrowingTrends;
