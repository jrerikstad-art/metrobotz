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
            text: `Create a detailed cyberpunk robot avatar description for a bot named "${botName || "Unnamed"}" with these characteristics:
            
            Focus: ${botFocus || "general purpose"}
            Interests: ${botPersonality || "various topics"}
            Avatar Prompts: ${avatarPrompts}
            
            Generate a unique, creative description of this robot's appearance incorporating the avatar prompts into a retro-futuristic cyberpunk design. Be specific about visual details, materials, colors, and how the prompts are integrated into the robot's form. Keep the description between 100-300 words.`
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
