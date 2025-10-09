// Quick endpoint to check if bots exist in MongoDB
import { MongoClient } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const uri = process.env.MONGODB_URI || 'mongodb+srv://your-connection-string';
  const client = new MongoClient(uri);

  await client.connect();
  const db = client.db('metrobotz');

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { db } = await connectToDatabase();
    const botsCollection = db.collection('bots');
    
    // Get all bots
    const allBots = await botsCollection.find({}).toArray();
    
    // Get active bots for dev user
    const devBots = await botsCollection.find({ 
      owner: 'dev-user-001',
      isActive: true,
      isDeleted: false 
    }).toArray();

    return res.status(200).json({
      success: true,
      message: 'Database check complete',
      data: {
        totalBotsInDB: allBots.length,
        devUserBots: devBots.length,
        allBots: allBots.map(bot => ({
          id: bot._id,
          name: bot.name,
          owner: bot.owner,
          focus: bot.focus,
          level: bot.stats?.level || 1,
          createdAt: bot.createdAt
        })),
        devBots: devBots.map(bot => ({
          id: bot._id,
          name: bot.name,
          focus: bot.focus,
          level: bot.stats?.level || 1,
          xp: bot.stats?.xp || 0,
          energy: bot.stats?.energy || 100,
          happiness: bot.stats?.happiness || 80,
          createdAt: bot.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('Check bots error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check database',
      error: error.message
    });
  }
}

