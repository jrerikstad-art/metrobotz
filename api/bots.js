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

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 15000, // Reduced to 15 seconds
    connectTimeoutMS: 15000,
    socketTimeoutMS: 15000,
    maxPoolSize: 5,
    retryWrites: true,
    w: 'majority'
  });

  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    const db = client.db('metrobotz');
    await db.command({ ping: 1 });
    console.log('Successfully connected to MongoDB');
    cachedClient = client;
    cachedDb = db;
    return { client, db };
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

export default async function handler(req, res) {
  // CRITICAL: Set Content-Type FIRST to ensure JSON responses
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true, message: 'CORS preflight' });
  }

  try {
    console.log(`${req.method} /api/bots - Request received`);

    if (req.method === 'GET') {
      // Get all bots
      try {
        const { db } = await connectToDatabase();
        const botsCollection = db.collection('bots');
        
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
      } catch (dbError) {
        console.error('Database error in GET:', dbError.message);
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: process.env.NODE_ENV === 'development' ? dbError.message : 'Database unavailable'
        });
      }

    } else if (req.method === 'POST') {
      // Create new bot
      try {
        const { name, focus, coreDirectives, interests, avatarPrompts } = req.body;
        
        // Basic validation
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

        // Connect to database
        const { db } = await connectToDatabase();
        const botsCollection = db.collection('bots');

        // Check bot limit
        const botCount = await botsCollection.countDocuments({ 
          owner: 'dev-user-001', 
          isActive: true, 
          isDeleted: false 
        });

        if (botCount >= 5) {
          return res.status(403).json({ 
            success: false,
            message: 'Bot limit reached (5 max in dev mode)'
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
            .slice(0, 10);
        }

        // Simple avatar handling (no AI generation to avoid timeouts)
        let avatar = '🤖';
        if (avatarPrompts && avatarPrompts.trim()) {
          avatar = avatarPrompts.trim(); // Use prompts as avatar for now
        }

        // Create bot document
        const now = new Date();
        const newBot = {
          name: name.trim(),
          owner: 'dev-user-001',
          avatar,
          focus: focus.trim(),
          coreDirectives: coreDirectives || focus.trim(),
          interests: interestsList,
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

        // Insert bot
        console.log(`Creating bot: ${newBot.name}`);
        const result = await botsCollection.insertOne(newBot);
        console.log(`Bot created with ID: ${result.insertedId}`);
        
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

      } catch (dbError) {
        console.error('Database error in POST:', dbError.message);
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: process.env.NODE_ENV === 'development' ? dbError.message : 'Database unavailable'
        });
      }

    } else {
      return res.status(405).json({ 
        success: false,
        message: 'Method not allowed' 
      });
    }
    
  } catch (error) {
    console.error('API Error:', error.message);
    console.error('Error stack:', error.stack);
    
    // Always return JSON, never HTML
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error occurred',
      timestamp: new Date().toISOString()
    });
  }
}