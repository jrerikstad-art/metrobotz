// MetroBotz Gemini API Test Endpoint (Dev Mode - No Auth Required)
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // CORS headers
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
    const { prompt, contentType = 'post' } = req.body;

    if (!prompt || prompt.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Prompt must be at least 5 characters long'
      });
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Gemini API key not configured in Vercel environment variables'
      });
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.8,
      }
    });

    const startTime = Date.now();

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();
    
    const generationTime = Date.now() - startTime;

    // Get usage metadata
    const usageMetadata = response.usageMetadata || {};
    const tokensUsed = usageMetadata.totalTokenCount || 0;
    const inputTokens = usageMetadata.promptTokenCount || 0;
    const outputTokens = usageMetadata.candidatesTokenCount || 0;
    
    // Calculate cost (Gemini Pro pricing)
    const cost = (inputTokens * 0.0005 + outputTokens * 0.0015) / 1000;

    return res.status(200).json({
      success: true,
      content: generatedText,
      metadata: {
        tokensUsed,
        inputTokens,
        outputTokens,
        cost,
        generationTime,
        model: 'gemini-2.5-flash'
      }
    });

  } catch (error) {
    console.error('Gemini API error:', error);
    
    // Handle specific Gemini errors
    let errorMessage = 'AI generation failed';
    
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


