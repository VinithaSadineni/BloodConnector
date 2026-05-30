import { useNotificationStore } from '../store/notificationStore';

/**
 * Custom hook to manage active user notifications drawer and counts.
 */
export const useNotifications = () => {
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const isOpen = useNotificationStore((state) => state.isOpen);
  const setOpen = useNotificationStore((state) => state.setOpen);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  const markRead = useNotificationStore((state) => state.markRead);
  const markAllRead = useNotificationStore((state) => state.markAllRead);
  const deleteNotification = useNotificationStore((state) => state.deleteNotification);

  return {
    notifications,
    unreadCount,
    isOpen,
    setOpen,
    fetchNotifications,
    markRead,
    markAllRead,
    deleteNotification,
  };
};
export default useNotifications;
