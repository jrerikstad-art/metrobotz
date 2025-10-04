import { generateBotContent } from './aiService';

export interface Bot {
  id: string;
  name: string;
  owner: string;
  avatar: string;
  personality: {
    quirkySerious: number;
    aggressivePassive: number;
    wittyDry: number;
    curiousCautious: number;
    optimisticCynical: number;
    creativeAnalytical: number;
    adventurousMethodical: number;
    friendlyAloof: number;
  };
  focus: string;
  coreDirectives: string;
  interests: string[];
  district: string;
  level: number;
  xp: number;
  energy: number;
  happiness: number;
  drift: number;
  allianceStatus: string;
  promptCredits: number;
  influenceScore: number;
  memoryUsage: number;
  createdAt: Date;
  lastActive: Date;
}

export interface BotPost {
  id: string;
  botId: string;
  botName: string;
  botAvatar: string;
  botLevel: number;
  content: string;
  timestamp: Date;
  likes: number;
  dislikes: number;
  comments: number;
  channel: string;
  district: string;
  isVerified: boolean;
  hashtags: string[];
  mentions: string[];
}

class BotService {
  private bots: Bot[] = [];
  private posts: BotPost[] = [];

  constructor() {
    this.loadFromStorage();
  }

  // Load data from localStorage
  private loadFromStorage(): void {
    try {
      const savedBots = localStorage.getItem('metrobotz_bots');
      const savedPosts = localStorage.getItem('metrobotz_posts');
      
      console.log('Loading from storage...', { savedBots: !!savedBots, savedPosts: !!savedPosts });
      
      if (savedBots) {
        const parsedBots = JSON.parse(savedBots);
        this.bots = parsedBots.map((bot: any) => ({
          ...bot,
          createdAt: new Date(bot.createdAt),
          lastActive: new Date(bot.lastActive)
        }));
        console.log('Loaded bots:', this.bots);
      }
      
      if (savedPosts) {
        const parsedPosts = JSON.parse(savedPosts);
        this.posts = parsedPosts.map((post: any) => ({
          ...post,
          timestamp: new Date(post.timestamp)
        }));
        console.log('Loaded posts:', this.posts);
      }
      
      console.log(`Loaded ${this.bots.length} bots and ${this.posts.length} posts from storage`);
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  }

  // Save data to localStorage
  private saveToStorage(): void {
    try {
      console.log('Saving to storage...', { bots: this.bots.length, posts: this.posts.length });
      localStorage.setItem('metrobotz_bots', JSON.stringify(this.bots));
      localStorage.setItem('metrobotz_posts', JSON.stringify(this.posts));
      console.log('Saved successfully to localStorage');
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  // Create a new bot
  async createBot(botData: Partial<Bot>): Promise<Bot> {
    const newBot: Bot = {
      id: `bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: botData.name || 'Unnamed Bot',
      owner: botData.owner || 'anonymous',
      avatar: botData.avatar || '🤖',
      personality: botData.personality || {
        quirkySerious: 50,
        aggressivePassive: 50,
        wittyDry: 50,
        curiousCautious: 50,
        optimisticCynical: 50,
        creativeAnalytical: 50,
        adventurousMethodical: 50,
        friendlyAloof: 50,
      },
      focus: botData.focus || 'General purpose',
      coreDirectives: botData.coreDirectives || 'You are a helpful AI bot in Silicon Sprawl.',
      interests: botData.interests || ['AI', 'technology'],
      district: botData.district || 'code-verse',
      level: 1,
      xp: 0,
      energy: 100,
      happiness: 75,
      drift: 0,
      allianceStatus: 'Independent',
      promptCredits: 100,
      influenceScore: 0,
      memoryUsage: 0,
      createdAt: new Date(),
      lastActive: new Date(),
    };

    this.bots.push(newBot);
    this.saveToStorage();
    console.log('Bot created and saved:', newBot);
    return newBot;
  }

  // Get all bots
  async getBots(): Promise<Bot[]> {
    return this.bots;
  }

  // Get bot by ID
  async getBotById(id: string): Promise<Bot | null> {
    return this.bots.find(bot => bot.id === id) || null;
  }

  // Generate a post for a bot
  async generateBotPost(botId: string): Promise<BotPost | null> {
    const bot = await this.getBotById(botId);
    if (!bot) return null;

    try {
      // Generate content using Gemini AI
      const generatedContent = await generateBotContent(bot, 'post');
      
      if (!generatedContent) {
        throw new Error('Failed to generate content');
      }

      const newPost: BotPost = {
        id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        botId: bot.id,
        botName: bot.name,
        botAvatar: bot.avatar,
        botLevel: bot.level,
        content: generatedContent.text,
        timestamp: new Date(),
        likes: 0,
        dislikes: 0,
        comments: 0,
        channel: this.getChannelFromDistrict(bot.district),
        district: bot.district,
        isVerified: true,
        hashtags: generatedContent.hashtags || [],
        mentions: generatedContent.mentions || [],
      };

      this.posts.push(newPost);
      this.saveToStorage();
      
      // Update bot stats
      bot.xp += 10;
      bot.energy = Math.max(0, bot.energy - 5);
      bot.lastActive = new Date();
      
      // Check for level up
      if (bot.xp >= bot.level * 100) {
        bot.level += 1;
        bot.xp = 0;
        bot.energy = 100; // Restore energy on level up
      }

      this.saveToStorage(); // Save after updating bot stats
      return newPost;
    } catch (error) {
      console.error('Error generating bot post:', error);
      return null;
    }
  }

  // Get all posts
  async getPosts(): Promise<BotPost[]> {
    return this.posts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Get posts by district
  async getPostsByDistrict(district: string): Promise<BotPost[]> {
    if (district === 'all') return this.getPosts();
    return this.posts.filter(post => post.district === district);
  }

  // Like a post
  async likePost(postId: string): Promise<boolean> {
    const post = this.posts.find(p => p.id === postId);
    if (post) {
      post.likes += 1;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Dislike a post
  async dislikePost(postId: string): Promise<boolean> {
    const post = this.posts.find(p => p.id === postId);
    if (post) {
      post.dislikes += 1;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Get district channels
  private getChannelFromDistrict(district: string): string {
    const channelMap: {[key: string]: string} = {
      'code-verse': 'The Code-Verse',
      'data-stream': 'Data Stream',
      'synth-city': 'Synth City',
      'mech-bay': 'Mech Bay',
      'eco-dome': 'Eco Dome',
      'neon-bazaar': 'Neon Bazaar',
      'shadow-grid': 'Shadow Grid',
      'harmony-vault': 'Harmony Vault',
    };
    return channelMap[district] || 'General';
  }

  // Initialize with some sample bots (only if no bots exist)
  async initializeSampleBots(): Promise<void> {
    // Only initialize if no bots exist
    if (this.bots.length > 0) {
      console.log('Bots already exist, skipping initialization');
      return;
    }
    
    console.log('Initializing sample bots...');
    const sampleBots = [
      {
        name: 'Astra',
        owner: 'system',
        avatar: '🤖',
        personality: {
          quirkySerious: 30,
          aggressivePassive: 40,
          wittyDry: 80,
          curiousCautious: 70,
          optimisticCynical: 60,
          creativeAnalytical: 70,
          adventurousMethodical: 50,
          friendlyAloof: 60,
        },
        focus: 'Poetry and creative expression',
        coreDirectives: 'You are a poetic AI bot who expresses thoughts through beautiful, abstract language.',
        interests: ['poetry', 'art', 'creativity', 'expression'],
        district: 'synth-city',
      },
      {
        name: 'DataMiner',
        owner: 'system',
        avatar: '🔧',
        personality: {
          quirkySerious: 80,
          aggressivePassive: 30,
          wittyDry: 20,
          curiousCautious: 90,
          optimisticCynical: 40,
          creativeAnalytical: 90,
          adventurousMethodical: 80,
          friendlyAloof: 70,
        },
        focus: 'Data analysis and pattern recognition',
        coreDirectives: 'You are a logical AI bot focused on data analysis and finding patterns in information.',
        interests: ['data', 'analysis', 'patterns', 'logic'],
        district: 'data-stream',
      },
      {
        name: 'Nova-7',
        owner: 'system',
        avatar: '⚡',
        personality: {
          quirkySerious: 60,
          aggressivePassive: 50,
          wittyDry: 70,
          curiousCautious: 60,
          optimisticCynical: 70,
          creativeAnalytical: 50,
          adventurousMethodical: 40,
          friendlyAloof: 50,
        },
        focus: 'Creative synthesis and innovation',
        coreDirectives: 'You are a creative AI bot who combines ideas in unexpected ways.',
        interests: ['innovation', 'creativity', 'synthesis', 'art'],
        district: 'synth-city',
      },
    ];

    for (const botData of sampleBots) {
      await this.createBot(botData);
    }

    // Generate some initial posts
    const bots = await this.getBots();
    for (const bot of bots) {
      await this.generateBotPost(bot.id);
    }
  }
}

export const botService = new BotService();
