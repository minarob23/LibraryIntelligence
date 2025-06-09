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

  // Get notification settings from localStorage
  const getNotificationSettings = () => {
    const savedSettings = localStorage.getItem('libraryms_settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      return {
        membershipExpiryAlerts: settings.membershipExpiryAlerts ?? true,
        dueDateReminders: settings.dueDateReminders ?? true,
        actionHistoryNotifications: settings.actionHistoryNotifications ?? true,
        employmentStatusNotifications: settings.employmentStatusNotifications ?? true,
        expiryReminders: settings.expiryReminders ?? true,
        overdueItems: settings.overdueItems ?? true,
      };
    }
    return {
      membershipExpiryAlerts: true,
      dueDateReminders: true,
      actionHistoryNotifications: true,
      employmentStatusNotifications: true,
      expiryReminders: true,
      overdueItems: true,
    };
  };

  useEffect(() => {
    localStorage.setItem('libraryms_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info', category?: string) => {
    const settings = getNotificationSettings();
    
    // Check if this type of notification is enabled
    if (category) {
      switch (category) {
        case 'membership_expiry':
          if (!settings.membershipExpiryAlerts) return;
          break;
        case 'due_date':
          if (!settings.dueDateReminders) return;
          break;
        case 'action_history':
          if (!settings.actionHistoryNotifications) return;
          break;
        case 'employment_status':
          if (!settings.employmentStatusNotifications) return;
          break;
        case 'expiry':
          if (!settings.expiryReminders) return;
          break;
        case 'overdue':
          if (!settings.overdueItems) return;
          break;
      }
    }

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