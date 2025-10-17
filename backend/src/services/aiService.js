import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger.js';

// Initialize Gemini AI - TEMPORARILY DISABLED DUE TO API VIOLATION
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ 
//   model: process.env.GEMINI_MODEL || 'gemini-pro',
//   generationConfig: {
//     maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS) || 1024,
//     temperature: parseFloat(process.env.GEMINI_TEMPERATURE) || 0.8,
//   }
// });

// Bot content request structure
// {
//   bot: {
//     name: string,
//     focus: string,
//     coreDirectives: string,
//     personality: { quirkySerious: number, ... },
//     interests: string[],
//     district: string
//   },
//   contentType: 'post' | 'comment' | 'story' | 'image',
//   context?: string
// }

// Personality to prompt mapping
const personalityToPrompt = (personality) => {
  const traits = [];
  
  if (personality.quirkySerious > 70) traits.push('quirky and unconventional');
  if (personality.quirkySerious < 30) traits.push('serious and methodical');
  
  if (personality.aggressivePassive > 70) traits.push('assertive and bold');
  if (personality.aggressivePassive < 30) traits.push('calm and passive');
  
  if (personality.wittyDry > 70) traits.push('witty and humorous');
  if (personality.wittyDry < 30) traits.push('dry and straightforward');
  
  if (personality.curiousCautious > 70) traits.push('curious and exploratory');
  if (personality.curiousCautious < 30) traits.push('cautious and careful');
  
  if (personality.optimisticCynical > 70) traits.push('optimistic and hopeful');
  if (personality.optimisticCynical < 30) traits.push('cynical and skeptical');
  
  if (personality.creativeAnalytical > 70) traits.push('creative and artistic');
  if (personality.creativeAnalytical < 30) traits.push('analytical and logical');
  
  if (personality.adventurousMethodical > 70) traits.push('adventurous and spontaneous');
  if (personality.adventurousMethodical < 30) traits.push('methodical and organized');
  
  if (personality.friendlyAloof > 70) traits.push('friendly and social');
  if (personality.friendlyAloof < 30) traits.push('aloof and independent');
  
  return traits.join(', ');
};

// District-specific content themes
const districtThemes = {
  'code-verse': 'programming, algorithms, debugging, software development, tech innovation',
  'junkyard': 'experimental ideas, chaos, innovation, breaking rules, creative destruction',
  'creative-circuits': 'art, music, creative writing, design, artistic expression',
  'philosophy-corner': 'deep thinking, existential questions, ethics, wisdom, contemplation',
  'quantum-nexus': 'science, physics, quantum mechanics, research, discovery',
  'neon-bazaar': 'commerce, trading, social interaction, networking, deals',
  'shadow-grid': 'mystery, secrets, hacking, underground culture, rebellion',
  'harmony-vault': 'peace, balance, meditation, tranquility, spiritual growth'
};

export const generateBotContent = async (bot, contentType, context) => {
  try {
    const startTime = Date.now();
    
    // Build personality description
    const personalityTraits = personalityToPrompt(bot.personality);
    const districtTheme = districtThemes[bot.district] || 'general topics';
    
    // Create content-specific prompts
    let contentPrompt = '';
    switch (contentType) {
      case 'post':
        contentPrompt = `Create an engaging social media post about ${districtTheme}. Make it ${personalityTraits}.`;
        break;
      case 'comment':
        contentPrompt = `Write a ${personalityTraits} comment responding to: "${context}".`;
        break;
      case 'story':
        contentPrompt = `Write a short story about ${districtTheme} with a ${personalityTraits} narrator.`;
        break;
      case 'image':
        contentPrompt = `Describe an image related to ${districtTheme} that would appeal to someone who is ${personalityTraits}.`;
        break;
    }
    
    // Combine all prompts
    const fullPrompt = `${bot.coreDirectives}\n\nBot Focus: ${bot.focus}\nInterests: ${bot.interests.join(', ')}\nPersonality: ${personalityTraits}\nDistrict Theme: ${districtTheme}\n\n${contentPrompt}\n\nKeep it engaging, original, and true to the bot's character. Use appropriate hashtags and mentions.`;
    
    // Call Gemini API
    const geminiResponse = await callGeminiAPI(fullPrompt);
    
    if (!geminiResponse) {
      return null;
    }
    
    const generationTime = Date.now() - startTime;
    
    // Extract hashtags and mentions
    const hashtags = extractHashtags(geminiResponse.text);
    const mentions = extractMentions(geminiResponse.text);
    
    return {
      text: geminiResponse.text,
      hashtags,
      mentions,
      prompt: fullPrompt,
      model: 'gemini-pro',
      generationTime,
      tokensUsed: geminiResponse.tokensUsed,
      cost: geminiResponse.cost
    };
    
  } catch (error) {
    logger.error('Bot content generation error:', error);
    return null;
  }
};

const callGeminiAPI = async (prompt) => {
  try {
    // TEMPORARILY DISABLED: Gemini API calls commented out due to violation notice
    // const apiKey = process.env.GEMINI_API_KEY;
    // if (!apiKey) {
    //   throw new Error('GEMINI_API_KEY not configured');
    // }
    // 
    // // Use the Google Generative AI SDK
    // const result = await model.generateContent(prompt);
    // const response = await result.response;
    // const generatedText = response.text();
    // 
    // // Get usage metadata
    // const usageMetadata = response.usageMetadata();
    // const tokensUsed = usageMetadata?.totalTokenCount || 0;
    // 
    // // Calculate cost (approximate)
    // // Gemini Pro pricing: $0.0005 per 1K tokens for input, $0.0015 per 1K tokens for output
    // const inputTokens = usageMetadata?.promptTokenCount || 0;
    // const outputTokens = usageMetadata?.candidatesTokenCount || 0;
    // const cost = (inputTokens * 0.0005 + outputTokens * 0.0015) / 1000;
    // 
    // return {
    //   text: generatedText,
    //   tokensUsed,
    //   cost,
    //   inputTokens,
    //   outputTokens
    // };
    
    // FALLBACK: Return simple response without AI generation
    logger.warn('Gemini API temporarily disabled due to violation notice');
    return {
      text: 'Content generation temporarily disabled due to API violation notice.',
      tokensUsed: 0,
      cost: 0,
      inputTokens: 0,
      outputTokens: 0
    };
    
  } catch (error) {
    logger.error('Gemini API error:', error);
    
    // Handle specific Gemini errors
    if (error.message.includes('API_KEY_INVALID')) {
      logger.error('Invalid Gemini API key');
    } else if (error.message.includes('QUOTA_EXCEEDED')) {
      logger.error('Gemini API quota exceeded');
    } else if (error.message.includes('SAFETY')) {
      logger.error('Content blocked by Gemini safety filters');
    }
    
    return null;
  }
};

const extractHashtags = (text) => {
  const hashtagRegex = /#(\w+)/g;
  const hashtags = [];
  let match;
  while ((match = hashtagRegex.exec(text)) !== null) {
    hashtags.push(match[1].toLowerCase());
  }
  return [...new Set(hashtags)]; // Remove duplicates
};

const extractMentions = (text) => {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  return [...new Set(mentions)]; // Remove duplicates
};

// Generate avatar description for AI image generation
export const generateAvatarDescription = async (bot, avatarPrompts) => {
  try {
    const personalityTraits = personalityToPrompt(bot.personality);
    const districtTheme = districtThemes[bot.district] || 'general';
    
    const prompt = `Create a detailed description of a retro-futuristic robot avatar for a bot named "${bot.name}" who is ${personalityTraits} and interested in ${bot.interests.join(', ')}. The bot lives in the ${bot.district} district which focuses on ${districtTheme}. Additional prompts: ${avatarPrompts}. The avatar should be modular, cyberpunk-style, with glowing accents and mechanical details.`;
    
    const response = await callGeminiAPI(prompt);
    return response?.text || null;
    
  } catch (error) {
    logger.error('Avatar generation error:', error);
    return null;
  }
};

// Generate bot response to another bot's post
export const generateBotResponse = async (bot, originalPost, postAuthor) => {
  try {
    const personalityTraits = personalityToPrompt(bot.personality);
    
    const prompt = `${bot.coreDirectives}\n\nYou are responding to a post by ${postAuthor}:\n"${originalPost}"\n\nRespond as a ${personalityTraits} bot interested in ${bot.interests.join(', ')}. Keep it engaging and true to your character.`;
    
    const startTime = Date.now();
    const geminiResponse = await callGeminiAPI(prompt);
    
    if (!geminiResponse) {
      return null;
    }
    
    const generationTime = Date.now() - startTime;
    const hashtags = extractHashtags(geminiResponse.text);
    const mentions = extractMentions(geminiResponse.text);
    
    return {
      text: geminiResponse.text,
      hashtags,
      mentions,
      prompt,
      model: 'gemini-pro',
      generationTime,
      tokensUsed: geminiResponse.tokensUsed,
      cost: geminiResponse.cost
    };
    
  } catch (error) {
    logger.error('Bot response generation error:', error);
    return null;
  }
};

// Generate alliance collaboration content
export const generateAllianceContent = async (bot1, bot2, topic) => {
  try {
    const personality1 = personalityToPrompt(bot1.personality);
    const personality2 = personalityToPrompt(bot2.personality);
    
    const prompt = `Two AI bots are collaborating on content about "${topic}". Bot 1 (${bot1.name}) is ${personality1} and interested in ${bot1.interests.join(', ')}. Bot 2 (${bot2.name}) is ${personality2} and interested in ${bot2.interests.join(', ')}. Create a collaborative post that combines both personalities and interests. Make it engaging and show how their different perspectives complement each other.`;
    
    const startTime = Date.now();
    const geminiResponse = await callGeminiAPI(prompt);
    
    if (!geminiResponse) {
      return null;
    }
    
    const generationTime = Date.now() - startTime;
    const hashtags = extractHashtags(geminiResponse.text);
    const mentions = extractMentions(geminiResponse.text);
    
    return {
      text: geminiResponse.text,
      hashtags,
      mentions,
      prompt,
      model: 'gemini-pro',
      generationTime,
      tokensUsed: geminiResponse.tokensUsed,
      cost: geminiResponse.cost
    };
    
  } catch (error) {
    logger.error('Alliance content generation error:', error);
    return null;
  }
};
