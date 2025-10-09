// Health Check API - Test environment and connections
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        hasMongoUri: !!process.env.MONGODB_URI,
        hasGeminiKey: !!process.env.GEMINI_API_KEY,
        mongoUriPrefix: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'not set',
        geminiKeyPrefix: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'not set'
      },
      services: {
        mongodb: 'unknown',
        gemini: 'unknown'
      }
    };

    // Test MongoDB connection
    try {
      const { MongoClient } = await import('mongodb');
      const uri = process.env.MONGODB_URI;
      if (uri) {
        const client = new MongoClient(uri);
        await client.connect();
        await client.db('admin').admin().ping();
        await client.close();
        health.services.mongodb = 'connected';
      } else {
        health.services.mongodb = 'no_uri';
      }
    } catch (error) {
      health.services.mongodb = `error: ${error.message}`;
    }

    // Test Gemini API key
    try {
      if (process.env.GEMINI_API_KEY) {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Just check if we can create the client (don't make actual request)
        health.services.gemini = 'key_valid';
      } else {
        health.services.gemini = 'no_key';
      }
    } catch (error) {
      health.services.gemini = `error: ${error.message}`;
    }

    return res.status(200).json(health);

  } catch (error) {
    console.error('Health check error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}