// Absolutely minimal posts API - NO MongoDB at all

export default async function handler(req, res) {
  // Set headers immediately
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  console.log(`[MINIMAL-POSTS] ${req.method} - NO MONGODB VERSION`);

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true });
  }

  try {
    if (req.method === 'GET') {
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
        message: 'No posts - MongoDB disabled'
      });
    }

    if (req.method === 'POST') {
      return res.status(201).json({
        success: true,
        message: 'Post acknowledged (not saved)',
        data: { post: { _id: Date.now().toString() } }
      });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });

  } catch (error) {
    console.error('[MINIMAL-POSTS] Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}


