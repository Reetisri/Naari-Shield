import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import axios from 'axios';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      upgrade: false,
    });

    setSocket(newSocket);

    newSocket.on('connect', async () => {
      console.log('Socket Connected:', newSocket.id);

      // Join individual user room
      newSocket.emit('join', user._id);

      // If Guardian, fetch linked users and join their rooms
      if (user.role === 'guardian') {
        try {
          const res = await axios.get('/api/guardian/list');
          if (res.data.success) {
            const userIds = res.data.data.map(item => item.user?._id).filter(Boolean);
            if (userIds.length > 0) {
              newSocket.emit('join_guardian', userIds);
              console.log('Joined rooms for linked users:', userIds);
            }
          }
        } catch (err) {
          console.error('Error fetching linked users for socket rooms setup:', err);
        }
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
