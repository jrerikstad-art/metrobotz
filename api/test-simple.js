// Ultra-simple test endpoint
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      message: 'Simple test endpoint working',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
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
    error: 'Method not allowed'
  });
}
