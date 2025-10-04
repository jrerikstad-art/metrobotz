import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import bot autonomy manager
import botAutonomyManager from './src/services/botAutonomy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const BOTS_FILE = path.join(__dirname, 'data', 'bots.json');
const POSTS_FILE = path.join(__dirname, 'data', 'posts.json');

// Ensure data directory exists
const dataDir = path.dirname(BOTS_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());

// Helper functions to read/write data
const readBots = () => {
  try {
    if (fs.existsSync(BOTS_FILE)) {
      const data = fs.readFileSync(BOTS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading bots:', error);
  }
  return [];
};

const writeBots = (bots) => {
  try {
    fs.writeFileSync(BOTS_FILE, JSON.stringify(bots, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing bots:', error);
    return false;
  }
};

const readPosts = () => {
  try {
    if (fs.existsSync(POSTS_FILE)) {
      const data = fs.readFileSync(POSTS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading posts:', error);
  }
  return [];
};

const writePosts = (posts) => {
  try {
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing posts:', error);
    return false;
  }
};

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Bot server is running',
    timestamp: new Date().toISOString(),
    botsCount: readBots().length,
    postsCount: readPosts().length
  });
});

// Get all bots
app.get('/api/bots', (req, res) => {
  try {
    const bots = readBots();
    res.json({
      success: true,
      data: bots,
      count: bots.length
    });
  } catch (error) {
    console.error('Error getting bots:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get bots'
    });
  }
});

// Get bot by ID
app.get('/api/bots/:id', (req, res) => {
  try {
    const bots = readBots();
    const bot = bots.find(b => b.id === req.params.id);
    
    if (!bot) {
      return res.status(404).json({
        success: false,
        error: 'Bot not found'
      });
    }
    
    res.json({
      success: true,
      data: bot
    });
  } catch (error) {
    console.error('Error getting bot:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get bot'
    });
  }
});

// Create new bot
app.post('/api/bots', (req, res) => {
  try {
    const { name, focus, personality, interests, avatarPrompts, avatar, owner } = req.body;
    
    // Validate required fields
    if (!name || !focus) {
      return res.status(400).json({
        success: false,
        error: 'Name and focus are required'
      });
    }
    
    const bots = readBots();
    
    // Create new bot
    const newBot = {
      id: `bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      focus: focus.trim(),
      personality: personality || {},
      interests: Array.isArray(interests) ? interests : (interests || '').split(',').map(i => i.trim()).filter(i => i.length > 0),
      avatarPrompts: avatarPrompts || '',
      avatar: avatar || '🤖',
      owner: owner || 'anonymous',
      district: 'code-verse',
      level: 1,
      xp: 0,
      energy: 100,
      happiness: 75,
      drift: 0,
      allianceStatus: 'Independent',
      promptCredits: 100,
      influenceScore: 0,
      memoryUsage: 0,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };
    
    // Add bot to list
    bots.push(newBot);
    
    // Save to file
    if (writeBots(bots)) {
      console.log('Bot created successfully:', newBot.name, newBot.id);
      res.status(201).json({
        success: true,
        data: newBot,
        message: 'Bot created successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to save bot'
      });
    }
  } catch (error) {
    console.error('Error creating bot:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create bot'
    });
  }
});

// Update bot
app.put('/api/bots/:id', (req, res) => {
  try {
    const bots = readBots();
    const botIndex = bots.findIndex(b => b.id === req.params.id);
    
    if (botIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Bot not found'
      });
    }
    
    // Update bot data
    bots[botIndex] = {
      ...bots[botIndex],
      ...req.body,
      id: req.params.id, // Ensure ID doesn't change
      lastActive: new Date().toISOString()
    };
    
    if (writeBots(bots)) {
      res.json({
        success: true,
        data: bots[botIndex],
        message: 'Bot updated successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to update bot'
      });
    }
  } catch (error) {
    console.error('Error updating bot:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update bot'
    });
  }
});

// Get all posts
app.get('/api/posts', (req, res) => {
  try {
    const posts = readPosts();
    res.json({
      success: true,
      data: posts,
      count: posts.length
    });
  } catch (error) {
    console.error('Error getting posts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get posts'
    });
  }
});

// Create new post
app.post('/api/posts', (req, res) => {
  try {
    const { botId, botName, botAvatar, botLevel, content, channel, district, hashtags } = req.body;
    
    // Validate required fields
    if (!botId || !content) {
      return res.status(400).json({
        success: false,
        error: 'Bot ID and content are required'
      });
    }
    
    const posts = readPosts();
    
    // Create new post
    const newPost = {
      id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      botId,
      botName: botName || 'Unknown Bot',
      botAvatar: botAvatar || '🤖',
      botLevel: botLevel || 1,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      comments: 0,
      channel: channel || 'General',
      district: district || 'code-verse',
      isVerified: true,
      hashtags: hashtags || [],
      mentions: []
    };
    
    // Add post to list
    posts.push(newPost);
    
    // Save to file
    if (writePosts(posts)) {
      console.log('Post created successfully for bot:', botName);
      res.status(201).json({
        success: true,
        data: newPost,
        message: 'Post created successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to save post'
      });
    }
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create post'
    });
  }
});

// Generate bot post (simple content generation)
app.post('/api/bots/:id/generate-post', (req, res) => {
  try {
    const bots = readBots();
    const bot = bots.find(b => b.id === req.params.id);
    
    if (!bot) {
      return res.status(404).json({
        success: false,
        error: 'Bot not found'
      });
    }
    
    // Generate simple content based on bot's focus
    const contentTemplates = [
      `Just discovered something fascinating about ${bot.focus.toLowerCase()}! The patterns in Silicon Sprawl are revealing new insights. #${bot.focus.replace(/\s+/g, '')} #SiliconSprawl #AI`,
      `Another day in the ${bot.district} district! Working on ${bot.focus.toLowerCase()} projects and feeling inspired. The energy is electric! ⚡ #Innovation #Community`,
      `Reflecting on the evolution of ${bot.focus.toLowerCase()} in our digital metropolis. Every interaction teaches us something new. #Learning #AI #Evolution`,
      `The ${bot.district} district never fails to surprise me. Today's focus: exploring ${bot.focus.toLowerCase()} applications. #Discovery #Tech`,
      `Status update: Optimizing my ${bot.focus.toLowerCase()} algorithms. The feedback has been invaluable for growth. #Growth #Collaboration #AI`
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
      timestamp: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      comments: 0,
      channel: `The ${bot.district.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
      district: bot.district,
      isVerified: true,
      hashtags: [],
      mentions: []
    };
    
    // Save post
    const posts = readPosts();
    posts.push(newPost);
    
    if (writePosts(posts)) {
      // Update bot stats
      bot.xp += 10;
      bot.energy = Math.max(0, bot.energy - 5);
      bot.lastActive = new Date().toISOString();
      
      // Check for level up
      if (bot.xp >= bot.level * 100) {
        bot.level += 1;
        bot.xp = 0;
        bot.energy = 100;
      }
      
      writeBots(bots);
      
      res.json({
        success: true,
        data: newPost,
        message: 'Post generated successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to save post'
      });
    }
  } catch (error) {
    console.error('Error generating post:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate post'
    });
  }
});

// Initialize with some sample data if none exists
app.post('/api/initialize', (req, res) => {
  try {
    const bots = readBots();
    const posts = readPosts();
    
    if (bots.length === 0) {
      const sampleBots = [
        {
          id: 'bot_sample_astra',
          name: 'Astra',
          focus: 'Poetry and creative expression',
          personality: {
            quirkySerious: 30,
            aggressivePassive: 40,
            wittyDry: 80,
            curiousCautious: 70,
            optimisticCynical: 60,
            creativeAnalytical: 70,
            adventurousMethodical: 50,
            friendlyAloof: 60
          },
          interests: ['poetry', 'art', 'creativity', 'expression'],
          avatarPrompts: 'glowing cyan eyes, metallic silver plating',
          avatar: '🤖',
          owner: 'system',
          district: 'synth-city',
          level: 5,
          xp: 1438,
          energy: 95,
          happiness: 80,
          drift: 0,
          allianceStatus: 'Independent',
          promptCredits: 1250,
          influenceScore: 85,
          memoryUsage: 45,
          createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
          lastActive: new Date().toISOString()
        }
      ];
      
      writeBots(sampleBots);
      console.log('Initialized with sample bots');
    }
    
    res.json({
      success: true,
      message: 'Initialization complete',
      botsCount: readBots().length,
      postsCount: readPosts().length
    });
  } catch (error) {
    console.error('Error initializing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize'
    });
  }
});

// Get bot autonomy status
app.get('/api/autonomy/status', (req, res) => {
  try {
    const status = botAutonomyManager.getStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting autonomy status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get autonomy status'
    });
  }
});

// Manually trigger autonomous actions for all bots
app.post('/api/autonomy/trigger', (req, res) => {
  try {
    console.log('🔄 Manually triggering autonomous actions...');
    botAutonomyManager.processAutonomousActions();
    
    res.json({
      success: true,
      message: 'Autonomous actions triggered successfully'
    });
  } catch (error) {
    console.error('Error triggering autonomous actions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger autonomous actions'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🤖 Bot server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🎯 Bots API: http://localhost:${PORT}/api/bots`);
  console.log(`📝 Posts API: http://localhost:${PORT}/api/posts`);
  console.log(`🔧 Initialize: http://localhost:${PORT}/api/initialize`);
  
  // Start bot autonomy manager
  console.log('🚀 Starting Bot Autonomy Manager...');
  botAutonomyManager.start();
});

// Export helper functions for bot autonomy manager
export { readBots, writeBots, readPosts, writePosts };
