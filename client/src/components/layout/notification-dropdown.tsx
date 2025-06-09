
import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/lib/hooks/use-notifications';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const checkAllNotifications = (borrowers: any[], borrowings: any[], librarians: any[]) => {
  const notifications: any[] = [];
  const today = new Date();

  // Check membership expiration
  borrowers?.forEach(borrower => {
    const expiryDate = new Date(borrower.expiryDate);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
      notifications.push({
        id: Date.now() + Math.random(),
        message: `📅 ${borrower.name}'s membership expires in ${daysUntilExpiry} days`,
        time: 'Today',
        read: false,
        type: daysUntilExpiry <= 7 ? 'warning' : 'info',
        category: 'membership',
      });
    } else if (daysUntilExpiry <= 0) {
      notifications.push({
        id: Date.now() + Math.random(),
        message: `⚠️ ${borrower.name}'s membership has expired ${Math.abs(daysUntilExpiry)} days ago`,
        time: 'Today',
        read: false,
        type: 'error',
        category: 'membership',
      });
    } else if (daysUntilExpiry <= 60) {
      notifications.push({
        id: Date.now() + Math.random(),
        message: `📋 ${borrower.name}'s membership expires in ${daysUntilExpiry} days`,
        time: 'Today',
        read: false,
        type: 'info',
        category: 'membership',
      });
    }
  });

  // Check overdue items and due dates
  borrowings?.forEach(borrowing => {
    const dueDate = new Date(borrowing.dueDate);
    const daysOverdue = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dueDate < today && borrowing.status !== 'returned') {
      notifications.push({
        id: Date.now() + Math.random(),
        message: `📚 Overdue: ${borrowing.bookTitle || 'Item'} (${daysOverdue} days overdue)`,
        time: 'Today',
        read: false,
        type: daysOverdue > 30 ? 'error' : daysOverdue > 14 ? 'warning' : 'info',
        category: 'borrowing',
      });
    } else if (dueDate > today && daysOverdue >= -7) {
      const daysRemaining = Math.abs(daysOverdue);
      notifications.push({
        id: Date.now() + Math.random(),
        message: `⏰ Due soon: ${borrowing.bookTitle || 'Item'} (${daysRemaining} days remaining)`,
        time: 'Today',
        read: false,
        type: daysRemaining <= 3 ? 'warning' : 'info',
        category: 'borrowing',
      });
    }
  });

  // Check librarian employment status
  librarians?.forEach(librarian => {
    if (librarian.membershipStatus === 'inactive') {
      notifications.push({
        id: Date.now() + Math.random(),
        message: `👨‍💼 ${librarian.name} has inactive employment status`,
        time: 'Today',
        read: false,
        type: 'warning',
        category: 'employment',
      });
    } else if (librarian.membershipStatus === 'temporary') {
      notifications.push({
        id: Date.now() + Math.random(),
        message: `📋 ${librarian.name} is on temporary employment`,
        time: 'Today',
        read: false,
        type: 'info',
        category: 'employment',
      });
    }
  });

  return notifications;
};

const NotificationDropdown = () => {
  const [open, setOpen] = useState(false);
  const { notifications, markAsRead, markAllAsRead, unreadCount, addNotification, clearAllNotifications } = useNotifications();
  
  const { data: borrowers } = useQuery({ queryKey: ['/api/borrowers'] });
  const { data: borrowings } = useQuery({ queryKey: ['/api/borrowings'] });
  const { data: librarians } = useQuery({ queryKey: ['/api/librarians'] });

  useEffect(() => {
    if (borrowers && borrowings && librarians) {
      const systemNotifications = checkAllNotifications(borrowers, borrowings, librarians);
      systemNotifications.forEach(notification => {
        addNotification(notification.message, notification.type, notification.category);
      });
    }
  }, [borrowers, borrowings, librarians]);

  return (
    <div className="flex items-center">
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
                {notifications.slice(0, 5).map((notification) => (
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
                        <div className="flex items-center justify-between mt-1">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {notification.time}
                          </div>
                          {notification.category && (
                            <div className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                              {notification.category === 'membership' && '👥 Membership'}
                              {notification.category === 'borrowing' && '📚 Borrowing'}
                              {notification.category === 'employment' && '👨‍💼 Employment'}
                              {notification.category === 'action' && '📝 Action'}
                            </div>
                          )}
                        </div>
                      </div>
                      {!notification.read && (
                        <div className="ml-2 h-2 w-2 bg-primary-500 rounded-full" />
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
          <Dialog>
            <DialogTrigger asChild>
              <DropdownMenuItem 
                className="justify-center text-sm text-primary-500 hover:text-primary-600"
                onSelect={(e) => {
                  e.preventDefault();
                }}
              >
                View all notifications
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex justify-between items-center">
                  <span>All Notifications</span>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs text-primary-500 hover:text-primary-600"
                      onClick={() => markAllAsRead()}
                    >
                      Mark all as read
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => clearAllNotifications()}
                    >
                      Delete all
                    </Button>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
                    No notifications available
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 mb-2 rounded-lg cursor-pointer transition duration-150 ease-in-out ${
                        !notification.read
                          ? notification.type === 'error' 
                            ? 'bg-red-50 dark:bg-red-900/20'
                            : notification.type === 'warning'
                            ? 'bg-yellow-50 dark:bg-yellow-900/20'
                            : 'bg-blue-50 dark:bg-blue-900/20'
                          : 'bg-gray-50 dark:bg-gray-900/20'
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start w-full">
                        <div className="w-full">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {notification.message}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {notification.time}
                            </div>
                            {notification.category && (
                              <div className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                {notification.category === 'membership' && '👥 Membership'}
                                {notification.category === 'borrowing' && '📚 Borrowing'}
                                {notification.category === 'employment' && '👨‍💼 Employment'}
                                {notification.category === 'action' && '📝 Action'}
                              </div>
                            )}
                          </div>
                        </div>
                        {!notification.read && (
                          <div className="ml-2 h-2 w-2 bg-primary-500 rounded-full" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default NotificationDropdown;
