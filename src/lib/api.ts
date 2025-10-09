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
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'API request failed');
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

