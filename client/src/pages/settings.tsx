import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, FileText, FileSpreadsheet, Clock, Type } from 'lucide-react';
import { exportToExcel, exportToNotion } from '@/lib/utils/export';
import { useQuery } from '@tanstack/react-query';

const Settings = () => {
  const { toast } = useToast();
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [isCompactView, setIsCompactView] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [expiryReminders, setExpiryReminders] = useState(true);
  const [overdueItems, setOverdueItems] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fontSizePreference, setFontSizePreference] = useState('medium');
  const [libraryHours, setLibraryHours] = useState({
    monday: { open: '09:00', close: '18:00' },
    tuesday: { open: '09:00', close: '18:00' },
    wednesday: { open: '09:00', close: '18:00' },
    thursday: { open: '09:00', close: '18:00' },
    friday: { open: '09:00', close: '18:00' },
    saturday: { open: '10:00', close: '16:00' },
    sunday: { open: 'Closed', close: 'Closed' },
  });

  // Fetch data for export
  const { data: books } = useQuery({ 
    queryKey: ['/api/books'],
  });
  
  const { data: research } = useQuery({ 
    queryKey: ['/api/research'],
  });
  
  const { data: borrowers } = useQuery({ 
    queryKey: ['/api/borrowers'],
  });
  
  const { data: librarians } = useQuery({ 
    queryKey: ['/api/librarians'],
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to import",
        variant: "destructive"
      });
      return;
    }

    // Here you would process the file for import
    // This is a simplified simulation for demonstration
    setTimeout(() => {
      toast({
        title: "Import successful",
        description: `Data from ${selectedFile.name} has been imported.`
      });
      setSelectedFile(null);
    }, 1000);
  };

  const handleExport = (dataType: string, format: 'excel' | 'notion') => {
    let dataToExport: any[] = [];
    let fileName = '';

    switch (dataType) {
      case 'books':
        dataToExport = Array.isArray(books) ? books : [];
        fileName = 'books_export';
        break;
      case 'research':
        dataToExport = Array.isArray(research) ? research : [];
        fileName = 'research_papers_export';
        break;
      case 'borrowers':
        dataToExport = Array.isArray(borrowers) ? borrowers : [];
        fileName = 'borrowers_export';
        break;
      case 'librarians':
        dataToExport = Array.isArray(librarians) ? librarians : [];
        fileName = 'librarians_export';
        break;
      default:
        break;
    }

    if (dataToExport.length === 0) {
      toast({
        title: "No data available",
        description: "There is no data to export",
        variant: "destructive"
      });
      return;
    }

    if (format === 'excel') {
      exportToExcel(dataToExport, fileName);
      toast({
        title: "Export successful",
        description: `Data exported to Excel as ${fileName}.xlsx`
      });
    } else {
      exportToNotion(dataToExport)
        .then(() => {
          toast({
            title: "Export successful",
            description: "Data exported to Notion"
          });
        })
        .catch(error => {
          toast({
            title: "Export failed",
            description: error.message,
            variant: "destructive"
          });
        });
    }
  };

  const handleSavePreferences = () => {
    // Apply font size setting to document
    document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg');
    switch (fontSizePreference) {
      case 'small':
        document.documentElement.classList.add('text-sm');
        break;
      case 'medium':
        document.documentElement.classList.add('text-base');
        break;
      case 'large':
        document.documentElement.classList.add('text-lg');
        break;
    }
    
    toast({
      title: "Preferences saved",
      description: "Your settings have been updated."
    });
  };
  
  const handleLibraryHoursChange = (day: string, type: 'open' | 'close', value: string) => {
    setLibraryHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day as keyof typeof prev],
        [type]: value
      }
    }));
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">Configure system preferences and data management</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Data Export/Import with System Preferences */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Data Export/Import</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="export">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="export">Export</TabsTrigger>
                <TabsTrigger value="import">Import</TabsTrigger>
              </TabsList>
              
              <TabsContent value="export" className="space-y-6">
                <div>
                  <h4 className="text-md font-medium mb-2">Export Data</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">Books Collection</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Export all books data</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center"
                          onClick={() => handleExport('books', 'excel')}
                        >
                          <FileSpreadsheet className="mr-1 h-4 w-4" /> Excel
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center"
                          onClick={() => handleExport('books', 'notion')}
                        >
                          <FileText className="mr-1 h-4 w-4" /> Notion
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">Research Papers</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Export all research papers data</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center"
                          onClick={() => handleExport('research', 'excel')}
                        >
                          <FileSpreadsheet className="mr-1 h-4 w-4" /> Excel
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center"
                          onClick={() => handleExport('research', 'notion')}
                        >
                          <FileText className="mr-1 h-4 w-4" /> Notion
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">Borrowers</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Export all borrowers data</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center"
                          onClick={() => handleExport('borrowers', 'excel')}
                        >
                          <FileSpreadsheet className="mr-1 h-4 w-4" /> Excel
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center"
                          onClick={() => handleExport('borrowers', 'notion')}
                        >
                          <FileText className="mr-1 h-4 w-4" /> Notion
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">Librarians</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Export all librarians data</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center"
                          onClick={() => handleExport('librarians', 'excel')}
                        >
                          <FileSpreadsheet className="mr-1 h-4 w-4" /> Excel
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center"
                          onClick={() => handleExport('librarians', 'notion')}
                        >
                          <FileText className="mr-1 h-4 w-4" /> Notion
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="import">
                <div>
                  <h4 className="text-md font-medium mb-2">Import Data</h4>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Drag & drop files or click to upload</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">Supported formats: .xlsx, .csv, .json</p>
                    
                    <div className="flex flex-col space-y-4">
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept=".xlsx,.csv,.json"
                        onChange={handleFileUpload}
                      />
                      <Button 
                        variant="outline"
                        className="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" /> Select Files
                      </Button>
                      
                      {selectedFile && (
                        <div className="mt-4 flex items-center justify-between p-2 border border-gray-200 dark:border-gray-700 rounded">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-gray-500 mr-2" />
                            <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => setSelectedFile(null)}
                            variant="ghost"
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                      
                      {selectedFile && (
                        <Button 
                          className="mt-4"
                          onClick={handleImport}
                        >
                          <Download className="mr-2 h-4 w-4" /> Import Data
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* System Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>System Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-medium mb-3">Appearance</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Dark Mode</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Switch between light and dark themes</p>
                    </div>
                    <Switch
                      checked={isDarkMode}
                      onCheckedChange={(checked) => {
                        setIsDarkMode(checked);
                        document.documentElement.classList.toggle('dark', checked);
                        localStorage.theme = checked ? 'dark' : 'light';
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Compact View</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Reduce padding in tables and lists</p>
                    </div>
                    <Switch
                      checked={isCompactView}
                      onCheckedChange={setIsCompactView}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-md font-medium mb-3">Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Email Notifications</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Receive emails for important updates</p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Expiry Reminders</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Notifications for membership expirations</p>
                    </div>
                    <Switch
                      checked={expiryReminders}
                      onCheckedChange={setExpiryReminders}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Overdue Items</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Alerts for overdue books and materials</p>
                    </div>
                    <Switch
                      checked={overdueItems}
                      onCheckedChange={setOverdueItems}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-md font-medium mb-3">Data Management</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Automatic Backups</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Regularly backup system data</p>
                    </div>
                    <Switch
                      checked={autoBackup}
                      onCheckedChange={setAutoBackup}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="backup-frequency" className="text-sm">Backup Frequency</Label>
                    <Select 
                      value={backupFrequency} 
                      onValueChange={setBackupFrequency}
                      disabled={!autoBackup}
                    >
                      <SelectTrigger id="backup-frequency" className="mt-1">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* Font Size Settings */}
              <div className="mt-6">
                <h4 className="text-md font-medium mb-3">Text Size</h4>
                <div className="flex items-center space-x-4">
                  <Type className="h-5 w-5 text-gray-500" />
                  <div className="flex-1">
                    <Select 
                      value={fontSizePreference} 
                      onValueChange={setFontSizePreference}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select text size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="pt-6">
                <Button onClick={handleSavePreferences}>
                  Save Preferences
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Library Hours */}
        <Card className="col-span-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              <div className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Library Hours
              </div>
            </CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Edit Hours</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Library Hours</DialogTitle>
                  <DialogDescription>
                    Set the opening and closing hours for each day of the week.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {Object.entries(libraryHours).map(([day, hours]) => (
                    <div key={day} className="grid grid-cols-[1fr,2fr,2fr,auto] gap-4 items-center">
                      <div className="font-medium capitalize">{day}</div>
                      <div>
                        <Label htmlFor={`${day}-open`} className="text-xs mb-1 block">Opening Time</Label>
                        <Input
                          id={`${day}-open`}
                          type="time"
                          value={hours.open !== 'Closed' ? hours.open : ''}
                          disabled={hours.open === 'Closed'}
                          onChange={(e) => handleLibraryHoursChange(day, 'open', e.target.value || 'Closed')}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`${day}-close`} className="text-xs mb-1 block">Closing Time</Label>
                        <Input
                          id={`${day}-close`}
                          type="time"
                          value={hours.close !== 'Closed' ? hours.close : ''}
                          disabled={hours.close === 'Closed'}
                          onChange={(e) => handleLibraryHoursChange(day, 'close', e.target.value || 'Closed')}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          variant={hours.open === 'Closed' ? "destructive" : "outline"}
                          size="sm"
                          className="mb-[2px]"
                          onClick={() => {
                            if (hours.open === 'Closed') {
                              handleLibraryHoursChange(day, 'open', '09:00');
                              handleLibraryHoursChange(day, 'close', '17:00');
                            } else {
                              handleLibraryHoursChange(day, 'open', 'Closed');
                              handleLibraryHoursChange(day, 'close', 'Closed');
                            }
                          }}
                        >
                          {hours.open === 'Closed' ? 'Open Day' : 'Close Day'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <DialogFooter>
                  <Button onClick={handleSavePreferences}>
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(libraryHours).map(([day, hours]) => (
                <div key={day} className="flex justify-between text-sm">
                  <span className="font-medium capitalize">{day}</span>
                  <span>{hours.open === 'Closed' ? 'Closed' : `${hours.open} - ${hours.close}`}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
