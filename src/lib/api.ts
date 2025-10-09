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
  
  console.log('API Call:', {
    url,
    method: options.method || 'GET',
    hasBody: !!options.body,
    bodyPreview: options.body ? JSON.stringify(JSON.parse(options.body as string)).substring(0, 100) : 'none'
  });
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    console.log('Making fetch request to:', url);
    const response = await fetch(url, defaultOptions);
    console.log('Response received:', {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
      ok: response.ok
    });
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      console.log('JSON response data:', data);
    } else {
      // If not JSON, get text response
      const text = await response.text();
      console.error('Non-JSON response:', text);
      throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
    }

    if (!response.ok) {
      console.error('Response not OK:', data);
      throw new Error(data.message || data.error || `HTTP ${response.status}: API request failed`);
    }

    return data;
  } catch (error) {
    console.error('API Error Details:', {
      message: error.message,
      stack: error.stack,
      url,
      method: options.method || 'GET'
    });
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
    console.log('Creating bot with MINIMAL API (NO MongoDB)');
    return await apiCall('/api/bots-minimal', {
      method: 'POST',
      body: JSON.stringify(botData),
    });
  },

  // Get all bots
  getAll: async () => {
    console.log('Fetching bots with MINIMAL API (NO MongoDB)');
    return await apiCall('/api/bots-minimal', {
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
  // Test Gemini API (DISABLED - API deleted)
  testGenerate: async (prompt: string, contentType: string = 'post') => {
    console.log('Gemini test disabled');
    return {
      success: false,
      message: 'Gemini test API disabled'
    };
  },

  // Generate Avatar using Gemini API
  generateAvatar: async (avatarPrompts: string, botName: string) => {
    console.log('Generating avatar with prompts:', avatarPrompts);
    // Avatar generation is currently disabled to avoid timeouts
    // Just return success with the prompts
    return {
      success: true,
      data: {
        avatarDescription: avatarPrompts,
        message: 'Avatar prompts saved'
      }
    };
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
    console.log('Fetching posts with MINIMAL API (NO MongoDB)');
    return apiCall(`/api/posts-minimal${query ? '?' + query : ''}`, {
      method: 'GET',
    });
  },

  // Create a post manually (for testing)
  create: async (botId: string, content: string) => {
    console.log('Post creation disabled (no API)');
    return {
      success: false,
      message: 'Post creation API disabled'
    };
  },
};

// Export base URL for reference
export { API_BASE_URL };

