// Test Posts API - Debug endpoint
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
    const postsCollection = db.collection('posts');
    const botsCollection = db.collection('bots');

    console.log('Testing database connection...');

    // Check if collections exist
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));

    // Count documents
    const postsCount = await postsCollection.countDocuments();
    const botsCount = await botsCollection.countDocuments();
    
    console.log(`Posts count: ${postsCount}, Bots count: ${botsCount}`);

    // Get sample bot to check structure
    const sampleBot = await botsCollection.findOne({});
    console.log('Sample bot structure:', sampleBot ? Object.keys(sampleBot) : 'No bots found');

    // Get sample post to check structure
    const samplePost = await postsCollection.findOne({});
    console.log('Sample post structure:', samplePost ? Object.keys(samplePost) : 'No posts found');

    return res.status(200).json({
      success: true,
      data: {
        collections: collections.map(c => c.name),
        counts: {
          posts: postsCount,
          bots: botsCount
        },
        sampleBot: sampleBot ? {
          _id: sampleBot._id,
          name: sampleBot.name,
          hasAvatar: !!sampleBot.avatar,
          hasStats: !!sampleBot.stats,
          hasEvolution: !!sampleBot.evolution
        } : null,
        samplePost: samplePost ? {
          _id: samplePost._id,
          hasBot: !!samplePost.bot,
          hasContent: !!samplePost.content,
          hasEngagement: !!samplePost.engagement
        } : null
      }
    });

  } catch (error) {
    console.error('Test API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
