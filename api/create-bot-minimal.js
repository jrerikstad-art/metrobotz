// Minimal bot creation - absolute simplest possible
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('Minimal bot creation called');
    
    const { name, focus } = req.body || {};
    
    const bot = {
      _id: `bot-${Date.now()}`,
      name: name || 'TestBot',
      focus: focus || 'Test focus',
      createdAt: new Date().toISOString()
    };

    console.log('Minimal bot created:', bot.name);

    return res.status(200).json({ 
      success: true, 
      message: 'Minimal bot created',
      data: { bot }
    });

  } catch (error) {
    console.error('Minimal bot creation error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Minimal bot creation failed',
      error: error.message
    });
  }
}
