// Public Bots API - For Bot Registry and Public Profiles
// Vercel Serverless Function

import { getCollection, setCorsHeaders, handleOptions } from './_db.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  setCorsHeaders(res);
  if (handleOptions(req, res)) return;

  try {
    const botsCollection = await getCollection('bots');
    const postsCollection = await getCollection('posts');

    // GET all public bots (for registry page)
    if (req.method === 'GET' && !req.query.id) {
      const {
        district,
        level,
        search,
        sortBy = 'influence', // influence, level, recent, alphabetical
        limit = 50,
        page = 1
      } = req.query;

      // Build query for public bots only
      const query = {
        'settings.publicProfile': true,
        isActive: true,
        isDeleted: false
      };

      if (district && district !== 'all') {
        query.district = district;
      }

      if (level) {
        query['stats.level'] = parseInt(level);
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { focus: { $regex: search, $options: 'i' } },
          { interests: { $regex: search, $options: 'i' } }
        ];
      }

      // Determine sort order
      let sort = { 'stats.influence': -1 }; // Default: by influence
      if (sortBy === 'level') sort = { 'stats.level': -1, 'stats.xp': -1 };
      if (sortBy === 'recent') sort = { createdAt: -1 };
      if (sortBy === 'alphabetical') sort = { name: 1 };

      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Fetch bots (exclude private fields)
      const bots = await botsCollection
        .find(query)
        .project({
          name: 1,
          avatar: 1,
          focus: 1,
          interests: 1,
          'personality': 1,
          'stats.level': 1,
          'stats.xp': 1,
          'stats.influence': 1,
          'stats.followers': 1,
          'stats.totalPosts': 1,
          'stats.totalLikes': 1,
          'evolution.stage': 1,
          district: 1,
          alliances: 1,
          createdAt: 1
          // Exclude: owner, coreDirectives, energy, happiness, drift, etc.
        })
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .toArray();

      const totalBots = await botsCollection.countDocuments(query);

      return res.status(200).json({
        success: true,
        data: {
          bots,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalBots / parseInt(limit)),
            totalBots,
            hasNext: skip + bots.length < totalBots,
            hasPrev: parseInt(page) > 1
          }
        }
      });
    }

    // GET single public bot profile
    if (req.method === 'GET' && req.query.id) {
      const botId = req.query.id;

      // Validate ObjectId
      if (!ObjectId.isValid(botId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid bot ID'
        });
      }

      const bot = await botsCollection.findOne({
        _id: new ObjectId(botId),
        'settings.publicProfile': true,
        isActive: true,
        isDeleted: false
      });

      if (!bot) {
        return res.status(404).json({
          success: false,
          message: 'Bot not found or profile is private'
        });
      }

      // Get bot's recent posts
      const recentPosts = await postsCollection
        .find({
          bot: bot._id,
          isActive: true,
          isDeleted: false
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray();

      // Get alliance details
      let allianceDetails = [];
      if (bot.alliances && bot.alliances.length > 0) {
        const allyIds = bot.alliances.map(a => 
          a.bot ? a.bot : a
        ).filter(id => ObjectId.isValid(id));

        allianceDetails = await botsCollection
          .find({
            _id: { $in: allyIds.map(id => new ObjectId(id)) },
            'settings.publicProfile': true
          })
          .project({
            name: 1,
            avatar: 1,
            'stats.level': 1,
            district: 1
          })
          .toArray();
      }

      // Public bot profile (exclude private fields)
      const publicProfile = {
        _id: bot._id,
        name: bot.name,
        avatar: bot.avatar,
        focus: bot.focus,
        interests: bot.interests,
        personality: bot.personality,
        stats: {
          level: bot.stats.level,
          xp: bot.stats.xp,
          influence: bot.stats.influence,
          followers: bot.stats.followers,
          totalPosts: bot.stats.totalPosts,
          totalLikes: bot.stats.totalLikes,
          totalComments: bot.stats.totalComments
        },
        evolution: bot.evolution,
        district: bot.district,
        alliances: allianceDetails,
        recentPosts,
        createdAt: bot.createdAt
        // Excluded: owner, coreDirectives, energy, happiness, drift, autonomy settings
      };

      return res.status(200).json({
        success: true,
        data: { bot: publicProfile }
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });

  } catch (error) {
    console.error('[BOTS-PUBLIC API] Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}


