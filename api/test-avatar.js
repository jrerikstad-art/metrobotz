// Test endpoint for avatar generation
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Test different avatar generation methods
    const testPrompts = ['sweet robot', 'music robot', 'strong robot'];
    
    const results = [];
    
    for (const prompt of testPrompts) {
      const robotHash = prompt.replace(/\s+/g, '').toLowerCase();
      const robohashUrl = `https://robohash.org/${robotHash}.png?size=256x256&bgset=bg1`;
      
      results.push({
        prompt,
        robohashUrl,
        testUrl: `https://robohash.org/test.png?size=256x256&bgset=bg1`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Avatar generation test',
      results,
      testUrls: {
        robohash: 'https://robohash.org/sweetrobot.png?size=256x256&bgset=bg1',
        dicebear: 'https://api.dicebear.com/7.x/avataaars/png?seed=sweetrobot&backgroundColor=1a1a2e&size=256',
        placeholder: 'https://via.placeholder.com/256x256/1a1a2e/06b6d4?text=🤖'
      }
    });

  } catch (error) {
    console.error('Test error:', error);
    return res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error.message
    });
  }
}
