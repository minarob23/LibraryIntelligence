import { toast } from "@/hooks/use-toast";

/**
 * Export data to Excel format
 * @param data Array of data to export
 * @param fileName Name of the file without extension
 */
export const exportToExcel = (data: any[], fileName: string = 'export') => {
  try {
    // Convert data to CSV format
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          let cell = row[header] === null || row[header] === undefined ? '' : row[header];
          
          // Handle strings that need quotes
          if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
            cell = `"${cell.replace(/"/g, '""')}"`;
          }
          
          return cell;
        }).join(',')
      )
    ].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

/**
 * Import data from Excel or CSV file
 * @param file File to import
 * @returns Promise that resolves with the imported data
 */
export const importFromFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        
        if (file.name.endsWith('.csv')) {
          const rows = content.split('\n');
          const headers = rows[0].split(',');
          
          const data = rows.slice(1).map(row => {
            const values = row.split(',');
            return headers.reduce((obj, header, index) => {
              obj[header] = values[index] || '';
              return obj;
            }, {} as Record<string, string>);
          });
          
          resolve(data);
        } else if (file.name.endsWith('.json')) {
          const data = JSON.parse(content);
          resolve(data);
        } else {
          reject(new Error('Unsupported file format. Please use CSV or JSON.'));
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        reject(new Error('Error parsing file. Please check the file format and try again.'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file. Please try again.'));
    };
    
    if (file.name.endsWith('.csv') || file.name.endsWith('.json')) {
      reader.readAsText(file);
    } else {
      reject(new Error('Unsupported file format. Please use CSV or JSON.'));
    }
  });
};
