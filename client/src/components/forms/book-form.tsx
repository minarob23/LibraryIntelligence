import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertBookSchema } from '@shared/schema';
import { z } from 'zod';
import { Calendar, Upload, X, Check, ChevronsUpDown, Plus, BookOpen, Quote, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { IndexItem } from '@/components/ui/index-item';
import QuoteCard from '@/components/ui/quote-card';
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
import ImageUpload from '@/components/ui/image-upload';

import IndexItemCard from '@/components/ui/index-item';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Copy, Star, FileText, Minus, Edit } from 'lucide-react';

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
  book?: BookFormValues & { 
    id?: number; 
    lastBorrowedDate?: string; 
    timesBorrowed?: number; 
    popularityScore?: number; 
    rate?: number;
    addedDate?: string;
    publishedDate?: string;
  };
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

  // Quotes management
  const [quotes, setQuotes] = useState<Array<{
    id?: number;
    content: string;
    page?: number;
    chapter?: string;
    author?: string;
    tags?: string;
    isFavorite?: boolean;
  }>>([]);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [editingQuote, setEditingQuote] = useState<any>(null);
  const [quoteForm, setQuoteForm] = useState({
    content: '',
    page: '',
    chapter: '',
    author: '',
    tags: '',
    isFavorite: false
  });

  // Book Index management
  const [indexItems, setIndexItems] = useState<Array<{
    id?: number;
    title: string;
    page?: number;
    level: number;
    order: number;
  }>>([]);
  const [showIndexForm, setShowIndexForm] = useState(false);
  const [editingIndexItem, setEditingIndexItem] = useState<any>(null);
  const [indexForm, setIndexForm] = useState({
    title: '',
    page: '',
    level: 1,
    order: 0
  });

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

  // Quote management functions
  const handleAddQuote = () => {
    if (quoteForm.content.trim()) {
      const newQuote = {
        id: Date.now(),
        content: quoteForm.content,
        page: quoteForm.page ? parseInt(quoteForm.page) : undefined,
        chapter: quoteForm.chapter || undefined,
        author: quoteForm.author || undefined,
        tags: quoteForm.tags || undefined,
        isFavorite: quoteForm.isFavorite
      };

      if (editingQuote) {
        setQuotes(quotes.map(q => q.id === editingQuote.id ? { ...newQuote, id: editingQuote.id } : q));
        setEditingQuote(null);
      } else {
        setQuotes([...quotes, newQuote]);
      }

      setQuoteForm({ content: '', page: '', chapter: '', author: '', tags: '', isFavorite: false });
      setShowQuoteForm(false);
    }
  };

  const handleEditQuote = (quote: any) => {
    setEditingQuote(quote);
    setQuoteForm({
      content: quote.content,
      page: quote.page?.toString() || '',
      chapter: quote.chapter || '',
      author: quote.author || '',
      tags: quote.tags || '',
      isFavorite: quote.isFavorite || false
    });
    setShowQuoteForm(true);
  };

  const handleDeleteQuote = (id: number | string) => {
    setQuotes(quotes.filter(q => q.id !== id));
  };

  const handleToggleQuoteFavorite = (id: number | string) => {
    setQuotes(quotes.map(q => q.id === id ? { ...q, isFavorite: !q.isFavorite } : q));
  };

  // Index management functions
  const handleAddIndexItem = () => {
    if (indexForm.title.trim()) {
      const newItem = {
        id: Date.now(),
        title: indexForm.title,
        page: indexForm.page ? parseInt(indexForm.page) : undefined,
        level: indexForm.level,
        order: indexItems.length
      };

      if (editingIndexItem) {
        setIndexItems(indexItems.map(item => item.id === editingIndexItem.id ? { ...newItem, id: editingIndexItem.id } : item));
        setEditingIndexItem(null);
      } else {
        setIndexItems([...indexItems, newItem]);
      }

      setIndexForm({ title: '', page: '', level: 1, order: 0 });
      setShowIndexForm(false);
    }
  };

  const handleEditIndexItem = (item: any) => {
    setEditingIndexItem(item);
    setIndexForm({
      title: item.title,
      page: item.page?.toString() || '',
      level: item.level,
      order: item.order
    });
    setShowIndexForm(true);
  };

  const handleDeleteIndexItem = (id: number | string) => {
    setIndexItems(indexItems.filter(item => item.id !== id));
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

            {/* Book Index Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Table of Contents ({indexItems.length})
                  {indexItems.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {indexItems.filter(item => item.level === 1).length} chapters
                    </Badge>
                  )}
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const toc = indexItems
                        .sort((a, b) => (a.page || 0) - (b.page || 0))
                        .map(item => `${'  '.repeat(item.level - 1)}${item.title}${item.page ? ` ..................... ${item.page}` : ''}`)
                        .join('\n');
                      navigator.clipboard.writeText(toc);
                      toast({ title: 'Table of contents copied to clipboard!' });
                    }}
                    disabled={indexItems.length === 0}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy TOC
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowIndexForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Chapter
                  </Button>
                </div>
              </div>

              {showIndexForm && (
                <Card className="p-4 border-dashed border-2 bg-muted/20">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <List className="h-4 w-4 text-muted-foreground" />
                      <Label className="font-medium">
                        {editingIndexItem ? 'Edit Index Item' : 'Add New Index Item'}
                      </Label>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Title</Label>
                        <Input
                          placeholder="e.g., Introduction, Chapter 1: The Beginning"
                          value={indexForm.title}
                          onChange={(e) => setIndexForm({ ...indexForm, title: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Page Number</Label>
                          <Input
                            type="number"
                            placeholder="e.g., 1"
                            value={indexForm.page}
                            onChange={(e) => setIndexForm({ ...indexForm, page: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Hierarchy Level</Label>
                          <Select 
                            value={indexForm.level.toString()} 
                            onValueChange={(value) => setIndexForm({ ...indexForm, level: parseInt(value) })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">
                                <div className="flex items-center gap-2">
                                  <BookOpen className="h-3 w-3" />
                                  Level 1 - Chapter/Part
                                </div>
                              </SelectItem>
                              <SelectItem value="2">
                                <div className="flex items-center gap-2 ml-4">
                                  <FileText className="h-3 w-3" />
                                  Level 2 - Section
                                </div>
                              </SelectItem>
                              <SelectItem value="3">
                                <div className="flex items-center gap-2 ml-8">
                                  <Minus className="h-3 w-3" />
                                  Level 3 - Subsection
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-3 border-t">
                    <Button 
                      type="button" 
                      size="sm" 
                      onClick={handleAddIndexItem}
                      disabled={!indexForm.title.trim()}
                    >
                      {editingIndexItem ? (
                        <>
                          <Edit className="h-3 w-3 mr-1" />
                          Update Item
                        </>
                      ) : (
                        <>
                          <Plus className="h-3 w-3 mr-1" />
                          Add Item
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setShowIndexForm(false);
                        setEditingIndexItem(null);
                        setIndexForm({ title: '', page: '', level: 1 });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </Card>
              )}

              <div className="space-y-3">
                {indexItems.length > 0 && (
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>Total items: {indexItems.length}</span>
                    <span>•</span>
                    <span>Chapters: {indexItems.filter(item => item.level === 1).length}</span>
                    <span>•</span>
                    <span>Sections: {indexItems.filter(item => item.level === 2).length}</span>
                    <span>•</span>
                    <span>Subsections: {indexItems.filter(item => item.level === 3).length}</span>
                  </div>
                )}

                <ScrollArea className="max-h-[400px]">
                  <div className="space-y-1">
                    {indexItems
                      .sort((a, b) => {
                        // Sort by page number, then by order
                        if (a.page && b.page) return Number(a.page) - Number(b.page);
                        return a.order - b.order;
                      })
                      .map((item, index) => (
                        <IndexItemCard
                          key={index}
                          item={{ ...item, id: index }}
                          onEdit={handleEditIndexItem}
                          onDelete={handleDeleteIndexItem}
                        />
                      ))}
                  </div>
                </ScrollArea>

                {indexItems.length === 0 && (
                  <Card className="p-6 border-dashed border-2">
                    <div className="text-center text-muted-foreground">
                      <List className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm mb-1">No table of contents added yet</p>
                      <p className="text-xs">Organize chapters and sections for easy navigation</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>

            {/* Quotes Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Quote className="h-4 w-4" />
                  Book Quotes ({quotes.length})
                  {quotes.filter(q => q.isFavorite).length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {quotes.filter(q => q.isFavorite).length} favorite
                    </Badge>
                  )}
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const quote = `"${quotes.map(q => q.content).join('"\n\n"')}"`;
                      navigator.clipboard.writeText(quote);
                      toast({ title: 'Quotes copied to clipboard!' });
                    }}
                    disabled={quotes.length === 0}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy All
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowQuoteForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Quote
                  </Button>
                </div>
              </div>

              {showQuoteForm && (
                <Card className="p-4 border-dashed border-2 bg-muted/20">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Quote className="h-4 w-4 text-muted-foreground" />
                      <Label className="font-medium">
                        {editingQuote ? 'Edit Quote' : 'Add New Quote'}
                      </Label>
                    </div>

                    <Textarea
                      placeholder="Enter the memorable quote from this book..."
                      value={quoteForm.content}
                      onChange={(e) => setQuoteForm({ ...quoteForm, content: e.target.value })}
                      className="min-h-[100px] resize-none"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Page Number</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 42"
                          value={quoteForm.page}
                          onChange={(e) => setQuoteForm({ ...quoteForm, page: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Chapter</Label>
                        <Input
                          placeholder="e.g., Chapter 5"
                          value={quoteForm.chapter}
                          onChange={(e) => setQuoteForm({ ...quoteForm, chapter: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Character/Speaker</Label>
                        <Input
                          placeholder="e.g., Narrator"
                          value={quoteForm.author}
                          onChange={(e) => setQuoteForm({ ...quoteForm, author: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Tags</Label>
                        <Input
                          placeholder="love, wisdom, conflict"
                          value={quoteForm.tags}
                          onChange={(e) => setQuoteForm({ ...quoteForm, tags: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="isFavorite"
                        checked={quoteForm.isFavorite}
                        onCheckedChange={(checked) => setQuoteForm({ ...quoteForm, isFavorite: !!checked })}
                      />
                      <Label htmlFor="isFavorite" className="text-sm flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        Mark as favorite
                      </Label>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-3 border-t">
                    <Button 
                      type="button" 
                      size="sm" 
                      onClick={handleAddQuote}
                      disabled={!quoteForm.content.trim()}
                    >
                      {editingQuote ? (
                        <>
                          <Edit className="h-3 w-3 mr-1" />
                          Update Quote
                        </>
                      ) : (
                        <>
                          <Plus className="h-3 w-3 mr-1" />
                          Add Quote
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setShowQuoteForm(false);
                        setEditingQuote(null);
                        setQuoteForm({ content: '', page: '', chapter: '', author: '', tags: '', isFavorite: false });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </Card>
              )}

              <div className="space-y-3">
                {quotes.length > 0 && (
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>Total: {quotes.length}</span>
                    <span>•</span>
                    <span>Favorites: {quotes.filter(q => q.isFavorite).length}</span>
                    <span>•</span>
                    <span>With Pages: {quotes.filter(q => q.page).length}</span>
                  </div>
                )}

                {quotes
                  .sort((a, b) => {
                    // Sort favorites first, then by page number
                    if (a.isFavorite && !b.isFavorite) return -1;
                    if (!a.isFavorite && b.isFavorite) return 1;
                    if (a.page && b.page) return Number(a.page) - Number(b.page);
                    return 0;
                  })
                  .map((quote, index) => (
                    <QuoteCard
                      key={index}
                      quote={{ ...quote, id: index }}
                      onEdit={handleEditQuote}
                      onDelete={handleDeleteQuote}
                      onToggleFavorite={handleToggleQuoteFavorite}
                    />
                  ))}

                {quotes.length === 0 && (
                  <Card className="p-6 border-dashed border-2">
                    <div className="text-center text-muted-foreground">
                      <Quote className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm mb-1">No quotes added yet</p>
                      <p className="text-xs">Capture memorable passages from this book</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>

             {/* Book Statistics Section - Read Only */}
            <div className="space-y-4 pt-6 border-t">
              <Label className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                📊 Book Statistics & Information
              </Label>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Added Date */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    📅 Added Date
                  </Label>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md border">
                    <span className="text-sm font-mono">
                      {isEditing 
                        ? (book?.addedDate ? new Date(book.addedDate).toLocaleDateString() : 'Not set')
                        : new Date().toLocaleDateString()
                      }
                    </span>
                  </div>
                </div>

                {/* Published Date */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    📖 Published Date
                  </Label>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md border">
                    <span className="text-sm font-mono">
                      {book?.publishedDate 
                        ? new Date(book.publishedDate).toLocaleDateString() 
                        : form.getValues('publishedDate') 
                          ? new Date(form.getValues('publishedDate')).toLocaleDateString()
                          : 'Not specified'
                      }
                    </span>
                  </div>
                </div>

                {/* Last Borrowed Date */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    🕒 Last Borrowed Date
                  </Label>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                    <span className="text-sm font-mono text-blue-800 dark:text-blue-300">
                      {isEditing && book?.lastBorrowedDate 
                        ? new Date(book.lastBorrowedDate).toLocaleDateString() 
                        : 'Never borrowed'
                      }
                    </span>
                  </div>
                </div>

                {/* Times Borrowed */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    🔄 Times Borrowed
                  </Label>
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-200 dark:border-green-800">
                    <span className="text-lg font-bold text-green-800 dark:text-green-300">
                      {isEditing ? (book?.timesBorrowed ?? 0) : 0}
                    </span>
                    <span className="text-xs text-green-600 dark:text-green-400 ml-2">
                      {((isEditing ? (book?.timesBorrowed ?? 0) : 0) === 1) ? 'time' : 'times'}
                    </span>
                  </div>
                </div>

                {/* Popularity Score */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    🌟 Popularity Score
                  </Label>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-md border border-purple-200 dark:border-purple-800">
                    <span className="text-lg font-bold text-purple-800 dark:text-purple-300">
                      {isEditing ? (book?.popularityScore ?? 0) : 0}
                    </span>
                    <span className="text-xs text-purple-600 dark:text-purple-400 ml-2">
                      / 100
                    </span>
                  </div>
                </div>

                {/* Rate */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    ⭐ Average Rating
                  </Label>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md border border-yellow-200 dark:border-yellow-800">
                    <span className="text-lg font-bold text-yellow-800 dark:text-yellow-300">
                      {isEditing && book?.rate ? `${book.rate}/10` : 'No ratings'}
                    </span>
                    {isEditing && book?.rate && (
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${
                              i < Math.floor((book.rate || 0) / 2) 
                                ? 'text-yellow-500 fill-current' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>ℹ️ Note:</strong> {isEditing 
                    ? 'These statistics are automatically calculated based on borrowing history and user ratings. They update in real-time as the book is borrowed and returned.'
                    : 'Statistics will be calculated automatically once the book is added and starts being borrowed by members.'
                  }
                </p>
              </div>
            </div>

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