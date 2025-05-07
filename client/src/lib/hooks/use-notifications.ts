import { useState, useEffect } from 'react';

export interface Notification {
  id: number;
  message: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 1, message: '5 new members joined today', time: '2 minutes ago', read: false },
  { id: 2, message: 'Membership renewal required for 3 borrowers', time: '1 hour ago', read: false },
  { id: 3, message: 'New book collection arrived', time: '3 hours ago', read: true },
  { id: 4, message: '10 books are overdue for return', time: '1 day ago', read: true },
  { id: 5, message: 'System backup completed successfully', time: '2 days ago', read: true }
];

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const savedNotifications = localStorage.getItem('libraryms_notifications');
    return savedNotifications ? JSON.parse(savedNotifications) : INITIAL_NOTIFICATIONS;
  });

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('libraryms_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const markAsRead = (id: number) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
  };

  const addNotification = (message: string) => {
    const newNotification: Notification = {
      id: Date.now(),
      message,
      time: 'just now',
      read: false,
    };
    
    setNotifications(prevNotifications => [newNotification, ...prevNotifications]);
  };

  const removeNotification = (id: number) => {
    setNotifications(prevNotifications =>
      prevNotifications.filter(notification => notification.id !== id)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(notification => !notification.read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification,
    clearAllNotifications,
  };
};
