import { useState, useEffect } from 'react';

export interface Notification {
  id: number;
  message: string;
  time: string;
  read: boolean;
  type?: 'success' | 'warning' | 'error' | 'info';
  category?: 'membership' | 'borrowing' | 'action' | 'employment';
  relatedId?: number;
}

const INITIAL_NOTIFICATIONS: Notification[] = [];

const checkExpiryAndOverdue = (borrowers: any[], borrowings: any[], librarians: any[]) => {
  const notifications: Notification[] = [];
  const today = new Date();

  // Check membership expiration
  borrowers?.forEach(borrower => {
    const expiryDate = new Date(borrower.expiryDate);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
      notifications.push({
        id: Date.now() + Math.random(),
        message: `📅 ${borrower.name}'s membership expires in ${daysUntilExpiry} days`,
        time: new Date().toLocaleTimeString(),
        read: false,
        type: daysUntilExpiry <= 7 ? 'warning' : 'info',
        category: 'membership',
        relatedId: borrower.id,
      });
    } else if (daysUntilExpiry <= 0) {
      notifications.push({
        id: Date.now() + Math.random(),
        message: `⚠️ ${borrower.name}'s membership has expired ${Math.abs(daysUntilExpiry)} days ago`,
        time: new Date().toLocaleTimeString(),
        read: false,
        type: 'error',
        category: 'membership',
        relatedId: borrower.id,
      });
    } else if (daysUntilExpiry <= 60) {
      notifications.push({
        id: Date.now() + Math.random(),
        message: `📋 ${borrower.name}'s membership expires in ${daysUntilExpiry} days`,
        time: new Date().toLocaleTimeString(),
        read: false,
        type: 'info',
        category: 'membership',
        relatedId: borrower.id,
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
        time: new Date().toLocaleTimeString(),
        read: false,
        type: daysOverdue > 30 ? 'error' : daysOverdue > 14 ? 'warning' : 'info',
        category: 'borrowing',
        relatedId: borrowing.id,
      });
    } else if (dueDate > today && daysOverdue >= -7) {
      const daysRemaining = Math.abs(daysOverdue);
      notifications.push({
        id: Date.now() + Math.random(),
        message: `⏰ Due soon: ${borrowing.bookTitle || 'Item'} (${daysRemaining} days remaining)`,
        time: new Date().toLocaleTimeString(),
        read: false,
        type: daysRemaining <= 3 ? 'warning' : 'info',
        category: 'borrowing',
        relatedId: borrowing.id,
      });
    }
  });

  // Check librarian employment status
  librarians?.forEach(librarian => {
    if (librarian.membershipStatus === 'inactive') {
      notifications.push({
        id: Date.now() + Math.random(),
        message: `👨‍💼 ${librarian.name} has inactive employment status`,
        time: new Date().toLocaleTimeString(),
        read: false,
        type: 'warning',
        category: 'employment',
        relatedId: librarian.id,
      });
    } else if (librarian.membershipStatus === 'temporary') {
      notifications.push({
        id: Date.now() + Math.random(),
        message: `📋 ${librarian.name} is on temporary employment`,
        time: new Date().toLocaleTimeString(),
        read: false,
        type: 'info',
        category: 'employment',
        relatedId: librarian.id,
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

  const addNotification = (
    message: string, 
    type: 'success' | 'warning' | 'error' | 'info' = 'info',
    category?: 'membership' | 'borrowing' | 'action' | 'employment',
    relatedId?: number
  ) => {
    const newNotification: Notification = {
      id: Date.now(),
      message,
      time: new Date().toLocaleTimeString(),
      read: false,
      type,
      category,
      relatedId,
    };

    setNotifications(prevNotifications => [newNotification, ...prevNotifications]);
  };

  const addActionNotification = (action: string, entityType: string, entityName: string) => {
    addNotification(
      `📝 ${action}: ${entityType} "${entityName}"`,
      'success',
      'action'
    );
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
    addActionNotification,
    removeNotification,
    clearAllNotifications,
  };
};