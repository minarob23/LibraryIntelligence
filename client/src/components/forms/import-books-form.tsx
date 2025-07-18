// Fixes the type definition for the imported book interface.
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, FileText, AlertTriangle, CheckCircle, X, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiRequest, queryClient } from '@/lib/queryClient';
import * as XLSX from 'xlsx';
import { Book } from '@/../../shared/schema';

interface ImportedBook {
  name?: string;
  author?: string;
  publisher?: string;
  bookCode?: string;
  cabinet?: string;
  shelf?: string;
  num?: string;
  copies?: number;
  genres?: string;
  tags?: string;
  description?: string;
  totalPages?: number;
  publishedDate?: string;
  coverImage?: string;
  comments?: string;
  missingFields: string[];
  isValid: boolean;
  rowIndex: number;
}

const ImportBooksForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { toast } = useToast();
  const [importedBooks, setImportedBooks] = useState<ImportedBook[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const requiredFields = ['name', 'author', 'publisher', 'bookCode'];

  const validateBook = (book: any, index: number): ImportedBook => {
    const missingFields: string[] = [];

    // Check required fields
    requiredFields.forEach(field => {
      if (!book[field] || String(book[field]).trim() === '') {
        missingFields.push(field);
      }
    });

    // Generate book code if cabinet, shelf, and num are provided but bookCode is missing
    if (!book.bookCode && book.cabinet && book.shelf && book.num) {
      book.bookCode = `${book.cabinet}/${book.shelf}/${book.num}`;
    }

    const isValid = missingFields.length === 0;

    return {
      ...book,
      copies: book.copies ? parseInt(book.copies) : 1,
      totalPages: book.totalPages ? parseInt(book.totalPages) : undefined,
      coverImage: book.coverImage || '/src/assets/book-covers/cover1.svg',
      missingFields,
      isValid,
      rowIndex: index + 1
    };
  };

  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = [];
      let current = '';
      let inQuotes = false;

      // Parse CSV with proper quote handling
      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      if (values.length > 0 && values.some(v => v)) {
        const row: any = {};
        headers.forEach((header, index) => {
          const value = values[index] || '';
          const normalizedHeader = normalizeHeaderName(header);
          row[normalizedHeader] = value.replace(/"/g, '').trim();
        });
        data.push(row);
      }
    }

    return data;
  };

  const parseExcel = (buffer: ArrayBuffer): any[] => {
    try {
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert sheet to JSON with header row as keys
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: '',
        blankrows: false
      });

      if (jsonData.length < 2) return [];

      const headers = (jsonData[0] as any[]).map(h => String(h || '').trim());
      const data: any[] = [];

      for (let i = 1; i < jsonData.length; i++) {
        const values = jsonData[i] as any[];
        if (values.length === 0 || values.every(v => !v)) continue;

        const row: any = {};
        headers.forEach((header, index) => {
          const value = values[index] || '';
          const normalizedHeader = normalizeHeaderName(header);
          row[normalizedHeader] = String(value).trim();
        });

        // Skip completely empty rows
        if (Object.values(row).some(v => v)) {
          data.push(row);
        }
      }

      return data;
    } catch (error) {
      console.error('Excel parsing error:', error);
      throw new Error('Failed to parse Excel file. Please check the file format.');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isCSV = fileName.endsWith('.csv');
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    if (!isCSV && !isExcel) {
      toast({
        title: 'Unsupported File Format',
        description: 'Please upload a CSV (.csv) or Excel (.xlsx, .xls) file.',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let data: any[] = [];

        if (isCSV) {
          const csvText = e.target?.result as string;
          data = parseCSV(csvText);
        } else if (isExcel) {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          data = parseExcel(arrayBuffer);
        }

        if (data.length === 0) {
          toast({
            title: 'Invalid Data File',
            description: 'Data file must have at least a header row and one data row.',
            variant: 'destructive',
          });
          return;
        }

        const books = data.map((book, index) => validateBook(book, index));
        setImportedBooks(books);
        setShowResults(true);

        toast({
          title: '✅ File Processed Successfully',
          description: `Successfully processed ${books.length} books from your ${isCSV ? 'CSV' : 'Excel'} file.`,
        });
      } catch (error) {
        console.error('File processing error:', error);
        toast({
          title: 'File Processing Error',
          description: 'Failed to process data file. Please check the file format.',
          variant: 'destructive',
        });
      }
    };

    if (isCSV) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const normalizeHeaderName = (header: string): string => {
    const mapping: { [key: string]: string } = {
      'title': 'name',
      'book name': 'name',
      'book title': 'name',
      'book code': 'bookCode',
      'code': 'bookCode',
      'total pages': 'totalPages',
      'pages': 'totalPages',
      'published date': 'publishedDate',
      'publication date': 'publishedDate',
      'cover image': 'coverImage',
      'image': 'coverImage',
      'genre': 'genres',
      'tag': 'tags',
      'number': 'num',
      'copy': 'copies',
      'number of copies': 'copies'
    };

    const normalized = header.toLowerCase().trim();
    return mapping[normalized] || normalized.replace(/\s+/g, '');
  };

  const handleImport = async () => {
    if (importedBooks.length === 0) {
      toast({
        title: 'No Data',
        description: 'Please upload a file first.',
        variant: 'destructive',
      });
      return;
    }

    const validBooks = importedBooks.filter(book => book.isValid);

    if (validBooks.length === 0) {
      toast({
        title: 'No Valid Books',
        description: 'All books have missing required fields. Please fix the data and try again.',
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true);

    try {
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const book of validBooks) {
        try {
          const bookData = { ...book };
          delete bookData.missingFields;
          delete bookData.isValid;
          delete bookData.rowIndex;

          await apiRequest('POST', '/api/books', bookData);
          successCount++;
        } catch (error: any) {
          errorCount++;
          errors.push(`Row ${book.rowIndex}: ${error.message || 'Unknown error'}`);
        }
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });

      if (successCount > 0) {
        toast({
          title: '🎉 Import Successful',
          description: `Successfully imported ${successCount} books.${errorCount > 0 ? ` ${errorCount} failed.` : ''}`,
        });

        if (onSuccess) {
          onSuccess();
        }
      }

      if (errors.length > 0) {
        console.error('Import errors:', errors);
      }

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Import Failed',
        description: 'An error occurred during import. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };



  const getFieldDisplayName = (field: string): string => {
    const displayNames: { [key: string]: string } = {
      'name': 'Book Name',
      'author': 'Author',
      'publisher': 'Publisher',
      'bookCode': 'Book Code',
      'cabinet': 'Cabinet',
      'shelf': 'Shelf',
      'num': 'Number',
      'copies': 'Copies',
      'genres': 'Genres',
      'tags': 'Tags',
      'description': 'Description',
      'totalPages': 'Total Pages',
      'publishedDate': 'Published Date',
      'coverImage': 'Cover Image',
      'comments': 'Comments'
    };
    return displayNames[field] || field;
  };

  const validBooksCount = importedBooks.filter(book => book.isValid).length;
  const invalidBooksCount = importedBooks.length - validBooksCount;

  return (
    <div className="space-y-6 max-h-[85vh] overflow-y-auto">
      {/* Beautiful Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-lg">
            <Upload className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300">Import Books Data</h3>
            <p className="text-blue-600 dark:text-blue-400">Upload your library collection from CSV or Excel files</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-blue-700 dark:text-blue-300">📤</div>
            <div className="text-xs text-blue-600 dark:text-blue-400">Upload Ready</div>
          </div>
          <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-green-700 dark:text-green-300">{validBooksCount}</div>
            <div className="text-xs text-green-600 dark:text-green-400">Valid Books</div>
          </div>
          <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-orange-700 dark:text-orange-300">{invalidBooksCount}</div>
            <div className="text-xs text-orange-600 dark:text-orange-400">Need Review</div>
          </div>
        </div>

        {/* Enhanced File Upload */}
        <div className="space-y-4">
          <div className="relative group">
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 border-2 border-dashed border-blue-300 dark:border-blue-600 hover:border-blue-400 dark:hover:border-blue-500 rounded-xl p-8 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer">
              <Input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />

              {/* Upload Icon and Animation */}
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4 rounded-full shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1 animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>

                {/* Upload Text */}
                <div className="text-center space-y-2">
                  <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                    Drop your CSV or Excel file here
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    or <span className="text-blue-600 dark:text-blue-400 font-medium underline">click to browse</span>
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                    <FileText className="h-3 w-3" />
                    <span>Supports CSV and Excel files up to unlimited size - both large and small files accepted</span>
                  </div>
                </div>

                {/* Visual Enhancement */}
                <div className="flex gap-2 opacity-60">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>

              {/* Hover Effect Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>

          <Alert className="border-blue-200 bg-blue-50/50 dark:border-blue-700 dark:bg-blue-900/10">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-300">
              <strong>Supported Formats:</strong> CSV (.csv) and Excel (.xlsx, .xls) files<br />
              <strong>Required Data:</strong> Title, Author Name, Publishing House, and Book Reference Code must be provided for successful processing.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {showResults && (
        <Card className="border-2 border-gray-200 dark:border-gray-700">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-t-lg">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-600" />
                Import Preview ({importedBooks.length} books found)
              </span>
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {validBooksCount} Valid
                </Badge>
                {invalidBooksCount > 0 && (
                  <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {invalidBooksCount} Invalid
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px] w-full">
              <Table>
                <TableHeader className="sticky top-0 bg-white dark:bg-gray-900 z-10">
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Book Name</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Publisher</TableHead>
                    <TableHead>Genres</TableHead>
                    <TableHead>Book Code</TableHead>
                    <TableHead>Copies</TableHead>
                    <TableHead>Missing/Issues</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importedBooks.map((book, index) => (
                    <TableRow key={index} className={book.isValid ? 'hover:bg-green-50 dark:hover:bg-green-900/10' : 'bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20'}>
                      <TableCell className="font-mono text-sm font-medium">{book.rowIndex}</TableCell>
                      <TableCell>
                        {book.isValid ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Valid
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                            <X className="h-3 w-3 mr-1" />
                            Invalid
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {book.name || <span className="text-red-500 italic">Missing</span>}
                      </TableCell>
                      <TableCell>
                        {book.author || <span className="text-red-500 italic">Missing</span>}
                      </TableCell>
                      <TableCell>
                        {book.publisher || <span className="text-red-500 italic">Missing</span>}
                      </TableCell>
                      <TableCell className="text-sm">
                        {book.genres ? (
                          <div className="flex flex-wrap gap-1">
                            {book.genres.split(',').slice(0, 2).map((genre: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800">
                                {genre.trim()}
                              </Badge>
                            ))}
                            {book.genres.split(',').length > 2 && (
                              <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800">
                                +{book.genres.split(',').length - 2}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">No genres</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {book.bookCode || <span className="text-red-500 italic">Missing</span>}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        <div className="flex items-center gap-1">
                          <span className="text-blue-700 dark:text-blue-300">{book.copies || 1}</span>
                          <span className="text-xs text-gray-500">copies</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {book.missingFields.length > 0 ? (
                          <div className="space-y-1">
                            {book.missingFields.map((field, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                                {getFieldDisplayName(field)}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs">
                            ✓ Complete
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            {invalidBooksCount > 0 && (
              <div className="p-4 border-t">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>⚠️ Warning:</strong> {invalidBooksCount} books have missing required fields and will be skipped during import.
                    Only {validBooksCount} valid books will be imported.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 dark:bg-gray-800/50">
              <Button
                variant="outline"
                onClick={() => {
                  setShowResults(false);
                  setImportedBooks([]);
                }}
                className="border-gray-300 dark:border-gray-600"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
              <Button
                onClick={handleImport}
                disabled={isImporting || validBooksCount === 0}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                {isImporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-1" />
                    Import {validBooksCount} Valid Books
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImportBooksForm;