import { useEffect, useRef, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext.jsx';

const SOCKET_URL = (() => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) return apiUrl.replace(/\/api$/, '');
  return 'http://localhost:5000';
})();

/**
 * Connects to the Socket.io server using the current access token.
 * Joins the user's personal room automatically on connection.
 *
 * Returns:
 *   socket     — the raw socket.io instance (or null when not connected)
 *   connected  — boolean connection state
 *   notifications — array of real-time notifications received this session
 *   clearNotifications — empties the local notifications array
 */
export function useSocket() {
  const { token } = useContext(AuthContext);
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!token) {
      // Clean up if user logs out mid-session
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('new_notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [token]);

  const clearNotifications = () => setNotifications([]);

  return {
    socket: socketRef.current,
    connected,
    notifications,
    clearNotifications,
  };
}
