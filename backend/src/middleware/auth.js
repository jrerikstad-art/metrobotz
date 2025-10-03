import { verifyToken, extractToken } from '../utils/jwt.js';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

// Authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }
    
    const decoded = verifyToken(token);
    
    // Find user and check if still active
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive || user.isDeleted) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }
    
    // Check if user is locked
    if (user.isLocked) {
      return res.status(401).json({
        success: false,
        message: 'Account is temporarily locked'
      });
    }
    
    // Update last active time
    user.stats.lastActive = new Date();
    await user.save();
    
    // Add user to request object
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error.message.includes('expired')) {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error.message.includes('Invalid')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      req.user = null;
      req.userId = null;
      return next();
    }
    
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user && user.isActive && !user.isDeleted && !user.isLocked) {
      req.user = user;
      req.userId = user._id;
    } else {
      req.user = null;
      req.userId = null;
    }
    
    next();
  } catch (error) {
    // If token is invalid, just continue without user
    req.user = null;
    req.userId = null;
    next();
  }
};

// Authorization middleware for subscription levels
export const requireSubscription = (requiredLevel) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const subscriptionLevels = {
      'free': 0,
      'pro': 1,
      'premium': 2
    };
    
    const userLevel = subscriptionLevels[req.user.subscription.type] || 0;
    const requiredLevelNum = subscriptionLevels[requiredLevel] || 0;
    
    if (userLevel < requiredLevelNum) {
      return res.status(403).json({
        success: false,
        message: `${requiredLevel} subscription required`,
        code: 'INSUFFICIENT_SUBSCRIPTION'
      });
    }
    
    next();
  };
};

// Authorization middleware for verified users
export const requireVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  if (!req.user.security.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Account verification required',
      code: 'VERIFICATION_REQUIRED'
    });
  }
  
  next();
};

// Authorization middleware for admin users
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  if (req.user.subscription.type !== 'premium' || !req.user.security.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
      code: 'ADMIN_REQUIRED'
    });
  }
  
  next();
};

// Rate limiting middleware for bot creation
export const limitBotCreation = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  const subscriptionLimits = {
    'free': 1,
    'pro': 2,
    'premium': 5
  };
  
  const maxBots = subscriptionLimits[req.user.subscription.type] || 1;
  
  // This would need to be checked against actual bot count in the database
  // For now, we'll add this to the request for the route handler to check
  req.maxBotsAllowed = maxBots;
  
  next();
};

// Middleware to check if user has sufficient credits
export const requireCredits = (creditsNeeded = 1) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (req.user.credits < creditsNeeded) {
      return res.status(402).json({
        success: false,
        message: 'Insufficient credits',
        code: 'INSUFFICIENT_CREDITS',
        creditsNeeded,
        creditsAvailable: req.user.credits
      });
    }
    
    next();
  };
};

// Middleware to check if user owns a resource
export const requireOwnership = (resourceModel, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
      
      const resourceId = req.params[resourceIdParam];
      const resource = await resourceModel.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }
      
      // Check if user owns the resource
      if (resource.owner && resource.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied - resource ownership required'
        });
      }
      
      // Add resource to request for use in route handlers
      req.resource = resource;
      
      next();
    } catch (error) {
      logger.error('Ownership check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

// Middleware to validate user permissions for bot operations
export const validateBotPermissions = (operation) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
      
      const botId = req.params.botId || req.params.id;
      const Bot = (await import('../models/Bot.js')).default;
      const bot = await Bot.findById(botId);
      
      if (!bot) {
        return res.status(404).json({
          success: false,
          message: 'Bot not found'
        });
      }
      
      // Check ownership
      if (bot.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied - bot ownership required'
        });
      }
      
      // Check if bot is active
      if (!bot.isActive || bot.isDeleted) {
        return res.status(400).json({
          success: false,
          message: 'Bot is not active'
        });
      }
      
      // Add bot to request
      req.bot = bot;
      
      next();
    } catch (error) {
      logger.error('Bot permissions validation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};
