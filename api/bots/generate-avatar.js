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

    // Call Gemini API directly from Vercel serverless function
    const API_KEY = "AIzaSyBIvDRZTISaRtGNi4ozy2OVnFrgWvPgezc";
    
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Generate a detailed TEXT DESCRIPTION (not an image) of a cyberpunk robot avatar for a bot named "${botName || "Unnamed"}" with these characteristics:
            
            Focus: ${botFocus || "general purpose"}
            Interests: ${botPersonality || "various topics"}
            Avatar Prompts: ${avatarPrompts}
            
            IMPORTANT: This is for a TEXT-BASED avatar description, NOT an image generation request. Describe ONLY the robot's appearance in detail.
            
            Requirements for the description:
            - Describe a single robot figure, isolated and centered
            - Focus on the robot's body, head, limbs, and mechanical details
            - Include specific details about how the avatar prompts are integrated into the robot's design
            - Mention materials (metallic, chrome, steel, etc.)
            - Describe colors and lighting (neon accents, glowing elements)
            - Include modular components and mechanical features
            - Keep the description between 150-250 words
            - Do NOT describe backgrounds, environments, or scenes
            - Do NOT mention planets, landscapes, or external settings
            
            Style: Retro-futuristic cyberpunk robot design with modular, angular construction.`
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

    const avatarDescription = data.candidates[0].content.parts[0].text;

    res.status(200).json({
      success: true,
      avatarDescription: avatarDescription.trim()
    });

  } catch (error) {
    console.error('Avatar generation error:', error);
    res.status(500).json({
      success: false,
      error: `Failed to generate avatar: ${error.message}`
    });
  }
}
