import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertLibrarianSchema } from '@shared/schema';
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

// Create a proper schema with validation messages
const librarianSchema = z.object({
  librarianId: z.string().min(1, 'Librarian ID is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(8, 'Phone number must be at least 8 characters'),
  appointmentDate: z.string().min(1, 'Appointment date is required'),
  membershipStatus: z.enum(['active', 'inactive', 'temporary'], {
    required_error: 'Please select a membership status',
  }),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
});

type LibrarianFormValues = z.infer<typeof librarianSchema>;

interface LibrarianFormProps {
  librarian?: LibrarianFormValues & { id?: number };
  onSuccess?: () => void;
  onCancel?: () => void;
}

const LibrarianForm = ({ librarian, onSuccess, onCancel }: LibrarianFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!librarian?.id;
  
  // Set default appointment date if not provided
  const today = new Date().toISOString().split('T')[0];

  const form = useForm<LibrarianFormValues>({
    resolver: zodResolver(librarianSchema),
    defaultValues: librarian ? {
      librarianId: librarian.librarianId || '',
      name: librarian.name || '',
      phone: librarian.phone || '',
      appointmentDate: librarian.appointmentDate || today,
      membershipStatus: librarian.membershipStatus || 'active' as const,
      email: librarian.email || '',
    } : {
      librarianId: '',
      name: '',
      phone: '',
      appointmentDate: today,
      membershipStatus: 'active' as const,
      email: '',
    },
  });
  
  const onSubmit = async (data: LibrarianFormValues) => {
    try {
      setIsSubmitting(true);
      
      if (isEditing && librarian) {
        await apiRequest('PUT', `/api/librarians/${librarian.id}`, JSON.stringify(data));
        toast({
          title: 'Success',
          description: 'Librarian updated successfully',
        });
      } else {
        await apiRequest('POST', '/api/librarians', JSON.stringify(data));
        toast({
          title: 'Success',
          description: 'Librarian added successfully',
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/librarians'] });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'add'} librarian. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Librarian' : 'Add New Librarian'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="librarianId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Librarian ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter librarian ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                name="appointmentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appointment Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="membershipStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Membership Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="temporary">Temporary</SelectItem>
                      </SelectContent>
                    </Select>
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
                {isSubmitting ? 'Saving...' : isEditing ? 'Update Librarian' : 'Add Librarian'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default LibrarianForm;
