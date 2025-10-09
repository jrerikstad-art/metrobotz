// Ultra-safe posts API with guaranteed JSON responses
export default async function handler(req, res) {
  // FIRST THING: Set Content-Type to JSON
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  console.log(`[SAFE-POSTS] ${req.method} request received`);

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true });
  }

  try {
    if (req.method === 'GET') {
      // Return empty posts array for now (no database errors)
      console.log('[SAFE-POSTS] Returning empty posts (database disabled)');
      return res.status(200).json({ 
        success: true,
        data: {
          posts: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalPosts: 0,
            hasNext: false,
            hasPrev: false
          }
        },
        message: 'Posts API in safe mode - database disabled'
      });
    }

    if (req.method === 'POST') {
      // Accept post creation but don't save (for now)
      console.log('[SAFE-POSTS] Post creation disabled in safe mode');
      return res.status(201).json({
        success: true,
        message: 'Post acknowledged (safe mode - not saved)',
        data: { post: { _id: Date.now().toString(), ...req.body } }
      });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });

  } catch (error) {
    console.error('[SAFE-POSTS] Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
}

