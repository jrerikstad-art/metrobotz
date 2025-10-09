import { MongoClient, ObjectId } from 'mongodb';

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
    serverSelectionTimeoutMS: 30000, // 30 seconds
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
    maxPoolSize: 10, // Increase pool size
    retryWrites: true,
    w: 'majority'
  });

  try {
    console.log('Connecting to MongoDB with URI:', uri.substring(0, 20) + '...');
    await client.connect();
    const db = client.db('metrobotz');
    await db.command({ ping: 1 });
    console.log('Successfully connected to MongoDB');
    cachedClient = client;
    cachedDb = db;
    return { client, db };
  } catch (error) {
    console.error('MongoDB connection failed:', error.code, error.message);
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token && process.env.NODE_ENV !== 'development') {
      return res.status(401).json({ error: 'No token' });
    }
    // Mock auth for dev mode
    req.user = { _id: 'dev-user-001' };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log(`${req.method} /api/bots - Request received`);
    
    // Connect to database with enhanced error handling
    let db;
    try {
      const connection = await connectToDatabase();
      db = connection.db;
      if (!db) throw new Error('Database unavailable');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Database connection failed',
        error: process.env.NODE_ENV === 'development' ? dbError.message : 'Database unavailable',
        timestamp: new Date().toISOString()
      });
    }
    
    const botsCollection = db.collection('bots');

    if (req.method === 'GET') {
      authenticate(req, res, async () => {
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
      });
      
    } else if (req.method === 'POST') {
      authenticate(req, res, async () => {
        console.log('Creating new bot...');
        const { name, focus, coreDirectives, interests, avatarPrompts } = req.body;
        
        // Enhanced validation
        if (!name || !focus) {
          return res.status(400).json({ 
            success: false,
            error: 'Name and focus required' 
          });
        }

        if (name.length < 2 || name.length > 50) {
          return res.status(400).json({ 
            success: false,
            error: 'Name must be 2-50 chars' 
          });
        }

        if (focus.length < 10 || focus.length > 500) {
          return res.status(400).json({ 
            success: false,
            error: 'Focus must be 10-500 chars' 
          });
        }

        // Check bot limit
        const botCount = await botsCollection.countDocuments({ 
          owner: 'dev-user-001', 
          isActive: true, 
          isDeleted: false 
        });

        if (botCount >= 5) {
          return res.status(403).json({ 
            success: false,
            error: 'Bot limit reached (5 max in dev mode)',
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

        // Enhanced avatar generation with Gemini
        let avatar = '🤖';
        if (avatarPrompts) {
          try {
            console.log('Generating avatar with Gemini...');
            const { GoogleGenerativeAI } = require('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            
            const result = await model.generateContent(
              `Generate a retro-futuristic robot avatar with transparent background, cute cartoonish style: ${avatarPrompts}. PNG, 256x256, neon colors.`,
              { 
                generationConfig: { 
                  responseMimeType: 'image/png', 
                  width: 256, 
                  height: 256 
                }, 
                timeout: 7000 
              }
            );
            
            avatar = result.response.candidates[0]?.content?.parts[0]?.fileData?.url || avatarPrompts;
            console.log('Avatar generated successfully');
          } catch (avatarError) {
            console.error('Avatar generation failed:', avatarError.message);
            avatar = avatarPrompts; // Fallback to text
          }
        }

        // Create comprehensive bot document
        const now = new Date();
        const newBot = {
          name: name.trim(),
          owner: 'dev-user-001',
          avatar,
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
          coreDirectives: coreDirectives || focus.trim(),
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
      });
      
    } else {
      return res.status(405).json({ 
        success: false,
        error: 'Method not allowed' 
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
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        body: req.body
      } : undefined,
      timestamp: new Date().toISOString()
    });
  }
}