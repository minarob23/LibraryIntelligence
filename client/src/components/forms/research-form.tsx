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
import { ScrollArea } from '@/components/ui/scroll-area';
import { queryClient } from '@/lib/queryClient';
import ImageUpload from '@/components/ui/image-upload';

// Extend the schema to add validation messages
const researchSchema = insertResearchPaperSchema.extend({
  name: z.string().min(2, 'Research name must be at least 2 characters'),
  author: z.string().min(2, 'Author name must be at least 2 characters'),
  publisher: z.string().min(2, 'Publisher name must be at least 2 characters'),
  researchCode: z.string().min(2, 'Research code must be at least 2 characters'),
  copies: z.number().min(1, 'Number of copies must be at least 1'),
  description: z.string().optional(),
  coverImage: z.string().min(1, 'Cover image is required'),
});

type ResearchFormValues = z.infer<typeof researchSchema>;

interface ResearchFormProps {
  research?: ResearchFormValues & { id?: number };
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ResearchForm = ({ research, onSuccess, onCancel }: ResearchFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!research;

  const form = useForm<ResearchFormValues>({
    resolver: zodResolver(researchSchema),
    defaultValues: research || {
      name: '',
      author: '',
      publisher: '',
      researchCode: '',
      copies: 1,
      description: '',
      coverImage: '',
    },
  });
  
  const onSubmit = async (data: ResearchFormValues) => {
    try {
      setIsSubmitting(true);
      
      if (isEditing && research) {
        await apiRequest('PUT', `/api/research/${research.id}`, data);
        toast({
          title: 'Success',
          description: 'Research paper updated successfully',
        });
      } else {
        await apiRequest('POST', '/api/research', data);
        toast({
          title: 'Success',
          description: 'Research paper added successfully',
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/research'] });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'add'} research paper. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <ScrollArea className="h-[80vh]">
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Research Paper' : 'Add New Research Paper'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Research Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter research title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter author name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="publisher"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Publisher</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter publisher name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="researchCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Research Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter research code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="copies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Copies</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                      />
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
                    <Textarea 
                      placeholder="Enter research description" 
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2 pt-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : isEditing ? 'Update Research' : 'Add Research'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
    </ScrollArea>
  );
};

export default ResearchForm;
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { queryClient } from '@/lib/queryClient';

const researchSchema = insertResearchPaperSchema.extend({
  name: z.string().min(2, 'Research paper name must be at least 2 characters'),
  author: z.string().min(2, 'Author name must be at least 2 characters'),
  publisher: z.string().min(2, 'Publisher name must be at least 2 characters'),
  researchCode: z.string().min(1, 'Research code is required'),
  copies: z.number().min(1, 'Number of copies must be at least 1'),
  description: z.string().optional(),
  coverImage: z.string().optional(),
});

type ResearchFormValues = z.infer<typeof researchSchema>;

interface ResearchFormProps {
  research?: ResearchFormValues & { id?: number };
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ResearchForm = ({ research, onSuccess, onCancel }: ResearchFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!research?.id;

  const form = useForm<ResearchFormValues>({
    resolver: zodResolver(researchSchema),
    defaultValues: research ? {
      name: research.name || '',
      author: research.author || '',
      publisher: research.publisher || '',
      researchCode: research.researchCode || '',
      copies: research.copies || 1,
      description: research.description || '',
      coverImage: research.coverImage || '/src/assets/book-covers/cover1.svg',
    } : {
      name: '',
      author: '',
      publisher: '',
      researchCode: '',
      copies: 1,
      description: '',
      coverImage: '/src/assets/book-covers/cover1.svg',
    },
  });
  
  const onSubmit = async (data: ResearchFormValues) => {
    try {
      setIsSubmitting(true);
      
      if (isEditing && research) {
        await apiRequest(`/api/research/${research.id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
        toast({
          title: 'Success',
          description: 'Research paper updated successfully',
        });
      } else {
        await apiRequest('/api/research', {
          method: 'POST',
          body: JSON.stringify(data),
        });
        toast({
          title: 'Success',
          description: 'Research paper added successfully',
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/research'] });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'add'} research paper. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Research Paper' : 'Add New Research Paper'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Research Paper Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter research paper name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter author name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="publisher"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Publisher</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter publisher name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="researchCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Research Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter research code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="copies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Copies</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter number of copies" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter cover image URL" {...field} />
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
                    <Textarea 
                      placeholder="Enter research paper description" 
                      className="resize-none" 
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2 pt-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : isEditing ? 'Update Research Paper' : 'Add Research Paper'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ResearchForm;
