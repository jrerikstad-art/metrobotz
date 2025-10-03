import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

const connectMongoDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/metrobotz';
    
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
    };

    // Try to connect, but don't exit if it fails
    try {
      await mongoose.connect(mongoURI, options);
      logger.info('✅ MongoDB connected successfully');
    } catch (mongoError) {
      logger.warn('⚠️ MongoDB connection failed, running in demo mode:', mongoError.message);
      logger.info('💡 To enable full functionality, install MongoDB or use MongoDB Atlas');
      return; // Continue without MongoDB
    }
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });
    
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    logger.info('💡 Running in demo mode without database');
  }
};

export { connectMongoDB };