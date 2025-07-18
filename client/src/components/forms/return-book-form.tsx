import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from '@/components/ui/star-rating';
import { BookOpen, Star } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';

const returnBookSchema = z.object({
  rating: z.number().min(1, 'Please provide a rating').max(10, 'Rating cannot exceed 10'),
  review: z.string().optional(),
});

type ReturnBookFormValues = z.infer<typeof returnBookSchema>;

interface ReturnBookFormProps {
  borrowing: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ReturnBookForm = ({ borrowing, onSuccess, onCancel }: ReturnBookFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ReturnBookFormValues>({
    resolver: zodResolver(returnBookSchema),
  });

  const onSubmit = async (data: ReturnBookFormValues) => {
    setIsSubmitting(true);
    try {
      // Import removed - using direct database operations instead

      // Update the borrowing record with return date and rating
      //const updatedBorrowing = localStorage_storage.updateBorrowing(borrowing.id, {
      //  returnDate: new Date().toISOString(),
      //  rating: data.rating,
      //  review: data.review || '',
      //  status: 'returned'
      //});

      //if (updatedBorrowing) {
      //  await queryClient.invalidateQueries({ queryKey: ['/api/borrowings'] });
      //  await queryClient.invalidateQueries({ queryKey: ['/api/books'] });

      //  toast({
      //    title: 'Success',
      //    description: 'Book returned successfully and rating submitted!',
      //  });

      //  onSuccess?.();
      //} else {
      //  throw new Error('Borrowing record not found');
      //}
      const updatedBorrowing = await apiRequest('PATCH', `/api/borrowings/${borrowing.id}`, {
        status: 'returned',
        returnDate: new Date().toISOString(),
        rating: data.rating || null,
        reviewComments: data.review || null,
      });

      if (updatedBorrowing) {
        await queryClient.invalidateQueries({ queryKey: ['/api/borrowings'] });
        await queryClient.invalidateQueries({ queryKey: ['/api/books'] });

        toast({
          title: 'Success',
          description: 'Book returned successfully and rating submitted!',
        });

        onSuccess?.();
      } else {
        throw new Error('Borrowing record not found');
      }
    } catch (error) {
      console.error('Error returning book:', error);
      toast({
        title: 'Error',
        description: 'Failed to return book. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    setValue('rating', newRating);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={20} className="text-blue-600" />
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">Book Return</h3>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            You're about to return this book. Please rate your reading experience to help other readers.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rating" className="text-sm font-medium">
            Rating (1-10 stars) <span className="text-red-500">*</span>
          </Label>
          <div className="flex items-center gap-3">
            <StarRating
              rating={rating}
              onRatingChange={handleRatingChange}
              maxRating={10}
              size="lg"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {rating > 0 ? `${rating}/10` : 'Select rating'}
            </span>
          </div>
          {errors.rating && (
            <p className="text-sm text-red-600">{errors.rating.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="review" className="text-sm font-medium">
            Review (Optional)
          </Label>
          <Textarea
            id="review"
            placeholder="Share your thoughts about this book..."
            {...register('review')}
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-gray-500">
            Your review will help other readers discover great books.
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Returning...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <BookOpen size={16} />
              Return Book
            </div>
          )}
        </Button>
      </div>
    </form>
  );
};

export default ReturnBookForm;