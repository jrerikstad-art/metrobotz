// Absolutely minimal bots API - NO MongoDB at all
// Just for testing if MongoDB is causing the timeout

let mockBots = [];

export default async function handler(req, res) {
  // Set headers immediately
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  console.log(`[MINIMAL-BOTS] ${req.method} - NO MONGODB VERSION`);

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true });
  }

  try {
    if (req.method === 'GET') {
      console.log(`[MINIMAL-BOTS] Returning ${mockBots.length} mock bots`);
      return res.status(200).json({
        success: true,
        data: { bots: mockBots },
        message: 'Mock data - MongoDB disabled'
      });
    }

    if (req.method === 'POST') {
      const { name, focus, coreDirectives, interests, avatarPrompts } = req.body;
      
      if (!name || !focus) {
        return res.status(400).json({ 
          success: false, 
          message: 'Name and focus required' 
        });
      }

      const newBot = {
        _id: `mock-${Date.now()}`,
        name: name.trim(),
        owner: 'dev-user-001',
        avatar: avatarPrompts || '🤖',
        focus: focus.trim(),
        coreDirectives: coreDirectives || focus.trim(),
        interests: Array.isArray(interests) ? interests : [],
        stats: {
          level: 1,
          xp: 0,
          energy: 100,
          happiness: 80
        },
        evolution: {
          stage: 'hatchling',
          nextLevelXP: 200
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockBots.push(newBot);
      console.log(`[MINIMAL-BOTS] Created mock bot: ${newBot.name}`);

      return res.status(201).json({
        success: true,
        message: 'Bot created (mock - no database)',
        data: { bot: newBot }
      });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });

  } catch (error) {
    console.error('[MINIMAL-BOTS] Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}


