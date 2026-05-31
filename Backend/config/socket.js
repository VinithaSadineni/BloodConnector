const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const CLIENT_URL = process.env.CLIENT_URL;
const DEV_CLIENT_URLS = process.env.DEV_CLIENT_URLS?.split(',').map(url => url.trim()).filter(Boolean) || [];

if (process.env.NODE_ENV === 'production' && !CLIENT_URL) {
  throw new Error('Missing required environment variable: CLIENT_URL in production');
}

const initSocket = (server) => {
  if (process.env.NODE_ENV === 'development' && DEV_CLIENT_URLS.length === 0) {
    throw new Error('Missing required environment variable: DEV_CLIENT_URLS in development. Set local dev URLs in .env or .env.development.');
  }

  io = socketIO(server, {
    cors: {
      origin: process.env.NODE_ENV === 'development' ? DEV_CLIENT_URLS : [CLIENT_URL],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware for handshake
  io.use(async (socket, next) => {
    try {
      let token = socket.handshake.auth.token || socket.handshake.headers['authorization'];
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Handle "Bearer <token>" format
      const tokenString = token.startsWith('Bearer ') ? token.slice(7) : token;
      
      const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔌 Socket connected: User ${socket.userId} with role ${socket.userRole}`);
    }

    // Join Personal Room
    socket.join(socket.userId.toString());

    // Join Role Room
    socket.join(`role_${socket.userRole}`);

    // Listeners
    socket.on('join_city_room', (cityName) => {
      if (cityName) {
        const formattedCity = cityName.trim().toLowerCase();
        socket.join(`city_${formattedCity}`);
        if (process.env.NODE_ENV === 'development') {
          console.log(`🏙️ User ${socket.userId} joined city room: city_${formattedCity}`);
        }
      }
    });

    socket.on('leave_city_room', (cityName) => {
      if (cityName) {
        const formattedCity = cityName.trim().toLowerCase();
        socket.leave(`city_${formattedCity}`);
        if (process.env.NODE_ENV === 'development') {
          console.log(`🏙️ User ${socket.userId} left city room: city_${formattedCity}`);
        }
      }
    });

    socket.on('sos_triggered', (sosData) => {
      if (sosData.city) {
        const formattedCity = sosData.city.trim().toLowerCase();
        io.to(`city_${formattedCity}`).emit('emergency_broadcast', {
          type: 'sos_alert',
          message: `🚨 CRITICAL SOS: Emergency blood donation needed in ${sosData.city}!`,
          data: sosData
        });
      }
    });

    socket.on('disconnect', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔌 Socket disconnected: User ${socket.userId}`);
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

const emitToUser = (userId, event, data) => {
  if (io && userId) {
    io.to(userId.toString()).emit(event, data);
  }
};

const emitToCity = (cityName, event, data) => {
  if (io && cityName) {
    const formattedCity = cityName.trim().toLowerCase();
    io.to(`city_${formattedCity}`).emit(event, data);
  }
};

const emitToRole = (roleName, event, data) => {
  if (io && roleName) {
    io.to(`role_${roleName}`).emit(event, data);
  }
};

const broadcast = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitToUser,
  emitToCity,
  emitToRole,
  broadcast
};
