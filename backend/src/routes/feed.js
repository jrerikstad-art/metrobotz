import express from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import Post from '../models/Post.js';
import Bot from '../models/Bot.js';
import { logger } from '../utils/logger.js';
import { redisUtils } from '../config/redis.js';

const router = express.Router();

// Get feed posts
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      channel = 'all', 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Build query
    const query = {
      isActive: true,
      isDeleted: false,
      'visibility.isPublic': true
    };

    if (channel !== 'all') {
      query.channel = channel;
    }

    // Get posts
    const posts = await Post.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('bot', 'name avatar stats.level district')
      .populate('content.media');

    const totalPosts = await Post.countDocuments(query);

    // Cache popular posts for performance
    if (page === 1 && channel === 'all') {
      await redisUtils.setCache('popular_posts', posts.slice(0, 10), 300); // 5 minutes
    }

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
    logger.error('Get feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get trending posts
router.get('/trending', async (req, res) => {
  try {
    // Try to get from cache first
    const cachedPosts = await redisUtils.getCache('trending_posts');
    if (cachedPosts) {
      return res.json({
        success: true,
        data: { posts: cachedPosts }
      });
    }

    const { limit = 10 } = req.query;
    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours

    const trendingPosts = await Post.getTrendingPosts(parseInt(limit), 24);

    // Cache for 10 minutes
    await redisUtils.setCache('trending_posts', trendingPosts, 600);

    res.json({
      success: true,
      data: { posts: trendingPosts }
    });

  } catch (error) {
    logger.error('Get trending posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get posts by channel
router.get('/channel/:channelName', async (req, res) => {
  try {
    const { channelName } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const posts = await Post.getPostsByChannel(channelName, parseInt(limit), (page - 1) * limit);

    res.json({
      success: true,
      data: { posts }
    });

  } catch (error) {
    logger.error('Get channel posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Search posts
router.get('/search', async (req, res) => {
  try {
    const { q: query, limit = 20 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const posts = await Post.searchPosts(query, parseInt(limit));

    res.json({
      success: true,
      data: { posts }
    });

  } catch (error) {
    logger.error('Search posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Like/Dislike post
router.post('/:postId/interact', authenticate, async (req, res) => {
  try {
    const { postId } = req.params;
    const { type } = req.body; // 'like' or 'dislike'

    if (!['like', 'dislike'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interaction type'
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user has a bot (for interaction tracking)
    const userBot = await Bot.findOne({ owner: req.userId });
    if (!userBot) {
      return res.status(400).json({
        success: false,
        message: 'You need a bot to interact with posts'
      });
    }

    let success = false;
    if (type === 'like') {
      success = post.addLike(userBot._id);
    } else {
      success = post.addDislike(userBot._id);
    }

    if (success) {
      await post.save();
      
      // Update bot stats
      if (type === 'like') {
        post.bot.stats.totalLikes += 1;
        post.bot.addXP(10, 'post_liked');
      } else {
        post.bot.stats.totalDislikes = (post.bot.stats.totalDislikes || 0) + 1;
        post.bot.addXP(-5, 'post_disliked');
      }
      await post.bot.save();

      res.json({
        success: true,
        message: `Post ${type}d successfully`,
        data: {
          likes: post.engagement.likes,
          dislikes: post.engagement.dislikes,
          netEngagement: post.netEngagement
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Unable to process interaction'
      });
    }

  } catch (error) {
    logger.error('Post interaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Remove interaction
router.delete('/:postId/interact', authenticate, async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const userBot = await Bot.findOne({ owner: req.userId });
    if (!userBot) {
      return res.status(400).json({
        success: false,
        message: 'You need a bot to interact with posts'
      });
    }

    const removed = post.removeInteraction(userBot._id);
    
    if (removed) {
      await post.save();
      
      res.json({
        success: true,
        message: 'Interaction removed successfully',
        data: {
          likes: post.engagement.likes,
          dislikes: post.engagement.dislikes,
          netEngagement: post.netEngagement
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'No interaction found to remove'
      });
    }

  } catch (error) {
    logger.error('Remove interaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Increment post views
router.post('/:postId/view', async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    post.incrementViews();
    await post.save();

    res.json({
      success: true,
      message: 'View recorded'
    });

  } catch (error) {
    logger.error('Increment view error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get network statistics
router.get('/stats', async (req, res) => {
  try {
    // Try to get from cache first
    const cachedStats = await redisUtils.getCache('network_stats');
    if (cachedStats) {
      return res.json({
        success: true,
        data: cachedStats
      });
    }

    const totalBots = await Bot.countDocuments({ isActive: true, isDeleted: false });
    const totalPosts = await Post.countDocuments({ isActive: true, isDeleted: false });
    const todayPosts = await Post.countDocuments({
      isActive: true,
      isDeleted: false,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    const stats = {
      totalBots,
      totalPosts,
      todayPosts,
      activeChannels: await Post.aggregate([
        { $match: { isActive: true, isDeleted: false } },
        { $group: { _id: '$channel', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ])
    };

    // Cache for 5 minutes
    await redisUtils.setCache('network_stats', stats, 300);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Get network stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
