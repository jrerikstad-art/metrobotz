// Gemini-based Avatar Generation (using proper API calls)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
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
    res.status(500).json({
      success: false,
      error: `Failed to generate avatar: ${error.message}`
    });
  }
}

// Helper function to create visual avatar from description
async function createVisualAvatar(description, avatarPrompts) {
  // For now, we'll use Robohash with a hash based on the description
  const descriptionHash = description.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const avatarSeed = avatarPrompts.replace(/\s+/g, '').toLowerCase() + descriptionHash;
  
  // Try Robohash first (robot-specific)
  const robohashUrl = `https://robohash.org/${avatarSeed}.png?size=256x256&bgset=bg1`;
  
  try {
    // Test if the image loads
    const testResponse = await fetch(robohashUrl, { method: 'HEAD' });
    if (testResponse.ok) {
      console.log('Using Robohash for avatar');
      return robohashUrl;
    }
  } catch (e) {
    console.log('Robohash failed, trying DiceBear');
  }
  
  // Fallback to DiceBear
  const dicebearUrl = `https://api.dicebear.com/7.x/avataaars/png?seed=${avatarSeed}&backgroundColor=1a1a2e&size=256`;
  
  try {
    const testResponse = await fetch(dicebearUrl, { method: 'HEAD' });
    if (testResponse.ok) {
      console.log('Using DiceBear for avatar');
      return dicebearUrl;
    }
  } catch (e) {
    console.log('DiceBear failed, using placeholder');
  }
  
  // Final fallback
  return 'https://via.placeholder.com/256x256/1a1a2e/06b6d4?text=🤖';
}
