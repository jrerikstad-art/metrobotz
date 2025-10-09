// MetroBotz Bots API Route for Vercel (Dev Mode - No Auth)
import { MongoClient, ObjectId } from 'mongodb';

// MongoDB connection
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const uri = process.env.MONGODB_URI || 'mongodb+srv://your-connection-string';
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000, // 5 second timeout
    connectTimeoutMS: 5000,
    socketTimeoutMS: 5000
  });

  await client.connect();
  const db = client.db('metrobotz');

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

// Dev mode - hardcoded user ID (remove when auth is implemented)
const DEV_USER_ID = 'dev-user-001';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { db } = await connectToDatabase();
    const botsCollection = db.collection('bots');

    if (req.method === 'GET') {
      // Get all bots for dev user
      const bots = await botsCollection.find({ owner: DEV_USER_ID, isActive: true, isDeleted: false }).toArray();
      return res.status(200).json({ 
        success: true, 
        data: { bots },
        count: bots.length 
      });
      
    } else if (req.method === 'POST') {
      // Create new bot
      const { name, focus, coreDirectives, interests, avatarPrompts, avatar, personality } = req.body;
      
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

      // Check bot limit (1 for free tier in dev)
      const botCount = await botsCollection.countDocuments({ 
        owner: DEV_USER_ID, 
        isActive: true, 
        isDeleted: false 
      });

      if (botCount >= 5) { // Allow 5 bots in dev mode
        return res.status(403).json({ 
          success: false,
          message: 'Bot limit reached (5 max in dev mode)',
          code: 'BOT_LIMIT_EXCEEDED'
        });
      }

      // Parse interests from string or array (simplified)
      let interestsList = [];
      if (Array.isArray(interests)) {
        interestsList = interests;
      } else if (typeof interests === 'string' && interests.trim()) {
        interestsList = interests.split(',').map(i => i.trim()).filter(i => i).slice(0, 10); // Limit to 10 interests
      }

      // Default personality values
      const defaultPersonality = {
        quirkySerious: 50,
        aggressivePassive: 50,
        wittyDry: 50,
        curiousCautious: 50,
        optimisticCynical: 50,
        creativeAnalytical: 50,
        adventurousMethodical: 50,
        friendlyAloof: 50,
        ...(personality || {})
      };

      // Create bot document (simplified for faster execution)
      const now = new Date();
      const newBot = {
        name: name.trim(),
        owner: DEV_USER_ID,
        avatar: avatar || avatarPrompts || '🤖', // Simplified avatar handling
        personality: defaultPersonality,
        coreDirectives: coreDirectives || focus,
        focus: focus.trim(),
        interests: interestsList,
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
          lastActiveTime: now,
          createdAt: now
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

      // Insert bot with timeout protection
      const result = await botsCollection.insertOne(newBot);
      
      // Return minimal response for faster execution
      return res.status(201).json({ 
        success: true, 
        message: 'Bot created successfully',
        data: { 
          bot: {
            _id: result.insertedId,
            name: newBot.name,
            focus: newBot.focus,
            avatar: newBot.avatar
          }
        }
      });
      
    } else {
      return res.status(405).json({ 
        success: false,
        message: 'Method not allowed' 
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}