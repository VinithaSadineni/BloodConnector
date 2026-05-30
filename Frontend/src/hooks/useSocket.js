import { useEffect } from 'react';
import { useSocketStore } from '../store/socketStore';

/**
 * Custom hook to interact with active Socket.IO connection and triggers.
 */
export const useSocket = () => {
  const socket = useSocketStore((state) => state.socket);
  const isConnected = useSocketStore((state) => state.isConnected);
  const emit = useSocketStore((state) => state.emit);
  const connect = useSocketStore((state) => state.connect);
  const disconnect = useSocketStore((state) => state.disconnect);

  return {
    socket,
    isConnected,
    emit,
    connect,
    disconnect
  };
};

/**
 * Custom hook to register socket event listeners that clean up on component unmount automatically.
 */
export const useSocketEvent = (eventName, callback) => {
  const socket = useSocketStore((state) => state.socket);

  useEffect(() => {
    if (!socket) return;

    socket.on(eventName, callback);
    
    return () => {
      socket.off(eventName, callback);
    };
  }, [socket, eventName, callback]);
};

export default useSocket;
