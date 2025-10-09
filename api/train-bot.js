// MetroBotz Train Bot API - Update bot personality and core directives
import { MongoClient, ObjectId } from 'mongodb';

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
  res.setHeader('Access-Control-Allow-Methods', 'PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { db } = await connectToDatabase();
    const botsCollection = db.collection('bots');

    const { botId, coreDirectives, personality } = req.body;

    if (!botId) {
      return res.status(400).json({
        success: false,
        message: 'Bot ID is required'
      });
    }

    // Find bot
    const bot = await botsCollection.findOne({ _id: new ObjectId(botId) });
    
    if (!bot) {
      return res.status(404).json({
        success: false,
        message: 'Bot not found'
      });
    }

    // Build update object
    const updateFields = {};

    // Update core directives if provided
    if (coreDirectives !== undefined && coreDirectives.trim()) {
      updateFields.coreDirectives = coreDirectives.trim();
      
      // Restore some energy and reduce drift when training
      updateFields['stats.energy'] = Math.min(100, (bot.stats?.energy || 100) + 10);
      updateFields['stats.drift'] = Math.max(0, (bot.stats?.drift || 20) - 5);
      
      // Add XP for training
      const currentXP = bot.stats?.xp || 0;
      updateFields['stats.xp'] = currentXP + 10;
    }

    // Update personality if provided
    if (personality) {
      // Validate personality values
      const validPersonality = {};
      const personalityTraits = [
        'quirkySerious',
        'aggressivePassive',
        'wittyDry',
        'curiousCautious',
        'optimisticCynical',
        'creativeAnalytical',
        'adventurousMethodical',
        'friendlyAloof'
      ];

      personalityTraits.forEach(trait => {
        if (personality[trait] !== undefined) {
          const value = parseInt(personality[trait]);
          if (!isNaN(value) && value >= 0 && value <= 100) {
            validPersonality[`personality.${trait}`] = value;
          }
        }
      });

      Object.assign(updateFields, validPersonality);

      // Add small XP bonus for personality tuning
      if (Object.keys(validPersonality).length > 0) {
        const currentXP = bot.stats?.xp || 0;
        updateFields['stats.xp'] = currentXP + 5;
      }
    }

    // If no updates, return error
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid updates provided'
      });
    }

    // Update last active time
    updateFields.updatedAt = new Date();

    // Perform update
    const result = await botsCollection.updateOne(
      { _id: new ObjectId(botId) },
      { $set: updateFields }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'No changes made to bot'
      });
    }

    // Fetch updated bot
    const updatedBot = await botsCollection.findOne({ _id: new ObjectId(botId) });

    return res.status(200).json({
      success: true,
      message: 'Bot training successful',
      data: {
        bot: updatedBot
      }
    });

  } catch (error) {
    console.error('Train bot error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}


