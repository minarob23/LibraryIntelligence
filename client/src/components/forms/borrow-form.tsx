
import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Users, BookOpen, Clock, Star, MessageSquare } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

const borrowSchema = z.object({
  borrowerId: z.number({
    required_error: 'Borrower is required',
  }),
  librarianId: z.number({
    required_error: 'Librarian is required',
  }),
  bookId: z.number().optional(),
  researchId: z.number().optional(),
  borrowDate: z.string().min(1, 'Borrow date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.enum(['borrowed', 'returned', 'overdue'], {
    required_error: 'Status is required',
  }),
  rating: z.number().min(1).max(5).optional(),
  review: z.string().optional(),
  returnDate: z.string().optional(),
}).refine(
  (data) => data.bookId || data.researchId,
  {
    message: "Either a book or research paper must be selected",
    path: ["bookId"],
  }
);

type BorrowFormValues = z.infer<typeof borrowSchema> & {
  borrowerSearch?: string;
  librarianSearch?: string;
  bookSearch?: string;
  researchSearch?: string;
};

interface BorrowFormProps {
  borrowing?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function BorrowForm({ borrowing, onSuccess, onCancel }: BorrowFormProps) {
  const [borrowerSearch, setBorrowerSearch] = useState('');
  const [librarianSearch, setLibrarianSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [researchSearch, setResearchSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { data: borrowers = [] } = useQuery({
    queryKey: ['/api/borrowers'],
    queryFn: () => apiRequest('GET', '/api/borrowers'),
  });

  const { data: librarians = [] } = useQuery({
    queryKey: ['/api/librarians'],
    queryFn: () => apiRequest('GET', '/api/librarians'),
  });

  const { data: books = [] } = useQuery({
    queryKey: ['/api/books'],
    queryFn: () => apiRequest('GET', '/api/books'),
  });

  const { data: researchPapers = [] } = useQuery({
    queryKey: ['/api/research'],
    queryFn: () => apiRequest('GET', '/api/research'),
  });

  // Filter functions
  const filteredBorrowers = Array.isArray(borrowers) ? borrowers.filter((borrower: any) =>
    borrower.name?.toLowerCase().includes(borrowerSearch.toLowerCase()) ||
    borrower.memberId?.toLowerCase().includes(borrowerSearch.toLowerCase()) ||
    borrower.phone?.includes(borrowerSearch)
  ) : [];

  const filteredLibrarians = Array.isArray(librarians) ? librarians.filter((librarian: any) =>
    librarian.name?.toLowerCase().includes(librarianSearch.toLowerCase()) ||
    librarian.librarianId?.toLowerCase().includes(librarianSearch.toLowerCase())
  ) : [];

  const filteredBooks = Array.isArray(books) ? books.filter((book: any) =>
    book.name?.toLowerCase().includes(bookSearch.toLowerCase()) ||
    book.author?.toLowerCase().includes(bookSearch.toLowerCase()) ||
    book.bookCode?.toLowerCase().includes(bookSearch.toLowerCase())
  ) : [];

  const filteredResearch = Array.isArray(researchPapers) ? researchPapers.filter((paper: any) =>
    paper.name?.toLowerCase().includes(researchSearch.toLowerCase()) ||
    paper.author?.toLowerCase().includes(researchSearch.toLowerCase()) ||
    paper.researchCode?.toLowerCase().includes(researchSearch.toLowerCase())
  ) : [];

  const form = useForm<BorrowFormValues>({
    resolver: zodResolver(borrowSchema),
    defaultValues: {
      borrowerId: borrowing?.borrowerId || undefined,
      librarianId: borrowing?.librarianId || undefined,
      bookId: borrowing?.bookId || undefined,
      researchId: borrowing?.researchId || undefined,
      borrowDate: borrowing?.borrowDate ? new Date(borrowing.borrowDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      dueDate: borrowing?.dueDate ? new Date(borrowing.dueDate).toISOString().split('T')[0] : '',
      status: borrowing?.status || 'borrowed',
      rating: borrowing?.rating || undefined,
      review: borrowing?.review || '',
      returnDate: borrowing?.returnDate ? new Date(borrowing.returnDate).toISOString().split('T')[0] : '',
    },
  });

  // Auto-calculate due date (30 days from borrow date)
  useEffect(() => {
    const borrowDate = form.watch('borrowDate');
    if (borrowDate && !borrowing) {
      const dueDate = new Date(borrowDate);
      dueDate.setDate(dueDate.getDate() + 30);
      form.setValue('dueDate', dueDate.toISOString().split('T')[0]);
    }
  }, [form.watch('borrowDate'), borrowing, form]);

  // Auto-set return date when status changes to returned
  useEffect(() => {
    const status = form.watch('status');
    if (status === 'returned' && !form.getValues('returnDate')) {
      form.setValue('returnDate', new Date().toISOString().split('T')[0]);
    }
  }, [form.watch('status'), form]);

  const onSubmit = async (data: BorrowFormValues) => {
    try {
      setIsLoading(true);
      
      const borrowingData = {
        ...data,
        rating: data.rating || null,
        returnDate: data.status === 'returned' ? (data.returnDate || new Date().toISOString().split('T')[0]) : null,
      };

      if (borrowing?.id) {
        await apiRequest('PUT', `/api/borrowings/${borrowing.id}`, borrowingData);
      } else {
        await apiRequest('POST', '/api/borrowings', borrowingData);
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving borrowing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {borrowing ? 'Edit Borrowing Record' : 'New Borrowing Record'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Borrower Selection */}
              <div className="space-y-4">
                <Label>Search Borrower</Label>
                <Input
                  placeholder="Search by name, ID, or phone..."
                  value={borrowerSearch}
                  onChange={(e) => setBorrowerSearch(e.target.value)}
                />
                <FormField
                  control={form.control}
                  name="borrowerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Borrower *</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a borrower" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredBorrowers.map((borrower: any) => (
                            <SelectItem key={borrower.id} value={borrower.id.toString()}>
                              <div className="flex flex-col">
                                <span className="font-medium">{borrower.name}</span>
                                <span className="text-xs text-gray-500">
                                  ID: {borrower.memberId} | {borrower.phone}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Librarian Selection */}
              <div className="space-y-4">
                <Label>Search Librarian</Label>
                <Input
                  placeholder="Search by name or ID..."
                  value={librarianSearch}
                  onChange={(e) => setLibrarianSearch(e.target.value)}
                />
                <FormField
                  control={form.control}
                  name="librarianId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Librarian *</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a librarian" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredLibrarians.map((librarian: any) => (
                            <SelectItem key={librarian.id} value={librarian.id.toString()}>
                              <div className="flex flex-col">
                                <span className="font-medium">{librarian.name}</span>
                                <span className="text-xs text-gray-500">
                                  ID: {librarian.librarianId}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Book/Research Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label>Search Book</Label>
                <Input
                  placeholder="Search by title, author, or code..."
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                />
                <FormField
                  control={form.control}
                  name="bookId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Book</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value ? parseInt(value) : undefined);
                          form.setValue('researchId', undefined);
                        }}
                        value={field.value?.toString() || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a book" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {filteredBooks.map((book: any) => (
                            <SelectItem key={book.id} value={book.id.toString()}>
                              <div className="flex flex-col">
                                <span className="font-medium">{book.name}</span>
                                <span className="text-xs text-gray-500">
                                  {book.author} | Code: {book.bookCode}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <Label>Search Research Paper</Label>
                <Input
                  placeholder="Search by title, author, or code..."
                  value={researchSearch}
                  onChange={(e) => setResearchSearch(e.target.value)}
                />
                <FormField
                  control={form.control}
                  name="researchId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Research Paper</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value ? parseInt(value) : undefined);
                          form.setValue('bookId', undefined);
                        }}
                        value={field.value?.toString() || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a research paper" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {filteredResearch.map((research: any) => (
                            <SelectItem key={research.id} value={research.id.toString()}>
                              <div className="flex flex-col">
                                <span className="font-medium">{research.name}</span>
                                <span className="text-xs text-gray-500">
                                  {research.author} | Code: {research.researchCode}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="borrowDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Borrow Date *</FormLabel>
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
                    <FormLabel>Due Date *</FormLabel>
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
                    <FormLabel>Status *</FormLabel>
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
            </div>

            {/* Return Date (shown when status is returned) */}
            {form.watch('status') === 'returned' && (
              <FormField
                control={form.control}
                name="returnDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Return Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Rating and Review (shown when status is returned) */}
            {form.watch('status') === 'returned' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating (1-5)</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString() || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Rate the item" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No rating</SelectItem>
                          <SelectItem value="1">⭐ (1)</SelectItem>
                          <SelectItem value="2">⭐⭐ (2)</SelectItem>
                          <SelectItem value="3">⭐⭐⭐ (3)</SelectItem>
                          <SelectItem value="4">⭐⭐⭐⭐ (4)</SelectItem>
                          <SelectItem value="5">⭐⭐⭐⭐⭐ (5)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="review"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Review</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Optional review or comments"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : borrowing ? 'Update Record' : 'Create Record'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
