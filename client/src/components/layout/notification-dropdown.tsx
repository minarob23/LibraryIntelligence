import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/lib/hooks/use-notifications';
import { useQuery } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,

const checkExpiryAndOverdue = (borrowers: any[], borrowings: any[]) => {
  const notifications: any[] = [];
  const today = new Date();

  // Check membership expiration
  borrowers?.forEach(borrower => {
    const expiryDate = new Date(borrower.expiryDate);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
      notifications.push({
        id: Date.now() + Math.random(),
        message: `${borrower.name}'s membership expires in ${daysUntilExpiry} days`,
        time: 'Today',
        read: false,
      });
    } else if (daysUntilExpiry <= 0) {
      notifications.push({
        id: Date.now() + Math.random(),
        message: `${borrower.name}'s membership has expired`,
        time: 'Today',
        read: false,
      });
    }
  });

  // Check overdue items
  borrowings?.forEach(borrowing => {
    const dueDate = new Date(borrowing.dueDate);
    if (dueDate < today && borrowing.status !== 'returned') {
      notifications.push({
        id: Date.now() + Math.random(),
        message: `Overdue: ${borrowing.bookTitle || 'Item'} (${Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))} days)`,
        time: 'Today',
        read: false,
      });
    }
  });

  return notifications;
};
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const NotificationDropdown = () => {
  const [open, setOpen] = useState(false);
  const { notifications, markAsRead, markAllAsRead, unreadCount, addNotification } = useNotifications();
  
  const { data: borrowers } = useQuery({ queryKey: ['/api/borrowers'] });
  const { data: borrowings } = useQuery({ queryKey: ['/api/borrowings'] });

  useEffect(() => {
    if (borrowers && borrowings) {
      const notifications = checkExpiryAndOverdue(borrowers, borrowings);
      notifications.forEach(notification => {
        addNotification(notification.message);
      });
    }
  }, [borrowers, borrowings]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-primary-500 hover:text-primary-600"
            onClick={() => markAllAsRead()}
          >
            Mark all as read
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-96 overflow-y-auto">
          {notifications.length > 0 ? (
            <DropdownMenuGroup>
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`px-4 py-3 cursor-pointer transition duration-150 ease-in-out ${
                    !notification.read
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start w-full">
                    <div className="ml-2 w-full">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {notification.message}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {notification.time}
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="ml-2 h-2 w-2 bg-primary-500 rounded-full"></div>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          ) : (
            <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
              No notifications
            </div>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center text-sm text-primary-500 hover:text-primary-600">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
