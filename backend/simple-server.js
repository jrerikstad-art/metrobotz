import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { logger } from './src/utils/logger.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'MetroBotz Backend',
    version: '1.0.0'
  });
});

// Test Gemini API endpoint
app.post('/api/bots/test-generate', async (req, res) => {
  try {
    const { prompt, contentType = 'post' } = req.body;

    if (!prompt || prompt.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Prompt must be at least 5 characters long'
      });
    }

    // Check if Gemini API key is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'AIzaSy_your_actual_api_key_here') {
      return res.status(400).json({
        success: false,
        message: 'Gemini API key not configured. Please update your .env file with a valid API key.'
      });
    }

    // For now, return a mock response
    const mockResponse = {
      text: `🤖 Mock response for: "${prompt}"\n\nThis is a demo response. To enable real AI generation, configure your Gemini API key in the .env file and ensure the AI service is properly set up.`,
      tokensUsed: 42,
      cost: 0.0001,
      generationTime: 150
    };

    res.json({
      success: true,
      content: mockResponse.text,
      metadata: {
        tokensUsed: mockResponse.tokensUsed,
        cost: mockResponse.cost,
        generationTime: mockResponse.generationTime
      }
    });

  } catch (error) {
    logger.error('Test generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Basic API routes
app.get('/api/status', (req, res) => {
  res.json({
    status: 'running',
    timestamp: new Date().toISOString(),
    services: {
      database: 'demo mode',
      redis: 'demo mode',
      gemini: process.env.GEMINI_API_KEY ? 'configured' : 'not configured'
    }
  });
});

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
const startServer = async () => {
  try {
    app.listen(PORT, HOST, () => {
      logger.info(`🚀 MetroBotz Backend Server running on http://${HOST}:${PORT}`);
      logger.info(`📊 Health check: http://${HOST}:${PORT}/health`);
      logger.info(`🧪 Test endpoint: http://${HOST}:${PORT}/api/bots/test-generate`);
      logger.info(`📋 Status: http://${HOST}:${PORT}/api/status`);
      
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'AIzaSy_your_actual_api_key_here') {
        logger.warn('⚠️  Gemini API key not configured - running in demo mode');
        logger.info('💡 To enable AI features, update GEMINI_API_KEY in your .env file');
      }
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();
