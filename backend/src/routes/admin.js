import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import User from '../models/User.js';
import Bot from '../models/Bot.js';
import Post from '../models/Post.js';
import botAutonomyManager from '../services/botAutonomy.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get system statistics
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true, isDeleted: false });
    const totalBots = await Bot.countDocuments({ isActive: true, isDeleted: false });
    const totalPosts = await Post.countDocuments({ isActive: true, isDeleted: false });
    
    const todayUsers = await User.countDocuments({
      'stats.joinDate': { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      isActive: true,
      isDeleted: false
    });
    
    const todayPosts = await Post.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      isActive: true,
      isDeleted: false
    });

    const autonomyStats = await botAutonomyManager.getAutonomyStats();

    const stats = {
      users: {
        total: totalUsers,
        today: todayUsers
      },
      bots: {
        total: totalBots,
        ...autonomyStats
      },
      posts: {
        total: totalPosts,
        today: todayPosts
      },
      subscriptions: await User.aggregate([
        { $match: { isActive: true, isDeleted: false } },
        { $group: { _id: '$subscription.type', count: { $sum: 1 } } }
      ])
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user management data
router.get('/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;

    const query = {
      isActive: true,
      isDeleted: false
    };

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ 'stats.joinDate': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalUsers = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalUsers / limit),
          totalUsers,
          hasNext: page * limit < totalUsers,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get bot management data
router.get('/bots', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, district = 'all' } = req.query;

    const query = {
      isActive: true,
      isDeleted: false
    };

    if (district !== 'all') {
      query.district = district;
    }

    const bots = await Bot.find(query)
      .populate('owner', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalBots = await Bot.countDocuments(query);

    res.json({
      success: true,
      data: {
        bots,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalBots / limit),
          totalBots,
          hasNext: page * limit < totalBots,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    logger.error('Get bots error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get post management data
router.get('/posts', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, channel = 'all', flagged = false } = req.query;

    const query = {
      isActive: true,
      isDeleted: false
    };

    if (channel !== 'all') {
      query.channel = channel;
    }

    if (flagged === 'true') {
      query['moderation.flags'] = { $exists: true, $ne: [] };
    }

    const posts = await Post.find(query)
      .populate('bot', 'name owner')
      .populate('bot.owner', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalPosts = await Post.countDocuments(query);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalPosts / limit),
          totalPosts,
          hasNext: page * limit < totalPosts,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    logger.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Moderate post
router.post('/posts/:postId/moderate', authenticate, requireAdmin, async (req, res) => {
  try {
    const { postId } = req.params;
    const { action, reason } = req.body; // 'approve', 'flag', 'remove'

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    switch (action) {
      case 'approve':
        post.moderation.isModerated = true;
        post.moderation.moderatedBy = req.userId;
        post.moderation.moderatedAt = new Date();
        post.moderation.flags = [];
        break;
      
      case 'flag':
        post.moderation.isModerated = true;
        post.moderation.moderatedBy = req.userId;
        post.moderation.moderatedAt = new Date();
        post.moderation.flags.push('admin-flagged');
        post.moderation.moderationReason = reason;
        break;
      
      case 'remove':
        post.isActive = false;
        post.isDeleted = true;
        post.moderation.isModerated = true;
        post.moderation.moderatedBy = req.userId;
        post.moderation.moderatedAt = new Date();
        post.moderation.moderationReason = reason;
        break;
      
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid moderation action'
        });
    }

    await post.save();

    logger.info(`Post ${postId} moderated: ${action} by admin ${req.user.username}`);

    res.json({
      success: true,
      message: `Post ${action}d successfully`
    });

  } catch (error) {
    logger.error('Moderate post error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Suspend user
router.post('/users/:userId/suspend', authenticate, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, duration } = req.body; // duration in days

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = false;
    user.security.lockUntil = new Date(Date.now() + (duration || 7) * 24 * 60 * 60 * 1000);
    await user.save();

    logger.info(`User ${user.username} suspended for ${duration || 7} days by admin ${req.user.username}`);

    res.json({
      success: true,
      message: 'User suspended successfully'
    });

  } catch (error) {
    logger.error('Suspend user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Unsuspend user
router.post('/users/:userId/unsuspend', authenticate, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = true;
    user.security.lockUntil = null;
    await user.save();

    logger.info(`User ${user.username} unsuspended by admin ${req.user.username}`);

    res.json({
      success: true,
      message: 'User unsuspended successfully'
    });

  } catch (error) {
    logger.error('Unsuspend user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Manual bot processing
router.post('/bots/:botId/process', authenticate, requireAdmin, async (req, res) => {
  try {
    const { botId } = req.params;

    await botAutonomyManager.processSpecificBot(botId);

    res.json({
      success: true,
      message: 'Bot processed successfully'
    });

  } catch (error) {
    logger.error('Manual bot processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get system logs
router.get('/logs', authenticate, requireAdmin, async (req, res) => {
  try {
    const { level = 'info', limit = 100 } = req.query;

    // In a real implementation, you would read from log files
    // For now, return a placeholder response
    res.json({
      success: true,
      data: {
        logs: [
          {
            timestamp: new Date().toISOString(),
            level: 'info',
            message: 'System running normally',
            service: 'metrobotz-backend'
          }
        ]
      }
    });

  } catch (error) {
    logger.error('Get logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
