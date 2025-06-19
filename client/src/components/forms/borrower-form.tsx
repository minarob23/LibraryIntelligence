
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Phone, Mail, MapPin, Calendar, User, Building2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

const borrowerSchema = z.object({
  memberId: z.string().min(1, 'Member ID is required'), // Changed id to memberId
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(8, 'Phone number must be at least 8 characters'),
  category: z.enum(['primary', 'middle', 'secondary', 'university', 'graduate'], {
    required_error: 'Category is required',
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
  borrower?: any;
  onSuccess: () => void;
  onCancel: () => void;
  index?: number;
}

export default function BorrowerForm({ borrower, onSuccess, onCancel, index }: BorrowerFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<BorrowerFormValues>({
    resolver: zodResolver(borrowerSchema),
    defaultValues: {
      memberId: borrower?.memberId || `M${String(index || 1).padStart(4, '0')}`,
      name: borrower?.name || '',
      phone: borrower?.phone || '',
      category: borrower?.category || 'university',
      joinedDate: borrower?.joinedDate ? new Date(borrower.joinedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      expiryDate: borrower?.expiryDate ? new Date(borrower.expiryDate).toISOString().split('T')[0] : '',
      email: borrower?.email || '',
      address: borrower?.address || '',
      churchName: borrower?.churchName || '',
      fatherOfConfession: borrower?.fatherOfConfession || '',
      studies: borrower?.studies || '',
      job: borrower?.job || '',
      hobbies: borrower?.hobbies || '',
      favoriteBooks: borrower?.favoriteBooks || '',
      additionalPhone: borrower?.additionalPhone || '',
    },
  });

  // Auto-calculate expiry date (1 year from joined date)
  React.useEffect(() => {
    const joinedDate = form.watch('joinedDate');
    if (joinedDate && !borrower) {
      const expiryDate = new Date(joinedDate);
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      form.setValue('expiryDate', expiryDate.toISOString().split('T')[0]);
    }
  }, [form.watch('joinedDate'), borrower, form]);

  const onSubmit = async (data: BorrowerFormValues) => {
    try {
      setIsLoading(true);

      const borrowerData = {
        ...data,
        email: data.email || null,
        address: data.address || null,
        churchName: data.churchName || null,
        fatherOfConfession: data.fatherOfConfession || null,
        studies: data.studies || null,
        job: data.job || null,
        hobbies: data.hobbies || null,
        favoriteBooks: data.favoriteBooks || null,
        additionalPhone: data.additionalPhone || null,
      };

      if (borrower?.id) {
        await apiRequest('PUT', `/api/borrowers/${borrower.id}`, borrowerData);
      } else {
        await apiRequest('POST', '/api/borrowers', borrowerData);
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving borrower:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {borrower ? 'Edit Member' : 'Add New Member'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="memberId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Member ID *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter member ID" {...field} />
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
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="primary">Primary - ابتدائي</SelectItem>
                        <SelectItem value="middle">Middle - إعدادي</SelectItem>
                        <SelectItem value="secondary">Secondary - ثانوي</SelectItem>
                        <SelectItem value="university">University - جامعي</SelectItem>
                        <SelectItem value="graduate">Graduate - خريج</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
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
                      <FormLabel>Additional Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter additional phone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
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
            </div>

            {/* Membership Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Membership Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="joinedDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Joined Date *</FormLabel>
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
                      <FormLabel>Expiry Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Additional Information</h3>
              <FormField
                control={form.control}
                name="churchName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Church Name</FormLabel>
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
                    <FormLabel>Father of Confession</FormLabel>
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
                    <FormLabel>Studies</FormLabel>
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
                    <FormLabel>Job</FormLabel>
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
                    <FormLabel>Hobbies</FormLabel>
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
                    <FormLabel>Favorite Books</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter favorite books" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : borrower ? 'Update Member' : 'Create Member'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
