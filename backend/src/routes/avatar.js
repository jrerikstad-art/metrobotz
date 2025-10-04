import express from 'express';
import { GenerativeModel } from '@google/generative-ai';

const router = express.Router();

// CORS middleware
router.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

router.post('/generate', async (req, res) => {
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

    // Master Prompt for consistent Silicon Sprawl aesthetic
    const MASTER_PROMPT = "Generate a retro-futuristic robot avatar with a transparent background, in a cute, cartoonish style suitable for a digital metropolis. PNG format with alpha channel, 256x256 resolution, and modular design for overlays.";

    // User's custom prompt for specific features
    const USER_PROMPT = `Bot Name: "${botName || "Unnamed"}". Focus: ${botFocus || "general purpose"}. Interests: ${botPersonality || "various topics"}. Custom Features: ${avatarPrompts}`;

    // Combine prompts
    const FULL_PROMPT = MASTER_PROMPT + (USER_PROMPT ? ` ${USER_PROMPT}.` : '') + " Ensure transparency and modularity.";

    console.log('Full prompt:', FULL_PROMPT);

    // Gemini API call for image generation
    const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyBIvDRZTISaRtGNi4ozy2OVnFrgWvPgezc";
    if (!API_KEY) throw new Error('Gemini API key not configured');

    console.log('Using API key:', API_KEY.substring(0, 10) + '...');

    const model = new GenerativeModel(API_KEY, 'gemini-2.5-flash'); // Latest model
    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: FULL_PROMPT }] }],
      generationConfig: {
        responseMimeType: 'image/png',
        width: 256,
        height: 256,
        quality: 'high',
        maxOutputTokens: 500 // Adjusted for image generation
      }
    });

    console.log('Gemini API response:', JSON.stringify(response, null, 2));

    if (!response.candidates || !response.candidates[0].content || !response.candidates[0].content.parts[0].fileData) {
      throw new Error("Invalid image response from Gemini API");
    }

    const imageUrl = response.candidates[0].content.parts[0].fileData.url; // URL to PNG
    console.log('Generated image URL:', imageUrl);

    res.status(200).json({
      success: true,
      avatarUrl: imageUrl,
      avatarType: 'image'
    });

  } catch (error) {
    console.error('Avatar generation error:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      error: `Failed to generate avatar: ${error.message}`
    });
  }
});

export default router;
