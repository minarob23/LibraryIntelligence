import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertBookSchema } from '@shared/schema';
import { z } from 'zod';
import { Calendar, Upload, X, Check, ChevronsUpDown, Plus, BookOpen, Quote, List } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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

const PREDEFINED_TAGS = [
  "Classic Literature",
  "Educational",
  "Reference",
  "Biography",
  "Academic",
  "Religious Studies",
  "Philosophy",
  "History",
  "Theology",
  "Spiritual",
  "Biblical Studies",
  "Patristic",
  "Liturgy",
  "Prayer",
  "Saints",
  "Martyrs",
  "Monasticism",
  "Ethics",
  "Apologetics",
  "Comparative Religion",
  "Psychology",
  "Sociology",
  "Anthropology",
  "Archaeology",
  "Manuscripts",
  "Commentary",
  "Hermeneutics",
  "Exegesis",
  "Church Fathers",
  "Eastern Orthodox",
  "Coptic",
  "Byzantine",
  "Medieval",
  "Modern",
  "Contemporary",
  "Arabic",
  "English",
  "Bilingual",
  "Translation",
  "Critical Edition",
  "Popular",
  "Academic Level",
  "Beginner Friendly",
  "Advanced",
  "Research",
  "Devotional",
  "Pastoral",
  "Youth",
  "Family",
  "Women Studies",
  "Men Studies",
  "Marriage",
  "Parenting",
  "Social Issues",
  "Politics",
  "Economics",
  "Science",
  "Art",
  "Music",
  "Poetry",
  "Drama",
  "Fiction",
  "Non-Fiction",
  "Rare Book",
  "First Edition",
  "Illustrated",
  "Maps",
  "Charts",
  "Photographs"
];

const bookSchema = insertBookSchema.extend({
  name: z.string().optional(),
  author: z.string().optional(),
  publisher: z.string().optional(),
  bookCode: z.string().optional(),
  index: z.string().optional(),
  copies: z.number().optional(),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  totalPages: z.number().optional(),
  cabinet: z.string().optional(),
  shelf: z.string().optional(),
  num: z.string().optional(),
  addedDate: z.string().optional(),
  publishedDate: z.string().optional(),
  genres: z.string().optional(),
  tags: z.string().optional(),
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

  // Fetch borrowings data for statistics calculation
  const { data: borrowings } = useQuery({ 
    queryKey: ['/api/borrowings'],
    refetchInterval: 2000,
  });

  // Helper functions for statistics calculation
  const getBookBorrowings = (bookId: number) => {
    if (!borrowings || !bookId) return [];
    return borrowings.filter((b: any) => b.bookId === bookId) || [];
  };

  const getTimesBorrowed = (bookId: number) => {
    return getBookBorrowings(bookId).length;
  };

  const getLastBorrowedDate = (bookId: number) => {
    const bookBorrowings = getBookBorrowings(bookId);
    if (bookBorrowings.length === 0) return null;

    const dates = bookBorrowings.map((b: any) => new Date(b.borrowDate));
    return new Date(Math.max(...dates.map(d => d.getTime())));
  };

  const getAverageRating = (bookId: number) => {
    const bookBorrowings = getBookBorrowings(bookId).filter((b: any) => b.rating);
    if (bookBorrowings.length === 0) return null;

    const sum = bookBorrowings.reduce((acc: number, b: any) => acc + b.rating, 0);
    return (sum / bookBorrowings.length).toFixed(1);
  };

  const getPopularityScore = (bookId: number) => {
    const timesBorrowed = getTimesBorrowed(bookId);
    const avgRating = getAverageRating(bookId);
    const lastBorrowed = getLastBorrowedDate(bookId);

    if (timesBorrowed === 0) return 0;

    // Base score from borrowing frequency (max 50 points)
    let score = Math.min(timesBorrowed * 10, 50);

    // Add rating bonus (max 30 points)
    if (avgRating) {
      score += parseFloat(avgRating) * 6;
    }

    // Add recency bonus (max 20 points)
    if (lastBorrowed) {
      const daysSince = Math.floor((new Date().getTime() - lastBorrowed.getTime()) / (1000 * 60 * 60 * 24));
      const recencyBonus = Math.max(0, 20 - (daysSince / 7));
      score += recencyBonus;
    }

    return Math.round(score);
  };
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
  const [selectedTags, setSelectedTags] = useState<string[]>(
    book?.tags ? book.tags.split(',').map((t: string) => t.trim()) : []
  );
  const [genresOpen, setGenresOpen] = useState(false);
  const [authorsOpen, setAuthorsOpen] = useState(false);
  const [publishersOpen, setPublishersOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [newAuthor, setNewAuthor] = useState('');
  const [newPublisher, setNewPublisher] = useState('');
  const [newGenre, setNewGenre] = useState('');
  const [newTag, setNewTag] = useState('');

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
  const [showIndexModal, setShowIndexModal] = useState(false);

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
      tags: '',
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
      tags: selectedTags.join(', '),
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
                          <CommandInput 
                            placeholder="Search genres..." 
                            value={newGenre}
                            onValueChange={setNewGenre}
                          />
                          <CommandEmpty>
                            <div className="p-2">
                              <p className="text-sm text-gray-500 mb-2">No genre found.</p>
                              {newGenre && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (newGenre.trim() && !selectedGenres.includes(newGenre.trim())) {
                                      setSelectedGenres([...selectedGenres, newGenre.trim()]);
                                      setNewGenre('');
                                    }
                                  }}
                                >
                                  Add "{newGenre}"
                                </Button>
                              )}
                            </div>
                          </CommandEmpty>
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

            {/* Tags Field */}
            <FormField
                control={form.control}
                name="tags"
                render={() => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-1 rounded">
                        <span className="text-white text-xs">🏷️</span>
                      </div>
                      Book Tags
                      {selectedTags.length > 0 && (
                        <Badge variant="secondary" className="ml-2 bg-pink-100 text-pink-800">
                          {selectedTags.length} selected
                        </Badge>
                      )}
                    </FormLabel>
                    <Popover open={tagsOpen} onOpenChange={setTagsOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={tagsOpen}
                          className="w-full justify-between mt-1 h-auto min-h-[50px] text-left border-2 border-pink-200 hover:border-pink-300 focus:border-pink-400"
                        >
                          <div className="flex flex-wrap gap-1 max-w-[calc(100%-2rem)]">
                            {selectedTags.length === 0 && (
                              <span className="text-muted-foreground">Select tags to categorize this book...</span>
                            )}
                            {selectedTags.map((tag, index) => (
                              <Badge 
                                key={index} 
                                variant="secondary" 
                                className="text-xs bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 border border-pink-200 hover:bg-pink-200"
                              >
                                {tag}
                                <X 
                                  className="ml-1 h-3 w-3 cursor-pointer hover:bg-pink-300 rounded-full" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTags(selectedTags.filter((_, i) => i !== index));
                                  }}
                                />
                              </Badge>
                            ))}
                          </div>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0 max-h-80">
                        <Command>
                          <CommandInput 
                            placeholder="Search tags or type to add new..." 
                            value={newTag}
                            onValueChange={setNewTag}
                            className="border-pink-200 focus:border-pink-400"
                          />
                          <CommandEmpty>
                            <div className="p-3 space-y-2">
                              <p className="text-sm text-gray-500">No tag found.</p>
                              {newTag && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
                                      setSelectedTags([...selectedTags, newTag.trim()]);
                                      setNewTag('');
                                    }
                                  }}
                                  className="w-full bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-700"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add "{newTag}" as new tag
                                </Button>
                              )}
                            </div>
                          </CommandEmpty>
                          <CommandGroup className="max-h-64 overflow-auto">
                            <div className="p-2">
                              <div className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                                <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                                Popular Tags
                              </div>
                              <div className="grid grid-cols-2 gap-1">
                                {PREDEFINED_TAGS.slice(0, 8).map((tag) => (
                                  <CommandItem
                                    key={tag}
                                    onSelect={() => {
                                      if (selectedTags.includes(tag)) {
                                        setSelectedTags(selectedTags.filter(t => t !== tag));
                                      } else {
                                        setSelectedTags([...selectedTags, tag]);
                                      }
                                    }}
                                    className="text-xs p-2 cursor-pointer hover:bg-pink-50"
                                  >
                                    <div className="flex items-center gap-2 w-full">
                                      <Check
                                        className={cn(
                                          "h-3 w-3",
                                          selectedTags.includes(tag) ? "opacity-100 text-pink-600" : "opacity-0"
                                        )}
                                      />
                                      <span className="truncate">{tag}</span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </div>
                            </div>
                            
                            <div className="border-t border-gray-200 p-2">
                              <div className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                All Tags ({PREDEFINED_TAGS.length})
                              </div>
                              {PREDEFINED_TAGS.map((tag) => (
                                <CommandItem
                                  key={tag}
                                  onSelect={() => {
                                    if (selectedTags.includes(tag)) {
                                      setSelectedTags(selectedTags.filter(t => t !== tag));
                                    } else {
                                      setSelectedTags([...selectedTags, tag]);
                                    }
                                  }}
                                  className="text-sm p-2 cursor-pointer hover:bg-pink-50"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedTags.includes(tag) ? "opacity-100 text-pink-600" : "opacity-0"
                                    )}
                                  />
                                  {tag}
                                </CommandItem>
                              ))}
                            </div>
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                    <div className="text-sm text-gray-500 mt-2 p-2 bg-pink-50 dark:bg-pink-900/20 rounded border border-pink-200 dark:border-pink-800">
                      <p className="font-medium text-pink-800 dark:text-pink-300 mb-1">💡 Tagging Tips:</p>
                      <ul className="text-xs space-y-1 text-pink-700 dark:text-pink-400">
                        <li>• Use specific tags to help readers find exactly what they need</li>
                        <li>• Combine subject tags (e.g., "Theology") with format tags (e.g., "Academic")</li>
                        <li>• Add difficulty level tags like "Beginner Friendly" or "Advanced"</li>
                        <li>• Include language tags for bilingual or translated works</li>
                      </ul>
                    </div>
                  </FormItem>
                )}
              />

            {/* Table of Contents Modal Button */}
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowIndexModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 border-0"
                >
                  <List className="h-4 w-4 mr-2" />
                  Table of Contents
                </Button>
              </div>

              {indexItems.length > 0 && (
                <div className="bg-muted/30 p-3 rounded-lg border border-dashed">
                  <p className="text-sm text-muted-foreground text-center">
                    {indexItems.length} items • Click "Table of Contents" to view and edit
                  </p>
                </div>
              )}
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
              {/* Additional Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>ℹ️ Note:</strong> {isEditing 
                    ? 'These statistics are automatically calculated based on borrowing history and user ratings. They update in real-time as the book is borrowed and returned.'
                    : 'Statistics will be calculated automatically once the book is added and starts being borrowed by members.'
                  }
                </p>
              </div>

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
                      {isEditing && book?.id ? 
                        (getLastBorrowedDate(book.id) 
                          ? getLastBorrowedDate(book.id)?.toLocaleDateString() 
                          : 'Never borrowed'
                        ) : 'Never borrowed'
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
                      {isEditing && book?.id ? getTimesBorrowed(book.id) : 0}
                    </span>
                    <span className="text-xs text-green-600 dark:text-green-400 ml-2">
                      {((isEditing && book?.id ? getTimesBorrowed(book.id) : 0) === 1) ? 'time' : 'times'}
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
                      {isEditing && book?.id ? getPopularityScore(book.id) : 0}
                    </span>
                    <span className="text-xs text-purple-600 dark:text-purple-400 ml-2">
                      / 100
                    </span>
                  </div>
                </div>

                {/* Average Rating */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    ⭐ Average Rating
                  </Label>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md border border-yellow-200 dark:border-yellow-800">
                    <span className="text-lg font-bold text-yellow-800 dark:text-yellow-300">
                      {isEditing && book?.id && getAverageRating(book.id) ? `${getAverageRating(book.id)}/10` : 'No ratings'}
                    </span>
                    {isEditing && book?.id && getAverageRating(book.id) && (
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${
                              i < Math.floor((parseFloat(getAverageRating(book.id) || '0')) / 2) 
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

              {/* Current Status */}
              {isEditing && book?.id && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    📋 Current Status
                  </Label>
                  <div className={`p-3 rounded-md border ${
                    borrowings?.some((b: any) => b.bookId === book.id && b.status === 'borrowed')
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                      : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  }`}>
                    <span className={`text-sm font-medium ${
                      borrowings?.some((b: any) => b.bookId === book.id && b.status === 'borrowed')
                        ? 'text-yellow-800 dark:text-yellow-300'
                        : 'text-green-800 dark:text-green-300'
                    }`}>
                      {borrowings?.some((b: any) => b.bookId === book.id && b.status === 'borrowed')
                        ? '📤 Currently Borrowed'
                        : '📥 Available for Borrowing'
                      }
                    </span>
                  </div>
                </div>
              )}

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

        {/* Beautiful Table of Contents Modal */}
        <Dialog open={showIndexModal} onOpenChange={setShowIndexModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                  <List className="h-5 w-5 text-white" />
                </div>
                Table of Contents
                {indexItems.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {indexItems.length} items
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Statistics */}
              {indexItems.length > 0 && (
                <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{indexItems.filter(item => item.level === 1).length}</div>
                    <div className="text-sm text-muted-foreground">Chapters</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{indexItems.filter(item => item.level === 2).length}</div>
                    <div className="text-sm text-muted-foreground">Sections</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{indexItems.filter(item => item.level === 3).length}</div>
                    <div className="text-sm text-muted-foreground">Subsections</div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowIndexForm(true)}
                  className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Chapter
                </Button>

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
                </div>
              </div>

              {/* Add Index Form */}
              {showIndexForm && (
                <Card className="p-4 border-2 border-dashed border-green-200 bg-green-50/50 dark:bg-green-900/10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-green-500 p-1 rounded">
                        <List className="h-3 w-3 text-white" />
                      </div>
                      <Label className="font-medium text-green-800 dark:text-green-300">
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
                          className="border-green-200 focus:border-green-400"
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
                            className="border-green-200 focus:border-green-400"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Hierarchy Level</Label>
                          <Select 
                            value={indexForm.level.toString()} 
                            onValueChange={(value) => setIndexForm({ ...indexForm, level: parseInt(value) })}
                          >
                            <SelectTrigger className="border-green-200 focus:border-green-400">
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

                    <div className="flex gap-2 mt-4 pt-3 border-t border-green-200">
                      <Button 
                        type="button" 
                        size="sm" 
                        onClick={handleAddIndexItem}
                        disabled={!indexForm.title.trim()}
                        className="bg-green-600 hover:bg-green-700"
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
                          setIndexForm({ title: '', page: '', level: 1, order: 0 });
                        }}
                        className="border-green-200 text-green-700 hover:bg-green-50"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Index Items Display with Enhanced Hierarchy */}
              <ScrollArea className="max-h-[400px] pr-4">
                <div className="space-y-1">
                  {indexItems.length > 0 ? (
                    indexItems
                      .sort((a, b) => {
                        // Sort by page number, then by order
                        if (a.page && b.page) return Number(a.page) - Number(b.page);
                        return a.order - b.order;
                      })
                      .map((item, index) => (
                        <div
                          key={index}
                          className={`group relative border rounded-lg transition-all duration-200 hover:shadow-md ${
                            item.level === 1 
                              ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 hover:border-blue-400 dark:from-blue-900/20 dark:to-blue-800/30 dark:border-blue-700' :
                            item.level === 2 
                              ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200 hover:border-green-400 dark:from-green-900/20 dark:to-green-800/30 dark:border-green-700 ml-6' :
                              'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 hover:border-purple-400 dark:from-purple-900/20 dark:to-purple-800/30 dark:border-purple-700 ml-12'
                          } p-3`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              {/* Hierarchical Icon */}
                              <div className={`flex items-center justify-center rounded-lg p-1.5 ${
                                item.level === 1 ? 'bg-blue-500 text-white' :
                                item.level === 2 ? 'bg-green-500 text-white' :
                                'bg-purple-500 text-white'
                              }`}>
                                {item.level === 1 ? (
                                  <BookOpen className="h-3 w-3" />
                                ) : item.level === 2 ? (
                                  <FileText className="h-3 w-3" />
                                ) : (
                                  <Minus className="h-3 w-3" />
                                )}
                              </div>

                              {/* Hierarchy Lines */}
                              {item.level > 1 && (
                                <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600" style={{
                                  left: item.level === 2 ? '12px' : '36px'
                                }} />
                              )}

                              <div className="flex-1">
                                {/* Title with Level Styling */}
                                <div className={`font-medium flex items-center gap-2 ${
                                  item.level === 1 ? 'text-lg text-blue-800 dark:text-blue-200' :
                                  item.level === 2 ? 'text-base text-green-800 dark:text-green-200' :
                                  'text-sm text-purple-800 dark:text-purple-200'
                                }`}>
                                  {/* Level Prefix */}
                                  <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                                    item.level === 1 ? 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200' :
                                    item.level === 2 ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200' :
                                    'bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200'
                                  }`}>
                                    {item.level === 1 ? 'CH' : item.level === 2 ? 'SEC' : 'SUB'}
                                  </span>
                                  
                                  <span className="flex-1">{item.title}</span>
                                  
                                  {/* Page Number Badge */}
                                  {item.page && (
                                    <Badge variant="outline" className={`text-xs ${
                                      item.level === 1 ? 'border-blue-300 text-blue-700' :
                                      item.level === 2 ? 'border-green-300 text-green-700' :
                                      'border-purple-300 text-purple-700'
                                    }`}>
                                      p. {item.page}
                                    </Badge>
                                  )}
                                </div>

                                {/* Level Description */}
                                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${
                                    item.level === 1 ? 'bg-blue-400' :
                                    item.level === 2 ? 'bg-green-400' :
                                    'bg-purple-400'
                                  }`} />
                                  <span>
                                    {item.level === 1 ? 'Chapter' : item.level === 2 ? 'Section' : 'Subsection'}
                                    {item.page && ` • Starts at page ${item.page}`}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditIndexItem(item)}
                                className="h-8 w-8 p-0 hover:bg-white/50"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteIndexItem(index)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <Card className="p-8 border-dashed border-2 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
                      <div className="text-center text-muted-foreground">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <List className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">No table of contents yet</h3>
                        <p className="text-sm mb-4">Organize chapters and sections for easy navigation</p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowIndexForm(true)}
                          className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Chapter
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
    </ScrollArea>
  );
};

export default BookForm;