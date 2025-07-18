
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Star, Clock, TrendingUp } from 'lucide-react';

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
}

const TopBorrowersByEngagement = () => {
  const { data: borrowings } = useQuery<Borrowing[]>({
    queryKey: ['/api/borrowings'],
  });

  const { data: borrowers, isLoading } = useQuery<Borrower[]>({
    queryKey: ['/api/borrowers'],
  });

  const calculateEngagementScore = (borrowerId: number): number => {
    try {
      const allBorrowings = borrowings || [];
      const userBorrowings = allBorrowings.filter((b: Borrowing) => b.borrowerId === borrowerId);

      if (!userBorrowings.length) return 0;

      const totalBorrowings = userBorrowings.length;
      const activeBorrowings = userBorrowings.filter(b => b.status === 'borrowed').length;
      const returnedBorrowings = userBorrowings.filter(b => b.status === 'returned');
      const ratedBorrowings = userBorrowings.filter(b => b.rating).length;

      const onTimeBorrowings = returnedBorrowings.filter(b => {
        if (!b.returnDate) return false;
        const returnDate = new Date(b.returnDate);
        const dueDate = new Date(b.dueDate);
        return returnDate <= dueDate;
      }).length;

      const frequencyScore = Math.min(totalBorrowings / 3, 1) * 3;
      const timelinessScore = returnedBorrowings.length > 0 
        ? (onTimeBorrowings / returnedBorrowings.length) * 3 
        : 0;
      const ratingScore = (ratedBorrowings / totalBorrowings) * 2;
      const activityScore = (activeBorrowings / Math.max(1, totalBorrowings)) * 2;

      const totalScore = frequencyScore + timelinessScore + ratingScore + activityScore;
      return Math.min(totalScore, 10);
    } catch (error) {
      console.error('Error calculating engagement score:', error);
      return 0;
    }
  };

  const getEngagementMetrics = (borrowerId: number) => {
    const allBorrowings = borrowings || [];
    const userBorrowings = allBorrowings.filter((b: Borrowing) => b.borrowerId === borrowerId);
    
    if (!userBorrowings.length) return {
      totalBooks: 0,
      onTimeReturns: 0,
      ratings: 0,
      avgRating: 0
    };

    const returnedBorrowings = userBorrowings.filter(b => b.status === 'returned');
    const onTimeBorrowings = returnedBorrowings.filter(b => {
      if (!b.returnDate) return false;
      const returnDate = new Date(b.returnDate);
      const dueDate = new Date(b.dueDate);
      return returnDate <= dueDate;
    });
    
    const ratedBorrowings = userBorrowings.filter(b => b.rating);
    const avgRating = ratedBorrowings.length > 0 
      ? ratedBorrowings.reduce((sum, b) => sum + (b.rating || 0), 0) / ratedBorrowings.length 
      : 0;

    return {
      totalBooks: userBorrowings.length,
      onTimeReturns: returnedBorrowings.length > 0 ? Math.round((onTimeBorrowings.length / returnedBorrowings.length) * 100) : 0,
      ratings: ratedBorrowings.length,
      avgRating: Number(avgRating.toFixed(1))
    };
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const getEngagementLevel = (score: number) => {
    if (score >= 8) return { label: 'Excellent', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
    if (score >= 6) return { label: 'Good', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' };
    if (score >= 4) return { label: 'Average', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' };
    return { label: 'Low', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
  };

  const getScoreIcon = (score: number) => {
    if (score >= 8) return <Trophy className="h-4 w-4 text-yellow-500" />;
    if (score >= 6) return <Star className="h-4 w-4 text-blue-500" />;
    if (score >= 4) return <TrendingUp className="h-4 w-4 text-green-500" />;
    return <Clock className="h-4 w-4 text-gray-500" />;
  };

  const topBorrowersByEngagement = borrowers?.map((borrower: Borrower) => ({
    ...borrower,
    engagementScore: calculateEngagementScore(borrower.id),
    metrics: getEngagementMetrics(borrower.id)
  }))
  .sort((a, b) => {
    // Prioritize Graduate category borrowers
    if (a.category === 'graduate' && b.category !== 'graduate') return -1;
    if (b.category === 'graduate' && a.category !== 'graduate') return 1;
    return b.engagementScore - a.engagementScore;
  })
  .slice(0, 10);

  return (
    <Card className="border-none shadow-lg bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-300 dark:to-purple-300 bg-clip-text text-transparent flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top Borrowers by Engagement Score
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Ranked by frequency, timeliness, participation, and activity • Graduate students prioritized
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Borrower</TableHead>
              <TableHead>Engagement Score</TableHead>
              <TableHead>Performance Metrics</TableHead>
              <TableHead>Level</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-6 w-8" /></TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="ml-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16 mt-1" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-16 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : !topBorrowersByEngagement?.length ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No engagement data available
                </TableCell>
              </TableRow>
            ) : (
              topBorrowersByEngagement?.map((borrower: Borrower & { engagementScore: number; metrics: any }, index: number) => {
                const engagementLevel = getEngagementLevel(borrower.engagementScore);
                return (
                  <TableRow key={borrower.id} className={`${
                    borrower.category === 'graduate' 
                      ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-l-4 border-purple-400' 
                      : index < 3 
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20' 
                        : ''
                  }`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {index < 3 && (
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? 'bg-yellow-400 text-yellow-900' :
                            index === 1 ? 'bg-gray-300 text-gray-700' :
                            'bg-orange-400 text-orange-900'
                          }`}>
                            {index + 1}
                          </div>
                        )}
                        {index >= 3 && (
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-6 text-center">
                            {index + 1}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar>
                          <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-blue-700 dark:text-blue-300">
                            {getInitials(borrower.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium">{borrower.name}</div>
                            {borrower.category === 'graduate' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 dark:from-purple-900/30 dark:to-pink-900/30 dark:text-purple-300">
                                Graduate
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {borrower.category} • ID: {borrower.id}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getScoreIcon(borrower.engagementScore)}
                        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {borrower.engagementScore.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">/10</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span>{borrower.metrics.totalBooks} books borrowed</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span>{borrower.metrics.onTimeReturns}% on-time returns</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                          <span>{borrower.metrics.ratings} ratings given</span>
                          {borrower.metrics.avgRating > 0 && (
                            <span className="text-gray-500">({borrower.metrics.avgRating}★)</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={engagementLevel.color}>
                        {engagementLevel.label}
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

export default TopBorrowersByEngagement;
