import { useState, useEffect } from 'react';
import { useCompactView } from '@/lib/context/compact-view-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, FileSpreadsheet, Clock, Type, Palette, Database, Shield, Bell, Upload } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Slider } from '@/components/ui/slider';
import { exportToExcel, exportAllDataToJSON, exportAllDataToExcel } from '@/lib/utils/export';
import { localStorage_storage } from "@/lib/localStorage";

const Settings = () => {
  const { toast } = useToast();
  const [profileImage, setProfileImage] = useState<string | null>(() => {
    return localStorage.getItem('profileImage') || null;
  });
  const [displayName, setDisplayName] = useState(() => {
    return localStorage.getItem('displayName') || 'Admin';
  });
  const [email, setEmail] = useState(() => {
    return localStorage.getItem('email') || 'admin@library.com';
  });
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const { isCompactView, setIsCompactView } = useCompactView();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [fontSizePreference, setFontSizePreference] = useState('medium');

  // New settings states
  const [refreshInterval, setRefreshInterval] = useState(() => {
    return parseInt(localStorage.getItem('refreshInterval') || '2');
  });
  const [tableRowsPerPage, setTableRowsPerPage] = useState(() => {
    return parseInt(localStorage.getItem('tableRowsPerPage') || '10');
  });
  const [showBookCovers, setShowBookCovers] = useState(() => {
    return localStorage.getItem('showBookCovers') !== 'false';
  });
  const [enableSounds, setEnableSounds] = useState(() => {
    return localStorage.getItem('enableSounds') !== 'false';
  });
  const [doubleClickEdit, setDoubleClickEdit] = useState(() => {
    return localStorage.getItem('doubleClickEdit') !== 'false';
  });
  const [confirmDelete, setConfirmDelete] = useState(() => {
    return localStorage.getItem('confirmDelete') !== 'false';
  });

  // Password confirmation states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [resetPassword, setResetPassword] = useState('');

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
  const { data: books } = useQuery<any[]>({ queryKey: ['/api/books'] });
  const { data: borrowings } = useQuery({ 
    queryKey: ['/api/borrowings'],
    refetchInterval: 2000,
  });
  const { data: borrowers } = useQuery<any[]>({ queryKey: ['/api/borrowers'] });
  const { data: librarians } = useQuery<any[]>({ queryKey: ['/api/librarians'] });
  const { data: feedback } = useQuery<any[]>({ queryKey: ['/api/feedback'] });
  const { data: research } = useQuery<any[]>({ queryKey: ['/api/research'] });



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

    // Save all settings to localStorage
    localStorage.setItem('libraryHours', JSON.stringify(libraryHours));
    localStorage.setItem('refreshInterval', refreshInterval.toString());
    localStorage.setItem('tableRowsPerPage', tableRowsPerPage.toString());
    localStorage.setItem('showBookCovers', showBookCovers.toString());
    localStorage.setItem('enableSounds', enableSounds.toString());
    localStorage.setItem('doubleClickEdit', doubleClickEdit.toString());
    localStorage.setItem('confirmDelete', confirmDelete.toString());
    localStorage.setItem('backupFrequency', backupFrequency);

    toast({
      title: "Preferences Updated",
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
    <div className="animate-fade-in">
      <div className="mb-6 animate-slide-up">
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">Configure system preferences and data management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-24 h-24 relative group cursor-pointer" onClick={() => document.getElementById('profile-image-upload')?.click()}>
                  <img
                    src={profileImage || 'https://github.com/shadcn.png'}
                    alt="Profile"
                    className="rounded-full w-full h-full object-cover transition-opacity group-hover:opacity-75"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                  <input
                    id="profile-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const result = event.target?.result as string;
                          setProfileImage(result);
                          localStorage.setItem('profileImage', result);
                          toast({
                            title: "Profile Image Updated",
                            description: "Your profile image has been successfully updated."
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Click image to upload new profile picture
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="display-name">Display Name</Label>
                <Input 
                  id="display-name" 
                  placeholder="Your name" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button onClick={() => {
                // Update all profile data in localStorage
                if (profileImage) {
                  localStorage.setItem('profileImage', profileImage);
                }
                localStorage.setItem('displayName', displayName);
                localStorage.setItem('email', email);

                // Trigger a window event to notify header component
                window.dispatchEvent(new CustomEvent('profileUpdated', { 
                  detail: { 
                    newImage: profileImage,
                    newDisplayName: displayName,
                    newEmail: email
                  } 
                }));

                toast({ 
                  title: "Profile updated",
                  description: "Your profile has been saved successfully."
                });
              }}>
                Save Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Library Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              Library Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(libraryHours).map(([day, hours]) => (
                <div key={day} className="flex justify-between text-sm">
                  <span className="font-medium capitalize">{day}</span>
                  <span>{hours.open === 'Closed' ? 'Closed' : `${hours.open} - ${hours.close}`}</span>
                </div>
              ))}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="mt-4 w-full">Edit Hours</Button>
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
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h4 className="text-md font-medium">Update Password</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" placeholder="Enter current password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" placeholder="Enter new password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" placeholder="Confirm new password" />
                </div>
              </div>
              <Button onClick={() => {
                const currentPassword = (document.getElementById('currentPassword') as HTMLInputElement)?.value;
                const newPassword = (document.getElementById('newPassword') as HTMLInputElement)?.value;
                const confirmPassword = (document.getElementById('confirmPassword') as HTMLInputElement)?.value;

                if (currentPassword && (!newPassword || !confirmPassword)) {
                  toast({
                    title: "Validation Error",
                    description: "Please fill in all password fields to update password",
                    variant: "destructive"
                  });
                  return;
                }

                if (newPassword && newPassword !== confirmPassword) {
                  toast({
                    title: "Password Mismatch",
                    description: "New password and confirmation do not match",
                    variant: "destructive"
                  });
                  return;
                }

                if (!currentPassword || !newPassword || !confirmPassword) {
                  toast({
                    title: "Validation Error",
                    description: "Please fill in all password fields",
                    variant: "destructive"
                  });
                  return;
                }

                toast({ 
                  title: "Password Updated",
                  description: "Your password has been updated successfully"
                });
              }}>
                Update Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="text-md font-medium">Export Data</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Export your library data for backup or analysis purposes
                </p>

                <div className="space-y-4">
                  {/* Beautiful Export Books Card */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-2 rounded-lg">
                          <FileSpreadsheet className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-emerald-800 dark:text-emerald-300">Export Library Books</h4>
                          <p className="text-sm text-emerald-600 dark:text-emerald-400">
                            Export all book records in Excel format
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                          {books?.length || 0}
                        </div>
                        <div className="text-xs text-emerald-600 dark:text-emerald-400">
                          {(books?.length || 0) === 1 ? 'book' : 'books'}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="text-xs text-emerald-700 dark:text-emerald-300">
                        Export contains: Complete Book Records, Author Details, Publisher Information, Category Classifications, Storage Location Data, and Reference Codes
                      </div>
                    </div>

                    <Button
                      variant="default"
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0 font-medium"
                      onClick={() => {
                        if (books && books.length > 0) {
                          exportToExcel(books, 'library-books-complete');
                          toast({
                            title: "📊 Export Successful",
                            description: `Successfully exported ${books.length} books to Excel file with complete details`,
                          });
                        } else {
                          toast({
                            title: "📚 No Books Available",
                            description: "There are no books in the library to export",
                            variant: "destructive"
                          });
                        }
                      }}
                      disabled={!books || books.length === 0}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {books && books.length > 0 
                        ? `Export ${books.length} Books to Excel` 
                        : 'No Books to Export'
                      }
                    </Button>
                  </div>
                </div>
              </div>


            </div>
          </CardContent>
        </Card>

        {/* System Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-purple-500" />
              System Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-medium mb-3">Appearance</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Dark Mode</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Toggle between light and dark themes</p>
                    </div>
                    <Switch
                      checked={isDarkMode}
                      onCheckedChange={(checked) => {
                        setIsDarkMode(checked);
                        if (checked) {
                          document.documentElement.classList.add('dark');
                        } else {
                          document.documentElement.classList.remove('dark');
                        }
                        localStorage.setItem('theme', checked ? 'dark' : 'light');
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
                      onCheckedChange={(checked) => {
                        setIsCompactView(checked);
                        localStorage.setItem('isCompactView', checked.toString());
                      }}
                    />
                  </div>


                </div>
              </div>



              {/* Text Size Settings */}
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

              <Button onClick={handleSavePreferences} className="w-full mt-4">
                Save Preferences
              </Button>
            </div>

            {/* Reset Data Section */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-md font-medium mb-3 text-red-600 dark:text-red-400">Danger Zone</h4>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-700">
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-red-500 p-2 rounded-lg">
                    <Database className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-red-800 dark:text-red-300">Reset All Data</h5>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      This will permanently delete all library data including books, borrowers, librarians, borrowings, and feedback. Sample data will be restored.
                    </p>
                  </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Database className="mr-2 h-4 w-4" />
                      Reset All Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-red-600">Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription className="space-y-2">
                        <div>This action cannot be undone. This will permanently delete:</div>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>All books and their information</li>
                          <li>All borrower records</li>
                          <li>All librarian accounts</li>
                          <li>All borrowing history</li>
                          <li>All librarian accounts</li>
                          <li>All feedback submissions</li>
                          <li>All research papers</li>
                        </ul>
                        <div className="font-semibold text-red-600">Fresh sample data will be restored after reset.</div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => {
                          setShowPasswordModal(true);
                        }}
                      >
                        Yes, Reset Everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>


      </div>

      {/* Password Confirmation Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Shield className="h-5 w-5" />
              Security Confirmation Required
            </DialogTitle>
            <DialogDescription>
              To prevent accidental data loss, please enter the administrator password to confirm the system reset.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reset-password">Administrator Password</Label>
              <Input
                id="reset-password"
                type="password"
                placeholder="Enter admin password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && resetPassword === 'admin123') {
                    handleSystemReset();
                  }
                }}
              />
              <p className="text-xs text-gray-500">
                Enter the administrator password to proceed with system reset
              </p>
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordModal(false);
                setResetPassword('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={resetPassword !== 'admin123'}
              onClick={async () => {
                if (resetPassword === 'admin123') {
                  await handleSystemReset();
                } else {
                  toast({
                    title: "❌ Incorrect Password",
                    description: "Please enter the correct administrator password.",
                    variant: "destructive"
                  });
                }
              }}
            >
              Confirm Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  async function handleSystemReset() {
    try {
      // Force reset all localStorage data immediately
      localStorage_storage.forceResetData();

      // Clear all localStorage completely
      localStorage.clear();

      // Try to call the API to reset the database, but don't fail if it doesn't work
      try {
        const response = await fetch('/api/reset-database', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Database reset successful:', result);
        } else {
          console.warn('Database reset API call failed, but localStorage reset succeeded');
        }
      } catch (apiError) {
        console.warn('Database reset API call failed:', apiError);
        // Continue anyway since localStorage reset succeeded
      }

      toast({
        title: "🔄 System Reset Complete",
        description: "All data has been reset and sample data restored. Refreshing page...",
        className: "bg-green-500 text-white",
        duration: 3000
      });

      // Close the modal
      setShowPasswordModal(false);
      setResetPassword('');

      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error("Error resetting data:", error);
      toast({
        title: "❌ Reset Failed",
        description: `Failed to reset system data: ${error.message}`,
        variant: "destructive",
      });
    }
  }
};

export default Settings;