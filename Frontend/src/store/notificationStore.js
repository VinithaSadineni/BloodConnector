import { create } from 'zustand';
import axiosInstance from '../lib/axios';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isOpen: false,

  setOpen: (isOpen) => set({ isOpen }),

  fetchNotifications: async () => {
    try {
      const response = await axiosInstance.get('/notifications');
      // Backend may return notifications directly or wrapped inside an object
      const notifications = response.data.notifications || response.data.data || response.data || [];
      const unreadCount = notifications.filter(n => !n.isRead).length;
      set({ notifications, unreadCount });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  },

  addNotification: (n) => {
    set((state) => {
      // Prevent duplicate messages if any
      const exists = state.notifications.find(item => item._id === n._id);
      if (exists) return {};

      const updated = [n, ...state.notifications];
      return {
        notifications: updated,
        unreadCount: updated.filter(item => !item.isRead).length
      };
    });
  },

  markRead: async (id) => {
    try {
      await axiosInstance.put(`/notifications/${id}/read`);
      set((state) => {
        const updated = state.notifications.map((n) => 
          n._id === id ? { ...n, isRead: true } : n
        );
        return {
          notifications: updated,
          unreadCount: updated.filter(item => !item.isRead).length
        };
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },

  markAllRead: async () => {
    try {
      await axiosInstance.put('/notifications/read-all');
      set((state) => {
        const updated = state.notifications.map((n) => ({ ...n, isRead: true }));
        return {
          notifications: updated,
          unreadCount: 0
        };
      });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  },

  deleteNotification: async (id) => {
    try {
      await axiosInstance.delete(`/notifications/${id}`);
      set((state) => {
        const updated = state.notifications.filter((n) => n._id !== id);
        return {
          notifications: updated,
          unreadCount: updated.filter(item => !item.isRead).length
        };
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }
}));
