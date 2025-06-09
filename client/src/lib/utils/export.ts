
import { toast } from "@/hooks/use-toast";

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
