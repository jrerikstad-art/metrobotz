// Simple test endpoint to verify API functionality
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const testData = {
      success: true,
      message: 'API is working correctly',
      timestamp: new Date().toISOString(),
      method: req.method,
      hasBody: !!req.body,
      bodyKeys: req.body ? Object.keys(req.body) : [],
      environment: {
        hasMongoUri: !!process.env.MONGODB_URI,
        hasGeminiKey: !!process.env.GEMINI_API_KEY,
        nodeEnv: process.env.NODE_ENV
      }
    };

    console.log('Test API called:', testData);

    return res.status(200).json(testData);

  } catch (error) {
    console.error('Test API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error.message
    });
  }
}
