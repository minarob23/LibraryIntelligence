import { useState, useEffect } from 'react';
import { Menu, User, Settings, LogOut } from 'lucide-react';
import { useLocation } from 'wouter';
import ThemeToggle from './theme-toggle';
import { useTheme } from '@/lib/hooks/use-theme';
import { useCompactView } from '@/lib/context/compact-view-context';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();

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
  const { toast } = useToast();

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

export default Header;