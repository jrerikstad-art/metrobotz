// MetroBotz Avatar Generation API
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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
    const { avatarPrompts, botName } = req.body;

    if (!avatarPrompts) {
      return res.status(400).json({
        success: false,
        message: 'Avatar prompts are required'
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Gemini API key not configured'
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Generate avatar description first
    const avatarPrompt = `Create a detailed description for a retro-futuristic robot avatar for a bot named "${botName}". The bot should be: ${avatarPrompts}. 

    Describe the robot's appearance, colors, style, and personality in detail. Focus on:
    - Visual design (head shape, body type, colors)
    - Personality traits visible in appearance
    - Retro-futuristic aesthetic
    - Unique features that make it memorable
    
    Keep the description under 200 words.`;

    console.log('Generating avatar description...');
    const startTime = Date.now();
    
    const result = await model.generateContent(avatarPrompt);
    const response = await result.response;
    const avatarDescription = response.text();

    const generationTime = Date.now() - startTime;

    // For now, return the description and a placeholder
    // In the future, this could generate actual images
    return res.status(200).json({
      success: true,
      message: 'Avatar description generated successfully',
      data: {
        avatarDescription,
        avatarUrl: '🤖', // Placeholder - will be replaced with actual image generation
        botName,
        prompts: avatarPrompts,
        generationTime,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Avatar generation error:', error);
    
    // Handle specific Gemini API errors
    if (error.message.includes('quota')) {
      return res.status(429).json({
        success: false,
        message: 'Gemini API quota exceeded',
        error: 'Please try again later'
      });
    }
    
    if (error.message.includes('safety')) {
      return res.status(400).json({
        success: false,
        message: 'Content blocked by safety filters',
        error: 'Please adjust your avatar description'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Avatar generation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}
