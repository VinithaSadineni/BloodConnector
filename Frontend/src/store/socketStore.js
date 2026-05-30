import { create } from 'zustand';
import { initSocket } from '../lib/socket';
import { useNotificationStore } from './notificationStore';
import { toast } from 'react-hot-toast';

export const useSocketStore = create((set, get) => {
  // Listen for manual disconnect events triggered from AuthStore
  if (typeof window !== 'undefined') {
    window.addEventListener('socket-disconnect', () => {
      get().disconnect();
    });
  }

  return {
    socket: null,
    isConnected: false,

    connect: (token, user) => {
      if (get().socket) return; // Prevent multiple socket instances

      const socket = initSocket(token);

      socket.on('connect', () => {
        set({ isConnected: true });
        console.log('Socket.IO Handshake established successfully.');

        // Join personal and city rooms for notifications and localized alerts
        if (user) {
          if (user.city) {
            socket.emit('join_city_room', user.city);
            console.log(`Joined localized room: city_${user.city}`);
          }
        }
      });

      socket.on('disconnect', () => {
        set({ isConnected: false });
        console.log('Socket.IO Disconnected.');
      });

      // standard listen events
      
      // 1. Direct Notifications
      socket.on('new_notification', (notification) => {
        useNotificationStore.getState().addNotification(notification);
        toast(notification.message || 'New notification', {
          icon: '🔔',
          style: {
            background: '#111827',
            color: '#F0F4F8',
            border: '1px solid #1F2D3D',
          },
        });
      });

      // 2. City-wide Critical SOS Alerts
      socket.on('new_sos_alert', (data) => {
        const request = data.request || data;
        const bloodGroup = request.bloodGroup || 'Blood';
        const city = request.city || 'your area';

        // Critical Red Alert Toast
        toast.error(`🚨 SOS ALERT: ${bloodGroup} needed in ${city}!`, {
          duration: 7000,
          style: {
            background: '#C8102E',
            color: '#ffffff',
            fontWeight: 'bold',
            boxShadow: '0 0 25px rgba(200, 16, 46, 0.6)',
          },
        });

        // Insert into standard user alerts history
        useNotificationStore.getState().addNotification({
          _id: request._id || Math.random().toString(),
          title: '🚨 CRITICAL SOS BROADCAST',
          message: `Active emergency! ${bloodGroup} required at ${request.hospitalName || 'hospital'} (${city}).`,
          type: 'sos',
          isRead: false,
          createdAt: new Date().toISOString(),
        });

        // Dispatch globally for active dashboard components to intercept
        window.dispatchEvent(new CustomEvent('new-sos-alert', { detail: request }));
      });

      // 3. Status Change Updates
      socket.on('request_status_update', (data) => {
        const request = data.request || data;
        const status = request.status || 'updated';

        toast(`Request status updated to: ${status.toUpperCase()}`, {
          icon: '🔄',
          style: {
            background: '#111827',
            color: '#F0F4F8',
            border: '1px solid #1F2D3D',
          },
        });

        window.dispatchEvent(new CustomEvent('request-status-update', { detail: request }));
      });

      // 4. Request Accepted Alerts
      socket.on('request_accepted', (data) => {
        toast.success(`A donor has accepted your blood request!`, {
          icon: '❤️',
          duration: 6000,
          style: {
            background: '#00D68F',
            color: '#ffffff',
            fontWeight: 'bold',
          },
        });
        window.dispatchEvent(new CustomEvent('request-accepted', { detail: data }));
      });

      // 5. Blood stock updates
      socket.on('blood_stock_update', (data) => {
        window.dispatchEvent(new CustomEvent('blood-stock-update', { detail: data }));
      });

      socket.connect();
      set({ socket });
    },

    disconnect: () => {
      const { socket } = get();
      if (socket) {
        socket.disconnect();
        set({ socket: null, isConnected: false });
        console.log('Socket.IO connection terminated.');
      }
    },

    emit: (event, data) => {
      const { socket } = get();
      if (socket && socket.connected) {
        socket.emit(event, data);
      }
    }
  };
});
