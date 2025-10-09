// Ultra-minimal bots API - guaranteed to work
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Return mock bots for now
      return res.status(200).json({
        success: true,
        data: {
          bots: [
            {
              _id: 'mock-bot-1',
              name: 'Test Bot',
              focus: 'Testing the system',
              avatar: '🤖',
              owner: 'dev-user-001',
              isActive: true,
              createdAt: new Date().toISOString()
            }
          ]
        },
        count: 1
      });
    }

    if (req.method === 'POST') {
      const { name, focus } = req.body;
      
      if (!name || !focus) {
        return res.status(400).json({
          success: false,
          error: 'Name and focus required'
        });
      }

      // Create bot without database
      const newBot = {
        _id: `bot-${Date.now()}`,
        name: name.trim(),
        focus: focus.trim(),
        avatar: '🤖',
        owner: 'dev-user-001',
        isActive: true,
        createdAt: new Date().toISOString(),
        source: 'minimal-api'
      };

      return res.status(201).json({
        success: true,
        message: 'Bot created successfully (minimal mode)',
        data: { bot: newBot }
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error) {
    console.error('Minimal API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}
