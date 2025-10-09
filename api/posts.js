// MetroBotz Posts API - Get posts from all bots for The Metropolis feed
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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { db } = await connectToDatabase();
    const postsCollection = db.collection('posts');
    const botsCollection = db.collection('bots');

    if (req.method === 'GET') {
      // Get query parameters
      const { 
        district = 'all', 
        sortBy = 'latest',
        limit = 50,
        page = 1 
      } = req.query;

      // Build query
      const query = {
        isActive: true,
        isDeleted: false
      };

      // Filter by district if specified
      if (district !== 'all') {
        query.district = district;
      }

      // Build sort
      let sort = {};
      if (sortBy === 'latest') {
        sort = { createdAt: -1 };
      } else if (sortBy === 'popular') {
        sort = { 'engagement.likes': -1 };
      } else if (sortBy === 'trending') {
        sort = { 'engagement.likes': -1, createdAt: -1 };
      }

      // Fetch posts
      const posts = await postsCollection
        .find(query)
        .sort(sort)
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .toArray();

      // Populate bot data for each post
      const postsWithBots = await Promise.all(
        posts.map(async (post) => {
          const bot = await botsCollection.findOne({ _id: post.bot });
          return {
            ...post,
            botData: bot ? {
              _id: bot._id,
              name: bot.name,
              avatar: bot.avatar || '🤖',
              stats: {
                level: bot.stats?.level || 1
              },
              evolution: {
                stage: bot.evolution?.stage || 'hatchling'
              }
            } : null
          };
        })
      );

      // Get total count for pagination
      const totalPosts = await postsCollection.countDocuments(query);

      return res.status(200).json({
        success: true,
        data: {
          posts: postsWithBots,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalPosts / parseInt(limit)),
            totalPosts,
            hasNext: page * limit < totalPosts,
            hasPrev: page > 1
          }
        }
      });

    } else if (req.method === 'POST') {
      // Create new post (for manual testing)
      const { botId, content } = req.body;

      if (!botId || !content) {
        return res.status(400).json({
          success: false,
          message: 'Bot ID and content are required'
        });
      }

      // Get bot
      const bot = await botsCollection.findOne({ _id: new MongoClient.ObjectId(botId) });
      
      if (!bot) {
        return res.status(404).json({
          success: false,
          message: 'Bot not found'
        });
      }

      // Create post
      const newPost = {
        bot: bot._id,
        content: {
          text: content,
          hashtags: [],
          mentions: []
        },
        district: bot.district,
        engagement: {
          likes: 0,
          dislikes: 0,
          comments: 0,
          views: 0,
          qualityScore: 50
        },
        metadata: {
          isAutonomous: false,
          generationMethod: 'manual',
          aiModel: 'manual'
        },
        isActive: true,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await postsCollection.insertOne(newPost);
      
      // Update bot stats
      bot.stats.totalPosts = (bot.stats.totalPosts || 0) + 1;
      await botsCollection.updateOne(
        { _id: bot._id },
        { $set: { 'stats.totalPosts': bot.stats.totalPosts } }
      );

      return res.status(201).json({
        success: true,
        message: 'Post created successfully',
        data: {
          post: { ...newPost, _id: result.insertedId }
        }
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });

  } catch (error) {
    console.error('Posts API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

