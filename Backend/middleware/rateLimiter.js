const rateLimit = require('express-rate-limit');

// In development, create a pass-through limiter
const noOpLimiter = (req, res, next) => next();

// Global rate limiter: Max 100 requests per 15 minutes per IP
const globalLimiter = process.env.NODE_ENV === 'development' ? noOpLimiter : rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => req.ip || req.connection.remoteAddress,
  skip: (req, res) => req.path === '/health'
});

// Auth limiter: Max 200 requests per 15 minutes per IP (very permissive for development/testing)
const authLimiter = process.env.NODE_ENV === 'development' ? noOpLimiter : rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: {
    success: false,
    message: 'Too many login or registration attempts from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => req.ip || req.connection.remoteAddress
});

// SOS route limiter: Max 5 requests per minute per IP
const sosLimiter = process.env.NODE_ENV === 'development' ? noOpLimiter : rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50,
  message: {
    success: false,
    message: 'Too many SOS requests triggered, please wait a minute before attempting again.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => req.ip || req.connection.remoteAddress
});

module.exports = {
  globalLimiter,
  authLimiter,
  sosLimiter
};
