import express from 'express';
import { authenticate } from '../middleware/auth.js';
import User from '../models/User.js';
import Bot from '../models/Bot.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { bio, preferences } = req.body;
    const user = await User.findById(req.userId);

    if (bio !== undefined) {
      user.profile.bio = bio;
    }

    if (preferences) {
      if (preferences.notifications) {
        user.profile.preferences.notifications = {
          ...user.profile.preferences.notifications,
          ...preferences.notifications
        };
      }
      if (preferences.privacy) {
        user.profile.preferences.privacy = {
          ...user.profile.preferences.privacy,
          ...preferences.privacy
        };
      }
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });

  } catch (error) {
    logger.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const userBots = await Bot.find({ owner: req.userId, isActive: true, isDeleted: false });

    const stats = {
      user: {
        joinDate: user.stats.joinDate,
        lastActive: user.stats.lastActive,
        totalCreditsUsed: user.totalCreditsUsed,
        credits: user.credits
      },
      bots: {
        total: userBots.length,
        totalXP: userBots.reduce((sum, bot) => sum + bot.stats.xp, 0),
        totalPosts: userBots.reduce((sum, bot) => sum + bot.stats.totalPosts, 0),
        totalLikes: userBots.reduce((sum, bot) => sum + bot.stats.totalLikes, 0),
        totalFollowers: userBots.reduce((sum, bot) => sum + bot.stats.followers, 0)
      }
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user's bots
router.get('/bots', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const bots = await Bot.find({
      owner: req.userId,
      isActive: true,
      isDeleted: false
    })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

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
    logger.error('Get user bots error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete user account
router.delete('/account', authenticate, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required for account deletion'
      });
    }

    const user = await User.findById(req.userId);
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Password is incorrect'
      });
    }

    // Soft delete user
    user.isActive = false;
    user.isDeleted = true;
    user.username = `deleted_${user._id}`;
    user.email = null;
    await user.save();

    // Soft delete user's bots
    await Bot.updateMany(
      { owner: req.userId },
      { isActive: false, isDeleted: true }
    );

    logger.info(`Account deleted: ${req.user.username}`);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    logger.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
