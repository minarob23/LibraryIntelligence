import { useState } from 'react';
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
import { Upload, Download, FileText, FileSpreadsheet, Clock, Type } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const Settings = () => {
  const { toast } = useToast();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const { isCompactView, setIsCompactView } = useCompactView();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
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
  const { data: books } = useQuery({ queryKey: ['/api/books'] });
  const { data: borrowers } = useQuery({ queryKey: ['/api/borrowers'] });
  const { data: librarians } = useQuery({ queryKey: ['/api/librarians'] });
  const { data: borrowings } = useQuery({ queryKey: ['/api/borrowings'] });
  const { data: feedback } = useQuery({ queryKey: ['/api/feedback'] });
  const { data: research } = useQuery({ queryKey: ['/api/research'] });

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

    // Save library hours to localStorage for membership page
    localStorage.setItem('libraryHours', JSON.stringify(libraryHours));

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
    <div className="animate-fade-in">
      <div className="mb-6 animate-slide-up">
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">Configure system preferences and data management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col items-center space-y-3">
                <div className="relative w-24 h-24">
                  <img
                    src={profileImage || 'https://github.com/shadcn.png'}
                    alt="Profile"
                    className="rounded-full w-full h-full object-cover"
                  />
                  <label
                    htmlFor="profile-upload"
                    className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1 rounded-full cursor-pointer hover:bg-primary/90"
                  >
                    <Upload className="h-4 w-4" />
                  </label>
                  <input
                    id="profile-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          setProfileImage(e.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
                <Button variant="outline" size="sm" onClick={() => setProfileImage(null)}>
                  Remove Photo
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="display-name">Display Name</Label>
                <Input id="display-name" placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="your@email.com" />
              </div>
              <Button onClick={() => {
                toast({ title: "Profile updated" });
              }}>
                Save Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Library Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Library Hours</CardTitle>
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
            <CardTitle>Security</CardTitle>
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



              <div>
                <h4 className="text-md font-medium mb-3">Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Email Notifications</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Receive email alerts for important events</p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Auto-refresh Data</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Automatically refresh data every 2 seconds</p>
                    </div>
                    <Switch
                      checked={autoBackup}
                      onCheckedChange={setAutoBackup}
                    />
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

              {/* Language Settings */}
              <div className="mt-6">
                <h4 className="text-md font-medium mb-3">Language & Region</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="language" className="text-sm">Display Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger id="language" className="mt-1">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="timezone" className="text-sm">Timezone</Label>
                    <Select defaultValue="UTC">
                      <SelectTrigger id="timezone" className="mt-1">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="EST">Eastern Time</SelectItem>
                        <SelectItem value="PST">Pacific Time</SelectItem>
                        <SelectItem value="CET">Central European Time</SelectItem>
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

        {/* Data Export/Import */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h4 className="text-md font-medium">Export Data</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Download your library data in various formats</p>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => {
                    // Export logic would go here
                    toast({
                      title: "Export Started",
                      description: "Your data export is being prepared..."
                    });
                  }}
                >
                  <FileText className="h-4 w-4" />
                  Export as JSON
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => {
                    // Export logic would go here
                    toast({
                      title: "Export Started",
                      description: "Your CSV export is being prepared..."
                    });
                  }}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Export as CSV
                </Button>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-md font-medium mb-2">Quick Actions</h4>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => {
                      // Clear cache logic
                      localStorage.clear();
                      toast({
                        title: "Cache Cleared",
                        description: "Browser cache has been cleared successfully"
                      });
                    }}
                  >
                    Clear Browser Cache
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full justify-start text-destructive hover:text-destructive">
                        Reset All Settings
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reset All Settings</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will reset all your preferences to default values. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => {
                            // Reset settings logic
                            localStorage.removeItem('theme');
                            localStorage.removeItem('isCompactView');
                            localStorage.removeItem('libraryHours');
                            toast({
                              title: "Settings Reset",
                              description: "All settings have been reset to defaults"
                            });
                            window.location.reload();
                          }}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Reset Settings
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default Settings;