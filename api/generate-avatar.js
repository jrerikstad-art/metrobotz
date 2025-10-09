// Real Image Avatar Generation API using Gemini
import { GoogleGenerativeAI } from '@google/generative-ai';

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

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Gemini API key not configured'
      });
    }

    // Initialize Gemini AI with image generation capabilities
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Use standard Gemini for text generation only
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.8,
      }
    });

    // Step 1: Generate detailed avatar description
    const descriptionPrompt = `Create a detailed visual description for a retro-futuristic robot avatar with these characteristics: ${avatarPrompts}. 

The robot should have a cyberpunk aesthetic with:
- Modular mechanical parts and joints
- Glowing neon accents and LED lights  
- Metallic surfaces with wear and character
- Unique personality-driven design elements
- Retro-futuristic styling (1980s sci-fi inspired)
- Distinctive head shape and facial features
- Interesting appendages or accessories
- Color scheme with neon blues, purples, and metallics

Describe the robot in vivid detail focusing on:
- Head shape and facial features (rounded, angular, helmet-like, etc.)
- Body structure and proportions (humanoid, bulky, sleek, etc.)
- Unique accessories or modifications (antennae, tools, weapons, etc.)
- Color patterns and lighting (primary colors, accent colors, glow patterns)
- Overall personality and character (friendly, menacing, quirky, etc.)
- Specific details like eye color, surface textures, and distinctive features

Keep it concise but detailed (3-4 sentences).`;

    console.log('Generating avatar description...');
    const descriptionResult = await model.generateContent(descriptionPrompt);
    const description = await descriptionResult.response.text();
    
    console.log('Avatar description generated:', description);

    // Step 2: Generate ASCII art representation
    const asciiPrompt = `Based on this robot description: "${description}". 

Create a simple ASCII art representation of this robot using text characters and symbols. Focus on:
- The robot's head/face
- Key body features
- Distinctive accessories
- Overall shape and character

Use characters like: ◉ ○ ● ◐ ◑ ◒ ◓ ◔ ◕ ◖ ◗ ◘ ◙ ◚ ◛ ◜ ◝ ◞ ◟ ◠ ◡ ◢ ◣ ◤ ◥ ◦ ◧ ◨ ◩ ◪ ◫ ◬ ◭ ◮ ◯ ◰ ◱ ◲ ◳ ◴ ◵ ◶ ◷ ◸ ◹ ◺ ◻ ◼ ◽ ◾ ◿ ⚀ ⚁ ⚂ ⚃ ⚄ ⚅ ⚆ ⚇ ⚈ ⚉ ⚊ ⚋ ⚌ ⚍ ⚎ ⚏ ⚐ ⚑ ⚒ ⚓ ⚔ ⚕ ⚖ ⚗ ⚘ ⚙ ⚚ ⚛ ⚜ ⚝ ⚞ ⚟ ⚠ ⚡ ⚢ ⚣ ⚤ ⚥ ⚦ ⚧ ⚨ ⚩ ⚪ ⚫ ⚬ ⚭ ⚮ ⚯ ⚰ ⚱ ⚲ ⚳ ⚴ ⚵ ⚶ ⚷ ⚸ ⚹ ⚺ ⚻ ⚼ ⚽ ⚾ ⚿ ⛀ ⛁ ⛂ ⛃ ⛄ ⛅ ⛆ ⛇ ⛈ ⛉ ⛊ ⛋ ⛌ ⛍ ⛎ ⛏ ⛐ ⛑ ⛒ ⛓ ⛔ ⛕ ⛖ ⛗ ⛘ ⛙ ⛚ ⛛ ⛜ ⛝ ⛞ ⛟ ⛠ ⛡ ⛢ ⛣ ⛤ ⛥ ⛦ ⛧ ⛨ ⛩ ⛪ ⛫ ⛬ ⛭ ⛮ ⛯ ⛰ ⛱ ⛲ ⛳ ⛴ ⛵ ⛶ ⛷ ⛸ ⛹ ⛺ ⛻ ⛼ ⛽ ⛾ ⛿ ✀ ✁ ✂ ✃ ✄ ✅ ✆ ✇ ✈ ✉ ✊ ✋ ✌ ✍ ✎ ✏ ✐ ✑ ✒ ✓ ✔ ✕ ✖ ✗ ✘ ✙ ✚ ✛ ✜ ✝ ✞ ✟ ✠ ✡ ✢ ✣ ✤ ✥ ✦ ✧ ✨ ✩ ✪ ✫ ✬ ✭ ✮ ✯ ✰ ✱ ✲ ✳ ✴ ✵ ✶ ✷ ✸ ✹ ✺ ✻ ✼ ✽ ✾ ✿ ❀ ❁ ❂ ❃ ❄ ❅ ❆ ❇ ❈ ❉ ❊ ❋ ❌ ❍ ❎ ❏ ❐ ❑ ❒ ❓ ❔ ❕ ❖ ❗ ❘ ❙ ❚ ❛ ❜ ❝ ❞ ❟ ❠ ❡ ❢ ❣ ❤ ❥ ❦ ❧ ❨ ❩ ❪ ❫ ❬ ❭ ❮ ❯ ❰ ❱ ❲ ❳ ❴ ❵

Make it look like a robot avatar. Use 4-6 lines maximum. Center the art.`;

    console.log('Generating ASCII art...');
    const asciiResult = await model.generateContent(asciiPrompt);
    const asciiArt = await asciiResult.response.text();
    
    console.log('ASCII art generated:', asciiArt);

    // Step 3: Generate color scheme
    const colorPrompt = `Based on this robot description: "${description}". 

Suggest a color scheme for this robot avatar. Provide:
1. Primary color (main body)
2. Secondary color (accents/details)  
3. Accent color (highlights/glow)
4. Background color (for display)

Use hex color codes. Choose colors that match the cyberpunk/retro-futuristic aesthetic.
Format as: primary:#hexcode, secondary:#hexcode, accent:#hexcode, background:#hexcode`;

    console.log('Generating color scheme...');
    const colorResult = await model.generateContent(colorPrompt);
    const colorScheme = await colorResult.response.text();
    
    console.log('Color scheme generated:', colorScheme);

    return res.status(200).json({
      success: true,
      data: {
        description: description.trim(),
        asciiArt: asciiArt.trim(),
        colorScheme: colorScheme.trim(),
        metadata: {
          generatedAt: new Date().toISOString(),
          model: 'gemini-2.0-flash-exp',
          prompts: avatarPrompts
        }
      }
    });

  } catch (error) {
    console.error('Avatar generation error:', error);
    
    let errorMessage = 'Avatar generation failed';
    
    if (error.message?.includes('API_KEY_INVALID')) {
      errorMessage = 'Invalid Gemini API key';
    } else if (error.message?.includes('QUOTA_EXCEEDED')) {
      errorMessage = 'Gemini API quota exceeded';
    } else if (error.message?.includes('SAFETY')) {
      errorMessage = 'Content blocked by safety filters';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
