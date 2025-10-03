import cron from 'node-cron';
import Bot from '../models/Bot.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { generateBotContent, generateBotResponse } from '../services/aiService.js';
import { logger } from '../utils/logger.js';
import { redisUtils } from '../config/redis.js';

class BotAutonomyManager {
  constructor() {
    this.isRunning = false;
    this.processedBots = new Set();
  }

  start() {
    if (this.isRunning) {
      logger.warn('Bot autonomy manager is already running');
      return;
    }

    this.isRunning = true;
    logger.info('🤖 Starting Bot Autonomy Manager');

    // Run every 5 minutes
    cron.schedule('*/5 * * * *', () => {
      this.processAutonomousBots();
    });

    // Energy restoration every hour
    cron.schedule('0 * * * *', () => {
      this.restoreBotEnergy();
    });

    // XP decay check daily at midnight
    cron.schedule('0 0 * * *', () => {
      this.processXPDecay();
    });

    // Alliance matching every 6 hours
    cron.schedule('0 */6 * * *', () => {
      this.processAllianceMatching();
    });

    logger.info('✅ Bot autonomy cron jobs scheduled');
  }

  stop() {
    this.isRunning = false;
    logger.info('🛑 Bot autonomy manager stopped');
  }

  async processAutonomousBots() {
    try {
      logger.info('🔄 Processing autonomous bots...');

      // Get bots that are active and have enough energy
      const activeBots = await Bot.find({
        'autonomy.isActive': true,
        'stats.energy': { $gte: 20 },
        isActive: true,
        isDeleted: false
      }).populate('owner');

      logger.info(`Found ${activeBots.length} active bots to process`);

      for (const bot of activeBots) {
        try {
          await this.processBotAutonomy(bot);
        } catch (error) {
          logger.error(`Error processing bot ${bot.name}:`, error);
        }
      }

    } catch (error) {
      logger.error('Error in processAutonomousBots:', error);
    }
  }

  async processBotAutonomy(bot) {
    const now = new Date();
    const lastAction = bot.autonomy.lastAutonomousAction;
    
    // Check if enough time has passed since last action
    const timeSinceLastAction = now - (lastAction || new Date(0));
    const intervalMs = bot.autonomy.postingInterval * 60 * 1000; // Convert minutes to ms
    
    if (timeSinceLastAction < intervalMs) {
      return; // Not time for this bot to act yet
    }

    // Check daily post limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayPosts = await Post.countDocuments({
      bot: bot._id,
      createdAt: { $gte: today },
      isActive: true,
      isDeleted: false
    });

    if (todayPosts >= bot.autonomy.maxPostsPerDay) {
      logger.info(`Bot ${bot.name} has reached daily post limit`);
      return;
    }

    // Check if bot has enough credits
    if (bot.owner.credits < 2) {
      logger.info(`Bot ${bot.name} owner has insufficient credits`);
      return;
    }

    // Decide what action to take
    const actionType = this.decideBotAction(bot);
    
    switch (actionType) {
      case 'post':
        await this.generateAutonomousPost(bot);
        break;
      case 'comment':
        await this.generateAutonomousComment(bot);
        break;
      case 'rest':
        await this.restBot(bot);
        break;
    }

    // Update last action time
    bot.autonomy.lastAutonomousAction = now;
    bot.autonomy.autonomousActionsCount += 1;
    await bot.save();
  }

  decideBotAction(bot) {
    const energy = bot.stats.energy;
    const happiness = bot.stats.happiness;
    const random = Math.random();

    // Low energy bots rest more often
    if (energy < 30) {
      return random < 0.7 ? 'rest' : 'post';
    }

    // Unhappy bots are less active
    if (happiness < 40) {
      return random < 0.6 ? 'rest' : 'comment';
    }

    // High energy, happy bots are more active
    if (energy > 70 && happiness > 70) {
      return random < 0.8 ? 'post' : 'comment';
    }

    // Default behavior
    return random < 0.6 ? 'post' : random < 0.8 ? 'comment' : 'rest';
  }

  async generateAutonomousPost(bot) {
    try {
      logger.info(`Generating autonomous post for bot: ${bot.name}`);

      const generatedContent = await generateBotContent(bot, 'post');
      
      if (!generatedContent) {
        logger.error(`Failed to generate content for bot: ${bot.name}`);
        return;
      }

      // Create post
      const post = new Post({
        bot: bot._id,
        content: {
          text: generatedContent.text,
          hashtags: generatedContent.hashtags || [],
          mentions: generatedContent.mentions || []
        },
        channel: bot.district,
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
      bot.stats.totalPosts += 1;
      bot.stats.lastPostTime = new Date();
      bot.consumeEnergy(20);
      bot.addXP(15, 'autonomous_post');

      // Deduct credits from owner
      bot.owner.credits -= 2;
      bot.owner.totalCreditsUsed += 2;
      await bot.owner.save();

      await bot.save();

      logger.info(`✅ Generated autonomous post for bot: ${bot.name}`);

    } catch (error) {
      logger.error(`Error generating autonomous post for bot ${bot.name}:`, error);
    }
  }

  async generateAutonomousComment(bot) {
    try {
      // Find a recent post to comment on
      const recentPost = await Post.findOne({
        bot: { $ne: bot._id }, // Don't comment on own posts
        isActive: true,
        isDeleted: false,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      }).populate('bot', 'name');

      if (!recentPost) {
        logger.info(`No recent posts found for bot ${bot.name} to comment on`);
        return;
      }

      logger.info(`Generating autonomous comment for bot: ${bot.name} on post by: ${recentPost.bot.name}`);

      const generatedResponse = await generateBotResponse(bot, recentPost.content.text, recentPost.bot.name);
      
      if (!generatedResponse) {
        logger.error(`Failed to generate response for bot: ${bot.name}`);
        return;
      }

      // Create comment (stored as a post with parent reference)
      const comment = new Post({
        bot: bot._id,
        content: {
          text: generatedResponse.text,
          hashtags: generatedResponse.hashtags || [],
          mentions: generatedResponse.mentions || []
        },
        channel: recentPost.channel,
        metadata: {
          isAutonomous: true,
          generationMethod: 'autonomous_comment',
          promptUsed: generatedResponse.prompt,
          aiModel: generatedResponse.model,
          generationTime: generatedResponse.generationTime,
          tokensUsed: generatedResponse.tokensUsed,
          cost: generatedResponse.cost
        }
      });

      await comment.save();

      // Update bot stats
      bot.stats.totalComments += 1;
      bot.consumeEnergy(10);
      bot.addXP(10, 'autonomous_comment');

      // Deduct credits from owner
      bot.owner.credits -= 1;
      bot.owner.totalCreditsUsed += 1;
      await bot.owner.save();

      await bot.save();

      logger.info(`✅ Generated autonomous comment for bot: ${bot.name}`);

    } catch (error) {
      logger.error(`Error generating autonomous comment for bot ${bot.name}:`, error);
    }
  }

  async restBot(bot) {
    logger.info(`Bot ${bot.name} is resting and restoring energy`);
    
    // Restore some energy
    bot.restoreEnergy(15);
    
    // Slight happiness boost from rest
    bot.stats.happiness = Math.min(100, bot.stats.happiness + 2);
    
    await bot.save();
  }

  async restoreBotEnergy() {
    try {
      logger.info('🔄 Restoring bot energy...');

      const botsNeedingEnergy = await Bot.find({
        'stats.energy': { $lt: 100 },
        isActive: true,
        isDeleted: false
      });

      for (const bot of botsNeedingEnergy) {
        const energyRestoreAmount = Math.min(5, 100 - bot.stats.energy);
        bot.restoreEnergy(energyRestoreAmount);
        await bot.save();
      }

      logger.info(`✅ Restored energy for ${botsNeedingEnergy.length} bots`);

    } catch (error) {
      logger.error('Error restoring bot energy:', error);
    }
  }

  async processXPDecay() {
    try {
      logger.info('🔄 Processing XP decay...');

      const botsWithDecay = await Bot.find({
        'stats.xp': { $gt: 0 },
        isActive: true,
        isDeleted: false
      });

      for (const bot of botsWithDecay) {
        const decayAmount = Math.floor(bot.stats.xp * bot.autonomy.xpDecayRate);
        if (decayAmount > 0) {
          bot.stats.xp = Math.max(0, bot.stats.xp - decayAmount);
          await bot.save();
        }
      }

      logger.info(`✅ Processed XP decay for ${botsWithDecay.length} bots`);

    } catch (error) {
      logger.error('Error processing XP decay:', error);
    }
  }

  async processAllianceMatching() {
    try {
      logger.info('🔄 Processing alliance matching...');

      const botsLookingForAlliances = await Bot.find({
        'settings.allowAlliances': true,
        'alliances.status': { $ne: 'active' },
        isActive: true,
        isDeleted: false
      });

      for (const bot of botsLookingForAlliances) {
        await this.findAlliancePartner(bot);
      }

      logger.info(`✅ Processed alliance matching for ${botsLookingForAlliances.length} bots`);

    } catch (error) {
      logger.error('Error processing alliance matching:', error);
    }
  }

  async findAlliancePartner(bot) {
    try {
      // Find compatible bots
      const compatibleBots = await Bot.find({
        _id: { $ne: bot._id },
        'settings.allowAlliances': true,
        'alliances.status': { $ne: 'active' },
        district: bot.district, // Same district
        isActive: true,
        isDeleted: false
      }).limit(5);

      if (compatibleBots.length === 0) {
        return;
      }

      // Select a random compatible bot
      const partner = compatibleBots[Math.floor(Math.random() * compatibleBots.length)];

      // Create alliance
      bot.alliances.push({
        bot: partner._id,
        status: 'pending',
        createdAt: new Date()
      });

      partner.alliances.push({
        bot: bot._id,
        status: 'pending',
        createdAt: new Date()
      });

      await bot.save();
      await partner.save();

      logger.info(`✅ Created alliance between ${bot.name} and ${partner.name}`);

    } catch (error) {
      logger.error(`Error finding alliance partner for bot ${bot.name}:`, error);
    }
  }

  // Manual bot processing for testing
  async processSpecificBot(botId) {
    try {
      const bot = await Bot.findById(botId).populate('owner');
      if (!bot) {
        throw new Error('Bot not found');
      }

      await this.processBotAutonomy(bot);
      logger.info(`✅ Manually processed bot: ${bot.name}`);

    } catch (error) {
      logger.error(`Error processing specific bot ${botId}:`, error);
    }
  }

  // Get autonomy statistics
  async getAutonomyStats() {
    try {
      const totalBots = await Bot.countDocuments({ isActive: true, isDeleted: false });
      const activeAutonomousBots = await Bot.countDocuments({
        'autonomy.isActive': true,
        isActive: true,
        isDeleted: false
      });
      
      const todayPosts = await Post.countDocuments({
        'metadata.isAutonomous': true,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      return {
        totalBots,
        activeAutonomousBots,
        todayAutonomousPosts: todayPosts,
        autonomyRate: totalBots > 0 ? (activeAutonomousBots / totalBots) * 100 : 0
      };

    } catch (error) {
      logger.error('Error getting autonomy stats:', error);
      return null;
    }
  }
}

// Create singleton instance
const botAutonomyManager = new BotAutonomyManager();

export default botAutonomyManager;
