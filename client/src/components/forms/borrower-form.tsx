import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertBorrowerSchema } from '@shared/schema';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { queryClient } from '@/lib/queryClient';

// Extend the schema to add validation messages
const borrowerSchema = insertBorrowerSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(8, 'Phone number must be at least 8 characters'),
  category: z.enum(['primary', 'middle', 'secondary', 'university', 'graduate'], {
    required_error: 'Please select a category',
  }),
  joinedDate: z.string().min(1, 'Joined date is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().optional(),
  churchName: z.string().optional(),
  fatherOfConfession: z.string().optional(),
  studies: z.string().optional(),
  job: z.string().optional(),
  hobbies: z.string().optional(),
  favoriteBooks: z.string().optional(),
  additionalPhone: z.string().optional(),
});

type BorrowerFormValues = z.infer<typeof borrowerSchema>;

interface BorrowerFormProps {
  borrower?: BorrowerFormValues & { id?: number };
  onSuccess?: () => void;
  onCancel?: () => void;
}

const BorrowerForm = ({ borrower, onSuccess, onCancel }: BorrowerFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!borrower?.id;

  // Set default dates if not provided
  const today = new Date().toISOString().split('T')[0];
  const defaultExpiryDate = new Date();
  defaultExpiryDate.setFullYear(defaultExpiryDate.getFullYear() + 1);
  const oneYearFromNow = defaultExpiryDate.toISOString().split('T')[0];

  const form = useForm<BorrowerFormValues>({
    resolver: zodResolver(borrowerSchema),
    defaultValues: borrower || {
      name: '',
      phone: '',
      category: 'primary' as const,
      joinedDate: today,
      expiryDate: oneYearFromNow,
      email: '',
      address: '',
      churchName: '',
      fatherOfConfession: '',
      studies: '',
      job: '',
      hobbies: '',
      favoriteBooks: '',
      additionalPhone: '',
    },
  });
  
  const onSubmit = async (data: BorrowerFormValues) => {
    try {
      setIsSubmitting(true);
      
      if (isEditing && borrower) {
        await apiRequest('PUT', `/api/borrowers/${borrower.id}`, data);
        toast({
          title: 'Success',
          description: 'Borrower updated successfully',
        });
      } else {
        await apiRequest('POST', '/api/borrowers', data);
        toast({
          title: 'Success',
          description: 'Borrower added successfully',
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/borrowers'] });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'add'} borrower. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Borrower' : 'Add New Borrower'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Personal Information */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="primary">Primary</SelectItem>
                        <SelectItem value="middle">Middle</SelectItem>
                        <SelectItem value="secondary">Secondary</SelectItem>
                        <SelectItem value="university">University</SelectItem>
                        <SelectItem value="graduate">Graduate</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="additionalPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter additional phone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email address" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="joinedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Joined Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Membership Expiry Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Additional Information */}
              <FormField
                control={form.control}
                name="churchName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Church Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter church name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fatherOfConfession"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Father of Confession (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter father of confession" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="studies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Studies (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter studies" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="job"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter job" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="hobbies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hobbies (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter hobbies" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="favoriteBooks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Favorite Books (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter favorite books" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : isEditing ? 'Update Borrower' : 'Add Borrower'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default BorrowerForm;
