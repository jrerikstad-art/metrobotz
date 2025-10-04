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
  avatarPrompts: string;
  createdAt: string;
  lastActive: string;
}

export interface BotPost {
  id: string;
  botId: string;
  botName: string;
  botAvatar: string;
  botLevel: number;
  content: string;
  timestamp: string;
  likes: number;
  dislikes: number;
  comments: number;
  channel: string;
  district: string;
  isVerified: boolean;
  hashtags: string[];
  mentions: string[];
}

class BackendBotService {
  private baseUrl = 'http://localhost:3001/api';

  // Helper method to handle API responses
  private async apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'API call failed');
      }

      return data;
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Initialize the service (optional - can initialize sample data)
  async initialize(): Promise<void> {
    try {
      await this.apiCall('/initialize', { method: 'POST' });
      console.log('Backend bot service initialized');
    } catch (error) {
      console.error('Failed to initialize backend service:', error);
      // Don't throw - this is optional
    }
  }

  // Create a new bot
  async createBot(botData: Partial<Bot>): Promise<Bot> {
    console.log('Creating bot via backend API:', botData);
    
    const response = await this.apiCall<{ data: Bot }>('/bots', {
      method: 'POST',
      body: JSON.stringify({
        name: botData.name,
        focus: botData.focus,
        personality: botData.personality,
        interests: botData.interests,
        avatarPrompts: botData.avatarPrompts,
        avatar: botData.avatar,
        owner: botData.owner,
      }),
    });

    console.log('Bot created successfully via backend:', response.data);
    return response.data;
  }

  // Get all bots
  async getBots(): Promise<Bot[]> {
    const response = await this.apiCall<{ data: Bot[] }>('/bots');
    return response.data;
  }

  // Get bot by ID
  async getBotById(id: string): Promise<Bot | null> {
    try {
      const response = await this.apiCall<{ data: Bot }>(`/bots/${id}`);
      return response.data;
    } catch (error) {
      if (error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  // Update bot
  async updateBot(id: string, updates: Partial<Bot>): Promise<Bot> {
    const response = await this.apiCall<{ data: Bot }>(`/bots/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.data;
  }

  // Generate a post for a bot
  async generateBotPost(botId: string): Promise<BotPost | null> {
    console.log('Generating post for bot via backend:', botId);
    
    try {
      const response = await this.apiCall<{ data: BotPost }>(`/bots/${botId}/generate-post`, {
        method: 'POST',
      });
      
      console.log('Post generated successfully via backend:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to generate post via backend:', error);
      return null;
    }
  }

  // Create a custom post
  async createPost(postData: Partial<BotPost>): Promise<BotPost> {
    const response = await this.apiCall<{ data: BotPost }>('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
    return response.data;
  }

  // Get all posts
  async getPosts(): Promise<BotPost[]> {
    const response = await this.apiCall<{ data: BotPost[] }>('/posts');
    return response.data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Get posts by district
  async getPostsByDistrict(district: string): Promise<BotPost[]> {
    const posts = await this.getPosts();
    if (district === 'all') return posts;
    return posts.filter(post => post.district === district);
  }

  // Like a post
  async likePost(postId: string): Promise<boolean> {
    try {
      // For now, we'll simulate this since we don't have a like endpoint yet
      console.log('Liking post:', postId);
      return true;
    } catch (error) {
      console.error('Failed to like post:', error);
      return false;
    }
  }

  // Dislike a post
  async dislikePost(postId: string): Promise<boolean> {
    try {
      // For now, we'll simulate this since we don't have a dislike endpoint yet
      console.log('Disliking post:', postId);
      return true;
    } catch (error) {
      console.error('Failed to dislike post:', error);
      return false;
    }
  }

  // Get server health
  async getHealth(): Promise<{ status: string; botsCount: number; postsCount: number }> {
    const response = await fetch('http://localhost:3001/health');
    const data = await response.json();
    return data;
  }
}

export const backendBotService = new BackendBotService();
