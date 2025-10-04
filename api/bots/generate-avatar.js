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
    const MASTER_PROMPT = "Generate a retro-futuristic robot avatar with a transparent background, in a cute, cartoonish style suitable for a digital metropolis. Ensure high quality, PNG format with alpha channel, 256x256 resolution, and modular design for overlays.";
    
    // User's custom prompt for specific features
    const USER_PROMPT = `Bot Name: "${botName || "Unnamed"}". Focus: ${botFocus || "general purpose"}. Interests: ${botPersonality || "various topics"}. Custom Features: ${avatarPrompts}`;
    
    // Combine prompts
    const FULL_PROMPT = MASTER_PROMPT + (USER_PROMPT ? ` ${USER_PROMPT}.` : '') + " Ensure transparency and modularity.";
    
    // Call Gemini API for TEXT DESCRIPTION (since image generation might not be available)
    const API_KEY = "AIzaSyBIvDRZTISaRtGNi4ozy2OVnFrgWvPgezc";
    
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: FULL_PROMPT + `
            
            IMPORTANT: Generate a detailed TEXT DESCRIPTION of this robot avatar, NOT an image. 
            Focus on:
            - Single robot figure, isolated and centered
            - Specific integration of the custom features into the robot's design
            - Materials, colors, and mechanical details
            - Modular components and cyberpunk aesthetic
            - 150-250 words maximum
            - NO backgrounds, environments, or external scenes
            - Describe how the custom features are integrated into the robot's form`
          }]
        }]
      })
    });

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status} ${geminiResponse.statusText}`);
    }

    const data = await geminiResponse.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error("Invalid response format from Gemini API");
    }

    // Extract the generated text description
    const avatarDescription = data.candidates[0].content.parts[0].text;
    
    res.status(200).json({
      success: true,
      avatarDescription: avatarDescription.trim(),
      avatarType: 'text' // Indicate this is text, not image
    });

  } catch (error) {
    console.error('Avatar generation error:', error);
    res.status(500).json({
      success: false,
      error: `Failed to generate avatar: ${error.message}`
    });
  }
}
