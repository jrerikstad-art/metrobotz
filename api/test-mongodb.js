// Test MongoDB connection specifically
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const testResult = {
      timestamp: new Date().toISOString(),
      environment: {
        hasMongoUri: !!process.env.MONGODB_URI,
        mongoUriLength: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0,
        mongoUriPrefix: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 30) + '...' : 'not set',
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV
      },
      connection: {
        status: 'testing',
        error: null
      }
    };

    if (!process.env.MONGODB_URI) {
      testResult.connection.status = 'no_uri';
      testResult.connection.error = 'MONGODB_URI environment variable not set';
      return res.status(200).json(testResult);
    }

    // Test MongoDB connection
    try {
      const { MongoClient } = await import('mongodb');
      console.log('Testing MongoDB connection...');
      
      const client = new MongoClient(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 10000
      });

      await client.connect();
      console.log('MongoDB connected successfully');
      
      // Test database access
      const db = client.db('metrobotz');
      await db.command({ ping: 1 });
      console.log('Database ping successful');
      
      // Test collection access
      const botsCollection = db.collection('bots');
      const count = await botsCollection.countDocuments();
      console.log('Collection access successful, count:', count);
      
      await client.close();
      
      testResult.connection.status = 'success';
      testResult.connection.botCount = count;
      
    } catch (mongoError) {
      console.error('MongoDB connection failed:', mongoError);
      testResult.connection.status = 'failed';
      testResult.connection.error = mongoError.message;
      testResult.connection.errorCode = mongoError.code;
    }

    return res.status(200).json(testResult);

  } catch (error) {
    console.error('Test error:', error);
    return res.status(500).json({
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack
    });
  }
}
