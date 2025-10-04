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
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    
    const { botName, botFocus, botPersonality, avatarPrompts } = req.body;

    console.log('Extracted data:', { botName, botFocus, botPersonality, avatarPrompts });

    if (!avatarPrompts || avatarPrompts.trim().length < 5) {
      console.log('Validation failed: avatarPrompts too short or missing');
      return res.status(400).json({
        success: false,
        error: 'Avatar prompts must be at least 5 characters long'
      });
    }

    // Simple, reliable avatar description generation
    const name = botName || "Unnamed";
    const focus = botFocus || "general purpose";
    const interests = botPersonality || "various topics";
    const prompts = avatarPrompts || "robotic features";

    // Generate avatar description using simple algorithm
    const descriptions = [
      `Meet ${name}, a sleek cyberpunk robot with ${prompts.toLowerCase()} integrated into its modular design. This bot specializes in ${focus.toLowerCase()} and has a passion for ${interests.toLowerCase()}. Its retro-futuristic aesthetic features glowing cyan accents, metallic silver plating, and mechanical details that reflect its unique personality.`,
      
      `${name} is an advanced AI robot featuring ${prompts.toLowerCase()} as part of its distinctive cyberpunk design. Optimized for ${focus.toLowerCase()} tasks, this bot's interests in ${interests.toLowerCase()} are reflected in its sophisticated mechanical architecture and neon-accented modular components.`,
      
      `Introducing ${name}, a cutting-edge robot with ${prompts.toLowerCase()} elements seamlessly integrated into its sleek cyberpunk frame. Designed for ${focus.toLowerCase()} applications, this bot's love for ${interests.toLowerCase()} is evident in its sophisticated retro-futuristic aesthetic and glowing mechanical details.`
    ];

    // Simple hash to pick description
    const hash = (name + focus + interests + prompts).length;
    const selectedDescription = descriptions[hash % descriptions.length];

    console.log('Generated description:', selectedDescription);

    res.status(200).json({
      success: true,
      avatarDescription: selectedDescription,
      avatarType: 'text'
    });

  } catch (error) {
    console.error('Avatar generation error:', error);
    
    res.status(500).json({
      success: false,
      error: `Failed to generate avatar: ${error.message}`
    });
  }
}
