// (Twilio credentials removed from here; now stored in config/twilio.js)

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import userRoutes from './routes/userRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import queueRoutes from './routes/queueRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import smsRoutes from './routes/smsRoutes.js';
import './scripts/sendReminders.js';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Explicitly load .env from the src/server directory
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../../dist')));

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/sms', smsRoutes);

// Catch-all route to serve index.html for client-side routing
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error occurred:', err);
  console.error('Stack trace:', err.stack);
  const statusCode = err.statusCode || 500; // Use status code from error if available, else 500
  res.status(statusCode).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? { ...err, stack: err.stack } : 'Internal server error',
  });
});

// Connect to MongoDB
mongoose.connect('mongodb+srv://users:Sumitp%40til58@trimly.clslanc.mongodb.net/?retryWrites=true&w=majority&appName=trimly',
  { useNewUrlParser: true, useUnifiedTopology: true }
)
  .then(() => {
    console.log('Connected to MongoDB Atlas!');
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`API endpoint: http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB Atlas connection error:', error);
  }); 