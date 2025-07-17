import { useState, useEffect } from 'react';
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



const PREDEFINED_TAGS = [
  "Academic", "Research", "Reference", "Textbook", "Popular", "Classic", "Contemporary",
  "Beginner", "Advanced", "Comprehensive", "Introduction", "Guide", "Manual", "Handbook",
  "Philosophy", "History", "Science", "Technology", "Literature", "Poetry", "Fiction",
  "Non-fiction", "Biography", "Autobiography", "Memoir", "Essay", "Article", "Journal",
  "Educational", "Religious", "Spiritual", "Cultural", "Social", "Political", "Economic",
  "Arabic", "English", "Bilingual", "Translation", "Original", "Revised", "Updated",
  "Illustrated", "Charts", "Diagrams", "Maps", "Tables", "Index", "Bibliography",
  "Rare", "Valuable", "Limited Edition", "First Edition", "Reprinted", "Digital Available"
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
  const [selectedTags, setSelectedTags] = useState<string[]>(
    book?.tags ? book.tags.split(',').map((t: string) => t.trim()) : []
  );
  const [genresOpen, setGenresOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [newGenre, setNewGenre] = useState('');
  const [newTag, setNewTag] = useState('');

  // Quotes management with auto-load from localStorage
  const [quotes, setQuotes] = useState<Array<{
    id?: number;
    content: string;
    page?: number;
    chapter?: string;
    author?: string;
    tags?: string;
    isFavorite?: boolean;
  }>>(() => {
    // Load saved quotes on initialization
    if (book?.id) {
      try {
        const savedQuotes = localStorage.getItem(`book-quotes-${book.id}`);
        return savedQuotes ? JSON.parse(savedQuotes) : [];
      } catch (error) {
        console.error('Error loading saved quotes:', error);
        return [];
      }
    }
    return [];
  });
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
  const [indexSearch, setIndexSearch] = useState('');

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

  // Quote management functions with auto-save
  const handleAddQuote = async () => {
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

      // Auto-save quotes to localStorage
      const updatedQuotes = editingQuote 
        ? quotes.map(q => q.id === editingQuote.id ? { ...newQuote, id: editingQuote.id } : q)
        : [...quotes, newQuote];

      try {
        localStorage.setItem(`book-quotes-${book?.id || 'new'}`, JSON.stringify(updatedQuotes));
        toast({
          title: 'Quote Saved',
          description: 'Quote has been automatically saved.',
        });
      } catch (error) {
        console.error('Error saving quote:', error);
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

  const handleDeleteQuote = async (id: number | string) => {
    const updatedQuotes = quotes.filter(q => q.id !== id);
    setQuotes(updatedQuotes);

    // Auto-save to localStorage
    try {
      localStorage.setItem(`book-quotes-${book?.id || 'new'}`, JSON.stringify(updatedQuotes));
      toast({
        title: 'Quote Deleted',
        description: 'Quote has been automatically removed.',
      });
    } catch (error) {
      console.error('Error saving quotes after deletion:', error);
    }
  };

  const handleToggleQuoteFavorite = async (id: number | string) => {
    const quote = quotes.find(q => q.id === id);
    const isBecomingFavorite = !quote?.isFavorite;

    const updatedQuotes = quotes.map(q => q.id === id ? { ...q, isFavorite: !q.isFavorite } : q);
    setQuotes(updatedQuotes);

    // Auto-save to localStorage
    try {
      localStorage.setItem(`book-quotes-${book?.id || 'new'}`, JSON.stringify(updatedQuotes));
      toast({
        title: isBecomingFavorite ? '❤️ Added to Favorites' : '💔 Removed from Favorites',
        description: isBecomingFavorite 
          ? 'Quote has been marked as favorite and saved.' 
          : 'Quote has been removed from favorites and saved.',
      });
    } catch (error) {
      console.error('Error saving quotes after favorite toggle:', error);
    }
  };

  // Index management functions
  const handleAddIndexItem = () => {
    if (!indexForm.title.trim()) return;

    const newItem = {
      ...indexForm,
      page: indexForm.page ? parseInt(indexForm.page) : undefined,
      id: Date.now(),
      order: indexItems.length
    };

    let updatedItems;
    if (editingIndexItem) {
      updatedItems = indexItems.map(item => 
        item.id === editingIndexItem.id ? { ...newItem, id: editingIndexItem.id } : item
      );
    } else {
      updatedItems = [...indexItems, newItem];
    }

    setIndexItems(updatedItems);

    setIndexForm({ title: '', page: '', level: 1, order: 0 });
    setEditingIndexItem(null);
    setShowIndexForm(false);
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

  const handleDeleteIndexItem = (index: number) => {
    const updatedItems = indexItems.filter((_, i) => i !== index);
    setIndexItems(updatedItems);
  };

  const onSubmit = async (data: BookFormValues) => {
    try {
      setIsSubmitting(true);
    const formData = {
      ...data,
      coverImage: uploadedImage || '/src/assets/book-covers/cover1.svg',
      genres: selectedGenres.join(', '),
      tags: selectedTags.join(', '),
      tableOfContents: JSON.stringify(indexItems),
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

  // Load existing table of contents if editing
  useEffect(() => {
    if (book?.tableOfContents) {
      try {
        const parsed = JSON.parse(book.tableOfContents);
        if (Array.isArray(parsed)) {
          setIndexItems(parsed);
        }
      } catch (error) {
        console.error('Error parsing table of contents:', error);
      }
    }
  }, [book]);

  // Auto-save table of contents whenever indexItems change
  useEffect(() => {
    form.setValue('tableOfContents', JSON.stringify(indexItems));
  }, [indexItems, form]);

  // Auto-save table of contents when modal closes
  useEffect(() => {
    if (!showIndexModal) {
      form.setValue('tableOfContents', JSON.stringify(indexItems));
    }
  }, [showIndexModal, indexItems, form]);

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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author Information</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter author information" {...field} />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-gray-500 mt-1">
                      Enter general author information
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="publisher"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Publisher Information</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter publisher information" {...field} />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-gray-500 mt-1">
                      Enter general publisher information
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
                    <FormLabel>PublishedDate</FormLabel>
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
                                  className="ml-1 h-3 w-3 cursor-pointer hover:text-red-600 transition-colors" 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const updatedGenres = selectedGenres.filter((_, i) => i !== index);
                                    setSelectedGenres(updatedGenres);
                                    form.setValue('genres', updatedGenres.join(', '));
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

            {/* Beautiful Tags Field */}
            <FormField
              control={form.control}
              name="tags"
              render={() => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-1 rounded">
                      <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Tags
                  </FormLabel>

                  <div className="space-y-3">
                    <Popover open={tagsOpen} onOpenChange={setTagsOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={tagsOpen}
                          className="w-full justify-between mt-1 h-auto min-h-[50px] text-left bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 border-orange-200 dark:border-orange-700 hover:from-orange-100 hover:to-pink-100"
                        >
                          <div className="flex flex-wrap gap-1 max-w-full">
                            {selectedTags.length === 0 && (
                              <span className="text-gray-500">Add tags to categorize this book...</span>
                            )}
                            {selectedTags.map((tag, index) => (
                              <Badge 
                                key={index} 
                                variant="secondary" 
                                className="text-xs bg-gradient-to-r from-orange-100 to-pink-100 text-orange-800 dark:from-orange-900/50 dark:to-pink-900/50 dark:text-orange-300 hover:from-orange-200 hover:to-pink-200 transition-colors border border-orange-200 dark:border-orange-700"
                              >
                                🏷️ {tag}
                                <X 
                                  className="ml-1 h-3 w-3 cursor-pointer hover:text-red-600 transition-colors" 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const updatedTags = selectedTags.filter((_, i) => i !== index);
                                    setSelectedTags(updatedTags);
                                    form.setValue('tags', updatedTags.join(', '));
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
                            placeholder="Search or add new tags..." 
                            value={newTag}
                            onValueChange={setNewTag}
                          />
                          <CommandEmpty>
                            <div className="p-3">
                              <p className="text-sm text-gray-500 mb-3">No tag found.</p>
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
                                  className="w-full bg-gradient-to-r from-orange-50 to-pink-50 border-orange-200 text-orange-800 hover:from-orange-100 hover:to-pink-100"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Create "{newTag}"
                                </Button>
                              )}
                            </div>
                          </CommandEmpty>
                          <CommandGroup className="max-h-64 overflow-auto">
                            <div className="p-2 border-b">
                              <p className="text-xs font-medium text-gray-600 mb-2">📚 Popular Tags</p>
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
                                className="flex items-center px-3 py-2 hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedTags.includes(tag) ? "opacity-100 text-orange-600" : "opacity-0"
                                  )}
                                />
                                <span className="mr-2">🏷️</span>
                                {tag}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {/* Tags Preview */}
                    {selectedTags.length > 0 && (
                      <div className="bg-gradient-to-r from-orange-50/50 to-pink-50/50 dark:from-orange-900/10 dark:to-pink-900/10 p-3 rounded-lg border border-dashed border-orange-200 dark:border-orange-700">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                            Selected Tags ({selectedTags.length})
                          </p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTags([])}
                            className="h-6 px-2 text-xs text-orange-600 hover:text-orange-800 hover:bg-orange-100"
                          >
                            Clear All
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {selectedTags.map((tag, index) => (
                            <span 
                              key={index} 
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-700 rounded-full text-orange-700 dark:text-orange-300"
                            >
                              🏷️ {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <FormMessage />
                  <p className="text-sm text-gray-500 mt-1">
                    Add relevant tags to help categorize and discover this book
                  </p>
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
                      const quotesText = quotes.map(q => '"' + q.content + '"').join('\n\n');
                      navigator.clipboard.writeText(quotesText);
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
                  .map((quote) => (
                  <QuoteCard
                    key={quote.id}
                    quote={quote}
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
                📊 Publication & Catalog Information
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
              {isEditing && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={async () => {
                    try {
                      const currentValues = form.getValues();
                      const duplicatedBook = {
                        ...currentValues,
                        name: `${currentValues.name} (Copy)`,
                        bookCode: `${currentValues.bookCode}-COPY`,
                        genres: selectedGenres.join(', '),
                        tags: selectedTags.join(', '),
                        coverImage: uploadedImage || '/src/assets/book-covers/cover1.svg',
                      };

                      await apiRequest('POST', '/api/books', duplicatedBook);

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

                      toast({
                        title: 'Success',
                        description: 'Book duplicated successfully',
                      });

                      if (onSuccess) {
                        onSuccess();
                      }
                    } catch (error) {
                      console.error('Error duplicating book:', error);
                      toast({
                        title: 'Error',
                        description: 'Failed to duplicate book. Please try again.',
                        variant: 'destructive',
                      });
                    }
                  }}
                  className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                >
                  <Copy className="mr-2 h-4 w-4" /> Duplicate Book
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
                      <div className={cn(
                        "p-1 rounded",
                        indexForm.level === 1 ? "bg-blue-500" : 
                        indexForm.level === 2 ? "bg-green-500" : "bg-purple-500"
                      )}>
                        <List className="h-3 w-3 text-white" />
                      </div>
                      <Label className={cn(
                        "font-medium",
                        indexForm.level === 1 ? "text-blue-800 dark:text-blue-300" : 
                        indexForm.level === 2 ? "text-green-800 dark:text-green-300" : "text-purple-800 dark:text-purple-300"
                      )}>
                        {editingIndexItem ? 'Edit Index Item' : 
                          indexForm.level === 1 ? 'Add New Chapter' :
                          indexForm.level === 2 ? 'Add New Section' : 'Add New Subsection'
                        }
                      </Label>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Title</Label>
                        <Input
                          placeholder={
                            indexForm.level === 1 ? "e.g., Chapter 1: The Beginning" :
                            indexForm.level === 2 ? "e.g., Section 1.1: Overview" :
                            "e.g., Subsection 1.1.1: Introduction"
                          }
                          value={indexForm.title}
                          onChange={(e) => setIndexForm({ ...indexForm, title: e.target.value })}
                          className={cn(
                            "focus:border-green-400",
                            indexForm.level === 1 ? "border-blue-200" : 
                            indexForm.level === 2 ? "border-green-200" : "border-purple-200"
                          )}
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

              {/* Search Bar */}
              <div className="relative">
                <Input
                  placeholder="Search in table of contents..."
                  value={indexSearch}
                  onChange={(e) => setIndexSearch(e.target.value)}
                  className="pl-10 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-700"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Index Items Display with Hierarchical Structure */}
              <ScrollArea className="max-h-[400px] pr-4">
                <div className="space-y-1">
                  {indexItems.length > 0 ? (
                    (() => {
                      // Filter items based on search with priority: chapter > section > subsection
                      const filteredItems = indexItems.filter(item => {
                        if (!indexSearch.trim()) return true;
                        const searchLower = indexSearch.toLowerCase();
                        return item.title.toLowerCase().includes(searchLower);
                      }).sort((a, b) => {
                        // Sort by level first (priority: chapter > section > subsection)
                        if (indexSearch.trim()) {
                          if (a.level !== b.level) return a.level - b.level;
                        }
                        // Then by page number, then by order
                        if (a.page && b.page) return Number(a.page) - Number(b.page);
                        return a.order - b.order;
                      });

                      // Group items hierarchically
                      const renderHierarchy = () => {
                        const chapters = filteredItems.filter(item => item.level === 1);

                        return chapters.map((chapter, chapterIndex) => {
                          const sections = filteredItems.filter(item => 
                            item.level === 2 && 
                            (!item.page || !chapter.page || item.page > chapter.page)
                          );

                          return (
                            <div key={chapterIndex} className="mb-2">
                              {/* Chapter */}
                              <div className="group relative bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-l-4 border-blue-500 rounded-lg p-3 hover:shadow-md transition-all duration-200">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setIndexForm({
                                            title: '',
                                            page: chapter.page ? (chapter.page + 1).toString() : '',
                                            level: 2,
                                            order: indexItems.length
                                          });
                                          setShowIndexForm(true);
                                          toast({
                                            title: 'Adding Section',
                                            description: `Adding section under: ${chapter.title}`,
                                          });
                                        }}
                                        className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer"
                                        title="Click to add section under this chapter"
                                      >
                                        <span className="text-white text-xs font-bold">▼</span>
                                      </button>
                                      <Badge className="bg-blue-500 text-white text-xs px-2 py-0">
                                        الفصل
                                      </Badge>
                                      {chapter.page && (
                                        <Badge variant="secondary" className="text-xs">
                                          صفحة {chapter.page}
                                        </Badge>
                                      )}
                                    </div>
                                    <div 
                                      className="flex-1 cursor-pointer"
                                      onClick={() => {
                                        setIndexForm({
                                          title: '',
                                          page: chapter.page ? (chapter.page + 1).toString() : '',
                                          level: 2,
                                          order: indexItems.length
                                        });
                                        setShowIndexForm(true);
                                        toast({
                                          title: 'Adding Section',
                                          description: `Adding section under: ${chapter.title}`,
                                        });
                                      }}
                                      title="Click to add section under this chapter"
                                    >
                                      <div className="font-bold text-blue-800 dark:text-blue-200 text-lg hover:text-blue-600 dark:hover:text-blue-100 transition-colors">
                                        {chapter.title}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setIndexForm({
                                          title: '',
                                          page: chapter.page ? (chapter.page + 1).toString() : '',
                                          level: 2,
                                          order: indexItems.length
                                        });
                                        setShowIndexForm(true);
                                        toast({
                                          title: 'Adding Section',
                                          description: `Adding section under: ${chapter.title}`,
                                        });
                                      }}
                                      className="h-8 w-8 p-0 bg-green-50 hover:bg-green-100 text-green-600"
                                      title="Add section"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditIndexItem(chapter)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteIndexItem(filteredItems.indexOf(chapter))}
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              {/* Sections under this chapter */}
                              <div className="ml-6 mt-1 space-y-1">
                                {sections.map((section, sectionIndex) => {
                                  const subsections = filteredItems.filter(item => 
                                    item.level === 3 && 
                                    (!item.page || !section.page || item.page > section.page)
                                  );

                                  return (
                                    <div key={sectionIndex}>
                                      {/* Section */}
                                      <div className="group relative bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-l-3 border-green-400 rounded-lg p-2 hover:shadow-sm transition-all duration-200">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2 flex-1">
                                            <div className="flex items-center gap-2">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setIndexForm({
                                                    title: '',
                                                    page: section.page ? (section.page + 1).toString() : '',
                                                    level: 3,
                                                    order: indexItems.length
                                                  });
                                                  setShowIndexForm(true);
                                                  toast({
                                                    title: 'Adding Subsection',
                                                    description: `Adding subsection under: ${section.title}`,
                                                  });
                                                }}
                                                className="w-3 h-3 bg-green-400 rounded-full hover:bg-green-500 transition-colors cursor-pointer"
                                                title="Click to add subsection under this section"
                                              ></button>
                                              <Badge className="bg-green-400 text-white text-xs px-2 py-0">
                                                قسم
                                              </Badge>
                                              {section.page && (
                                                <Badge variant="secondary" className="text-xs">
                                                  صفحة {section.page}
                                                </Badge>
                                              )}
                                            </div>
                                            <div 
                                              className="font-semibold text-green-700 dark:text-green-300 cursor-pointer hover:text-green-600 dark:hover:text-green-200 transition-colors"
                                              onClick={() => {
                                                setIndexForm({
                                                  title: '',
                                                  page: section.page ? (section.page + 1).toString() : '',
                                                  level: 3,
                                                  order: indexItems.length
                                                });
                                                setShowIndexForm(true);
                                                toast({
                                                  title: 'Adding Subsection',
                                                  description: `Adding subsection under: ${section.title}`,
                                                });
                                              }}
                                              title="Click to add subsection under this section"
                                            >
                                              {section.title}
                                            </div>
                                          </div>
                                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => {
                                                setIndexForm({
                                                  title: '',
                                                  page: section.page ? (section.page + 1).toString() : '',
                                                  level: 3,
                                                  order: indexItems.length
                                                });
                                                setShowIndexForm(true);
                                                toast({
                                                  title: 'Adding Subsection',
                                                  description: `Adding subsection under: ${section.title}`,
                                                });
                                              }}
                                              className="h-6 w-6 p-0 bg-purple-50 hover:bg-purple-100 text-purple-600"
                                              title="Add subsection"
                                            >
                                              <Plus className="h-2 w-2" />
                                            </Button>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleEditIndexItem(section)}
                                              className="h-6 w-6 p-0"
                                            >
                                              <Edit className="h-2 w-2" />
                                            </Button>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleDeleteIndexItem(filteredItems.indexOf(section))}
                                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                              <X className="h-2 w-2" />
                                            </Button>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Subsections under this section */}
                                      <div className="ml-6 mt-1 space-y-1">
                                        {subsections.map((subsection, subsectionIndex) => (
                                          <div key={subsectionIndex} className="group relative bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/10 dark:to-purple-800/10 border-l-2 border-purple-300 rounded-lg p-2 hover:shadow-sm transition-all duration-200">
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-2 flex-1">
                                                <div className="flex items-center gap-2">
                                                  <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
                                                  <Badge className="bg-purple-300 text-white text-xs px-1 py-0">
                                                    فرع
                                                  </Badge>
                                                  {subsection.page && (
                                                    <Badge variant="secondary" className="text-xs">
                                                      صفحة {subsection.page}
                                                    </Badge>
                                                  )}
                                                </div>
                                                <div className="text-sm text-purple-700 dark:text-purple-300">
                                                  {subsection.title}
                                                </div>
                                              </div>
                                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => handleEditIndexItem(subsection)}
                                                  className="h-6 w-6 p-0"
                                                >
                                                  <Edit className="h-2 w-2" />
                                                </Button>
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => handleDeleteIndexItem(filteredItems.indexOf(subsection))}
                                                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                  <X className="h-2 w-2" />
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        });
                      };

                      return renderHierarchy();
                    })()
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