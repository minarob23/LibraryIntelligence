import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { membershipApplicationSchema } from '@shared/schema';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type MembershipFormValues = z.infer<typeof membershipApplicationSchema>;

const MembershipForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<MembershipFormValues>({
    resolver: zodResolver(membershipApplicationSchema),
    defaultValues: {
      name: '',
      stage: 'primary',
      birthdate: '',
      phone: '',
      additionalPhone: '',
      email: '',
      address: '',
      churchName: '',
      fatherOfConfession: '',
      studies: '',
      job: '',
      hobbies: '',
      favoriteBooks: ''
    },
  });
  
  const onSubmit = async (data: MembershipFormValues) => {
    try {
      setIsSubmitting(true);
      await apiRequest('POST', '/api/membership-application', data);
      
      toast({
        title: 'Success',
        description: 'Your membership application has been submitted successfully.',
      });
      
      setIsSuccess(true);
      form.reset();
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit membership application. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isSuccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Application Submitted</CardTitle>
          <CardDescription>
            Thank you for your membership application. We will review your application and get back to you soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsSuccess(false)}>
            Submit Another Application
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Membership Registration</CardTitle>
        <CardDescription>
          Join our library community by filling out the form below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="birthdate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Birthdate</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
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
                        <Input placeholder="Enter your phone number" {...field} />
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
                        <Input placeholder="Enter additional phone number" {...field} />
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
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your email address" type="email" {...field} />
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
                        <Input placeholder="Enter your address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Membership Category */}
            <div>
              <h3 className="text-lg font-medium mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                Membership Category
              </h3>
              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select your stage</FormLabel>
                    <FormDescription>
                      Please select one category that best describes your current educational level.
                    </FormDescription>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-2">
                      <FormControl>
                        <RadioGroup 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full"
                        >
                          <div className="flex items-center space-x-2 border border-gray-300 dark:border-gray-600 rounded-md p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                            <RadioGroupItem value="primary" id="primary" />
                            <Label htmlFor="primary">Primary</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2 border border-gray-300 dark:border-gray-600 rounded-md p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                            <RadioGroupItem value="middle" id="middle" />
                            <Label htmlFor="middle">Middle</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2 border border-gray-300 dark:border-gray-600 rounded-md p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                            <RadioGroupItem value="secondary" id="secondary" />
                            <Label htmlFor="secondary">Secondary</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2 border border-gray-300 dark:border-gray-600 rounded-md p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                            <RadioGroupItem value="university" id="university" />
                            <Label htmlFor="university">University</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2 border border-gray-300 dark:border-gray-600 rounded-md p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                            <RadioGroupItem value="graduate" id="graduate" />
                            <Label htmlFor="graduate">Graduate</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2 border border-gray-300 dark:border-gray-600 rounded-md p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                            <RadioGroupItem value="librarian" id="librarian" />
                            <Label htmlFor="librarian">Librarian</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-medium mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                Additional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="churchName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Church Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your church name" {...field} />
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
                        <Input placeholder="Enter your studies" {...field} />
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
                        <Input placeholder="Enter your job" {...field} />
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
                        <Textarea placeholder="Enter your hobbies" {...field} />
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
                      <FormLabel>Favourite Books</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter your favourite books" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => window.location.href = '/dashboard'}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Registration'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default MembershipForm;
