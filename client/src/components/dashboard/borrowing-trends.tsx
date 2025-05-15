
import { useQuery } from '@tanstack/react-query';
import ChartContainer from './chart-container';

const BorrowingTrends = () => {
  const { data: borrowings } = useQuery({ 
    queryKey: ['/api/borrowings'],
  });

  const getMonthlyData = () => {
    if (!borrowings) return [];
    
    const monthlyData = new Map();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize last 12 months with 0
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      monthlyData.set(monthKey, 0);
    }

    // Count borrowings per month
    borrowings.forEach((borrowing: any) => {
      const date = new Date(borrowing.borrowDate);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      if (monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, monthlyData.get(monthKey) + 1);
      }
    });

    return Array.from(monthlyData.entries()).map(([name, value]) => ({
      name,
      value
    }));
  };

  return (
    <ChartContainer
      title="Borrowing Trends"
      type="line"
      data={getMonthlyData()}
      nameKey="name"
      dataKey="value"
      height={350}
      colors={['#3B82F6']}
    />
  );
};

export default BorrowingTrends;
