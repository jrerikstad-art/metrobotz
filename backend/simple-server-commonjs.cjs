// Simple MetroBotz Backend Server
// This version runs without MongoDB or Redis for testing

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Simple logging
const log = (message) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
};

// Health check endpoint
app.get('/health', (req, res) => {
  log('Health check requested');
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
    log('Test generation requested');
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
    log(`Test generation error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Basic API routes
app.get('/api/status', (req, res) => {
  log('Status check requested');
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
  log(`404 - Route not found: ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  log(`Unhandled error: ${err.message}`);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
app.listen(PORT, HOST, () => {
  log(`🚀 MetroBotz Backend Server running on http://${HOST}:${PORT}`);
  log(`📊 Health check: http://${HOST}:${PORT}/health`);
  log(`🧪 Test endpoint: http://${HOST}:${PORT}/api/bots/test-generate`);
  log(`📋 Status: http://${HOST}:${PORT}/api/status`);
  
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'AIzaSy_your_actual_api_key_here') {
    log('⚠️  Gemini API key not configured - running in demo mode');
    log('💡 To enable AI features, update GEMINI_API_KEY in your .env file');
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});
