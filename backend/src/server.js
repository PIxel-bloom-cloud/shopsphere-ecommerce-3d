
import 'express-async-errors';
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { rateLimit } from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';

const frontendPath = path.resolve(
  process.cwd(),
  'frontend',
  'dist'
);

if (
  !process.env.MONGO_URI ||
  !process.env.JWT_SECRET ||
  process.env.JWT_SECRET.length < 32
) {
  throw new Error(
    'MONGO_URI and a JWT_SECRET of at least 32 characters are required.'
  );
}

const app = express();

app.disable('x-powered-by');
app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173'
}));

app.use(express.json({ limit: '1mb' }));

// API health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'ShopSphere API'
  });
});

// Authentication rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    message: 'Too many attempts. Please try again later.'
  }
});

// API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Handle unknown API routes
app.use('/api', (_req, res) => {
  res.status(404).json({
    message: 'API route not found.'
  });
});

// Serve frontend static files
app.use(express.static(frontendPath));

// React Router fallback
app.get('*', (req, res, next) => {
  if (req.method !== 'GET') {
    return next();
  }

  res.sendFile(
    path.join(frontendPath, 'index.html'),
    (err) => {
      if (err) next(err);
    }
  );
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err);

  res.status(err.status || 500).json({
    message: err.status
      ? err.message
      : 'Unexpected server error.'
  });
});

const port = process.env.PORT || 5000;

try {
  await mongoose.connect(process.env.MONGO_URI);

  app.listen(port, () => {
    console.log(`ShopSphere running on port ${port}`);
    console.log(`Frontend directory: ${frontendPath}`);
  });
} catch (err) {
  console.error('MongoDB connection failed:', err.message);
  process.exit(1);
}
