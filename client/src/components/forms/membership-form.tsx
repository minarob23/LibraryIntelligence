
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
import { User, School, Heart, CheckCircle, Loader2, Sparkles } from 'lucide-react';

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
      <Card className="shadow-xl border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-green-900">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-700 dark:text-green-400">Application Submitted!</CardTitle>
          <CardDescription className="text-base text-green-600 dark:text-green-300">
            Thank you for your membership application. We will review your application and get back to you soon.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            onClick={() => setIsSuccess(false)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Submit Another Application
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="membership-form-container">
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
        <CardHeader className="text-center pb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
          <div className="relative z-10">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Join Our Library Family
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 dark:text-gray-400 mt-3 max-w-md mx-auto">
              Unlock a world of knowledge and become part of our vibrant reading community
            </CardDescription>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <ScrollArea className="h-[500px] w-full pr-4">
                <div className="space-y-8 pb-4">
                  {/* Personal Information */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-blue-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                    <h3 className="text-xl font-bold mb-6 pb-3 border-b-2 border-gradient-to-r from-blue-500 to-purple-500 text-gray-800 dark:text-gray-200 flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 shadow-md">
                        <User className="h-4 w-4" />
                      </div>
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="id"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">Member ID</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your unique member ID" 
                                {...field} 
                                className="border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg transition-colors duration-200"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">Full Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your complete name" 
                                {...field} 
                                className="border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg transition-colors duration-200"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="birthdate"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">Date of Birth</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                {...field} 
                                className="border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg transition-colors duration-200"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">Primary Phone</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your main phone number" 
                                {...field} 
                                className="border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg transition-colors duration-200"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="additionalPhone"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">Secondary Phone <span className="text-gray-400">(Optional)</span></FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Alternative contact number" 
                                {...field} 
                                className="border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg transition-colors duration-200"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="your.email@example.com" 
                                type="email" 
                                {...field} 
                                className="border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg transition-colors duration-200"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem className="space-y-2 md:col-span-2">
                            <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">Home Address</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Complete residential address" 
                                {...field} 
                                className="border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg transition-colors duration-200"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Education Level */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-green-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                    <h3 className="text-xl font-bold mb-6 pb-3 border-b-2 border-gradient-to-r from-green-500 to-teal-500 text-gray-800 dark:text-gray-200 flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 shadow-md">
                        <School className="h-4 w-4" />
                      </div>
                      Education Level
                    </h3>
                    <FormField
                      control={form.control}
                      name="stage"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-lg font-semibold text-gray-700 dark:text-gray-300">Select Your Current Educational Stage</FormLabel>
                          <FormDescription className="text-gray-600 dark:text-gray-400">
                            Choose the category that best matches your current educational level or background.
                          </FormDescription>
                          <FormControl>
                            <RadioGroup 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
                            >
                              {[
                                { value: 'primary', label: 'Primary', color: 'from-red-400 to-pink-500' },
                                { value: 'middle', label: 'Middle', color: 'from-orange-400 to-yellow-500' },
                                { value: 'secondary', label: 'Secondary', color: 'from-green-400 to-emerald-500' },
                                { value: 'university', label: 'University', color: 'from-blue-400 to-cyan-500' },
                                { value: 'graduate', label: 'Graduate', color: 'from-purple-400 to-violet-500' }
                              ].map((stage) => (
                                <div key={stage.value} className="flex items-center space-x-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
                                  <RadioGroupItem value={stage.value} id={stage.value} className="text-blue-600" />
                                  <Label htmlFor={stage.value} className="font-medium cursor-pointer flex-1">
                                    {stage.label}
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Additional Information */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-orange-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                    <h3 className="text-xl font-bold mb-6 pb-3 border-b-2 border-gradient-to-r from-orange-500 to-red-500 text-gray-800 dark:text-gray-200 flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 shadow-md">
                        <Heart className="h-4 w-4" />
                      </div>
                      Tell Us More About You
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="organizationName"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">Organization/Institution</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your organization or institution" 
                                {...field} 
                                className="border-2 border-gray-200 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-400 rounded-lg transition-colors duration-200"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="emergencyContact"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">Emergency Contact</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Emergency contact person" 
                                {...field} 
                                className="border-2 border-gray-200 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-400 rounded-lg transition-colors duration-200"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="studies"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">Field of Study</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="What do you study?" 
                                {...field} 
                                className="border-2 border-gray-200 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-400 rounded-lg transition-colors duration-200"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="job"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">Occupation</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your profession or job" 
                                {...field} 
                                className="border-2 border-gray-200 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-400 rounded-lg transition-colors duration-200"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hobbies"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">Hobbies & Interests</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="What do you enjoy doing in your free time?" 
                                {...field} 
                                className="border-2 border-gray-200 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-400 rounded-lg transition-colors duration-200 min-h-[80px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="favoriteBooks"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">Favorite Books & Authors</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Share some books or authors you love!" 
                                {...field} 
                                className="border-2 border-gray-200 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-400 rounded-lg transition-colors duration-200 min-h-[80px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="flex justify-end space-x-4 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  className="px-8 py-3 border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 rounded-lg"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg font-semibold"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Sparkles className="h-5 w-5 mr-2" />
                      Complete Registration
                    </div>
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
