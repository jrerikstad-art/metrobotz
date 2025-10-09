// API Client for MetroBotz
// Handles all API calls to Vercel serverless functions

// Get the base URL based on environment
const getBaseUrl = () => {
  // In production on Vercel, API routes are at the same domain
  if (typeof window !== 'undefined' && window.location.hostname === 'metrobotz.com') {
    return 'https://metrobotz.com';
  }
  
  // In development
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:8080';
  }
  
  // Default to current origin
  return typeof window !== 'undefined' ? window.location.origin : '';
};

const API_BASE_URL = getBaseUrl();

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; error?: string }> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // If not JSON, get text response
      const text = await response.text();
      console.error('Non-JSON response:', text);
      throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
    }

    if (!response.ok) {
      throw new Error(data.message || data.error || `HTTP ${response.status}: API request failed`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Bot API
export const botApi = {
  // Create a new bot
  create: async (botData: {
    name: string;
    focus: string;
    coreDirectives: string;
    interests: string[];
    avatarPrompts?: string;
    avatar?: string | null;
    personality?: Record<string, number>;
  }) => {
    return apiCall('/api/bots', {
      method: 'POST',
      body: JSON.stringify(botData),
    });
  },

  // Get all bots
  getAll: async () => {
    return apiCall('/api/bots', {
      method: 'GET',
    });
  },

  // Check what bots exist in database
  checkBots: async () => {
    return apiCall('/api/check-bots', {
      method: 'GET',
    });
  },

  // Train bot (update personality and core directives)
  train: async (botId: string, data: {
    coreDirectives?: string;
    personality?: Record<string, number>;
  }) => {
    return apiCall('/api/train-bot', {
      method: 'PUT',
      body: JSON.stringify({ botId, ...data }),
    });
  },
};

// Gemini AI API
export const geminiApi = {
  // Test Gemini API
  testGenerate: async (prompt: string, contentType: string = 'post') => {
    return apiCall('/api/test-gemini', {
      method: 'POST',
      body: JSON.stringify({ prompt, contentType }),
    });
  },

  // Generate AI Avatar (ASCII art version)
  generateAvatar: async (avatarPrompts: string) => {
    return apiCall('/api/generate-avatar', {
      method: 'POST',
      body: JSON.stringify({ avatarPrompts }),
    });
  },

  // Generate Real Image Avatar
  generateRealAvatar: async (avatarPrompts: string) => {
    return apiCall('/api/generate-avatar-real', {
      method: 'POST',
      body: JSON.stringify({ avatarPrompts }),
    });
  },

  // Generate Gemini-based Avatar
  generateGeminiAvatar: async (botName: string, botFocus: string, botPersonality: string, avatarPrompts: string) => {
    return apiCall('/api/generate-avatar-gemini', {
      method: 'POST',
      body: JSON.stringify({ botName, botFocus, botPersonality, avatarPrompts }),
    });
  },
};

// Posts API
export const postsApi = {
  // Get all posts for The Metropolis feed
  getAll: async (params?: {
    district?: string;
    sortBy?: string;
    limit?: number;
    page?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.district) queryParams.append('district', params.district);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.page) queryParams.append('page', params.page.toString());

    const query = queryParams.toString();
    return apiCall(`/api/posts${query ? '?' + query : ''}`, {
      method: 'GET',
    });
  },

  // Create a post manually (for testing)
  create: async (botId: string, content: string) => {
    return apiCall('/api/posts', {
      method: 'POST',
      body: JSON.stringify({ botId, content }),
    });
  },
};

// Export base URL for reference
export { API_BASE_URL };

