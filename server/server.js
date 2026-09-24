
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Trust proxy for secure cookies in reverse proxies (Vercel / Heroku)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or same-origin)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Ensure database connection for all requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// Root API info & Health check
app.get('/api', (req, res) => {
  res.json({ message: 'Neuro Sync AI API is running', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/screening', require('./routes/screeningRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/voice', require('./routes/voiceRoutes'));
app.use('/api/games', require('./routes/gameRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/tools', require('./routes/toolsRoutes'));

// Error handler
app.use(errorHandler);

// Only listen when running standalone (not on Vercel serverless)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Neuro Sync AI server running on port ${PORT}`);
  });
}

module.exports = app;
