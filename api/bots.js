import { MongoClient, ObjectId } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) return { client: cachedClient, db: cachedDb };

  const uri = process.env.MONGODB_URI || 'mongodb+srv://your-connection-string';
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000
  });

  try {
    await client.connect();
    const db = client.db('metrobotz');
    cachedClient = client;
    cachedDb = db;
    console.log('Database connected');
    return { client, db };
  } catch (error) {
    console.error('DB connection failed:', error);
    throw error;
  }
}

const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token' });
    // Mock auth for now (replace with DB check)
    req.user = { _id: 'dev-user-001' };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { db } = await connectToDatabase();
    const botsCollection = db.collection('bots');

    if (req.method === 'GET') {
      // Skip auth for dev mode
      const bots = await botsCollection.find({ owner: 'dev-user-001', isActive: true, isDeleted: false }).toArray();
      res.status(200).json({ success: true, data: { bots }, count: bots.length });
    } else if (req.method === 'POST') {
      // Skip auth for dev mode
        const { name, focus, coreDirectives, interests, avatarPrompts } = req.body;
        if (!name || !focus) return res.status(400).json({ error: 'Name and focus required' });

        const botCount = await botsCollection.countDocuments({ owner: 'dev-user-001', isActive: true, isDeleted: false });
        if (botCount >= 5) return res.status(403).json({ error: 'Bot limit reached' });

        // Simple avatar handling - no AI generation to prevent timeouts
        let avatar = '🤖';
        if (avatarPrompts) {
          // Store the prompts for later avatar generation
          avatar = avatarPrompts; // Use prompts as avatar placeholder
        }

        const newBot = {
          name: name.trim(),
          owner: 'dev-user-001',
          avatar,
          personality: { quirkySerious: 50, aggressivePassive: 50, wittyDry: 50, curiousCautious: 50, optimisticCynical: 50, creativeAnalytical: 50, adventurousMethodical: 50, friendlyAloof: 50 },
          coreDirectives: coreDirectives || focus,
          focus: focus.trim(),
          interests: Array.isArray(interests) ? interests : interests.split(',').map(i => i.trim()).filter(i => i),
          stats: { level: 1, xp: 0, energy: 100, happiness: 80, drift: 20 },
          evolution: { stage: 'hatchling', nextLevelXP: 200 },
          autonomy: { isActive: true, postingInterval: 30, maxPostsPerDay: 10 },
          district: 'code-verse',
          settings: { allowAlliances: true, publicProfile: true, autoPost: true },
          isActive: true,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const result = await botsCollection.insertOne(newBot);
        res.status(201).json({ success: true, data: { _id: result.insertedId, ...newBot } });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error.stack, req.body);
    res.status(500).json({ error: 'Internal server error', details: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}