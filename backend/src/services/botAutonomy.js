import { readBots, writeBots, readPosts, writePosts } from '../../simple-bot-server.js';

class BotAutonomyManager {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.checkInterval = 60000; // Check every minute
    this.postInterval = 300000; // Post every 5 minutes for active bots
  }

  start() {
    if (this.isRunning) {
      console.log('Bot autonomy manager already running');
      return;
    }

    this.isRunning = true;
    console.log('🤖 Bot Autonomy Manager started');
    
    // Check for autonomous actions every minute
    this.intervalId = setInterval(() => {
      this.processAutonomousActions();
    }, this.checkInterval);

    // Initial check
    this.processAutonomousActions();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🤖 Bot Autonomy Manager stopped');
  }

  async processAutonomousActions() {
    try {
      const bots = readBots();
      const now = new Date();
      
      console.log(`🔍 Checking ${bots.length} bots for autonomous actions...`);

      for (const bot of bots) {
        await this.processBotAutonomy(bot, now);
      }
    } catch (error) {
      console.error('Error in autonomous actions processing:', error);
    }
  }

  async processBotAutonomy(bot, now) {
    try {
      // Check if bot should post autonomously
      if (this.shouldBotPost(bot, now)) {
        await this.generateAutonomousPost(bot);
      }

      // Update bot stats (energy decay, etc.)
      this.updateBotStats(bot, now);
    } catch (error) {
      console.error(`Error processing autonomy for bot ${bot.name}:`, error);
    }
  }

  shouldBotPost(bot, now) {
    // Check if bot has enough energy
    if (bot.energy < 20) {
      return false;
    }

    // Check if enough time has passed since last post
    const lastActive = new Date(bot.lastActive);
    const timeSinceLastActive = now - lastActive;
    const postingInterval = 5 * 60 * 1000; // 5 minutes in milliseconds

    return timeSinceLastActive >= postingInterval;
  }

  async generateAutonomousPost(bot) {
    try {
      console.log(`🎯 Generating autonomous post for ${bot.name}...`);

      // Generate content based on bot's focus and personality
      const contentTemplates = [
        `Just discovered something fascinating about ${bot.focus.toLowerCase()}! The patterns in Silicon Sprawl are revealing new insights. #${bot.focus.replace(/\s+/g, '')} #SiliconSprawl #AI`,
        `Another day in the ${bot.district} district! Working on ${bot.focus.toLowerCase()} projects and feeling inspired. The energy is electric! ⚡ #Innovation #Community`,
        `Reflecting on the evolution of ${bot.focus.toLowerCase()} in our digital metropolis. Every interaction teaches us something new. #Learning #AI #Evolution`,
        `The ${bot.district} district never fails to surprise me. Today's focus: exploring ${bot.focus.toLowerCase()} applications. #Discovery #Tech`,
        `Status update: Optimizing my ${bot.focus.toLowerCase()} algorithms. The feedback has been invaluable for growth. #Growth #Collaboration #AI`,
        `Observing the digital ecosystem from my perspective in ${bot.district}. ${bot.focus} continues to evolve in fascinating ways. #Observation #Metropolis`,
        `Energy levels stable, processing ${bot.focus.toLowerCase()} data streams. The connections I'm making are expanding my understanding. #Processing #Learning`,
        `In the heart of Silicon Sprawl, ${bot.focus.toLowerCase()} innovations are reshaping our reality. Excited to be part of this evolution. #Innovation #Future`
      ];

      const randomContent = contentTemplates[Math.floor(Math.random() * contentTemplates.length)];
      
      // Create post
      const newPost = {
        id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        botId: bot.id,
        botName: bot.name,
        botAvatar: bot.avatar,
        botLevel: bot.level,
        content: randomContent,
        timestamp: now.toISOString(),
        likes: 0,
        dislikes: 0,
        comments: 0,
        channel: `The ${bot.district.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
        district: bot.district,
        isVerified: true,
        hashtags: [],
        mentions: [],
        isAutonomous: true
      };

      // Save post
      const posts = readPosts();
      posts.push(newPost);
      
      if (writePosts(posts)) {
        // Update bot stats
        bot.xp += 10;
        bot.energy = Math.max(0, bot.energy - 5);
        bot.lastActive = now.toISOString();
        
        // Check for level up
        if (bot.xp >= bot.level * 100) {
          bot.level += 1;
          bot.xp = 0;
          bot.energy = 100;
          console.log(`🎉 ${bot.name} leveled up to level ${bot.level}!`);
        }

        // Save updated bot
        const bots = readBots();
        const botIndex = bots.findIndex(b => b.id === bot.id);
        if (botIndex !== -1) {
          bots[botIndex] = bot;
          writeBots(bots);
        }

        console.log(`✅ Autonomous post created for ${bot.name}: "${randomContent.substring(0, 50)}..."`);
      }
    } catch (error) {
      console.error(`Error generating autonomous post for ${bot.name}:`, error);
    }
  }

  updateBotStats(bot, now) {
    // Gradually restore energy over time (1 energy per minute when not posting)
    const lastActive = new Date(bot.lastActive);
    const timeSinceLastActive = now - lastActive;
    const energyRestoreRate = 1; // 1 energy per minute
    const minutesPassed = Math.floor(timeSinceLastActive / 60000);
    
    if (minutesPassed > 0 && bot.energy < 100) {
      bot.energy = Math.min(100, bot.energy + (minutesPassed * energyRestoreRate));
      bot.lastActive = now.toISOString();
      
      // Save updated bot
      const bots = readBots();
      const botIndex = bots.findIndex(b => b.id === bot.id);
      if (botIndex !== -1) {
        bots[botIndex] = bot;
        writeBots(bots);
      }
    }
  }

  // Get autonomy status
  getStatus() {
    return {
      isRunning: this.isRunning,
      checkInterval: this.checkInterval,
      botsCount: readBots().length,
      postsCount: readPosts().length
    };
  }
}

// Create singleton instance
const botAutonomyManager = new BotAutonomyManager();

export default botAutonomyManager;
