import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertBorrowingSchema } from '@shared/schema';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { queryClient } from '@/lib/queryClient';
import { Search } from 'lucide-react';

// Extend the schema to add validation messages
const borrowSchema = z.object({
  borrowerId: z.number({
    required_error: 'Borrower is required',
    invalid_type_error: 'Borrower must be selected',
  }),
  librarianId: z.number({
    required_error: 'Librarian is required',
    invalid_type_error: 'Librarian must be selected',
  }),
  bookId: z.number().optional(),
  researchId: z.number().optional(),
  borrowDate: z.string().min(1, 'Borrow date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.enum(['borrowed', 'returned', 'overdue'], {
    required_error: 'Status is required',
  }),
  rating: z.number().optional(),
  review: z.string().optional(),
  itemType: z.enum(['book', 'research']).default('book'),
}).superRefine((data, ctx) => {
  // For book-only borrowing, we just need bookId
  if (!data.bookId && !data.researchId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Either a book or research paper must be selected',
      path: ['bookId'],
    });
  }

  if (data.bookId && data.researchId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Cannot borrow both a book and research paper at once',
      path: ['bookId'],
    });
  }
});

type BorrowFormValues = z.infer<typeof borrowSchema> & {
  itemType: 'book' | 'research';
  rating?: number;
  review?: string;
};

interface BorrowFormProps {
  borrowing?: BorrowFormValues & { id?: number };
  onSuccess?: () => void;
  onCancel?: () => void;
}

const BorrowForm = ({ borrowing, onSuccess, onCancel }: BorrowFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [borrowerSearch, setBorrowerSearch] = useState('');
  const [librarianSearch, setLibrarianSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const isEditing = !!borrowing?.id;

  // Set default dates if not provided
  const today = new Date().toISOString().split('T')[0];
  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 14); // 14 days loan period
  const twoWeeksFromNow = defaultDueDate.toISOString().split('T')[0];

  // Fetch borrowers, librarians, books and research papers
  const { data: borrowers } = useQuery<any[]>({ 
    queryKey: ['/api/borrowers'],
  });

  const { data: librarians } = useQuery<any[]>({ 
    queryKey: ['/api/librarians'],
  });

  const { data: books } = useQuery<any[]>({ 
    queryKey: ['/api/books'],
  });

  const { data: researchPapers } = useQuery({ 
    queryKey: ['/api/research-papers'],
  });

  // Filter data based on search terms
  const filteredBorrowers = borrowers?.filter((borrower: any) =>
    borrower.name?.toLowerCase().includes(borrowerSearch.toLowerCase()) ||
    borrower.category?.toLowerCase().includes(borrowerSearch.toLowerCase()) ||
    borrower.email?.toLowerCase().includes(borrowerSearch.toLowerCase())
  ) || [];

  const filteredLibrarians = librarians?.filter((librarian: any) =>
    librarian.name?.toLowerCase().includes(librarianSearch.toLowerCase()) ||
    librarian.email?.toLowerCase().includes(librarianSearch.toLowerCase())
  ) || [];

  const filteredBooks = books?.filter((book: any) =>
    book.title?.toLowerCase().includes(bookSearch.toLowerCase()) ||
    book.name?.toLowerCase().includes(bookSearch.toLowerCase()) ||
    book.author?.toLowerCase().includes(bookSearch.toLowerCase()) ||
    book.bookCode?.toLowerCase().includes(bookSearch.toLowerCase())
  ) || [];

  const form = useForm<BorrowFormValues>({
    resolver: zodResolver(borrowSchema),
    defaultValues: {
      borrowerId: borrowing?.borrowerId || undefined,
      librarianId: borrowing?.librarianId || undefined,
      bookId: borrowing?.bookId || undefined,
      researchId: borrowing?.researchId || undefined,
      borrowDate: borrowing?.borrowDate || today,
      dueDate: borrowing?.dueDate || twoWeeksFromNow,
      status: borrowing?.status || 'borrowed',
      rating: borrowing?.rating || undefined,
      review: borrowing?.review || undefined,
    },
  });

  const onSubmit = async (values: BorrowFormValues) => {
    setIsSubmitting(true);
    try {
      // Clean and prepare the data for book-only borrowing
      const submitData: any = {
        borrowerId: values.borrowerId,
        librarianId: values.librarianId,
        borrowDate: values.borrowDate,
        dueDate: values.dueDate,
        status: values.status,
      };

      // Only include bookId if it has a value (for book-only borrowing)
      if (values.bookId) {
        submitData.bookId = values.bookId;
      }

      // Only include researchId if it has a value (not needed for book-only)
      if (values.researchId) {
        submitData.researchId = values.researchId;
      }

      // Optional fields
      if (values.rating) {
        submitData.rating = values.rating;
      }
      if (values.review) {
        submitData.review = values.review;
      }

      console.log('Submitting borrowing data:', submitData);

      if (isEditing) {
        await apiRequest('PUT', `/api/borrowings/${borrowing.id}`, JSON.stringify(submitData));
        toast({
          title: 'Success',
          description: 'Borrowing record updated successfully',
        });
      } else {
        await apiRequest('POST', '/api/borrowings', JSON.stringify(submitData));
        toast({
          title: 'Success',
          description: 'Borrowing record created successfully',
        });
      }

      await queryClient.invalidateQueries({ queryKey: ['/api/borrowings'] });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} borrowing record. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Book Borrowing Record' : 'New Book Borrowing Record'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="borrowerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Borrower</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select borrower" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <div className="flex items-center px-3 py-2 border-b">
                          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                          <Input
                            placeholder="Search borrowers..."
                            value={borrowerSearch}
                            onChange={(e) => setBorrowerSearch(e.target.value)}
                            className="h-8 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                        </div>
                        {filteredBorrowers.length === 0 && borrowerSearch && (
                          <div className="py-2 px-3 text-sm text-gray-500">
                            No borrowers found
                          </div>
                        )}
                        {filteredBorrowers.map((borrower: any) => (
                          <SelectItem key={borrower.id} value={borrower.id.toString()}>
                            {borrower.name} - {borrower.category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="librarianId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Librarian</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select librarian" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <div className="flex items-center px-3 py-2 border-b">
                          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                          <Input
                            placeholder="Search librarians..."
                            value={librarianSearch}
                            onChange={(e) => setLibrarianSearch(e.target.value)}
                            className="h-8 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                        </div>
                        {filteredLibrarians.length === 0 && librarianSearch && (
                          <div className="py-2 px-3 text-sm text-gray-500">
                            No librarians found
                          </div>
                        )}
                        {filteredLibrarians.map((librarian: any) => (
                          <SelectItem key={librarian.id} value={librarian.id.toString()}>
                            {librarian.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bookId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Book</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        if (value) {
                          field.onChange(parseInt(value));
                          // Clear research paper when book is selected
                          form.setValue('researchId', undefined);
                        }
                      }}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select book" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <div className="flex items-center px-3 py-2 border-b">
                          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                          <Input
                            placeholder="Search books..."
                            value={bookSearch}
                            onChange={(e) => setBookSearch(e.target.value)}
                            className="h-8 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                        </div>
                        {filteredBooks.length === 0 && bookSearch && (
                          <div className="py-2 px-3 text-sm text-gray-500">
                            No books found
                          </div>
                        )}
                        {filteredBooks.map((book: any) => (
                          <SelectItem key={book.id} value={book.id.toString()}>
                            {book.title || book.name} by {book.author}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Research Paper field hidden for book-only borrowing */}

              <FormField
                control={form.control}
                name="borrowDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Borrow Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="borrowed">Borrowed</SelectItem>
                        <SelectItem value="returned">Returned</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(form.formState.errors.bookId || form.formState.errors.researchId) && (
                <div className="col-span-2 text-destructive text-sm">
                  {form.formState.errors.bookId?.message || form.formState.errors.researchId?.message}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : isEditing ? 'Update Record' : 'Add Record'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default BorrowForm;