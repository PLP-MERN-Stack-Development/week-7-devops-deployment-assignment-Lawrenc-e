import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import bugRoutes from './routes/bugRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import { debugLog } from './utils/debugUtils.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  debugLog(`${req.method} ${req.path}`, { body: req.body, query: req.query });
  next();
});

// Routes
app.use('/api/bugs', bugRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    debugLog('MongoDB Connected', { host: conn.connection.host });
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  connectDB();
  
  app.listen(PORT, () => {
    debugLog(`Server running on port ${PORT}`, { environment: process.env.NODE_ENV });
  });
}

export default app;