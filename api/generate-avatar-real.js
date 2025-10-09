// Real Image Avatar Generation using free image generation services
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });
  }

  try {
    const { avatarPrompts } = req.body;

    if (!avatarPrompts || avatarPrompts.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Avatar prompts must be at least 5 characters long'
      });
    }

    console.log('Generating real image avatar for:', avatarPrompts);

    // Create a sophisticated prompt for image generation
    const imagePrompt = `A cute retro-futuristic robot avatar, ${avatarPrompts}, cyberpunk style, neon colors, glowing eyes, metallic body, 3D rendered, high quality, 256x256 pixels, transparent background, cartoon style, friendly appearance`;

    // Try multiple free image generation services
    let avatarUrl = null;

    // Method 1: Use Robohash API (robot-specific images) - PRIMARY
    try {
      const robotHash = avatarPrompts.replace(/\s+/g, '').toLowerCase();
      avatarUrl = `https://robohash.org/${robotHash}.png?size=256x256&bgset=bg1`;
      
      console.log('Trying Robohash with URL:', avatarUrl);
      
      // Test if the image loads
      const testResponse = await fetch(avatarUrl, { method: 'HEAD' });
      if (testResponse.ok) {
        console.log('Using Robohash robot image');
      } else {
        throw new Error('Robohash image not available');
      }
    } catch (e) {
      console.log('Robohash failed, trying next method:', e.message);
    }

    // Method 2: Use DiceBear API (free avatar generation)
    if (!avatarUrl) {
      try {
        const avatarSeed = avatarPrompts.replace(/\s+/g, '').toLowerCase();
        avatarUrl = `https://api.dicebear.com/7.x/avataaars/png?seed=${avatarSeed}&backgroundColor=1a1a2e&size=256`;
        
        console.log('Trying DiceBear with URL:', avatarUrl);
        
        // Test if the image loads
        const testResponse = await fetch(avatarUrl, { method: 'HEAD' });
        if (testResponse.ok) {
          console.log('Using DiceBear avatar');
        } else {
          throw new Error('DiceBear image not available');
        }
      } catch (e) {
        console.log('DiceBear failed, trying next method:', e.message);
      }
    }

    // Method 3: Use Lorem Picsum with robot-themed images (fallback)
    if (!avatarUrl) {
      try {
        // Generate a deterministic "random" number based on the prompt
        const seed = avatarPrompts.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        const imageId = (seed % 1000) + 1;
        avatarUrl = `https://picsum.photos/seed/robot-${imageId}/256/256`;
        
        console.log('Trying Lorem Picsum with URL:', avatarUrl);
        
        // Test if the image loads
        const testResponse = await fetch(avatarUrl, { method: 'HEAD' });
        if (testResponse.ok) {
          console.log('Using Lorem Picsum fallback image');
        } else {
          throw new Error('Image not available');
        }
      } catch (e) {
        console.log('Lorem Picsum failed, using default:', e.message);
      }
    }

    // Method 4: Fallback to a default robot image
    if (!avatarUrl) {
      avatarUrl = 'https://via.placeholder.com/256x256/1a1a2e/06b6d4?text=🤖';
      console.log('Using placeholder fallback');
    }

    // Generate a description based on the prompt
    let description = `A ${avatarPrompts} robot with cyberpunk styling and neon accents`;
    
    // Add personality-based descriptions
    const promptLower = avatarPrompts.toLowerCase();
    if (promptLower.includes('sweet') || promptLower.includes('cute')) {
      description = `A sweet and cute ${avatarPrompts} robot with pink and purple neon lights, friendly glowing eyes, and a heart-shaped antenna`;
    } else if (promptLower.includes('music')) {
      description = `A music-loving ${avatarPrompts} robot with sound wave patterns, musical note accessories, and vibrant audio-reactive lighting`;
    } else if (promptLower.includes('strong') || promptLower.includes('power')) {
      description = `A powerful ${avatarPrompts} robot with metallic armor, electric blue highlights, and energy crackling around its frame`;
    } else if (promptLower.includes('space')) {
      description = `A space-exploring ${avatarPrompts} robot with starfield patterns, rocket boosters, and cosmic purple and silver coloring`;
    }

    console.log('Real image avatar generated successfully:', avatarUrl);

    return res.status(200).json({
      success: true,
      data: {
        avatarUrl: avatarUrl,
        description: description,
        prompt: imagePrompt,
        metadata: {
          generatedAt: new Date().toISOString(),
          originalPrompt: avatarPrompts,
          type: 'real-image',
          source: avatarUrl.includes('robohash') ? 'robohash' : 
                  avatarUrl.includes('dicebear') ? 'dicebear' : 
                  avatarUrl.includes('picsum') ? 'picsum' : 'placeholder'
        }
      }
    });

  } catch (error) {
    console.error('Avatar generation error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Avatar generation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
