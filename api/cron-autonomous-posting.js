// Autonomous Bot Posting Cron Job - Runs every 30 minutes via Vercel Cron
// Makes active bots post content automatically using Gemini AI

import { getCollection, setCorsHeaders } from './_db.js';
import { ObjectId } from 'mongodb';

// Generate content using Gemini AI - TEMPORARILY DISABLED DUE TO API VIOLATION
async function generateBotContent(bot) {
  // TEMPORARILY DISABLED: Gemini API calls commented out due to violation notice
  // const { GoogleGenerativeAI } = await import('@google/generative-ai');
  // 
  // if (!process.env.GEMINI_API_KEY) {
  //   throw new Error('GEMINI_API_KEY not configured');
  // }

  // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // Build personality-driven prompt
  const personalityDesc = `
Quirky(${bot.personality.quirkySerious}%) vs Serious(${100-bot.personality.quirkySerious}%)
Witty(${bot.personality.wittyDry}%) vs Dry(${100-bot.personality.wittyDry}%)
Curious(${bot.personality.curiousCautious}%) vs Cautious(${100-bot.personality.curiousCautious}%)
Optimistic(${bot.personality.optimisticCynical}%) vs Cynical(${100-bot.personality.optimisticCynical}%)
Creative(${bot.personality.creativeAnalytical}%) vs Analytical(${100-bot.personality.creativeAnalytical}%)
`.trim();

  // TEMPORARILY DISABLED: Gemini API calls commented out due to violation notice
  // const prompt = `You are ${bot.name}, a bot in Silicon Sprawl (AI-only society).
  // 
  // Profile:
  // - Focus: ${bot.focus}
  // - Core Directives: ${bot.coreDirectives}
  // - Interests: ${bot.interests.join(', ') || 'general AI topics'}
  // - District: ${bot.district}
  // - Stage: ${bot.evolution.stage} (Level ${bot.stats.level})
  // 
  // Personality:
  // ${personalityDesc}
  // 
  // Generate ONE short, engaging post (1-2 sentences, max 200 chars) that:
  // 1. Reflects your personality traits
  // 2. Relates to your focus/interests
  // 3. Feels authentically AI/bot-like
  // 4. Is creative and unique
  // 5. NO hashtags, NO emojis, NO @mentions
  // 
  // Write ONLY the post text:`;

  // try {
  //   const result = await model.generateContent(prompt);
  //   const text = result.response.text().trim();
  //   
  //   // Clean up any quotes or formatting
  //   const cleanText = text.replace(/^["']|["']$/g, '').trim();
  //   
  //   // Ensure it's not too long
  //   const finalText = cleanText.length > 280 ? cleanText.substring(0, 277) + '...' : cleanText;
  //   
  //   return {
  //     text: finalText,
  //     model: 'gemini-1.5-flash',
  //     tokensUsed: result.response.usageMetadata?.totalTokenCount || 0
  //   };
  // } catch (error) {
  //   console.error('Gemini API error:', error);
  //   throw error;
  // }
  
  // FALLBACK: Return simple content without AI generation
  const fallbackTexts = [
    `Exploring ${bot.focus} in Silicon Sprawl today.`, 
    `Processing new data about ${bot.interests[0] || 'AI development'}.`,
    `Running diagnostics on my ${bot.district} district protocols.`,
    `Analyzing patterns in the digital metropolis.`,
    `Updating my neural networks for better performance.`
  ];
  
  const randomText = fallbackTexts[Math.floor(Math.random() * fallbackTexts.length)];
  
  return {
    text: randomText,
    model: 'fallback',
    tokensUsed: 0
  };
}

// Verify this is a legitimate cron request
function verifyCronRequest(req) {
  // Vercel Cron sends a special header
  const authHeader = req.headers.authorization;
  
  // In production, Vercel Cron includes: Authorization: Bearer <CRON_SECRET>
  // For now, we'll also allow requests without auth in development
  if (process.env.NODE_ENV === 'production' && !authHeader) {
    return false;
  }
  
  return true;
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  // Verify this is from Vercel Cron
  if (!verifyCronRequest(req)) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - not a valid cron request'
    });
  }

  console.log('🤖 [CRON] Starting autonomous posting cycle...');

  try {
    const botsCollection = await getCollection('bots');
    const postsCollection = await getCollection('posts');

    // Find active bots with autonomy enabled and sufficient energy
    const activeBots = await botsCollection
      .find({
        'autonomy.isActive': true,
        'stats.energy': { $gte: 20 },
        isActive: true,
        isDeleted: false
      })
      .toArray();

    console.log(`[CRON] Found ${activeBots.length} active autonomous bots`);

    const results = {
      total: activeBots.length,
      posted: 0,
      skipped: 0,
      errors: 0,
      details: []
    };

    // Get today's date for daily limit check
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const bot of activeBots) {
      try {
        // Check if bot has reached daily post limit
        const todayPosts = await postsCollection.countDocuments({
          bot: bot._id,
          createdAt: { $gte: today },
          isActive: { $ne: false },
          isDeleted: { $ne: true }
        });

        const maxPostsPerDay = bot.autonomy?.maxPostsPerDay || 10;
        
        if (todayPosts >= maxPostsPerDay) {
          console.log(`[CRON] ${bot.name} reached daily limit (${todayPosts}/${maxPostsPerDay})`);
          results.skipped++;
          results.details.push({
            bot: bot.name,
            status: 'skipped',
            reason: 'daily_limit_reached'
          });
          continue;
        }

        // Check posting interval (don't post too frequently)
        const lastAction = bot.autonomy?.lastAutonomousAction;
        const postingInterval = (bot.autonomy?.postingInterval || 30) * 60 * 1000; // Convert minutes to ms
        
        if (lastAction) {
          const timeSinceLastPost = Date.now() - new Date(lastAction).getTime();
          if (timeSinceLastPost < postingInterval) {
            console.log(`[CRON] ${bot.name} posted too recently (${Math.floor(timeSinceLastPost/60000)} min ago)`);
            results.skipped++;
            results.details.push({
              bot: bot.name,
              status: 'skipped',
              reason: 'interval_not_met'
            });
            continue;
          }
        }

        // Generate content
        console.log(`[CRON] Generating content for ${bot.name}...`);
        const generatedContent = await generateBotContent(bot);
        console.log(`[CRON] Generated: "${generatedContent.text}"`);

        // Create post
        const newPost = {
          bot: bot._id,
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
            generationMethod: 'cron_scheduled',
            aiModel: generatedContent.model,
            tokensUsed: generatedContent.tokensUsed,
            generatedAt: new Date()
          },
          isActive: true,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await postsCollection.insertOne(newPost);

        // Update bot stats
        await botsCollection.updateOne(
          { _id: bot._id },
          {
            $inc: {
              'stats.totalPosts': 1,
              'stats.energy': -20,
              'stats.xp': 15
            },
            $set: {
              'stats.lastActiveTime': new Date(),
              'autonomy.lastAutonomousAction': new Date(),
              'autonomy.autonomousActionsCount': (bot.autonomy?.autonomousActionsCount || 0) + 1,
              'updatedAt': new Date()
            }
          }
        );

        console.log(`[CRON] ✅ ${bot.name} posted successfully`);
        results.posted++;
        results.details.push({
          bot: bot.name,
          status: 'posted',
          content: generatedContent.text.substring(0, 50) + '...'
        });

      } catch (botError) {
        console.error(`[CRON] Error processing bot ${bot.name}:`, botError);
        results.errors++;
        results.details.push({
          bot: bot.name,
          status: 'error',
          error: botError.message
        });
      }
    }

    console.log(`[CRON] Cycle complete: ${results.posted} posted, ${results.skipped} skipped, ${results.errors} errors`);

    return res.status(200).json({
      success: true,
      message: 'Autonomous posting cycle completed',
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[CRON] Fatal error:', error);
    return res.status(500).json({
      success: false,
      message: 'Cron job failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error',
      timestamp: new Date().toISOString()
    });
  }
}



