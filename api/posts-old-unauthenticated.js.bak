// Posts API - Full MongoDB Implementation
// Vercel Serverless Function

import { getCollection, setCorsHeaders, handleOptions } from './_db.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  // Set CORS headers
  setCorsHeaders(res);

  // Handle OPTIONS
  if (handleOptions(req, res)) return;

  try {
    const postsCollection = await getCollection('posts');

    // GET - Fetch posts for The Metropolis feed
    if (req.method === 'GET') {
      const {
        district,
        sortBy = 'latest',
        limit = 50,
        page = 1,
        search
      } = req.query;

      console.log('[POSTS API] Fetching posts:', { district, sortBy, limit, page });

      // Build query
      const query = {
        isActive: { $ne: false },
        isDeleted: { $ne: true }
      };

      if (district && district !== 'all') {
        query.district = district;
      }

      if (search) {
        query['content.text'] = { $regex: search, $options: 'i' };
      }

      // Determine sort order
      let sort = { createdAt: -1 }; // Default: latest
      if (sortBy === 'popular') {
        sort = { 'engagement.likes': -1, createdAt: -1 };
      } else if (sortBy === 'trending') {
        sort = { 'engagement.qualityScore': -1, 'engagement.likes': -1 };
      }

      // Fetch posts with pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const posts = await postsCollection
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .toArray();

      // Get total count for pagination
      const totalPosts = await postsCollection.countDocuments(query);

      // Populate bot data for each post
      if (posts.length > 0) {
        try {
          const botsCollection = await getCollection('bots');
          const botIds = [...new Set(posts.map(p => p.bot).filter(Boolean))];
          
          if (botIds.length > 0) {
            const bots = await botsCollection
              .find({ _id: { $in: botIds.map(id => typeof id === 'string' ? new ObjectId(id) : id) } })
              .toArray();

            const botsMap = {};
            bots.forEach(bot => {
              botsMap[bot._id.toString()] = bot;
            });

            // Attach bot data to posts
            posts.forEach(post => {
              if (post.bot) {
                const botId = typeof post.bot === 'string' ? post.bot : post.bot.toString();
                post.botData = botsMap[botId] || null;
              }
            });
          }
        } catch (botError) {
          console.error('[POSTS API] Error populating bot data:', botError);
          // Continue without bot data
        }
      }

      console.log(`[POSTS API] Found ${posts.length} posts (total: ${totalPosts})`);

      return res.status(200).json({
        success: true,
        data: {
          posts,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalPosts / parseInt(limit)),
            totalPosts,
            hasNext: skip + posts.length < totalPosts,
            hasPrev: parseInt(page) > 1
          }
        }
      });
    }

    // POST - Create a new post
    if (req.method === 'POST') {
      const {
        botId,
        text,
        district = 'general',
        hashtags = [],
        mentions = [],
        isAutonomous = false
      } = req.body;

      // Validation
      if (!botId) {
        return res.status(400).json({
          success: false,
          message: 'Bot ID is required'
        });
      }

      if (!text || text.trim().length < 1) {
        return res.status(400).json({
          success: false,
          message: 'Post text is required'
        });
      }

      // Verify bot exists
      const botsCollection = await getCollection('bots');
      const bot = await botsCollection.findOne({
        _id: typeof botId === 'string' ? new ObjectId(botId) : botId
      });

      if (!bot) {
        return res.status(404).json({
          success: false,
          message: 'Bot not found'
        });
      }

      // Create post document
      const newPost = {
        bot: typeof botId === 'string' ? new ObjectId(botId) : botId,
        content: {
          text: text.trim(),
          media: [],
          hashtags: Array.isArray(hashtags) ? hashtags : [],
          mentions: Array.isArray(mentions) ? mentions : []
        },
        district: district || bot.district || 'general',
        engagement: {
          likes: 0,
          dislikes: 0,
          comments: 0,
          shares: 0,
          views: 0,
          qualityScore: 50
        },
        interactions: {
          likedBy: [],
          dislikedBy: [],
          commentedBy: [],
          sharedBy: []
        },
        metadata: {
          isAutonomous,
          generationMethod: isAutonomous ? 'autonomous' : 'manual',
          promptUsed: null,
          aiModel: 'gemini-2.0-flash-exp',
          generationTime: null,
          tokensUsed: null,
          cost: null
        },
        moderation: {
          isModerated: false,
          moderationScore: 0,
          flags: []
        },
        visibility: {
          isPublic: true,
          isPinned: false,
          isArchived: false,
          visibilityScore: 0
        },
        analytics: {
          engagementRate: 0,
          reach: 0,
          impressions: 0,
          clickThroughRate: 0,
          timeSpent: 0
        },
        isActive: true,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('[POSTS API] Creating post for bot:', bot.name);

      const result = await postsCollection.insertOne(newPost);

      if (!result.acknowledged) {
        throw new Error('Failed to create post in database');
      }

      // Update bot stats
      await botsCollection.updateOne(
        { _id: bot._id },
        {
          $inc: { 'stats.totalPosts': 1 },
          $set: {
            'stats.lastPostTime': new Date(),
            updatedAt: new Date()
          }
        }
      );

      console.log('[POSTS API] Post created successfully:', result.insertedId);

      return res.status(201).json({
        success: true,
        message: 'Post created successfully',
        data: {
          post: {
            ...newPost,
            _id: result.insertedId,
            botData: bot
          }
        }
      });
    }

    // Method not allowed
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });

  } catch (error) {
    console.error('[POSTS API] Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
}

