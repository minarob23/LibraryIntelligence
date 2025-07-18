import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Borrowing {
  id: number;
  borrowerId: number;
  status: string;
  returnDate?: string;
  dueDate: string;
  rating?: number;
}

interface Borrower {
  id: number;
  name: string;
  category: string;
  expiryDate: string;
  joinedDate: string;
  borrowCount?: number;
  engagementScore: number;
}

const TopBorrowers = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('engagement');

  const { data: borrowings } = useQuery<Borrowing[]>({
    queryKey: ['/api/borrowings'],
  });

  const calculateEngagementScore = (borrowerId: number): number => {
    try {
      // Get all borrowings
      const allBorrowings = borrowings || [];
      const userBorrowings = allBorrowings.filter((b: Borrowing) => b.borrowerId === borrowerId);

      if (!userBorrowings.length) return 0;

      // Calculate basic metrics
      const totalBorrowings = userBorrowings.length;
      const activeBorrowings = userBorrowings.filter(b => b.status === 'borrowed').length;
      const returnedBorrowings = userBorrowings.filter(b => b.status === 'returned');
      const ratedBorrowings = userBorrowings.filter(b => b.rating).length;

      // Calculate return timeliness
      const onTimeBorrowings = returnedBorrowings.filter(b => {
        if (!b.returnDate) return false;
        const returnDate = new Date(b.returnDate);
        const dueDate = new Date(b.dueDate);
        return returnDate <= dueDate;
      }).length;

      // Calculate frequency score (max 3 points)
      const frequencyScore = Math.min(totalBorrowings / 3, 1) * 3;

      // Calculate timeliness score (max 3 points)
      const timelinessScore = returnedBorrowings.length > 0 
        ? (onTimeBorrowings / returnedBorrowings.length) * 3 
        : 0;

      // Calculate rating participation (max 2 points)
      const ratingScore = (ratedBorrowings / totalBorrowings) * 2;

      // Calculate activity score (max 2 points)
      const activityScore = (activeBorrowings / Math.max(1, totalBorrowings)) * 2;

      // Calculate total score (max 10 points)
      const totalScore = frequencyScore + timelinessScore + ratingScore + activityScore;

      // Store in localStorage for persistence
      const engagementData = JSON.parse(localStorage.getItem('borrowerEngagement') || '{}');
      engagementData[borrowerId] = {
        totalBorrowings,
        activeBorrowings,
        onTimeBorrowings,
        ratedBorrowings,
        frequencyScore,
        timelinessScore,
        ratingScore,
        activityScore,
        totalScore: Math.min(totalScore, 10),
        updated: new Date().toISOString()
      };
      localStorage.setItem('borrowerEngagement', JSON.stringify(engagementData));

      const finalScore = Math.min(totalScore, 10);
      // Return score with 2 decimal places
      return Number(finalScore.toFixed(2));
    } catch (error) {
      console.error('Error calculating engagement score:', error);
      return 0;
    }
  };

  const { data: borrowers, isLoading } = useQuery<Borrower[]>({
    queryKey: ['/api/borrowers'],
    select: (data) => data?.map((borrower: Borrower) => ({
      ...borrower,
      engagementScore: calculateEngagementScore(borrower.id)
    }))
  });

  // Get initials from a name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Get color class for category
  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'primary':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'middle':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'secondary':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'university':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'graduate':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Get color class for status
  const getStatusColor = (daysUntilExpiry: number) => {
    if (daysUntilExpiry < 0) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    if (daysUntilExpiry < 30) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
  };

  // Get status text based on days until expiry
  const getStatusText = (daysUntilExpiry: number) => {
    if (daysUntilExpiry < 0) return 'Expired';
    if (daysUntilExpiry < 30) return 'Expiring Soon';
    return 'Active';
  };

  // Calculate days until expiry
  const getDaysUntilExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <Card className="border-none shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-300 dark:to-white bg-clip-text text-transparent">Top Borrowers</CardTitle>
          <Select defaultValue="engagement" onValueChange={(value) => setFilter(value as string)}>
            <SelectTrigger className="w-[150px] border-gray-200 dark:border-gray-700">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="engagement">Engagement Score</SelectItem>
              <SelectItem value="borrowing">Borrowing Times</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Borrower</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Books</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Skeleton loading state
              Array(4).fill(0).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="ml-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16 mt-1" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : !borrowers?.length ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No borrowers data available
                </TableCell>
              </TableRow>
            ) : (
              borrowers?.map((borrower: Borrower) => {
                const daysUntilExpiry = getDaysUntilExpiry(borrower.expiryDate);
                return (
                  <TableRow key={borrower.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar>
                          <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            {getInitials(borrower.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <div className="text-sm font-medium">{borrower.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">ID: {borrower.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${getCategoryColor(borrower.category)} px-3 py-1`}>
                        {borrower.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {filter === 'engagement' ? (
                        <div className="flex flex-col items-start gap-1">
                          <div className="flex items-center gap-2">
                            <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                              {isNaN(borrower.engagementScore) ? 0 : borrower.engagementScore}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">engagement score</div>
                          </div>
                          <div className="text-xs text-gray-400">
                            Last borrowed: {(() => {
                              const userBorrowings = borrowings?.filter((b: Borrowing) => b.borrowerId === borrower.id) || [];
                              const latestBorrowing = userBorrowings.reduce((latest: Borrowing | null, current: Borrowing) => {
                                if (!latest || new Date(current.borrowDate) > new Date(latest.borrowDate)) {
                                  return current;
                                }
                                return latest;
                              }, null);

                              if (!latestBorrowing) return 'Never borrowed';
                              const borrowDate = new Date(latestBorrowing.borrowDate);
                              return borrowDate.toLocaleDateString('en-US', { 
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              });
                            })()}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-start gap-1">
                          <div className="flex items-center gap-2">
                            <div className="text-lg font-bold bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
                              {borrower.borrowCount || 0}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">times borrowed</div>
                          </div>
                          <div className="text-xs text-gray-400">
                            Since: {new Date(borrower.joinedDate).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${getStatusColor(daysUntilExpiry)}`}>
                        {getStatusText(daysUntilExpiry)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TopBorrowers;