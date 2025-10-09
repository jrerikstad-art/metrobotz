// Simple test endpoint to verify bots API is working
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true, message: 'CORS preflight' });
  }

  try {
    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        message: 'Bots API test endpoint working',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        hasMongoUri: !!process.env.MONGODB_URI,
        hasGeminiKey: !!process.env.GEMINI_API_KEY
      });
    }

    if (req.method === 'POST') {
      return res.status(200).json({
        success: true,
        message: 'POST request received',
        body: req.body,
        timestamp: new Date().toISOString()
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    return res.status(500).json({
      success: false,
      message: 'Test endpoint error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
