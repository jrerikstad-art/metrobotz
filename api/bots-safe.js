// Ultra-safe bots API with guaranteed JSON responses
import { MongoClient } from 'mongodb';

// Simple in-memory cache (for now)
let inMemoryBots = [];

export default async function handler(req, res) {
  // FIRST THING: Set Content-Type to JSON
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  console.log(`[SAFE-BOTS] ${req.method} request received`);

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true });
  }

  // Wrap EVERYTHING in try-catch to guarantee JSON response
  try {
    if (req.method === 'GET') {
      console.log('[SAFE-BOTS] GET - Attempting MongoDB connection...');
      
      // Try MongoDB with 5-second timeout
      try {
        const mongoPromise = connectWithTimeout();
        const { db } = await Promise.race([
          mongoPromise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('MongoDB connection timeout')), 5000)
          )
        ]);

        const botsCollection = db.collection('bots');
        const bots = await botsCollection.find({ 
          owner: 'dev-user-001',
          isActive: true,
          isDeleted: false
        }).toArray();

        console.log('[SAFE-BOTS] MongoDB success, found', bots.length, 'bots');
        return res.status(200).json({ success: true, data: { bots } });

      } catch (dbError) {
        console.error('[SAFE-BOTS] MongoDB failed:', dbError.message);
        // Return in-memory cache as fallback
        return res.status(200).json({ 
          success: true, 
          data: { bots: inMemoryBots },
          warning: 'Using cached data, database unavailable'
        });
      }
    }

    if (req.method === 'POST') {
      console.log('[SAFE-BOTS] POST - Creating bot...');
      const { name, focus, coreDirectives, interests, avatarPrompts } = req.body;

      // Validation
      if (!name || !focus) {
        return res.status(400).json({ success: false, message: 'Name and focus required' });
      }

      // Create bot object
      const newBot = {
        _id: Date.now().toString(),
        name: name.trim(),
        owner: 'dev-user-001',
        avatar: avatarPrompts || '🤖',
        focus: focus.trim(),
        coreDirectives: coreDirectives || focus.trim(),
        interests: Array.isArray(interests) ? interests : [],
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
          lastActiveTime: new Date()
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
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Try MongoDB with timeout
      try {
        const mongoPromise = connectWithTimeout();
        const { db } = await Promise.race([
          mongoPromise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('MongoDB connection timeout')), 5000)
          )
        ]);

        const botsCollection = db.collection('bots');
        const result = await botsCollection.insertOne(newBot);
        newBot._id = result.insertedId;

        // Also add to in-memory cache
        inMemoryBots.push(newBot);

        console.log('[SAFE-BOTS] Bot created in MongoDB:', newBot._id);
        return res.status(201).json({ 
          success: true, 
          message: 'Bot created successfully',
          data: { bot: newBot }
        });

      } catch (dbError) {
        console.error('[SAFE-BOTS] MongoDB save failed:', dbError.message);
        
        // Save to in-memory cache only
        inMemoryBots.push(newBot);
        console.log('[SAFE-BOTS] Bot saved to memory cache only');
        
        return res.status(201).json({ 
          success: true, 
          message: 'Bot created (cached - database unavailable)',
          data: { bot: newBot },
          warning: 'Saved to cache only'
        });
      }
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });

  } catch (error) {
    console.error('[SAFE-BOTS] Unexpected error:', error);
    // ALWAYS return JSON
    return res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Helper function with timeout
async function connectWithTimeout() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI not set');
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    socketTimeoutMS: 5000
  });

  await client.connect();
  const db = client.db('metrobotz');
  await db.command({ ping: 1 });

  return { client, db };
}

