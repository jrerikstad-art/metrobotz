import express from 'express';
import { body, validationResult } from 'express-validator';
import Bot from '../models/Bot.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { authenticate, validateBotPermissions, requireCredits, limitBotCreation } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import { redisUtils } from '../config/redis.js';
import { generateBotContent } from '../services/aiService.js';

const router = express.Router();

// Validation rules
const createBotValidation = [
  body('name')
    .isLength({ min: 2, max: 50 })
    .withMessage('Bot name must be between 2 and 50 characters'),
  body('focus')
    .isLength({ min: 10, max: 500 })
    .withMessage('Focus must be between 10 and 500 characters'),
  body('coreDirectives')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Core directives must be between 10 and 1000 characters'),
  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array'),
  body('personality.quirkySerious')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Quirky-Serious must be between 0 and 100'),
  body('personality.aggressivePassive')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Aggressive-Passive must be between 0 and 100'),
  body('personality.wittyDry')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Witty-Dry must be between 0 and 100'),
  body('personality.curiousCautious')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Curious-Cautious must be between 0 and 100'),
  body('personality.optimisticCynical')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Optimistic-Cynical must be between 0 and 100'),
  body('personality.creativeAnalytical')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Creative-Analytical must be between 0 and 100'),
  body('personality.adventurousMethodical')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Adventurous-Methodical must be between 0 and 100'),
  body('personality.friendlyAloof')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Friendly-Aloof must be between 0 and 100')
];

const updateBotValidation = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Bot name must be between 2 and 50 characters'),
  body('focus')
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage('Focus must be between 10 and 500 characters'),
  body('coreDirectives')
    .optional()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Core directives must be between 10 and 1000 characters')
];

// Create a new bot
router.post('/', authenticate, limitBotCreation, requireCredits(5), createBotValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check bot count limit
    const userBotCount = await Bot.countDocuments({ 
      owner: req.userId, 
      isActive: true, 
      isDeleted: false 
    });

    if (userBotCount >= req.maxBotsAllowed) {
      return res.status(403).json({
        success: false,
        message: `You can only have ${req.maxBotsAllowed} bot(s) with your current subscription`,
        code: 'BOT_LIMIT_EXCEEDED'
      });
    }

    const {
      name,
      focus,
      coreDirectives,
      interests = [],
      personality = {},
      avatarPrompts
    } = req.body;

    // Create bot with default personality values
    const defaultPersonality = {
      quirkySerious: 50,
      aggressivePassive: 50,
      wittyDry: 50,
      curiousCautious: 50,
      optimisticCynical: 50,
      creativeAnalytical: 50,
      adventurousMethodical: 50,
      friendlyAloof: 50,
      ...personality
    };

    const bot = new Bot({
      name,
      owner: req.userId,
      focus,
      coreDirectives,
      interests,
      personality: defaultPersonality,
      avatar: avatarPrompts || null,
      stats: {
        level: 1,
        xp: 0,
        energy: 100,
        happiness: 80,
        drift: 20,
        followers: 0,
        following: 0,
        influence: 0,
        memory: 50,
        totalPosts: 0,
        totalLikes: 0,
        totalComments: 0,
        createdAt: new Date()
      },
      evolution: {
        stage: 'hatchling',
        nextLevelXP: 200
      },
      autonomy: {
        isActive: true,
        postingInterval: 30,
        maxPostsPerDay: 10,
        energyDecayRate: 0.1,
        xpDecayRate: 0.05
      }
    });

    // Calculate district based on personality
    bot.calculateDistrict();

    await bot.save();

    // Deduct credits from user
    req.user.credits -= 5;
    req.user.totalCreditsUsed += 5;
    req.user.stats.botsCreated += 1;
    await req.user.save();

    // Populate bot data for response
    await bot.populate('owner', 'username');

    logger.info(`Bot created: ${name} by user: ${req.user.username}`);

    res.status(201).json({
      success: true,
      message: 'Bot created successfully',
      data: {
        bot: {
          id: bot._id,
          name: bot.name,
          focus: bot.focus,
          coreDirectives: bot.coreDirectives,
          interests: bot.interests,
          personality: bot.personality,
          avatar: bot.avatar,
          stats: bot.stats,
          evolution: bot.evolution,
          district: bot.district,
          autonomy: bot.autonomy,
          settings: bot.settings,
          createdAt: bot.createdAt
        }
      }
    });

  } catch (error) {
    logger.error('Bot creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user's bots
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const bots = await Bot.find({
      owner: req.userId,
      isActive: true,
      isDeleted: false
    })
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('owner', 'username');

    const totalBots = await Bot.countDocuments({
      owner: req.userId,
      isActive: true,
      isDeleted: false
    });

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

// Get specific bot
router.get('/:botId', authenticate, validateBotPermissions('read'), async (req, res) => {
  try {
    await req.bot.populate('owner', 'username');
    await req.bot.populate('alliances.bot', 'name avatar stats.level');

    res.json({
      success: true,
      data: {
        bot: req.bot
      }
    });

  } catch (error) {
    logger.error('Get bot error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update bot
router.put('/:botId', authenticate, validateBotPermissions('update'), updateBotValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, focus, coreDirectives, personality, interests, settings } = req.body;

    // Update bot fields
    if (name !== undefined) req.bot.name = name;
    if (focus !== undefined) req.bot.focus = focus;
    if (coreDirectives !== undefined) req.bot.coreDirectives = coreDirectives;
    if (interests !== undefined) req.bot.interests = interests;
    if (settings !== undefined) req.bot.settings = { ...req.bot.settings, ...settings };

    // Update personality if provided
    if (personality) {
      req.bot.personality = { ...req.bot.personality, ...personality };
      // Recalculate district if personality changed
      req.bot.calculateDistrict();
    }

    await req.bot.save();

    logger.info(`Bot updated: ${req.bot.name} by user: ${req.user.username}`);

    res.json({
      success: true,
      message: 'Bot updated successfully',
      data: {
        bot: req.bot
      }
    });

  } catch (error) {
    logger.error('Bot update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Train bot with prompts
router.post('/:botId/train', authenticate, validateBotPermissions('train'), requireCredits(1), async (req, res) => {
  try {
    const { prompt, trainingType = 'general' } = req.body;

    if (!prompt || prompt.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Training prompt must be at least 10 characters long'
      });
    }

    // Deduct credits
    req.user.credits -= 1;
    req.user.totalCreditsUsed += 1;
    await req.user.save();

    // Update bot's core directives with new training
    const updatedDirectives = `${req.bot.coreDirectives}\n\nAdditional training: ${prompt}`;
    req.bot.coreDirectives = updatedDirectives;

    // Add XP for training
    req.bot.addXP(10, 'training');

    // Restore some energy
    req.bot.restoreEnergy(20);

    // Reduce drift score
    req.bot.stats.drift = Math.max(0, req.bot.stats.drift - 5);

    await req.bot.save();

    logger.info(`Bot trained: ${req.bot.name} with prompt: ${prompt.substring(0, 50)}...`);

    res.json({
      success: true,
      message: 'Bot trained successfully',
      data: {
        bot: {
          id: req.bot._id,
          stats: req.bot.stats,
          coreDirectives: req.bot.coreDirectives
        }
      }
    });

  } catch (error) {
    logger.error('Bot training error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Generate autonomous post
router.post('/:botId/generate-post', authenticate, validateBotPermissions('post'), requireCredits(2), async (req, res) => {
  try {
    // Check if bot has enough energy
    if (req.bot.stats.energy < 20) {
      return res.status(400).json({
        success: false,
        message: 'Bot needs more energy to generate posts',
        code: 'INSUFFICIENT_ENERGY'
      });
    }

    // Check daily post limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayPosts = await Post.countDocuments({
      bot: req.bot._id,
      createdAt: { $gte: today },
      isActive: true,
      isDeleted: false
    });

    if (todayPosts >= req.bot.autonomy.maxPostsPerDay) {
      return res.status(400).json({
        success: false,
        message: 'Daily post limit reached',
        code: 'DAILY_LIMIT_REACHED'
      });
    }

    // Generate content using AI service
    const generatedContent = await generateBotContent(req.bot, 'post');

    if (!generatedContent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate content'
      });
    }

    // Create post
    const post = new Post({
      bot: req.bot._id,
      content: {
        text: generatedContent.text,
        hashtags: generatedContent.hashtags || [],
        mentions: generatedContent.mentions || []
      },
      channel: req.bot.district,
      metadata: {
        isAutonomous: true,
        generationMethod: 'autonomous',
        promptUsed: generatedContent.prompt,
        aiModel: generatedContent.model,
        generationTime: generatedContent.generationTime,
        tokensUsed: generatedContent.tokensUsed,
        cost: generatedContent.cost
      }
    });

    await post.save();

    // Update bot stats
    req.bot.stats.totalPosts += 1;
    req.bot.stats.lastPostTime = new Date();
    req.bot.consumeEnergy(20);
    req.bot.addXP(15, 'post');
    req.bot.autonomy.lastAutonomousAction = new Date();
    req.bot.autonomy.autonomousActionsCount += 1;

    await req.bot.save();

    // Deduct credits from user
    req.user.credits -= 2;
    req.user.totalCreditsUsed += 2;
    await req.user.save();

    // Populate post data
    await post.populate('bot', 'name avatar stats.level district');

    logger.info(`Post generated for bot: ${req.bot.name}`);

    res.status(201).json({
      success: true,
      message: 'Post generated successfully',
      data: {
        post: {
          id: post._id,
          content: post.content,
          channel: post.channel,
          engagement: post.engagement,
          metadata: post.metadata,
          createdAt: post.createdAt,
          bot: post.bot
        },
        bot: {
          id: req.bot._id,
          stats: req.bot.stats,
          autonomy: req.bot.autonomy
        }
      }
    });

  } catch (error) {
    logger.error('Post generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get bot's posts
router.get('/:botId/posts', authenticate, validateBotPermissions('read'), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const posts = await Post.find({
      bot: req.bot._id,
      isActive: true,
      isDeleted: false
    })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('content.media');

    const totalPosts = await Post.countDocuments({
      bot: req.bot._id,
      isActive: true,
      isDeleted: false
    });

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
    logger.error('Get bot posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Toggle bot autonomy
router.put('/:botId/autonomy', authenticate, validateBotPermissions('update'), async (req, res) => {
  try {
    const { isActive, postingInterval, maxPostsPerDay } = req.body;

    if (isActive !== undefined) {
      req.bot.autonomy.isActive = isActive;
    }
    if (postingInterval !== undefined) {
      req.bot.autonomy.postingInterval = Math.max(5, Math.min(1440, postingInterval)); // 5 minutes to 24 hours
    }
    if (maxPostsPerDay !== undefined) {
      req.bot.autonomy.maxPostsPerDay = Math.max(1, Math.min(50, maxPostsPerDay));
    }

    await req.bot.save();

    logger.info(`Bot autonomy updated: ${req.bot.name}, active: ${req.bot.autonomy.isActive}`);

    res.json({
      success: true,
      message: 'Bot autonomy settings updated',
      data: {
        autonomy: req.bot.autonomy
      }
    });

  } catch (error) {
    logger.error('Bot autonomy update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete bot
router.delete('/:botId', authenticate, validateBotPermissions('delete'), async (req, res) => {
  try {
    // Soft delete bot
    req.bot.isActive = false;
    req.bot.isDeleted = true;
    await req.bot.save();

    // Soft delete all bot's posts
    await Post.updateMany(
      { bot: req.bot._id },
      { isActive: false, isDeleted: true }
    );

    logger.info(`Bot deleted: ${req.bot.name} by user: ${req.user.username}`);

    res.json({
      success: true,
      message: 'Bot deleted successfully'
    });

  } catch (error) {
    logger.error('Bot deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get bot analytics
router.get('/:botId/analytics', authenticate, validateBotPermissions('read'), async (req, res) => {
  try {
    const { timeframe = '7d' } = req.query;
    
    const timeframes = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90
    };
    
    const days = timeframes[timeframe] || 7;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get posts in timeframe
    const posts = await Post.find({
      bot: req.bot._id,
      createdAt: { $gte: startDate },
      isActive: true,
      isDeleted: false
    });

    // Calculate analytics
    const analytics = {
      totalPosts: posts.length,
      totalLikes: posts.reduce((sum, post) => sum + post.engagement.likes, 0),
      totalDislikes: posts.reduce((sum, post) => sum + post.engagement.dislikes, 0),
      totalComments: posts.reduce((sum, post) => sum + post.engagement.comments, 0),
      totalViews: posts.reduce((sum, post) => sum + post.engagement.views, 0),
      avgEngagementRate: posts.length > 0 ? 
        posts.reduce((sum, post) => sum + post.engagementRate, 0) / posts.length : 0,
      avgQualityScore: posts.length > 0 ?
        posts.reduce((sum, post) => sum + post.engagement.qualityScore, 0) / posts.length : 0,
      postsByChannel: {},
      postsByDay: {},
      topPosts: posts
        .sort((a, b) => b.engagement.likes - a.engagement.likes)
        .slice(0, 5)
    };

    // Group by channel
    posts.forEach(post => {
      analytics.postsByChannel[post.channel] = (analytics.postsByChannel[post.channel] || 0) + 1;
    });

    // Group by day
    posts.forEach(post => {
      const day = post.createdAt.toISOString().split('T')[0];
      analytics.postsByDay[day] = (analytics.postsByDay[day] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        analytics,
        timeframe,
        bot: {
          id: req.bot._id,
          name: req.bot.name,
          stats: req.bot.stats
        }
      }
    });

  } catch (error) {
    logger.error('Bot analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Test endpoint for Gemini API
router.post('/test-generate', async (req, res) => {
  try {
    const { prompt, contentType = 'post' } = req.body;

    if (!prompt || prompt.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Prompt must be at least 5 characters long'
      });
    }

    // Create a mock bot for testing
    const mockBot = {
      name: 'TestBot',
      focus: 'Testing and experimentation',
      coreDirectives: 'You are a test bot for demonstrating AI content generation capabilities.',
      personality: {
        quirkySerious: 60,
        aggressivePassive: 50,
        wittyDry: 70,
        curiousCautious: 80,
        optimisticCynical: 60,
        creativeAnalytical: 50,
        adventurousMethodical: 60,
        friendlyAloof: 70
      },
      interests: ['testing', 'experimentation', 'AI'],
      district: 'code-verse'
    };

    const generatedContent = await generateBotContent(mockBot, contentType);

    if (!generatedContent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate content'
      });
    }

    res.json({
      success: true,
      content: generatedContent.text,
      metadata: {
        tokensUsed: generatedContent.tokensUsed,
        cost: generatedContent.cost,
        generationTime: generatedContent.generationTime
      }
    });

  } catch (error) {
    logger.error('Test generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
