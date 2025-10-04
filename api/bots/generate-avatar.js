export default async function handler(req, res) {
  // Set CORS headers
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

    // Master Prompt for consistent Silicon Sprawl aesthetic
    const MASTER_PROMPT = "Generate a detailed TEXT DESCRIPTION of a retro-futuristic robot avatar in a cute, cartoonish style suitable for a digital metropolis. The robot should have a blank screen face for adaptability, with modular elements like antennas or headphones. Use neon-inspired colors (cyan, purple, orange). Focus on the robot's appearance, materials, and design details.";
    
    // User's custom prompt for specific features
    const USER_PROMPT = `Bot Name: "${botName || "Unnamed"}". Focus: ${botFocus || "general purpose"}. Interests: ${botPersonality || "various topics"}. Custom Features: ${avatarPrompts}`;
    
    // Combine prompts
    const FULL_PROMPT = MASTER_PROMPT + (USER_PROMPT ? ` ${USER_PROMPT}.` : '') + " Ensure transparency and modularity.";
    
    console.log('Full prompt:', FULL_PROMPT);
    
    // Gemini API call for IMAGE GENERATION
    const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyBIvDRZTISaRtGNi4ozy2OVnFrgWvPgezc";
    console.log('Using API key:', API_KEY.substring(0, 10) + '...');
    
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: FULL_PROMPT
          }]
        }],
        generationConfig: {
          maxOutputTokens: 500
        }
      })
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status} ${geminiResponse.statusText} - ${errorText}`);
    }

    const data = await geminiResponse.json();
    console.log('Gemini API response:', JSON.stringify(data, null, 2));
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Invalid response structure:', data);
      throw new Error("Invalid response format from Gemini API");
    }

    // Extract the generated image data
    const imageData = data.candidates[0].content.parts[0];
    
    // Check if we got image data (base64 or URL)
    if (imageData.fileData && imageData.fileData.url) {
      // URL response
      res.status(200).json({
        success: true,
        avatarUrl: imageData.fileData.url,
        avatarType: 'image'
      });
    } else if (imageData.text && imageData.text.startsWith('data:image')) {
      // Base64 response
      res.status(200).json({
        success: true,
        avatarImage: imageData.text,
        avatarType: 'image'
      });
    } else {
      // Fallback to text description if image generation fails
      const avatarDescription = imageData.text || "A sleek cyberpunk robot with modular design and neon accents.";
      res.status(200).json({
        success: true,
        avatarDescription: avatarDescription.trim(),
        avatarType: 'text'
      });
    }

  } catch (error) {
    console.error('Avatar generation error:', error);
    console.error('Error stack:', error.stack);
    console.error('Request body:', req.body);
    
    res.status(500).json({
      success: false,
      error: `Failed to generate avatar: ${error.message}`,
      details: error.stack // Include stack trace for debugging
    });
  }
}
