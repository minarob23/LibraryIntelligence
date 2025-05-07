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

// Extend the schema to add validation messages
const borrowingSchema = insertBorrowingSchema.extend({
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
});

// We need to add a custom schema validator to ensure either bookId or researchId is provided
const borrowSchema = borrowingSchema.superRefine((data, ctx) => {
  if (!data.bookId && !data.researchId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Either a book or research paper must be selected',
      path: ['itemType'],
    });
  }
  
  if (data.bookId && data.researchId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Cannot borrow both a book and research paper at once',
      path: ['itemType'],
    });
  }
});

type BorrowFormValues = z.infer<typeof borrowSchema> & {
  itemType: 'book' | 'research';
};

interface BorrowFormProps {
  borrowing?: BorrowFormValues & { id?: number };
  onSuccess?: () => void;
  onCancel?: () => void;
}

const BorrowForm = ({ borrowing, onSuccess, onCancel }: BorrowFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itemType, setItemType] = useState<'book' | 'research'>(borrowing?.bookId ? 'book' : 'research');
  const isEditing = !!borrowing?.id;
  
  // Set default dates if not provided
  const today = new Date().toISOString().split('T')[0];
  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 14); // 14 days loan period
  const twoWeeksFromNow = defaultDueDate.toISOString().split('T')[0];

  // Fetch borrowers, librarians, books and research papers
  const { data: borrowers } = useQuery({ 
    queryKey: ['/api/borrowers'],
  });
  
  const { data: librarians } = useQuery({ 
    queryKey: ['/api/librarians'],
  });
  
  const { data: books } = useQuery({ 
    queryKey: ['/api/books'],
  });
  
  const { data: researchPapers } = useQuery({ 
    queryKey: ['/api/research'],
  });

  const form = useForm<BorrowFormValues>({
    resolver: zodResolver(borrowSchema),
    defaultValues: {
      ...borrowing,
      itemType: borrowing?.bookId ? 'book' : 'research',
      borrowDate: borrowing?.borrowDate || today,
      dueDate: borrowing?.dueDate || twoWeeksFromNow,
      status: borrowing?.status || 'borrowed',
    },
  });
  
  // Update form values when item type changes
  useEffect(() => {
    if (itemType === 'book') {
      form.setValue('researchId', undefined);
    } else {
      form.setValue('bookId', undefined);
    }
  }, [itemType, form]);

  const onSubmit = async (data: BorrowFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Remove the itemType field before sending to the API
      const { itemType: _, ...submitData } = data;
      
      if (isEditing && borrowing) {
        await apiRequest('PUT', `/api/borrowings/${borrowing.id}`, submitData);
        toast({
          title: 'Success',
          description: 'Borrowing record updated successfully',
        });
      } else {
        await apiRequest('POST', '/api/borrowings', submitData);
        toast({
          title: 'Success',
          description: 'Borrowing record added successfully',
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/borrowings'] });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'add'} borrowing record. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Borrowing Record' : 'New Borrowing Record'}</CardTitle>
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
                        {borrowers?.map((borrower: any) => (
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
                        {librarians?.map((librarian: any) => (
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
                name="itemType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => {
                          field.onChange(value);
                          setItemType(value as 'book' | 'research');
                        }}
                        defaultValue={field.value}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="book" id="book" />
                          <Label htmlFor="book">Book</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="research" id="research" />
                          <Label htmlFor="research">Research Paper</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {itemType === 'book' ? (
                <FormField
                  control={form.control}
                  name="bookId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Book</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select book" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {books?.map((book: any) => (
                            <SelectItem key={book.id} value={book.id.toString()}>
                              {book.name} by {book.author}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="researchId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Research Paper</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select research paper" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {researchPapers?.map((paper: any) => (
                            <SelectItem key={paper.id} value={paper.id.toString()}>
                              {paper.name} by {paper.author}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
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
              
              {form.formState.errors.itemType && (
                <div className="col-span-2 text-destructive text-sm">
                  {form.formState.errors.itemType.message}
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
