require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const { globalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

// Route Imports
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const seekerRoutes = require('./routes/seeker.routes');
const donorRoutes = require('./routes/donor.routes');
const hospitalRoutes = require('./routes/hospital.routes');
const adminRoutes = require('./routes/admin.routes');
const searchRoutes = require('./routes/search.routes');
const notificationRoutes = require('./routes/notification.routes');

const CLIENT_URL = process.env.CLIENT_URL;
const DEV_CLIENT_URLS = process.env.DEV_CLIENT_URLS?.split(',').map(url => url.trim()).filter(Boolean) || [];

if (!process.env.MONGO_URI) {
  console.error('Missing required environment variable: MONGO_URI');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('Missing required environment variable: JWT_SECRET');
  process.exit(1);
}

if (process.env.NODE_ENV === 'production' && !CLIENT_URL) {
  console.error('Missing required environment variable: CLIENT_URL in production');
  process.exit(1);
}

if (process.env.NODE_ENV === 'development' && DEV_CLIENT_URLS.length === 0) {
  console.error('Missing required environment variable: DEV_CLIENT_URLS in development. Set local dev URLs in .env or .env.development.');
  process.exit(1);
}

// Connect to Database
connectDB();

// Initialize Express App
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Trust proxy - properly detect IP addresses behind proxies/load balancers
app.set('trust proxy', 1);

// Middleware Setup
app.use(helmet()); // Basic security headers

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    const allowedOrigins = process.env.NODE_ENV === 'development' ? DEV_CLIENT_URLS : [CLIENT_URL];
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error(`CORS policy does not allow access from origin ${origin}`));
  },
  credentials: true,
};

app.use(cors(corsOptions));

// Logger (dev environment only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Global Rate Limiting
app.use(globalLimiter);

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Route (Welcome / Health Check)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🩸 Emergency Blood Connector Backend is active and running!',
    timestamp: new Date()
  });
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/seeker', seekerRoutes);
app.use('/api/donor', donorRoutes);
app.use('/api/hospital', hospitalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);

// Catch 404 Route Errors
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Not Found - Route ${req.originalUrl} does not exist on this server.`
  });
});

// Global Error Handler (Must be registered last)
app.use(errorHandler);

// Listen on PORT
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🩸 Emergency Blood Connector server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});

// Handle unhandled promise rejections gracefully
process.on('unhandledRejection', (err, promise) => {
  console.error(`⚠️ Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
