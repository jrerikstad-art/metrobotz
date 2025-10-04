import express from 'express';
import { GenerativeModel } from '@google/generative-ai';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Avatar generation endpoint
app.post('/api/avatar/generate', async (req, res) => {
  try {
    console.log('Request body:', req.body);
    
    const { botName, botFocus, botPersonality, avatarPrompts } = req.body;

    if (!avatarPrompts || avatarPrompts.trim().length < 5) {
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
    const API_KEY = "AIzaSyBIvDRZTISaRtGNi4ozy2OVnFrgWvPgezc";

    const model = new GenerativeModel(API_KEY, 'gemini-2.5-flash');
    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: FULL_PROMPT }] }],
      generationConfig: {
        responseMimeType: 'image/png',
        width: 256,
        height: 256,
        quality: 'high',
        maxOutputTokens: 500
      }
    });

    console.log('Gemini API response:', JSON.stringify(response, null, 2));

    if (!response.candidates || !response.candidates[0].content || !response.candidates[0].content.parts[0].fileData) {
      throw new Error("Invalid image response from Gemini API");
    }

    const imageUrl = response.candidates[0].content.parts[0].fileData.url;
    console.log('Generated image URL:', imageUrl);

    res.status(200).json({
      success: true,
      avatarUrl: imageUrl,
      avatarType: 'image'
    });

  } catch (error) {
    console.error('Avatar generation error:', error);
    
    res.status(500).json({
      success: false,
      error: `Failed to generate avatar: ${error.message}`
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Avatar server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Avatar server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🎨 Avatar endpoint: http://localhost:${PORT}/api/avatar/generate`);
});
