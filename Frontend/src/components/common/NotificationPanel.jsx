import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Bell, Heart, AlertTriangle, Info, Trash2 } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { formatTimeAgo } from '../../lib/utils';
import Button from '../ui/Button';

export const NotificationPanel = () => {
  const {
    notifications,
    unreadCount,
    isOpen,
    setOpen,
    markRead,
    markAllRead,
    deleteNotification
  } = useNotifications();

  const drawerRef = useRef(null);

  // Close drawer if clicked outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isOpen && drawerRef.current && !drawerRef.current.contains(e.target)) {
        // Exclude notification bell clicks to prevent immediate toggle back
        if (!e.target.closest('button')?.querySelector('.lucide-bell') && !e.target.closest('button')?.classList.contains('lucide-bell')) {
          setOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, setOpen]);

  const getIcon = (type) => {
    switch (type) {
      case 'sos':
        return <AlertTriangle className="w-4 h-4 text-critical animate-pulse" />;
      case 'accepted':
      case 'donation':
        return <Heart className="w-4 h-4 text-success" />;
      case 'info':
        return <Info className="w-4 h-4 text-info" />;
      default:
        return <Bell className="w-4 h-4 text-warning" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity"
            onClick={() => setOpen(false)}
          />

          {/* Drawer container */}
          <motion.div
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] bg-surface-3 border-l border-border/80 flex flex-col shadow-blood-lg font-body"
          >
            {/* Header */}
            <div className="p-5 border-b border-border/80 flex items-center justify-between bg-surface-2/20">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-text-primary uppercase tracking-wider font-mono">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded bg-blood-glow/10 border border-blood-glow/20 text-blood-glow text-[10px] font-bold font-mono">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="p-1.5 rounded-lg bg-surface-2 hover:bg-surface-4 border border-border text-xs text-text-muted hover:text-text-primary transition-all duration-200 outline-none flex items-center gap-1 active:scale-95"
                    title="Mark all read"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">All Read</span>
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg bg-surface-2 hover:bg-surface-4 border border-border text-text-muted hover:text-text-primary transition-all duration-200 outline-none active:scale-95"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List area */}
            <div className="flex-1 overflow-y-auto divide-y divide-border/60">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center px-6">
                  <div className="p-4 rounded-full bg-white/5 border border-white/5 text-text-muted mb-4 animate-pulse">
                    <Bell className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-text-primary tracking-wide mb-1">
                    All clear!
                  </h4>
                  <p className="text-xs text-text-muted max-w-[240px] leading-relaxed">
                    No active notifications to show right now. Critical emergency broadcasts will appear here.
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`p-4 flex gap-3 transition-colors duration-200 relative group ${!n.isRead ? 'bg-blood/5 hover:bg-blood/10' : 'bg-transparent hover:bg-white/5'}`}
                  >
                    {/* Unread marker bar */}
                    {!n.isRead && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-blood-glow" />
                    )}

                    {/* Icon container */}
                    <div className="p-2.5 h-9 w-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                      {getIcon(n.type)}
                    </div>

                    {/* Message content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-xs font-bold text-text-primary truncate ${!n.isRead ? 'text-blood-glow' : 'text-text-primary'}`}>
                          {n.title || 'System Alert'}
                        </h4>
                        <span className="text-[10px] text-text-muted shrink-0 mt-0.5">
                          {formatTimeAgo(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted leading-relaxed mt-1 select-text">
                        {n.message}
                      </p>
                      
                      {/* Individual inline action controllers on hover */}
                      <div className="flex justify-end gap-3 mt-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {!n.isRead && (
                          <button
                            onClick={() => markRead(n._id)}
                            className="text-[10px] font-bold text-success hover:underline outline-none flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Mark Read</span>
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(n._id)}
                          className="text-[10px] font-bold text-critical hover:underline outline-none flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;
