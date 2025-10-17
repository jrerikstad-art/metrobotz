// Health Check API - Test MongoDB Connection
import { connectToDatabase, setCorsHeaders, handleOptions } from './_db.js';

export default async function handler(req, res) {
  setCorsHeaders(res);
  
  if (handleOptions(req, res)) return;

  try {
    // Test MongoDB connection
    const { db } = await connectToDatabase();
    
    // Try to ping the database
    await db.command({ ping: 1 });
    
    // Count bots to verify collection access
    const botsCollection = db.collection('bots');
    const botCount = await botsCollection.countDocuments();

    return res.status(200).json({
      success: true,
      message: 'All systems operational',
      mongodb: {
        connected: true,
        database: db.databaseName,
        botCount
      },
      env: {
        hasMongoUri: !!process.env.MONGODB_URI,
        hasGeminiKey: !!process.env.GEMINI_API_KEY,
        nodeEnv: process.env.NODE_ENV || 'development'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message,
      mongodb: {
        connected: false,
        error: error.message
      },
      env: {
        hasMongoUri: !!process.env.MONGODB_URI,
        hasGeminiKey: !!process.env.GEMINI_API_KEY,
        nodeEnv: process.env.NODE_ENV || 'development'
      },
      timestamp: new Date().toISOString()
    });
  }
}



