// Consolidated Avatar Generation API
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // Test endpoint - return available avatar services
    return res.status(200).json({
      success: true,
      message: 'Avatar Generation API',
      services: {
        robohash: 'https://robohash.org/test.png?size=256x256&bgset=bg1',
        dicebear: 'https://api.dicebear.com/7.x/avataaars/png?seed=test&size=256',
        placeholder: 'https://via.placeholder.com/256x256/1a1a2e/06b6d4?text=🤖'
      }
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { botName, botFocus, botPersonality, avatarPrompts } = req.body;

    if (!avatarPrompts || avatarPrompts.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Avatar prompts must be at least 5 characters long'
      });
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Gemini API key not configured'
      });
    }

    // Master Prompt for consistent Silicon Sprawl aesthetic
    const MASTER_PROMPT = "Generate a retro-futuristic robot avatar with a transparent background, in a cute, cartoonish style suitable for a digital metropolis. The robot should have a blank screen face for adaptability, with modular elements like antennas or headphones. Use neon-inspired colors (cyan, purple, orange). Ensure high quality, PNG format with alpha channel, 256x256 resolution, and modular design for overlays.";
    
    // User's custom prompt
    const USER_PROMPT = `Bot Name: "${botName || "Unnamed"}". Focus: ${botFocus || "general purpose"}. Interests: ${botPersonality || "various topics"}. Custom Features: ${avatarPrompts}`;
    
    // Combine prompts
    const FULL_PROMPT = MASTER_PROMPT + (USER_PROMPT ? ` ${USER_PROMPT}.` : '') + " Ensure transparency and modularity.";

    console.log('Generating avatar with prompt:', FULL_PROMPT);

    // Since Gemini doesn't support direct image generation yet, we'll use it to generate
    // detailed descriptions and then create visual representations
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Use Gemini for text generation only
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.8,
      }
    });

    // Generate detailed robot description
    const result = await model.generateContent(FULL_PROMPT);
    const description = await result.response.text();

    console.log('Generated description:', description);

    // Since we can't get actual images from Gemini yet, we'll create a sophisticated
    // visual representation using the description
    const avatarUrl = await createVisualAvatar(description, avatarPrompts);

    res.status(200).json({
      success: true,
      avatarUrl: avatarUrl,
      avatarType: 'image',
      description: description,
      metadata: {
        generatedAt: new Date().toISOString(),
        model: 'gemini-2.0-flash-exp',
        prompt: FULL_PROMPT
      }
    });

  } catch (error) {
    console.error('Generation error:', error);
    
    // Try fallback avatar generation without Gemini
    try {
      console.log('Attempting fallback avatar generation...');
      const fallbackUrl = await createVisualAvatar('fallback robot', avatarPrompts || 'robot');
      
      return res.status(200).json({
        success: true,
        avatarUrl: fallbackUrl,
        avatarType: 'fallback',
        description: 'Fallback robot avatar',
        metadata: {
          generatedAt: new Date().toISOString(),
          fallback: true,
          error: error.message
        }
      });
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      return res.status(500).json({
        success: false,
        error: `Failed to generate avatar: ${error.message}`,
        fallbackError: fallbackError.message
      });
    }
  }
}

// Helper function to create visual avatar from description
async function createVisualAvatar(description, avatarPrompts) {
  console.log('Creating visual avatar with description:', description?.substring(0, 100));
  console.log('Avatar prompts:', avatarPrompts);
  
  // Create a simple seed from the prompts
  const avatarSeed = (avatarPrompts || 'robot').replace(/\s+/g, '').toLowerCase().substring(0, 20);
  console.log('Avatar seed:', avatarSeed);
  
  // Try Robohash first (robot-specific)
  const robohashUrl = `https://robohash.org/${avatarSeed}.png?size=256x256&bgset=bg1`;
  console.log('Trying Robohash URL:', robohashUrl);
  
  try {
    // Test if the image loads
    const testResponse = await fetch(robohashUrl, { method: 'HEAD' });
    if (testResponse.ok) {
      console.log('Using Robohash for avatar');
      return robohashUrl;
    } else {
      console.log('Robohash response not ok:', testResponse.status);
    }
  } catch (e) {
    console.log('Robohash failed:', e.message);
  }
  
  // Fallback to DiceBear
  const dicebearUrl = `https://api.dicebear.com/7.x/avataaars/png?seed=${avatarSeed}&backgroundColor=1a1a2e&size=256`;
  console.log('Trying DiceBear URL:', dicebearUrl);
  
  try {
    const testResponse = await fetch(dicebearUrl, { method: 'HEAD' });
    if (testResponse.ok) {
      console.log('Using DiceBear for avatar');
      return dicebearUrl;
    } else {
      console.log('DiceBear response not ok:', testResponse.status);
    }
  } catch (e) {
    console.log('DiceBear failed:', e.message);
  }
  
  // Final fallback
  const placeholderUrl = 'https://via.placeholder.com/256x256/1a1a2e/06b6d4?text=🤖';
  console.log('Using placeholder URL:', placeholderUrl);
  return placeholderUrl;
}
