import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertResearchPaperSchema } from '@shared/schema';
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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { queryClient } from '@/lib/queryClient';

// Research paper form schema
const researchSchema = insertResearchPaperSchema.extend({
  id: z.number().optional(),
  authors: z.string().min(1, 'Authors are required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  keywords: z.string().optional(),
  methodology: z.string().optional(),
  results: z.string().optional(),
  conclusion: z.string().optional(),
  references: z.string().optional(),
});

type ResearchFormValues = z.infer<typeof researchSchema>;

interface ResearchFormProps {
  research?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ResearchForm = ({ research, onSuccess, onCancel }: ResearchFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ResearchFormValues>({
    resolver: zodResolver(researchSchema),
    defaultValues: {
      authors: research?.authors || '',
      title: research?.title || '',
      description: research?.description || '',
      keywords: research?.keywords || '',
      methodology: research?.methodology || '',
      results: research?.results || '',
      conclusion: research?.conclusion || '',
      references: research?.references || '',
    },
  });

  const onSubmit = async (data: ResearchFormValues) => {
    setIsLoading(true);
    try {
      if (research) {
        // Update existing research
        const response = await fetch(`/api/research/${research.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to update research');
        }

        toast({
          title: "Success",
          description: "Research paper updated successfully",
        });
      } else {
        // Create new research
        const response = await fetch('/api/research', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to create research');
        }

        toast({
          title: "Success",
          description: "Research paper created successfully",
        });
      }

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['/api/research'] });

      onSuccess?.();
      form.reset();
    } catch (error) {
      console.error('Error saving research:', error);
      toast({
        title: "Error",
        description: "Failed to save research paper",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{research ? 'Edit Research Paper' : 'Add New Research Paper'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Research paper title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="authors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Authors</FormLabel>
                    <FormControl>
                      <Input placeholder="Author names" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Research description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keywords</FormLabel>
                  <FormControl>
                    <Input placeholder="Keywords (comma separated)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="methodology"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Methodology</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Research methodology" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="results"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Results</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Research results" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="conclusion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conclusion</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Research conclusion" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="references"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>References</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Research references" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : research ? 'Update Research' : 'Create Research'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ResearchForm;