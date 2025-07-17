import { toast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export data to Excel format
 * @param data Array of data to export
 * @param fileName Name of the file without extension
 */
export const exportToExcel = (data: any[], fileName: string = 'export') => {
  try {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    // Process data for better Excel formatting
    const processedData = data.map(row => {
      const processedRow: any = {};

      // Skip unwanted columns (including new ones to remove)
      const skipColumns = [
        'id', 'coverImage', 'comments', 'createdAt', 
        'addedDate', 'publishedDate', 'tags', 'description', 
        'index', 'totalPages', 'pages', 'title'
      ];

      Object.keys(row).forEach(key => {
        if (skipColumns.includes(key)) return;

        let value = row[key];

        // Handle null/undefined values
        if (value === null || value === undefined) {
          value = '';
        }

        processedRow[key] = value;
      });

      // Handle Book Code structure with separate columns
      if (row.cabinet || row.shelf || row.num || row.bookCode) {
        // Keep individual components as separate columns
        processedRow['Cabinet'] = row.cabinet || '';
        processedRow['Shelf'] = row.shelf || '';
        processedRow['Number'] = row.num || '';

        // Create combined Book Code
        const bookCodeParts = [];
        if (row.cabinet) bookCodeParts.push(`C${row.cabinet}`);
        if (row.shelf) bookCodeParts.push(`S${row.shelf}`);
        if (row.num) bookCodeParts.push(`N${row.num}`);

        const combinedCode = bookCodeParts.join('-');
        const finalBookCode = row.bookCode || combinedCode || 'N/A';

        processedRow['Book Code'] = finalBookCode;

        // Remove original columns
        delete processedRow.cabinet;
        delete processedRow.shelf;
        delete processedRow.num;
        delete processedRow.bookCode;
      }

      return processedRow;
    });

    // Define specific column order for Enhanced Export with Statistics
    const columnOrder = [
      'name',
      'author', 
      'publisher',
      'genres',
      'Cabinet',
      'Shelf', 
      'Number',
      'Book Code',
      'copies'
    ];

    // Get only the specified headers
    const orderedHeaders = columnOrder.filter(col => processedData.some(row => row.hasOwnProperty(col)));

    // Create English column headers
    const englishHeaders = orderedHeaders.map(header => {
      const englishMap: Record<string, string> = {
        'name': 'Book Name',
        'author': 'Author',
        'publisher': 'Publisher',
        'genres': 'Genres',
        'Cabinet': 'Cabinet',
        'Shelf': 'Shelf',
        'Number': 'Number',
        'Book Code': 'Book Code',
        'copies': 'Number of Copies'
      };
      return englishMap[header] || header;
    });

    // Create CSV with UTF-8 BOM for proper Arabic display in Excel
    const csvRows = [
      englishHeaders.join(','),
      ...processedData.map(row => 
        orderedHeaders.map(header => {
          let cell = row[header] || '';

          // Normalize Arabic text for proper UTF-8 encoding
          if (typeof cell === 'string') {
            cell = cell.normalize('NFC');

            // Handle strings that need quotes
            if (cell.includes(',') || cell.includes('"') || cell.includes('\n') || cell.includes('\r')) {
              cell = `"${cell.replace(/"/g, '""')}"`;
            }
          }

          return cell;
        }).join(',')
      )
    ];

    // Add UTF-8 BOM for proper Arabic character display in Excel
    const csvContent = '\uFEFF' + csvRows.join('\r\n');

    // Create blob and download
    const blob = new Blob([csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    toast({
      title: "Export Error",
      description: "There was an error exporting to Excel. Please try again.",
      variant: "destructive"
    });
  }
};

/**
 * Export all database data to a single JSON file
 * @param allData Object containing all database tables
 * @param fileName Name of the file without extension
 */
export const exportAllDataToJSON = (allData: any, fileName: string = 'complete-library-data') => {
  try {
    const jsonContent = JSON.stringify(allData, null, 2);

    // Create blob and download
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting all data:', error);
    toast({
      title: "Export Error",
      description: "There was an error exporting all data. Please try again.",
      variant: "destructive"
    });
  }
};

/**
 * Export all database data to multiple Excel files (one per table)
 * @param allData Object containing all database tables
 */
export const exportAllDataToExcel = (allData: any) => {
  try {
    const tables = Object.keys(allData);

    tables.forEach(tableName => {
      const tableData = allData[tableName];
      if (Array.isArray(tableData) && tableData.length > 0) {
        exportToExcel(tableData, `${tableName}_export`);
      }
    });

    toast({
      title: "Export Successful",
      description: `Exported ${tables.length} tables to Excel files`,
    });
  } catch (error) {
    console.error('Error exporting all data to Excel:', error);
    toast({
      title: "Export Error",
      description: "There was an error exporting all data to Excel. Please try again.",
      variant: "destructive"
    });
  }
};

/**
 * Import data from JSON file
 * @param file File to import
 * @returns Promise that resolves with the imported data
 */
export const importFromJSON = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        resolve(data);
      } catch (error) {
        console.error('Error parsing JSON file:', error);
        reject(new Error('Error parsing JSON file. Please check the file format and try again.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading file. Please try again.'));
    };

    reader.readAsText(file);
  });
};

/**
 * Import data from CSV file
 * @param file File to import
 * @returns Promise that resolves with the imported data
 */
export const importFromCSV = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const rows = content.split('\n').filter(row => row.trim());

        if (rows.length < 2) {
          reject(new Error('CSV file must contain at least a header row and one data row.'));
          return;
        }

        const headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));

        const data = rows.slice(1).map(row => {
          const values = row.split(',').map(v => v.trim().replace(/"/g, ''));
          return headers.reduce((obj, header, index) => {
            obj[header] = values[index] || '';
            return obj;
          }, {} as Record<string, string>);
        });

        resolve(data);
      } catch (error) {
        console.error('Error parsing CSV file:', error);
        reject(new Error('Error parsing CSV file. Please check the file format and try again.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading file. Please try again.'));
    };

    reader.readAsText(file);
  });
};

/**
 * Export data to Notion (simulated for demonstration)
 * @param data Array of data to export
 * @returns Promise that resolves when export is complete
 */
export const exportToNotion = async (data: any[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    // This is a simulation since actual Notion API integration would require API keys
    // In a real implementation, this would use the Notion API to create a new page or database

    try {
      // Simulate API call delay
      setTimeout(() => {
        // Log the data that would be exported
        console.log('Data to export to Notion:', data);
        resolve();
      }, 1000);
    } catch (error) {
      console.error('Error exporting to Notion:', error);
      reject(new Error("Failed to export to Notion. Please check your API key and try again."));
    }
  });
};

export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get all unique keys from all objects to handle varying structures
  const allKeys = new Set<string>();
  data.forEach(item => {
    Object.keys(item).forEach(key => allKeys.add(key));
  });

  const headers = Array.from(allKeys);

  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(item => 
      headers.map(header => {
        const value = item[header];
        // Handle values that might contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    )
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateLibraryStatistics = (books: any[], borrowings: any[]) => {
  const currentDate = new Date();
  const thirtyDaysAgo = new Date(currentDate.getTime() - (30 * 24 * 60 * 60 * 1000));

  // Calculate statistics
  const totalBooks = books?.length || 0;

  // Get currently borrowed book IDs
  const borrowedBookIds = new Set(
    borrowings?.filter((b: any) => b.status === 'borrowed').map((b: any) => b.bookId) || []
  );

  // Count available and borrowed books properly
  let availableBooks = 0;
  let borrowedBooks = 0;

  books?.forEach((book: any) => {
    if (borrowedBookIds.has(book.id)) {
      borrowedBooks++;
    } else {
      availableBooks++;
    }
  });

  // Calculate rates
  const availableRate = totalBooks > 0 ? Math.round((availableBooks / totalBooks) * 100) : 0;
  const borrowedRate = totalBooks > 0 ? Math.round((borrowedBooks / totalBooks) * 100) : 0;

  // Recently added books (last 30 days) - only count newly created books, not edited ones
  const recentlyAdded = books?.filter((book: any) => {
    if (!book.createdAt) return false;
    const bookDate = new Date(book.createdAt);
    return bookDate >= thirtyDaysAgo;
  }).length || 0;

  // Most popular genres
  const genreCounts: { [key: string]: number } = {};
  books?.forEach((book: any) => {
    if (book.genres) {
      const genres = book.genres.split(',').map((g: string) => g.trim());
      genres.forEach((genre: string) => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    }
  });

  const topGenres = Object.entries(genreCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([genre, count]) => ({ genre, count }));

  return {
    totalBooks,
    availableBooks,
    borrowedBooks,
    availableRate: Math.round(availableRate * 100) / 100,
    borrowedRate: Math.round(borrowedRate * 100) / 100,
    recentlyAdded,
    topGenres,
    generatedAt: currentDate.toISOString()
  };
};

export const exportLibraryWithStatistics = (books: any[], borrowings: any[], filename?: string) => {
  const stats = generateLibraryStatistics(books, borrowings);
  const exportDate = new Date().toLocaleDateString();
  const exportFilename = filename || `library-export-${new Date().toISOString().split('T')[0]}.csv`;

  // Create enhanced book data with only specified columns
  const enhancedBooks = books?.map((book: any) => {
    // Create combined Book Code
    const bookCodeParts = [];
    if (book.cabinet) bookCodeParts.push(`C${book.cabinet}`);
    if (book.shelf) bookCodeParts.push(`S${book.shelf}`);
    if (book.num) bookCodeParts.push(`N${book.num}`);
    const combinedCode = bookCodeParts.join('-');
    const finalBookCode = book.bookCode || combinedCode || 'N/A';

    return {
      name: book.name || '',
      author: book.author || '',
      publisher: book.publisher || '',
      genres: book.genres || '',
      Cabinet: book.cabinet || '',
      Shelf: book.shelf || '',
      Number: book.num || '',
      'Book Code': finalBookCode,
      copies: book.copies || 1
    };
  }) || [];

  // Create comprehensive export data with statistics header
  const statisticsHeader = [
    `# LIBRARY STATISTICS REPORT - Generated on ${exportDate}`,
    `# ============================================`,
    `# 📊 OVERVIEW STATISTICS`,
    `# Total Books: ${stats.totalBooks}`,
    `# Available Books: ${stats.availableBooks} (${stats.availableRate}%)`,
    `# Borrowed Books: ${stats.borrowedBooks} (${stats.borrowedRate}%)`,
    `# Recently Added (30 days): ${stats.recentlyAdded}`,
    `# ============================================`,
    `# 🎯 TOP GENRES`,
    ...stats.topGenres.map(({ genre, count }) => `# ${genre}: ${count} books`),
    `# ============================================`,
    `# 📚 DETAILED BOOK INVENTORY`,
    `Export contains: Complete Book Records, Creator Details, Publication Information, Category Classifications, Storage Location Data, and Reference Codes`,
    ``
  ];

  // Create CSV content with statistics
  const headers = enhancedBooks.length > 0 ? Object.keys(enhancedBooks[0]) : [];
  const csvContent = [
    ...statisticsHeader,
    headers.join(','),
    ...enhancedBooks.map(book => 
      headers.map(header => {
        const value = book[header];
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    )
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', exportFilename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return stats;
};

export const exportLibraryWithStatisticsToPDF = (books: any[], borrowings: any[], filename?: string) => {
  const stats = generateLibraryStatistics(books, borrowings);
  const exportDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const exportFilename = filename || `library-statistics-${new Date().toISOString().split('T')[0]}.pdf`;

  // Create enhanced book data with status first
  const enhancedBooks = books?.map((book: any) => {
    const isBorrowed = borrowings?.some((b: any) => b.bookId === book.id && b.status === 'borrowed');
    return {
      name: book.name || 'N/A',
      author: book.author || 'N/A',
      publisher: book.publisher || 'N/A',
      genres: book.genres || 'N/A',
      status: isBorrowed ? 'Borrowed' : 'Available',
      bookCode: book.bookCode || 'N/A',
      isbn: book.isbn || 'N/A',
      copies: book.copies || 1
    };
  }) || [];

  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let currentY = 30;

    // Clean header with modern design
    doc.setFillColor(37, 99, 235); // Clean blue
    doc.rect(0, 0, pageWidth, 25, 'F');

    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Library Statistics Report', pageWidth / 2, 16, { align: 'center' });

    // Subheader
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on ${exportDate}`, pageWidth / 2, 35, { align: 'center' });

    currentY = 50;

    // Dashboard Statistics Section
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('Library Dashboard Overview', 20, currentY);
    currentY += 20;

    // Create dashboard-style cards
    const cardWidth = (pageWidth - 60) / 2; // Two cards per row
    const cardHeight = 40;
    const cardSpacing = 10;

    const statisticsCards = [
      { 
        label: 'Total Books', 
        value: stats.totalBooks.toString(),
        color: [59, 130, 246], // Blue
        bgColor: [239, 246, 255]
      },
      { 
        label: 'Available Books', 
        value: `${stats.availableBooks} (${stats.availableRate}%)`,
        color: [34, 197, 94], // Green
        bgColor: [240, 253, 244]
      },
      { 
        label: 'Currently Borrowed', 
        value: `${stats.borrowedBooks} (${stats.borrowedRate}%)`,
        color: [239, 68, 68], // Red
        bgColor: [254, 242, 242]
      },
      { 
        label: 'Recently Added', 
        value: `${stats.recentlyAdded} books`,
        color: [168, 85, 247], // Purple
        bgColor: [250, 245, 255]
      }
    ];

    // Draw dashboard cards in 2x2 grid
    statisticsCards.forEach((card, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;

      const cardX = 20 + col * (cardWidth + cardSpacing);
      const cardY = currentY + row * (cardHeight + cardSpacing);

      // Card background with subtle shadow
      doc.setFillColor(220, 220, 220);
      doc.rect(cardX + 2, cardY + 2, cardWidth, cardHeight, 'F'); // Shadow

      doc.setFillColor(card.bgColor[0], card.bgColor[1], card.bgColor[2]);
      doc.rect(cardX, cardY, cardWidth, cardHeight, 'F');

      // Card border
      doc.setDrawColor(card.color[0], card.color[1], card.color[2]);
      doc.setLineWidth(1);
      doc.rect(cardX, cardY, cardWidth, cardHeight);

      // Card content
      // Title
      doc.setTextColor(card.color[0], card.color[1], card.color[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(card.label, cardX + cardWidth / 2, cardY + 12, { align: 'center' });

      // Value
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(card.value, cardX + cardWidth / 2, cardY + 28, { align: 'center' });
    });

    currentY += 2 * (cardHeight + cardSpacing) + 15;

    // Add availability status bar
    doc.setFillColor(248, 250, 252);
    doc.rect(20, currentY, pageWidth - 40, 25, 'F');

    // Status bar border
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(20, currentY, pageWidth - 40, 25);

    // Status bar content
    doc.setTextColor(75, 85, 99);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Library Status:', 25, currentY + 8);

    // Available percentage bar
    const barWidth = 100;
    const availableBarWidth = (stats.availableRate / 100) * barWidth;
    const borrowedBarWidth = (stats.borrowedRate / 100) * barWidth;

    const barX = 25;
    const barY = currentY + 12;

    // Available portion (green)
    doc.setFillColor(34, 197, 94);
    doc.rect(barX, barY, availableBarWidth, 8, 'F');

    // Borrowed portion (red)
    doc.setFillColor(239, 68, 68);
    doc.rect(barX + availableBarWidth, barY, borrowedBarWidth, 8, 'F');

    // Bar border
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(barX, barY, barWidth, 8);

    // Legend
    doc.setTextColor(34, 197, 94);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Available: ${stats.availableRate}%`, barX + barWidth + 10, barY + 4);

    doc.setTextColor(239, 68, 68);
    doc.text(`Borrowed: ${stats.borrowedRate}%`, barX + barWidth + 10, barY + 12);

    currentY += 35;

    // Top Genres section






    // Back to first page for footer
    const totalPages = doc.getNumberOfPages();
    doc.setPage(1);

    // Add footer with generation info on first page
    const finalY = pageHeight - 30;

    // Footer background
    doc.setFillColor(248, 250, 252);
    doc.rect(0, finalY, pageWidth, 20, 'F');

    // Footer text
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Report generated on ${new Date().toLocaleString('en-US')}`, pageWidth / 2, finalY + 8, { align: 'center' });
    doc.text(`Library Management System - Total: ${stats.totalBooks} books`, pageWidth / 2, finalY + 14, { align: 'center' });

    // Save the PDF
    doc.save(exportFilename);

    return stats;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    toast({
      title: "Export Error",
      description: "There was an error exporting to PDF. Please try again.",
      variant: "destructive"
    });
  }
};