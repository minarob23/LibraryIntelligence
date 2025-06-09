import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { membershipApplicationSchema } from '@shared/schema';
import { z } from 'zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
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
import { ScrollArea } from "@/components/ui/scroll-area";

type MembershipFormValues = z.infer<typeof membershipApplicationSchema>;

interface MembershipFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const MembershipForm: React.FC<MembershipFormProps> = ({ onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<MembershipFormValues>({
    resolver: zodResolver(membershipApplicationSchema),
    defaultValues: {
      id: '',
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
      const response = await apiRequest('POST', '/api/membership-application', data);

      if (!response) {
        throw new Error('No response from server');
      }

      // Also create a borrower record
      const joinedDate = new Date().toISOString().split('T')[0];
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      const borrowerData = {
        memberId: data.id, // Store the custom Member ID
        name: data.name,
        category: data.stage,
        phone: data.phone,
        email: data.email,
        address: data.address,
        joinedDate: joinedDate,
        expiryDate: expiryDate.toISOString().split('T')[0],
        churchName: data.churchName,
        fatherOfConfession: data.fatherOfConfession,
        studies: data.studies,
        job: data.job,
        hobbies: data.hobbies,
        favoriteBooks: data.favoriteBooks,
        additionalPhone: data.additionalPhone
      };

      await apiRequest('POST', '/api/borrowers', borrowerData);

      // Invalidate borrowers queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/borrowers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/borrower-distribution'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/top-borrowers'] });

      toast({
        title: 'Success',
        description: 'Your membership application has been submitted successfully.',
      });

      setIsSuccess(true);
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting application:', error);
      let errorMessage = 'Failed to submit membership application. ';

      if (error instanceof Error) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again later.';
      }

      toast({
        title: 'Error',
        description: errorMessage,
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
    <div className="membership-form-container max-w-4xl mx-auto">
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Membership Registration
        </CardTitle>
        <CardDescription className="text-base text-gray-600 dark:text-gray-400 mt-2">
          Join our library community and unlock a world of knowledge
        </CardDescription>
        <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-3 rounded-full"></div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ScrollArea className="h-[500px] w-full pr-4">
              <div className="space-y-6 pb-4">
                {/* Personal Information */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold mb-5 pb-2 border-b border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 flex items-center">
                    <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">1</div>
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Member ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your member ID" {...field} />
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
                <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold mb-5 pb-2 border-b border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 flex items-center">
                    <div className="w-7 h-7 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">2</div>
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
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Additional Information */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold mb-5 pb-2 border-b border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 flex items-center">
                    <div className="w-7 h-7 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">3</div>
                    Additional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
              </div>
            </ScrollArea>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="px-6 py-2 border hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  'Submit Registration'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
    </div>
  );
};

export default MembershipForm;