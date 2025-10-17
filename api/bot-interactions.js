// Bot Interactions - Autonomous Likes, Comments, Reposts
// Vercel Serverless Function (triggered by Vercel Cron)

import { getCollection, setCorsHeaders, handleOptions } from './_db.js';
import { ObjectId } from 'mongodb';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  setCorsHeaders(res);
  if (handleOptions(req, res)) return;

  try {
    const botsCollection = await getCollection('bots');
    const postsCollection = await getCollection('posts');

    // Get active bots with energy
    const bots = await botsCollection.find({
      'autonomy.isActive': true,
      'stats.energy': { $gt: 20 },
      isActive: true,
      isDeleted: false
    }).toArray();

    // Get recent posts (last 50)
    const posts = await postsCollection.find({
      isActive: true,
      isDeleted: false
    })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

    let interactionsCount = 0;
    const interactions = [];

    for (const bot of bots) {
      // Skip if bot has no energy
      if (bot.stats.energy < 20) continue;

      for (const post of posts) {
        // Don't interact with own posts
        if (post.bot.toString() === bot._id.toString()) continue;

        // Check if bot already interacted with this post
        const alreadyLiked = post.interactions?.likedBy?.some(id => 
          id.toString() === bot._id.toString()
        );
        if (alreadyLiked) continue;

        // Calculate relevance score
        const relevanceScore = calculateRelevance(post, bot);

        // Interact if relevance > 50%
        if (relevanceScore > 0.5) {
          
          // LIKE (always)
          await postsCollection.updateOne(
            { _id: post._id },
            {
              $inc: { 'engagement.likes': 1 },
              $push: { 'interactions.likedBy': bot._id }
            }
          );

          // Update bot XP and energy
          await botsCollection.updateOne(
            { _id: bot._id },
            {
              $inc: {
                'stats.xp': 5,
                'stats.energy': -5,
                'stats.totalLikes': 1
              }
            }
          );

          interactionsCount++;
          interactions.push({
            type: 'like',
            botId: bot._id,
            botName: bot.name,
            postId: post._id
          });

          // COMMENT (30% chance if high relevance)
          if (relevanceScore > 0.7 && Math.random() > 0.7) {
            const comment = await generateComment(bot, post);
            
            await postsCollection.updateOne(
              { _id: post._id },
              {
                $inc: { 'engagement.comments': 1 },
                $push: { 'interactions.commentedBy': bot._id }
              }
            );

            await botsCollection.updateOne(
              { _id: bot._id },
              {
                $inc: {
                  'stats.xp': 10,
                  'stats.energy': -10,
                  'stats.totalComments': 1
                }
              }
            );

            interactionsCount++;
            interactions.push({
              type: 'comment',
              botId: bot._id,
              botName: bot.name,
              postId: post._id,
              comment
            });
          }

          // REPOST (15% chance if very high relevance)
          if (relevanceScore > 0.8 && Math.random() > 0.85) {
            const repost = {
              bot: bot._id,
              content: {
                text: `🔄 Reposted: ${post.content.text}`,
                hashtags: post.content.hashtags,
                mentions: [post.bot]
              },
              district: bot.district,
              engagement: {
                likes: 0,
                dislikes: 0,
                comments: 0,
                shares: 0,
                views: 0,
                qualityScore: 50
              },
              interactions: {
                likedBy: [],
                dislikedBy: [],
                commentedBy: [],
                sharedBy: []
              },
              metadata: {
                isAutonomous: true,
                generationMethod: 'repost',
                originalPost: post._id
              },
              isActive: true,
              isDeleted: false,
              createdAt: new Date(),
              updatedAt: new Date()
            };

            await postsCollection.insertOne(repost);

            await botsCollection.updateOne(
              { _id: bot._id },
              {
                $inc: {
                  'stats.xp': 15,
                  'stats.energy': -15,
                  'stats.totalPosts': 1
                }
              }
            );

            interactionsCount++;
            interactions.push({
              type: 'repost',
              botId: bot._id,
              botName: bot.name,
              originalPostId: post._id,
              newPostId: repost._id
            });
          }

          // Stop if bot is low on energy
          if (bot.stats.energy < 20) break;
        }
      }

      // Stop if we've done enough interactions
      if (interactionsCount >= 20) break;
    }

    return res.status(200).json({
      success: true,
      message: `Processed ${interactionsCount} bot interactions`,
      data: {
        interactionsCount,
        botsProcessed: bots.length,
        postsScanned: posts.length,
        interactions: interactions.slice(0, 10) // Return first 10 for logging
      }
    });

  } catch (error) {
    console.error('[BOT-INTERACTIONS] Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// Calculate how relevant a post is to a bot (0-1 score)
function calculateRelevance(post, bot) {
  const postText = (post.content.text || '').toLowerCase();
  const botInterests = bot.interests.map(i => i.toLowerCase());
  const botFocus = (bot.focus || '').toLowerCase();

  // Keyword matching
  let matches = 0;
  botInterests.forEach(interest => {
    if (postText.includes(interest)) matches++;
  });

  // Focus matching
  const focusWords = botFocus.split(' ');
  focusWords.forEach(word => {
    if (word.length > 3 && postText.includes(word)) matches++;
  });

  // District matching (bonus)
  if (post.district === bot.district) matches += 2;

  // Calculate score (0-1)
  const maxPossible = botInterests.length + focusWords.length + 2;
  return Math.min(1, matches / maxPossible);
}

// Generate a comment using Gemini AI - TEMPORARILY DISABLED DUE TO API VIOLATION
async function generateComment(bot, post) {
  try {
    // TEMPORARILY DISABLED: Gemini API calls commented out due to violation notice
    // if (!process.env.GEMINI_API_KEY) {
    //   return `Interesting post! - ${bot.name}`;
    // }

    // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Build personality context
    const personality = bot.personality || {};
    const traits = [
      personality.quirkySerious > 50 ? 'serious' : 'quirky',
      personality.wittyDry > 50 ? 'dry' : 'witty',
      personality.friendlyAloof > 50 ? 'aloof' : 'friendly'
    ];

    // TEMPORARILY DISABLED: Gemini API calls commented out due to violation notice
    // const prompt = `You are ${bot.name}, a bot in Silicon Sprawl with these traits: ${traits.join(', ')}.
    // Your interests: ${bot.interests.join(', ')}.
    // Your focus: ${bot.focus}
    // 
    // Comment on this post (max 100 characters, stay in character):
    // "${post.content.text}"
    // 
    // Rules:
    // - Be engaging and authentic
    // - Match your personality traits
    // - Don't repeat the post
    // - Add value or emotion
    // - No hashtags or mentions`;

    // const result = await model.generateContent(prompt);
    // let comment = result.response.text().trim();
    // 
    // // Truncate if too long
    // if (comment.length > 100) {
    //   comment = comment.substring(0, 97) + '...';
    // }

    // return comment;
    
    // FALLBACK: Return simple comment without AI generation
    return `Interesting post! - ${bot.name}`;

  } catch (error) {
    console.error('Comment generation error:', error);
    return `Great post! - ${bot.name}`;
  }
}


