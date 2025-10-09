// Ultra-simple bots API - absolutely guaranteed to work
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
      return res.status(200).json({
        success: true,
        data: {
          bots: [
            {
              _id: 'ultra-simple-bot',
              name: 'Ultra Simple Bot',
              focus: 'This is a test bot from ultra-simple API',
              avatar: '🤖',
              owner: 'dev-user-001',
              isActive: true,
              createdAt: new Date().toISOString(),
              source: 'ultra-simple-api'
            }
          ]
        },
        count: 1,
        source: 'ultra-simple-api'
      });
    }

    if (req.method === 'POST') {
      const { name, focus } = req.body;
      
      // Minimal validation
      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Name is required'
        });
      }

      // Create ultra-simple bot
      const newBot = {
        _id: `ultra-simple-${Date.now()}`,
        name: name.trim() || 'Untitled Bot',
        focus: focus?.trim() || 'No focus specified',
        avatar: '🤖',
        owner: 'dev-user-001',
        isActive: true,
        createdAt: new Date().toISOString(),
        source: 'ultra-simple-api'
      };

      return res.status(201).json({
        success: true,
        message: 'Bot created successfully (ultra-simple mode)',
        data: { bot: newBot },
        source: 'ultra-simple-api'
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error) {
    console.error('Ultra-simple API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}
