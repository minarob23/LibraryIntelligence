
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import FeedbackForm from '@/components/forms/feedback-form';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Trash2, MessageSquare, Lightbulb, User, Phone, Mail, Calendar, CheckCircle, XCircle } from 'lucide-react';

const FeedbackPage = () => {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: feedbacks, isLoading, refetch } = useQuery({
    queryKey: ['/api/feedback'],
    queryFn: () => apiRequest('GET', '/api/feedback'),
  });

  const handleDelete = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/feedback/${id}`);
      toast({
        title: 'Success',
        description: 'Feedback deleted successfully.',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete feedback.',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await apiRequest('PUT', `/api/feedback/${id}`, { status });
      toast({
        title: 'Success',
        description: 'Feedback status updated successfully.',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update feedback status.',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'suggestion' ? (
      <Lightbulb className="h-4 w-4 text-yellow-600" />
    ) : (
      <MessageSquare className="h-4 w-4 text-blue-600" />
    );
  };

  return (
    <div className="animate-fade-in min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="mb-6 animate-slide-up text-center py-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
          Feedback & Suggestions
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Your voice matters! Share your thoughts and help us improve our library services
        </p>
        <div className="w-28 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto mt-4 rounded-full"></div>
      </div>

      <div className="container mx-auto px-4">
        <Tabs defaultValue="form" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-2">
            <TabsTrigger value="form" className="rounded-lg py-3 text-lg font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-200">
              💬 Submit Feedback
            </TabsTrigger>
            <TabsTrigger value="responses" className="rounded-lg py-3 text-lg font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white transition-all duration-200">
              📋 View Responses
            </TabsTrigger>
          </TabsList>

        <TabsContent value="form">
          <div className="max-w-2xl mx-auto">
            <FeedbackForm onSuccess={() => refetch()} />
          </div>
        </TabsContent>

        <TabsContent value="responses">
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-green-50 dark:from-gray-900 dark:to-green-900/20">
            <CardHeader className="text-center pb-6 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-lg">
              <CardTitle className="text-3xl font-bold flex items-center justify-center">
                <span className="mr-3">📋</span>
                Community Responses
              </CardTitle>
              <div className="w-24 h-1 bg-white/30 mx-auto mt-4 rounded-full"></div>
            </CardHeader>
            <CardContent className="p-8">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : feedbacks && feedbacks.length > 0 ? (
                <div className="space-y-4">
                  {feedbacks.map((feedback: any) => (
                    <Card key={feedback.id} className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] bg-white dark:bg-gray-800">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(feedback.type)}
                            <Badge variant="outline" className={getStatusColor(feedback.status)}>
                              {feedback.status}
                            </Badge>
                            <Badge variant="secondary">
                              {feedback.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusUpdate(feedback.id, feedback.status === 'pending' ? 'reviewed' : 'resolved')}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Feedback</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this feedback? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(feedback.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>

                        <div className="mb-3">
                          <p className="text-gray-800 dark:text-gray-200 mb-2">
                            {feedback.message}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                          {feedback.name && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{feedback.name}</span>
                            </div>
                          )}
                          {feedback.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{feedback.phone}</span>
                            </div>
                          )}
                          {feedback.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span>{feedback.email}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(feedback.submittedAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                          <span>Stage: {feedback.stage}</span>
                          <span>Membership: {feedback.membershipStatus}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No feedback submitted yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FeedbackPage;
