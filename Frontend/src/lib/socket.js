import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
if (!SOCKET_URL) {
  throw new Error('Missing VITE_SOCKET_URL. Set VITE_SOCKET_URL in .env or in your deployment environment to the deployed backend socket URL.');
}

/**
 * Creates and configures a Socket.IO client instance.
 * Pass the JWT token in auth parameters for handshake authentication.
 */
export const initSocket = (token) => {
  return io(SOCKET_URL, {
    auth: {
      token: `Bearer ${token}`
    },
    autoConnect: false,
    transports: ['websocket', 'polling'],
    reconnectionDelayMax: 10000,
  });
};
