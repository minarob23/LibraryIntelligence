import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const TopBorrowers = () => {
  const [filter, setFilter] = useState('engagement');

  const calculateEngagementScore = (borrowCount: number, lastBorrowDate: string) => {
    const daysSinceLastBorrow = Math.floor((new Date().getTime() - new Date(lastBorrowDate).getTime()) / (1000 * 3600 * 24));
    return Math.round(((borrowCount * 10 + (100 - Math.min(daysSinceLastBorrow, 100))) / 40) * 10) / 10;
  };
  const { data: borrowers, isLoading } = useQuery({
    queryKey: ['/api/dashboard/top-borrowers'],
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
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Top Borrowers</CardTitle>
          <Select defaultValue="engagement" onValueChange={(value) => setFilter(value as string)}>
            <SelectTrigger className="w-[150px]">
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
            ) : (
              borrowers?.map((borrower: any) => {
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
                    <TableCell className="whitespace-nowrap text-sm capitalize">{borrower.category}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {filter === 'engagement' 
                        ? `Engagement Score: ${calculateEngagementScore(borrower.borrowCount || 0, borrower.lastBorrowDate)}`
                        : `Times Borrowed: ${borrower.borrowCount || 0}`}
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
