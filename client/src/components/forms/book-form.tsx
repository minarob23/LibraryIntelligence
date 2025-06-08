import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertBookSchema } from '@shared/schema';
import { z } from 'zod';
import { Calendar, Upload, X, Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { queryClient } from '@/lib/queryClient';
import ImageUpload from '@/components/ui/image-upload';
import { cn } from '@/lib/utils';

// Extend the schema to add validation messages
const PREDEFINED_GENRES = [
  "Doctrine - عقيدة",
  "Comparative Theology - لاهوت مقارن",
  "Theology - لاهوت",
  "Spiritual Theology - لاهوت روحي",
  "Moral Theology - لاهوت أخلاقي",
  "Sermons - عظات",
  "Questions - أسئلة",
  "Islamic - إسلاميات",
  "Youth - شبابيات",
  "Educational - تربوي",
  "Religious Issues - قضايا دينية",
  "Spiritual - روحي",
  "Spiritual Literature - أدب روحي",
  "Biblical - كتابي",
  "Biblical Studies - دراسات كتابية",
  "Biblical Theology - لاهوت كتابي",
  "Biblical Criticism - نقد كتابي",
  "Biblical Reflections - تأملات كتابية",
  "Biblical Articles - مقالات كتابية",
  "Hermeneutics - علم التفسير",
  "Patristics - آبائيات",
  "Patristic Studies - دراسات آبائيّة",
  "Historical - تاريخي",
  "Defensives - دفاعيات",
  "Ritual - طقسي",
  "Church History - تاريخ كنيسة",
  "Ecumenical Councils - مجامع مسكونية",
  "Comparative Religion - مقارنة أديان",
  "Israelites - إسرائيليات",
  "Jewish Studies - دراسات يهودية",
  "Ancient Near Eastern Studies - دراسات الشرق الأدنى القديم",
  "Anthropology - الأنثروبولوجيا",
  "Philosophy - فلسفي",
  "Christian Philosophy - فلسفة مسيحية",
  "Christian Thought - فكر مسيحي",
  "Psychiatry - طب نفسي",
  "Eucharist - إفخارستيا",
  "Feasts - أعياد",
  "Liturgy Studies - دراسات ليتورجيا",
  "Liturgy - ليتورجيا",
  "Religious Policy - سياسة دينية",
  "Monastic teachings - تعاليم رهبانية",
  "Political Satire",
  "Paleography - مخطوطات قديمة",
  "Hebrews - عبري",
  "Christian Biographies - سير قديسين",
  "Biography - سيرة ذاتية",
  "Christology - طبيعة المسيح",
  "Mariology - اللاهوت المريمي",
  "Iconography - علم دراسة الأيقونة",
  "Religious Drama - مسرح ديني",
  "Poetry - شعر",
  "Novel - روايات",
  "Literature - أدب",
  "Sociology of Religion - علم الاجتماع الديني",
  "Sociology - علم اجتماع",
  "Christian Psychology - علم النفس المسيحي"
];

const PREDEFINED_AUTHORS = [
  "الراهب سارافيم البرموسي",
  "الدكتور القس رضا ثابت",
  "د. عماد موريس إسكندر",
  "كنيسة مارجرجس سبورتنج",
  "الأب متى المسكين",
  "الأنبا غريغورويس",
  "البابا ألكسندروس",
  "الراهب أثناسيوس المقاري",
  "Paul L. Gavrilyuk",
  "محمد الباز",
  "الأب لويس برسوم",
  "كيرلس بهجت",
  "د. خولة حمدي",
  "الأنبا موسى",
  "Kosti Bandali",
  "ميليتوس أسقف ساردس"
];

const PREDEFINED_PUBLISHERS = [
  "مدرسة الإسكندرية",
  "مركز باناريون للتراث الآبائي",
  "دار الثقافة",
  "كنيسة مارجرجس سبورتنج",
  "مجلة",
  "الكلية الإكليريكية",
  "دار مجلة مرقس",
  "المعهد الإكليريكي القبطي الفرنسيسكاني بالجيزة",
  "منشورات النور",
  "بتانة"
];

const bookSchema = insertBookSchema.extend({
  name: z.string().min(2, 'Book name must be at least 2 characters'),
  author: z.string().min(2, 'Author name must be at least 2 characters'),
  publisher: z.string().min(2, 'Publisher name must be at least 2 characters'),
  bookCode: z.string().min(2, 'Book code must be at least 2 characters'),
  index: z.string().optional(),
  copies: z.number().min(1, 'Number of copies must be at least 1'),
  description: z.string().optional(),
  coverImage: z.string().min(1, 'Cover image is required'),
  totalPages: z.number().min(1, 'Total pages must be at least 1').optional(),
  cabinet: z.string().min(1, 'Cabinet is required'),
  shelf: z.string().min(1, 'Shelf is required'),
  num: z.string().min(1, 'Number is required'),
  addedDate: z.string().optional(),
  publishedDate: z.string().optional(),
  genres: z.string().optional(),
  comments: z.string().optional(),
});

type BookFormValues = z.infer<typeof bookSchema>;

interface BookFormProps {
  book?: BookFormValues & { id?: number };
  index?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const BookForm = ({ book, index, onSuccess, onCancel }: BookFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!book;
  const [uploadedImage, setUploadedImage] = useState<string | null>(
    book?.coverImage || null
  );
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    book?.genres ? book.genres.split(',').map((g: string) => g.trim()) : []
  );
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>(
    book?.author ? book.author.split(',').map((a: string) => a.trim()) : []
  );
  const [selectedPublishers, setSelectedPublishers] = useState<string[]>(
    book?.publisher ? book.publisher.split(',').map((p: string) => p.trim()) : []
  );
  const [genresOpen, setGenresOpen] = useState(false);
  const [authorsOpen, setAuthorsOpen] = useState(false);
  const [publishersOpen, setPublishersOpen] = useState(false);
  const [newAuthor, setNewAuthor] = useState('');
  const [newPublisher, setNewPublisher] = useState('');

  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: book || {
      name: '',
      author: '',
      publisher: '',
      bookCode: '',
      index: '',
      copies: 1,
      description: '',
      coverImage: '',
      totalPages: undefined,
      cabinet: '',
      shelf: '',
      num: '',
      addedDate: new Date().toISOString().split('T')[0],
      publishedDate: '',
      genres: '',
      comments: '',
    },
  });

  const updateBookCode = () => {
    const cabinet = form.getValues('cabinet');
    const shelf = form.getValues('shelf');
    const num = form.getValues('num');

    if (cabinet && shelf && num) {
      const bookCode = `${cabinet}/${shelf}/${num}`;
      form.setValue('bookCode', bookCode);
    }
  };

  const onSubmit = async (data: BookFormValues) => {
    try {
      setIsSubmitting(true);
    const formData = {
      ...data,
      coverImage: uploadedImage || '/src/assets/book-covers/cover1.svg',
      genres: selectedGenres.join(', '),
      author: selectedAuthors.join(', '),
      publisher: selectedPublishers.join(', '),
    };

      if (isEditing && book) {
        await apiRequest('PUT', `/api/books/${book.id}`, formData);
        toast({
          title: 'Success',
          description: 'Book updated successfully',
        });
      } else {
        await apiRequest('POST', '/api/books', formData);
        toast({
          title: 'Success',
          description: 'Book added successfully',
        });
      }

      // Invalidate and refetch all related queries
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/popular-books'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/most-borrowed-books'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/top-borrowers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/borrower-distribution'] });
      queryClient.invalidateQueries({ queryKey: ['/api/borrowings'] });

      // Force immediate refetch to ensure UI updates
      queryClient.refetchQueries({ queryKey: ['/api/books'], type: 'active' });
      queryClient.refetchQueries({ queryKey: ['/api/borrowings'], type: 'active' });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'add'} book. Please try again.`,
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
        <CardTitle>{isEditing ? 'Edit Book' : 'Add New Book'}</CardTitle>
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
                    <FormLabel>Book Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter book name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="author"
                render={() => (
                  <FormItem>
                    <FormLabel>Author(s)</FormLabel>
                    <Popover open={authorsOpen} onOpenChange={setAuthorsOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={authorsOpen}
                          className="w-full justify-between mt-1 h-auto min-h-[40px] text-left"
                        >
                          <div className="flex flex-wrap gap-1">
                            {selectedAuthors.length === 0 && "Select authors..."}
                            {selectedAuthors.map((author, index) => (
                              <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                {author}
                                <X 
                                  className="ml-1 h-3 w-3 cursor-pointer" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedAuthors(selectedAuthors.filter((_, i) => i !== index));
                                  }}
                                />
                              </Badge>
                            ))}
                          </div>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput 
                            placeholder="Search authors..." 
                            value={newAuthor}
                            onValueChange={setNewAuthor}
                          />
                          <CommandEmpty>
                            <div className="p-2">
                              <p className="text-sm text-gray-500 mb-2">No author found.</p>
                              {newAuthor && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (newAuthor.trim() && !selectedAuthors.includes(newAuthor.trim())) {
                                      setSelectedAuthors([...selectedAuthors, newAuthor.trim()]);
                                      setNewAuthor('');
                                    }
                                  }}
                                >
                                  Add "{newAuthor}"
                                </Button>
                              )}
                            </div>
                          </CommandEmpty>
                          <CommandGroup className="max-h-64 overflow-auto">
                            {PREDEFINED_AUTHORS.map((author) => (
                              <CommandItem
                                key={author}
                                onSelect={() => {
                                  if (selectedAuthors.includes(author)) {
                                    setSelectedAuthors(selectedAuthors.filter(a => a !== author));
                                  } else {
                                    setSelectedAuthors([...selectedAuthors, author]);
                                  }
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedAuthors.includes(author) ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {author}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                    <p className="text-sm text-gray-500 mt-1">
                      Select multiple authors or add new ones
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="publisher"
                render={() => (
                  <FormItem>
                    <FormLabel>Publisher(s)</FormLabel>
                    <Popover open={publishersOpen} onOpenChange={setPublishersOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={publishersOpen}
                          className="w-full justify-between mt-1 h-auto min-h-[40px] text-left"
                        >
                          <div className="flex flex-wrap gap-1">
                            {selectedPublishers.length === 0 && "Select publishers..."}
                            {selectedPublishers.map((publisher, index) => (
                              <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-800">
                                {publisher}
                                <X 
                                  className="ml-1 h-3 w-3 cursor-pointer" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPublishers(selectedPublishers.filter((_, i) => i !== index));
                                  }}
                                />
                              </Badge>
                            ))}
                          </div>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput 
                            placeholder="Search publishers..." 
                            value={newPublisher}
                            onValueChange={setNewPublisher}
                          />
                          <CommandEmpty>
                            <div className="p-2">
                              <p className="text-sm text-gray-500 mb-2">No publisher found.</p>
                              {newPublisher && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (newPublisher.trim() && !selectedPublishers.includes(newPublisher.trim())) {
                                      setSelectedPublishers([...selectedPublishers, newPublisher.trim()]);
                                      setNewPublisher('');
                                    }
                                  }}
                                >
                                  Add "{newPublisher}"
                                </Button>
                              )}
                            </div>
                          </CommandEmpty>
                          <CommandGroup className="max-h-64 overflow-auto">
                            {PREDEFINED_PUBLISHERS.map((publisher) => (
                              <CommandItem
                                key={publisher}
                                onSelect={() => {
                                  if (selectedPublishers.includes(publisher)) {
                                    setSelectedPublishers(selectedPublishers.filter(p => p !== publisher));
                                  } else {
                                    setSelectedPublishers([...selectedPublishers, publisher]);
                                  }
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedPublishers.includes(publisher) ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {publisher}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                    <p className="text-sm text-gray-500 mt-1">
                      Select multiple publishers or add new ones
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cabinet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cabinet</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., A" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          updateBookCode();
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shelf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shelf</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., 01" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          updateBookCode();
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="num"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., 001" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          updateBookCode();
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bookCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Book Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Book code" {...field} readOnly />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="publishedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Published Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalPages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Pages</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        placeholder="Enter total pages"
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
                control={form.control}
                name="genres"
                render={() => (
                  <FormItem>
                    <FormLabel>Genres</FormLabel>
                    <Popover open={genresOpen} onOpenChange={setGenresOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={genresOpen}
                          className="w-full justify-between mt-1 h-auto min-h-[40px] text-left"
                        >
                          <div className="flex flex-wrap gap-1">
                            {selectedGenres.length === 0 && "Select genres..."}
                            {selectedGenres.map((genre, index) => (
                              <Badge key={index} variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                                {genre}
                                <X 
                                  className="ml-1 h-3 w-3 cursor-pointer" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedGenres(selectedGenres.filter((_, i) => i !== index));
                                  }}
                                />
                              </Badge>
                            ))}
                          </div>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search genres..." />
                          <CommandEmpty>No genre found.</CommandEmpty>
                          <CommandGroup className="max-h-64 overflow-auto">
                            {PREDEFINED_GENRES.map((genre) => (
                              <CommandItem
                                key={genre}
                                onSelect={() => {
                                  if (selectedGenres.includes(genre)) {
                                    setSelectedGenres(selectedGenres.filter(g => g !== genre));
                                  } else {
                                    setSelectedGenres([...selectedGenres, genre]);
                                  }
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedGenres.includes(genre) ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {genre}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                    <p className="text-sm text-gray-500 mt-1">
                      Select multiple genres for this book
                    </p>
                  </FormItem>
                )}
              />

            <FormField
              control={form.control}
              name="index"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Index Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter book index content" 
                      className="min-h-[120px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-sm text-gray-500 mt-1">
                    Enter the table of contents or index of the book
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter book description" 
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comments</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter any additional comments about the book" 
                      className="min-h-[80px]" 
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
                {isSubmitting ? 'Saving...' : isEditing ? 'Update Book' : 'Add Book'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
    </ScrollArea>
  );
};

export default BookForm;