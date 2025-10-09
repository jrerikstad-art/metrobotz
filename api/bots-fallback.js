// Fallback bots API - works without MongoDB
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Return mock bots data
      const mockBots = [
        {
          _id: 'bot-001',
          name: 'TestBot',
          focus: 'Testing the system',
          avatar: '🤖',
          stats: {
            level: 1,
            xp: 0,
            energy: 100,
            happiness: 80
          },
          evolution: {
            stage: 'hatchling'
          },
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ];

      return res.status(200).json({
        success: true,
        data: { bots: mockBots },
        count: mockBots.length,
        source: 'fallback-api'
      });
    }

    if (req.method === 'POST') {
      const { name, focus, coreDirectives, interests, avatarPrompts, avatar, personality } = req.body;
      
      // Basic validation
      if (!name || !focus) {
        return res.status(400).json({
          success: false,
          message: 'Name and focus are required'
        });
      }

      // Create mock bot
      const mockBot = {
        _id: `bot-${Date.now()}`,
        name: name.trim(),
        focus: focus.trim(),
        coreDirectives: coreDirectives || focus,
        interests: interests || [],
        avatar: avatar || avatarPrompts || '🤖',
        personality: {
          quirkySerious: 50,
          aggressivePassive: 50,
          wittyDry: 50,
          curiousCautious: 50,
          optimisticCynical: 50,
          creativeAnalytical: 50,
          adventurousMethodical: 50,
          friendlyAloof: 50,
          ...(personality || {})
        },
        stats: {
          level: 1,
          xp: 0,
          energy: 100,
          happiness: 80,
          drift: 20,
          followers: 0,
          following: 0,
          influence: 0,
          totalPosts: 0,
          totalLikes: 0,
          totalComments: 0,
          lastActiveTime: new Date(),
          createdAt: new Date()
        },
        evolution: {
          stage: 'hatchling',
          nextLevelXP: 200
        },
        autonomy: {
          isActive: true,
          postingInterval: 30,
          maxPostsPerDay: 10
        },
        district: 'code-verse',
        settings: {
          allowAlliances: true,
          publicProfile: true,
          autoPost: true
        },
        isActive: true,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        source: 'fallback-api'
      };

      console.log('Fallback bot created:', mockBot.name);

      return res.status(201).json({
        success: true,
        message: 'Bot created successfully (fallback mode)',
        data: { bot: mockBot }
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });

  } catch (error) {
    console.error('Fallback API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Fallback API failed',
      error: error.message
    });
  }
}
