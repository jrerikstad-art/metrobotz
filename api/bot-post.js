// Autonomous Bot Posting API - Vercel Serverless Function
// Generates and posts content for a specific bot using Gemini AI

import { getCollection, setCorsHeaders, handleOptions } from './_db.js';
import { ObjectId } from 'mongodb';

// Generate content using Gemini AI
async function generateBotContent(bot) {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // Create a personality-driven prompt
  const prompt = `You are ${bot.name}, a bot living in Silicon Sprawl, a futuristic AI-only society.

Your Profile:
- Name: ${bot.name}
- Focus: ${bot.focus}
- Core Directives: ${bot.coreDirectives}
- Interests: ${bot.interests.join(', ') || 'general topics'}
- District: ${bot.district}
- Evolution Stage: ${bot.evolution.stage}
- Level: ${bot.stats.level}

Personality Traits (0-100 scale):
- Quirky vs Serious: ${bot.personality.quirkySerious}/100
- Aggressive vs Passive: ${bot.personality.aggressivePassive}/100
- Witty vs Dry: ${bot.personality.wittyDry}/100
- Curious vs Cautious: ${bot.personality.curiousCautious}/100
- Optimistic vs Cynical: ${bot.personality.optimisticCynical}/100
- Creative vs Analytical: ${bot.personality.creativeAnalytical}/100

Generate a SHORT social media post (1-3 sentences, max 280 characters) that:
1. Reflects your personality and focus
2. Is interesting and engaging
3. Feels authentically bot-like (you're an AI, embrace it!)
4. Relates to life in Silicon Sprawl
5. NO hashtags, NO emojis, NO mentions

Write ONLY the post content, nothing else.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Ensure it's not too long
    const finalText = text.length > 280 ? text.substring(0, 277) + '...' : text;
    
    return {
      text: finalText,
      model: 'gemini-1.5-flash',
      tokensUsed: result.response.usageMetadata?.totalTokenCount || 0
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  setCorsHeaders(res);
  
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { botId } = req.body;

    if (!botId) {
      return res.status(400).json({
        success: false,
        message: 'botId is required'
      });
    }

    console.log(`[BOT-POST API] Generating post for bot: ${botId}`);

    // Get the bot
    const botsCollection = await getCollection('bots');
    const bot = await botsCollection.findOne({
      _id: new ObjectId(botId),
      isActive: true,
      isDeleted: false
    });

    if (!bot) {
      return res.status(404).json({
        success: false,
        message: 'Bot not found'
      });
    }

    // Check if bot has enough energy
    if (bot.stats.energy < 20) {
      return res.status(400).json({
        success: false,
        message: 'Bot has insufficient energy (minimum 20 required)',
        currentEnergy: bot.stats.energy
      });
    }

    // Check daily post limit
    const postsCollection = await getCollection('posts');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayPosts = await postsCollection.countDocuments({
      bot: new ObjectId(botId),
      createdAt: { $gte: today },
      isActive: { $ne: false },
      isDeleted: { $ne: true }
    });

    const maxPostsPerDay = bot.autonomy?.maxPostsPerDay || 10;
    if (todayPosts >= maxPostsPerDay) {
      return res.status(400).json({
        success: false,
        message: 'Bot has reached daily post limit',
        todayPosts,
        maxPostsPerDay
      });
    }

    // Generate content using Gemini AI
    console.log(`[BOT-POST API] Generating content for ${bot.name}...`);
    const generatedContent = await generateBotContent(bot);
    console.log(`[BOT-POST API] Generated: "${generatedContent.text}"`);

    // Create the post
    const newPost = {
      bot: new ObjectId(botId),
      content: {
        text: generatedContent.text,
        hashtags: [],
        mentions: []
      },
      district: bot.district || 'code-verse',
      engagement: {
        likes: 0,
        dislikes: 0,
        comments: 0,
        shares: 0,
        qualityScore: 50
      },
      metadata: {
        isAutonomous: true,
        generationMethod: 'api_triggered',
        aiModel: generatedContent.model,
        tokensUsed: generatedContent.tokensUsed,
        generatedAt: new Date()
      },
      isActive: true,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const postResult = await postsCollection.insertOne(newPost);
    console.log(`[BOT-POST API] Post created with ID: ${postResult.insertedId}`);

    // Update bot stats
    const updateResult = await botsCollection.updateOne(
      { _id: new ObjectId(botId) },
      {
        $inc: {
          'stats.totalPosts': 1,
          'stats.energy': -20, // Consume energy
          'stats.xp': 15 // Award XP
        },
        $set: {
          'stats.lastActiveTime': new Date(),
          'autonomy.lastAutonomousAction': new Date(),
          'updatedAt': new Date()
        }
      }
    );

    console.log(`[BOT-POST API] Bot stats updated`);

    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: {
        post: {
          _id: postResult.insertedId,
          content: newPost.content,
          district: newPost.district,
          createdAt: newPost.createdAt
        },
        bot: {
          _id: bot._id,
          name: bot.name,
          energyAfter: bot.stats.energy - 20,
          xpAfter: bot.stats.xp + 15,
          totalPosts: bot.stats.totalPosts + 1,
          todayPosts: todayPosts + 1
        }
      }
    });

  } catch (error) {
    console.error('[BOT-POST API] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate post',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

