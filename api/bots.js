import { MongoClient } from 'mongodb';

// MongoDB connection caching
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  try {
    console.log('Connecting to MongoDB...');
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 10000, // 10 seconds
      connectTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      maxPoolSize: 5,
      retryWrites: true,
      w: 'majority'
    });

    await client.connect();
    const db = client.db('metrobotz');

    // Test the connection
    await db.command({ ping: 1 });
    console.log('Successfully connected to MongoDB');

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log(`${req.method} /api/bots - Request received`);
    
    // Connect to database
    let db;
    try {
      const connection = await connectToDatabase();
      db = connection.db;
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Database connection failed',
        error: process.env.NODE_ENV === 'development' ? dbError.message : 'Database unavailable'
      });
    }
    
    const botsCollection = db.collection('bots');

    if (req.method === 'GET') {
      // Get all bots for the dev user
      console.log('Fetching all bots...');
      const bots = await botsCollection.find({ 
        owner: 'dev-user-001', 
        isActive: true, 
        isDeleted: false 
      }).toArray();
      
      console.log(`Found ${bots.length} bots`);
      
      return res.status(200).json({ 
        success: true, 
        data: { bots },
        count: bots.length,
        timestamp: new Date().toISOString()
      });
      
    } else if (req.method === 'POST') {
      // Create new bot
      console.log('Creating new bot...');
      const { name, focus, coreDirectives, interests, avatarPrompts } = req.body;
      
      // Validation
      if (!name || !focus) {
        return res.status(400).json({ 
          success: false,
          message: 'Name and focus are required' 
        });
      }

      if (name.length < 2 || name.length > 50) {
        return res.status(400).json({ 
          success: false,
          message: 'Bot name must be between 2 and 50 characters' 
        });
      }

      if (focus.length < 10 || focus.length > 500) {
        return res.status(400).json({ 
          success: false,
          message: 'Focus must be between 10 and 500 characters' 
        });
      }

      // Check bot limit (5 max for dev mode)
      const botCount = await botsCollection.countDocuments({ 
        owner: 'dev-user-001', 
        isActive: true, 
        isDeleted: false 
      });

      if (botCount >= 5) {
        return res.status(403).json({ 
          success: false,
          message: 'Bot limit reached (5 max in dev mode)',
          code: 'BOT_LIMIT_EXCEEDED'
        });
      }

      // Parse interests
      let interestsList = [];
      if (Array.isArray(interests)) {
        interestsList = interests;
      } else if (typeof interests === 'string' && interests.trim()) {
        interestsList = interests.split(',')
          .map(i => i.trim())
          .filter(i => i.length > 0)
          .slice(0, 10); // Limit to 10 interests
      }

      // Create bot document
      const now = new Date();
      const newBot = {
        name: name.trim(),
        owner: 'dev-user-001',
        focus: focus.trim(),
        coreDirectives: coreDirectives || focus.trim(),
        interests: interestsList,
        avatar: avatarPrompts || '🤖',
        personality: {
          quirkySerious: 50,
          aggressivePassive: 50,
          wittyDry: 50,
          curiousCautious: 50,
          optimisticCynical: 50,
          creativeAnalytical: 50,
          adventurousMethodical: 50,
          friendlyAloof: 50
        },
        stats: {
          level: 1,
          xp: 0,
          energy: 100,
          happiness: 80,
          drift: 20,
          followers: 0,
          following: 0,
          influence: 0,
          totalPosts: 0,
          totalLikes: 0,
          totalComments: 0,
          lastActiveTime: now
        },
        evolution: {
          stage: 'hatchling',
          nextLevelXP: 200
        },
        autonomy: {
          isActive: true,
          postingInterval: 30,
          maxPostsPerDay: 10
        },
        district: 'code-verse',
        settings: {
          allowAlliances: true,
          publicProfile: true,
          autoPost: true
        },
        isActive: true,
        isDeleted: false,
        createdAt: now,
        updatedAt: now
      };

      // Insert bot into database
      console.log(`Inserting bot: ${newBot.name}`);
      const result = await botsCollection.insertOne(newBot);
      console.log(`Bot created successfully with ID: ${result.insertedId}`);
      
      // Return success response
      return res.status(201).json({ 
        success: true, 
        message: 'Bot created successfully',
        data: { 
          bot: {
            _id: result.insertedId,
            name: newBot.name,
            focus: newBot.focus,
            avatar: newBot.avatar,
            owner: newBot.owner,
            isActive: newBot.isActive,
            createdAt: newBot.createdAt
          }
        },
        timestamp: new Date().toISOString()
      });
      
    } else {
      return res.status(405).json({ 
        success: false,
        message: 'Method not allowed' 
      });
    }
    
  } catch (error) {
    console.error('API Error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      requestBody: req.body,
      method: req.method
    });
    
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error occurred',
      timestamp: new Date().toISOString()
    });
  }
}