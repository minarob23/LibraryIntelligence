import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import coverImage1 from '@/assets/book-covers/cover1.svg';
import coverImage2 from '@/assets/book-covers/cover2.svg';
import coverImage3 from '@/assets/book-covers/cover3.svg';
import coverImage4 from '@/assets/book-covers/cover4.svg';

type FilterType = 'rating' | 'random' | 'borrowed';

const PopularBooks = () => {
  const [filter, setFilter] = useState<FilterType>('rating');
  
  const { data: books, isLoading } = useQuery({
    queryKey: ['/api/dashboard/popular-books'],
    select: (data) => {
      // Map local SVGs to the cover images
      return data.map((book: any, index: number) => {
        const coverImages = [coverImage1, coverImage2, coverImage3, coverImage4];
        return {
          ...book,
          coverImage: coverImages[index % coverImages.length]
        };
      });
    }
  });

  const handleFilterChange = (value: string) => {
    setFilter(value as FilterType);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Popular Books</CardTitle>
          <Select value={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">By Rating</SelectItem>
              <SelectItem value="random">Random</SelectItem>
              <SelectItem value="borrowed">Most Borrowed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            // Skeleton loading state
            Array(4).fill(0).map((_, index) => (
              <div key={index} className="flex space-x-3">
                <Skeleton className="w-16 h-24" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2 w-20" />
                </div>
              </div>
            ))
          ) : (
            books?.map((book: any) => (
              <div key={book.id} className="flex space-x-3">
                <img 
                  className="w-16 h-24 object-cover rounded" 
                  src={book.coverImage} 
                  alt={`Cover of ${book.name}`} 
                />
                <div>
                  <h4 className="font-medium">{book.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{book.author}</p>
                  <div className="flex items-center mt-1">
                    <div className="flex text-yellow-400">
                      {renderStars(parseFloat(book.rating))}
                    </div>
                    <span className="text-xs ml-1 text-gray-600 dark:text-gray-400">
                      {book.rating}/5
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to render stars based on rating
const renderStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const remainingStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  // Full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(<StarFull key={`full-${i}`} />);
  }
  
  // Half star if needed
  if (hasHalfStar) {
    stars.push(<StarHalf key="half" />);
  }
  
  // Empty stars
  for (let i = 0; i < remainingStars; i++) {
    stars.push(<StarEmpty key={`empty-${i}`} />);
  }
  
  return stars;
};

const StarFull = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const StarHalf = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    <path d="M12 17.27V5.6L9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="none" />
  </svg>
);

const StarEmpty = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

export default PopularBooks;
