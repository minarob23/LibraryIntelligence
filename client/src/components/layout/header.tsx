import { useState, useEffect } from 'react';
import { Menu, User } from 'lucide-react';
import { useLocation } from 'wouter';
import ThemeToggle from './theme-toggle';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface HeaderProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Header = ({ sidebarOpen, toggleSidebar }: HeaderProps) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm z-20 fixed top-0 left-0 right-0 h-[60px]">
      <div className="flex items-center justify-between px-4 py-3 h-full">
        <div className="flex items-center">
          <button
            onClick={() => toggleSidebar()}
            aria-label="Toggle Sidebar"
            className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none cursor-pointer"
          >
            <div className="flex flex-col gap-1.5">
              <div className="w-6 h-0.5 bg-current transition-all"></div>
              <div className="w-6 h-0.5 bg-current transition-all"></div>
              <div className="w-6 h-0.5 bg-current transition-all"></div>
            </div>
          </button>
          <h1 className="ml-4 text-xl font-semibold text-primary-600 dark:text-primary-400">Welcome back, Admin</h1>
        </div>

        <div className="flex items-center space-x-4">
          <DateTimeDisplay />
          <ThemeToggle />
          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

const DateTimeDisplay = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="hidden md:flex flex-col items-end text-right bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 px-3 py-2 rounded-lg border border-blue-100 dark:border-gray-600 shadow-sm">
      <div className="text-xs font-medium text-blue-600 dark:text-blue-300 leading-none">
        {formatDate(currentTime)}
      </div>
      <div className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-none mt-0.5">
        {formatTime(currentTime)}
      </div>
    </div>
  );
};

const UserMenu = () => {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [, navigate] = useLocation();

  return (
    <>
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
            <DialogDescription>
              Update your profile information here.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue="Admin" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="admin@library.com" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={(e) => {
              e.preventDefault();
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

              toast({
                title: "Profile Updated",
                description: "Your profile has been updated successfully"
              });
              setProfileOpen(false);
            }}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center space-x-2 focus:outline-none">
            <Avatar>
              <img src="https://github.com/shadcn.png" alt="profile" className="w-full h-full rounded-full" />
              <AvatarFallback className="bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-100">
                A
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:inline-block font-medium">Admin</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onSelect={() => setProfileOpen(true)}>
            <User size={16} className="mr-2" />
            Your Profile
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => navigate('/settings')}>
            <Settings size={18} className="mr-2 text-primary" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => window.location.href = '/login'}>
            <LogOut size={16} className="mr-2" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

// Icons needed for user menu
const Settings = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V4a2 2 0 0 0-2-2z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const LogOut = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

export default Header;