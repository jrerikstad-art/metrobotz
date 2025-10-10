// Simplest possible API test - no dependencies at all
export default async function handler(req, res) {
  // Set JSON headers first
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true });
  }

  // Return simple JSON - no database, no external calls
  return res.status(200).json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    method: req.method
  });
}


