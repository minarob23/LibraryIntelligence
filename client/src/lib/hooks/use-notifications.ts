import { useState, useEffect } from 'react';

export interface Notification {
  id: number;
  message: string;
  time: string;
  read: boolean;
  type?: 'success' | 'warning' | 'error' | 'info';
}

const INITIAL_NOTIFICATIONS: Notification[] = [];

const checkExpiryAndOverdue = (borrowers: any[], borrowings: any[]) => {
  const notifications: Notification[] = [];
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

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const savedNotifications = localStorage.getItem('libraryms_notifications');
    return savedNotifications ? JSON.parse(savedNotifications) : INITIAL_NOTIFICATIONS;
  });

  useEffect(() => {
    localStorage.setItem('libraryms_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    const newNotification: Notification = {
      id: Date.now(),
      message,
      time: new Date().toLocaleTimeString(),
      read: false,
      type,
    };

    setNotifications(prevNotifications => [newNotification, ...prevNotifications]);
  };

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

  const removeNotification = (id: number) => {
    setNotifications(prevNotifications =>
      prevNotifications.filter(notification => notification.id !== id)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const trackAction = (action: string, details: string) => {
    const recentActions = JSON.parse(localStorage.getItem('recentActions') || '[]');
    const newAction = {
      action,
      details,
      timestamp: new Date().toLocaleTimeString()
    };
    recentActions.unshift(newAction);
    // Keep only last 10 actions
    localStorage.setItem('recentActions', JSON.stringify(recentActions.slice(0, 10)));
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
    trackAction,
  };
};