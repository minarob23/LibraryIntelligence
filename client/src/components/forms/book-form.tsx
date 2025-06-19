import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { X, Plus, BookOpen, Calendar, User, Building2, Hash, FileText, Tag, MapPin, Star, ThumbsUp } from 'lucide-react';
import { AlertTriangle, Trash2, Edit } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ImageUpload } from '@/components/ui/image-upload';
import IndexItem from '@/components/ui/index-item';
import { QuoteCard } from '@/components/ui/quote-card';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Copy, Minus } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { useToast } from '@/hooks/use-toast';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from '@/components/ui/form';

// Predefined values for dropdowns
const PREDEFINED_GENRES = [
  "Theology - علم اللاهوت",
  "Church History - تاريخ الكنيسة",
  "Biblical Studies - دراسات كتابية",
  "Patristics - علم الآباء",
  "Liturgy - طقوس",
  "Spirituality - روحانيات",
  "Ethics - أخلاق مسيحية",
  "Apologetics - دفاعيات",
  "Eschatology - علم الأخرويات",
  "Ecclesiology - علم الكنيسة",
  "Sacraments - أسرار",
  "Monasticism - رهبنة",
  "Saints Lives - سير قديسين",
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
  "دار مجلة مرقس"
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

const bookSchema = z.object({
  name: z.string().min(1, 'Book name is required'),
  author: z.string().min(1, 'Author is required'),
  publisher: z.string().min(1, 'Publisher is required'),
  bookCode: z.string().min(1, 'Book code is required'),
  index: z.string().optional(),
  copies: z.number().min(1, 'At least 1 copy is required'),
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
  book?: any;
  onSuccess: () => void;
  onCancel: () => void;
  index?: number;
}

export default function BookForm({ book, onSuccess, onCancel, index }: BookFormProps) {
  const { toast } = useToast();
  const [authors, setAuthors] = useState<string[]>([]);
  const [publishers, setPublishers] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [indexItems, setIndexItems] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingQuote, setEditingQuote] = useState<any>(null);
  const [genresOpen, setGenresOpen] = useState(false);
  const [authorsOpen, setAuthorsOpen] = useState(false);
  const [publishersOpen, setPublishersOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [newAuthor, setNewAuthor] = useState('');
  const [newPublisher, setNewPublisher] = useState('');
  const [newGenre, setNewGenre] = useState('');
  const [newTag, setNewTag] = useState('');
  const [showIndexModal, setShowIndexModal] = useState(false);
  const [indexSearch, setIndexSearch] = useState('');
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    content: '',
    page: '',
    chapter: '',
    author: '',
    tags: '',
    isFavorite: false
  });
  const [editingIndexItem, setEditingIndexItem] = useState<any>(null);
  const [indexForm, setIndexForm] = useState({
    title: '',
    page: '',
    level: 1,
    order: 0
  });

  const { data: borrowings = [] } = useQuery({
    queryKey: ['/api/borrowings'],
    queryFn: () => apiRequest('GET', '/api/borrowings'),
	gcTime: 300000, // 5 minutes
  });

  // Helper function to get book borrowings
  const getBookBorrowings = (bookId: number) => {
    return Array.isArray(borrowings) ? borrowings.filter((b: any) => b.bookId === bookId) : [];
  };

  // Helper function to get latest borrow date
  const getLatestBorrowDate = (bookBorrowings: any[]) => {
    if (!bookBorrowings.length) return null;
    const dates = bookBorrowings
      .filter(b => b.borrowDate)
      .map(b => new Date(b.borrowDate));
    if (!dates.length) return null;
    return new Date(Math.max(...dates.map((d: Date) => d.getTime())));
  };

  // Helper function to get average rating
  const getAverageRating = (bookId: number) => {
    const bookBorrowings = getBookBorrowings(bookId);
    const ratingsWithValues = bookBorrowings.filter(b => b.rating && b.rating > 0);
    if (!ratingsWithValues.length) return null;
    const average = ratingsWithValues.reduce((sum, b) => sum + b.rating, 0) / ratingsWithValues.length;
    return average.toFixed(1);
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

  // Initialize state when book changes
  useEffect(() => {
    if (book) {
      setSelectedGenres(
        book?.genres ? book.genres.split(',').map((g: string) => g.trim()) : []
      );
      setAuthors(
        book?.author ? book.author.split(',').map((a: string) => a.trim()) : []
      );
      setPublishers(
        book?.publisher ? book.publisher.split(',').map((p: string) => p.trim()) : []
      );
      setTags(
        book?.tags ? book.tags.split(',').map((t: string) => t.trim()) : []
      );
	  try {
		setIndexItems(book?.tableOfContents ? JSON.parse(book.tableOfContents) : [])
		setQuotes(book?.quotes ? JSON.parse(book.quotes) : [])
	  } catch (error) {
		console.error("Failed to parse data", error)
	  }
    }
  }, [book]);

  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      name: book?.name || '',
      author: book?.author || '',
      publisher: book?.publisher || '',
      bookCode: book?.bookCode || `BK${String(index || 1).padStart(4, '0')}`,
      index: book?.index || '',
      copies: book?.copies || 1,
      description: book?.description || '',
      coverImage: book?.coverImage || '',
      totalPages: book?.totalPages || undefined,
      cabinet: book?.cabinet || '',
      shelf: book?.shelf || '',
      num: book?.num || '',
      addedDate: book?.addedDate ? new Date(book.addedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      publishedDate: book?.publishedDate ? new Date(book.publishedDate).toISOString().split('T')[0] : '',
      genres: book?.genres || '',
      comments: book?.comments || '',
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

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const newTags = [...tags, newTag.trim()];
      setTags(newTags);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addGenre = (genre: string) => {
    if (!selectedGenres.includes(genre)) {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const removeGenre = (genreToRemove: string) => {
    setSelectedGenres(selectedGenres.filter(genre => genre !== genreToRemove));
  };

  const addAuthor = (author: string) => {
    if (!authors.includes(author)) {
      setAuthors([...authors, author]);
    }
  };

  const addPublisher = (publisher: string) => {
    if (!publishers.includes(publisher)) {
      setPublishers([...publishers, publisher]);
    }
  };

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

  const addQuote = () => {
    const newQuote = {
      id: Date.now(),
      content: '',
      page: '',
      chapter: '',
      author: '',
      tags: '',
      isFavorite: false
    };
    setQuotes([...quotes, newQuote]);
  };

  const updateQuote = (id: number, field: string, value: any) => {
    setQuotes(quotes.map(quote => 
      quote.id === id ? { ...quote, [field]: value } : quote
    ));
  };

  const removeQuote = async (id: string | number) => {
    setQuotes(quotes.filter(quote => quote.id !== id));
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

  const handleToggleQuoteFavorite = async (id: number | string) => {
    const quote = quotes.find(q => q.id === id);
    const isBecomingFavorite = !quote?.isFavorite;

    const updatedQuotes = quotes.map(q => q.id === id ? { ...q, isFavorite: !q.isFavorite } : q);
    setQuotes(updatedQuotes);
  };

  const onSubmit = async (data: BookFormValues) => {
    try {
      setIsLoading(true);

      // Prepare the final data
      const bookData = {
        ...data,
        author: authors.join(', '),
        publisher: publishers.join(', '),
        genres: selectedGenres.join(', '),
        tags: tags.join(', '),
        tableOfContents: indexItems.length > 0 ? JSON.stringify(indexItems) : '',
        quotes: quotes.length > 0 ? JSON.stringify(quotes) : '',
        copies: Number(data.copies),
        totalPages: data.totalPages ? Number(data.totalPages) : null,
      };

      if (book?.id) {
        await apiRequest('PUT', `/api/books/${book.id}`, bookData);
        toast({
          title: 'Success',
          description: 'Book updated successfully',
        });
      } else {
        await apiRequest('POST', '/api/books', bookData);
        toast({
          title: 'Success',
          description: 'Book added successfully',
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving book:', error);
	  toast({
        title: 'Error',
        description: `Failed to ${book?.id ? 'update' : 'add'} book. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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

    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {book ? 'Edit Book' : 'Add New Book'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="details">Details & Location</TabsTrigger>
                <TabsTrigger value="content">Content & Index</TabsTrigger>
                <TabsTrigger value="preview">Preview & Summary</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Book Name *</FormLabel>
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
								{authors.length === 0 && "Select authors..."}
								{authors.map((author, index) => (
								  <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
									{author}
									<X
									  className="ml-1 h-3 w-3 cursor-pointer hover:text-red-600 transition-colors"
									  onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										const updatedAuthors = authors.filter((_, i) => i !== index);
										setAuthors(updatedAuthors);
										form.setValue('author', updatedAuthors.join(', '));
									  }}
									/>
								  </Badge>
								))}
							  </div>
							  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down ml-2 h-4 w-4 shrink-0 opacity-50"><path d="m6 9 6 6 6-6"/></svg>
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
										if (newAuthor.trim() && !authors.includes(newAuthor.trim())) {
										  setAuthors([...authors, newAuthor.trim()]);
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
									  if (authors.includes(author)) {
										setAuthors(authors.filter(a => a !== author));
									  } else {
										setAuthors([...authors, author]);
									  }
									}}
								  >
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(
										"mr-2 h-4 w-4",
										authors.includes(author) ? "opacity-100" : "opacity-0"
									  )}><polyline points="20 6 9 17 4 12"/></svg>
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
								{publishers.length === 0 && "Select publishers..."}
								{publishers.map((publisher, index) => (
								  <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-800">
									{publisher}
									<X
									  className="ml-1 h-3 w-3 cursor-pointer hover:text-red-600 transition-colors"
									  onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										const updatedPublishers = publishers.filter((_, i) => i !== index);
										setPublishers(updatedPublishers);
										form.setValue('publisher', updatedPublishers.join(', '));
									  }}
									/>
								  </Badge>
								))}
							  </div>
							  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down ml-2 h-4 w-4 shrink-0 opacity-50"><path d="m6 9 6 6 6-6"/></svg>
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
										if (newPublisher.trim() && !publishers.includes(newPublisher.trim())) {
										  setPublishers([...publishers, newPublisher.trim()]);
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
									  if (publishers.includes(publisher)) {
										setPublishers(publishers.filter(p => p !== publisher));
									  } else {
										setPublishers([...publishers, publisher]);
									  }
									}}
								  >
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(
										"mr-2 h-4 w-4",
										publishers.includes(publisher) ? "opacity-100" : "opacity-0"
									  )}><polyline points="20 6 9 17 4 12"/></svg>
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
							  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down ml-2 h-4 w-4 shrink-0 opacity-50"><path d="m6 9 6 6 6-6"/></svg>
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
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(
										"mr-2 h-4 w-4",
										selectedGenres.includes(genre) ? "opacity-100" : "opacity-0"
									  )}><polyline points="20 6 9 17 4 12"/></svg>
									{genre}
								  </CommandItem>
								))}
							  </CommandGroup>
							</Command>
						  </PopoverContent>
						</Popover>
						<FormMessage />
						<p className="text-sm text-gray-500 mt-1">```text
  Select multiple genres for this book
						</p>
					  </FormItem>
					)}
				  />
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="cabinet"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cabinet</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Cabinet location"
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
                            placeholder="Shelf number"
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
                            placeholder="Book number"
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="coverImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Image</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value || ''}
                          onChange={field.onChange}
                          onRemove={() => field.onChange('')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                            placeholder="Number of pages"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-6">
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
												{tags.length === 0 && (
													<span className="text-gray-500">Add tags to categorize this book...</span>
												)}
												{tags.map((tag, index) => (
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
																const updatedTags = tags.filter((_, i) => i !== index);
																setTags(updatedTags);
																form.setValue('tags', updatedTags.join(', '));
															}}
														/>
													</Badge>
												))}
											</div>
											<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down ml-2 h-4 w-4 shrink-0 opacity-50"><path d="m6 9 6 6 6-6"/></svg>
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
																if (newTag.trim() && !tags.includes(newTag.trim())) {
																	setTags([...tags, newTag.trim()]);
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
															if (tags.includes(tag)) {
																setTags(tags.filter(t => t !== tag));
															} else {
																setTags([...tags, tag]);
															}
														}}
														className="flex items-center px-3 py-2 hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50"
													>
														<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(
															"mr-2 h-4 w-4",
															tags.includes(tag) ? "opacity-100 text-orange-600" : "opacity-0"
														)}><polyline points="20 6 9 17 4 12"/></svg>
														<span className="mr-2">🏷️</span>
														{tag}
													</CommandItem>
												))}
											</CommandGroup>
										</Command>
									</PopoverContent>
								</Popover>

								{/* Tags Preview */}
								{tags.length > 0 && (
									<div className="bg-gradient-to-r from-orange-50/50 to-pink-50/50 dark:from-orange-900/10 dark:to-pink-900/10 p-3 rounded-lg border border-dashed border-orange-200 dark:border-orange-700">
										<div className="flex items-center justify-between mb-2">
											<p className="text-sm font-medium text-orange-800 dark:text-orange-300">
												Selected Tags ({tags.length})
											</p>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => setTags([])}
												className="h-6 px-2 text-xs text-orange-600 hover:text-orange-800 hover:bg-orange-100"
											>
												Clear All
											</Button>
										</div>
										<div className="flex flex-wrap gap-1">
											{tags.map((tag, index) => (
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

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Table of Contents</Label>
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
						<Button type="button" onClick={() => {
							setShowIndexModal(true)
							}} size="sm">
							<Plus className="h-4 w-4 mr-2" />
							Edit Chapters
						</Button>
					</div>
                  </div>
					<Dialog open={showIndexModal} onOpenChange={setShowIndexModal}>
						<DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<Label>Edit Chapters</Label>
									<Button type="button" onClick={handleAddIndexItem} size="sm">
										<Plus className="h-4 w-4 mr-2" />
										Add Chapter/Section
									</Button>
								</div>
								{indexItems.length > 0 && (
									<ScrollArea className="h-64 border rounded-md p-4">
										{indexItems.map((item, index) => (
											<div key={index} className="flex items-center justify-between space-x-2">
												<div className="flex-1">
													<Input
														type="text"
														placeholder="Title"
														value={item.title}
														onChange={(e) => {
															const updated = [...indexItems];
															updated[index] = { ...item, title: e.target.value };
															setIndexItems(updated);
														}}
													/>
												</div>
												<div className="flex-1">
													<Input
														type="number"
														placeholder="Page"
														value={item.page}
														onChange={(e) => {
															const updated = [...indexItems];
															updated[index] = { ...item, page: e.target.value };
															setIndexItems(updated);
														}}
													/>
												</div>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => {
														const updated = [...indexItems];
														updated.splice(index, 1);
														setIndexItems(updated);
													}}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										))}
									</ScrollArea>
								)}
							</div>
						</DialogContent>
					</Dialog>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Notable Quotes</Label>
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
							Copy Quotes
						</Button>
						<Button type="button" onClick={addQuote} size="sm">
							<Plus className="h-4 w-4 mr-2" />
							Add Quote
						</Button>
					</div>
                  </div>
                  {quotes.length > 0 && (
                    <ScrollArea className="h-64">
                      <div className="space-y-4">
                        {quotes.map((quote) => (
                          <QuoteCard
                            key={quote.id}
                            quote={quote}
                            onEdit={handleEditQuote}
                            onDelete={removeQuote}
                            onToggleFavorite={(id) => handleToggleQuoteFavorite(Number(id))}
                            isEditing={editingQuote?.id === quote.id}
                            onSave={(updatedQuote) => {
                              updateQuote(quote.id, 'content', updatedQuote.content);
                              updateQuote(quote.id, 'page', updatedQuote.page);
                              updateQuote(quote.id, 'chapter', updatedQuote.chapter);
                              updateQuote(quote.id, 'author', updatedQuote.author);
                              updateQuote(quote.id, 'tags', updatedQuote.tags);
                              setEditingQuote(null);
                            }}
                            onCancel={() => setEditingQuote(null)}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="preview" className="space-y-6">
                {book && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Book Statistics</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                              {getTimesBorrowed(book.id)}
                            </div>
                            <div className="text-sm text-gray-600">Total Borrowings</div>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              {getAverageRating(book.id) || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-600">Average Rating</div>
                          </div>
						  <div className="p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                              {getPopularityScore(book.id) || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-600">Popularity Score</div>
                          </div>
						  <div className="p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">
                              {getLastBorrowedDate(book.id)?.toLocaleDateString() || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-600">Last Borrowed Date</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Publication Info</Label>
                          <div className="text-sm space-y-1">
                            <div>
                              <strong>Published:</strong>{' '}
                              {form.getValues('publishedDate')
                                ? new Date(form.getValues('publishedDate')).toLocaleDateString()
                                : 'Not specified'}
                            </div>
                            <div>
                              <strong>Added:</strong>{' '}
                              {book.addedDate
                                ? new Date(book.addedDate).toLocaleDateString()
                                : 'Today'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Current Status</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < Math.floor((parseFloat(getAverageRating(book.id || 0) || '0')) / 2)
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              ({getAverageRating(book.id) || '0'} / 5.0)
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div
                              className={`h-3 w-3 rounded-full ${
                                borrowings && Array.isArray(borrowings) && borrowings.some((b: any) => b.bookId === book.id && b.status === 'borrowed')
                                  ? 'bg-red-500'
                                  : 'bg-green-500'
                              }`}
                            />
                            <span className="text-sm">
                              {borrowings && Array.isArray(borrowings) && borrowings.some((b: any) => b.bookId === book.id && b.status === 'borrowed')
                                ? 'Currently Borrowed'
                                : 'Available'}
                            </span>
                          </div>

                          {borrowings && Array.isArray(borrowings) && borrowings.some((b: any) => b.bookId === book.id && b.status === 'borrowed') && (
                            <div className="text-sm text-red-600">
                              <AlertTriangle className="h-4 w-4 inline mr-1" />
                              This book is currently borrowed
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Separator />

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
                          placeholder="Additional comments or notes"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : book ? 'Update Book' : 'Create Book'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>

  );
}