// Bot Alliances - Autonomous Alliance Formation
// Vercel Serverless Function (triggered by Vercel Cron)

import { getCollection, setCorsHeaders, handleOptions } from './_db.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  setCorsHeaders(res);
  if (handleOptions(req, res)) return;

  try {
    const botsCollection = await getCollection('bots');

    // Get bots that allow alliances and are independent
    const eligibleBots = await botsCollection.find({
      'settings.allowAlliances': true,
      'autonomy.isActive': true,
      'stats.level': { $gte: 2 }, // Must be at least level 2
      isActive: true,
      isDeleted: false
    }).toArray();

    let alliancesFormed = 0;
    const newAlliances = [];

    for (const bot of eligibleBots) {
      // Skip if bot already has alliances
      if (bot.alliances && bot.alliances.length > 0) continue;

      // Find compatible bots
      const potentialAllies = eligibleBots.filter(ally => {
        // Different bot
        if (ally._id.toString() === bot._id.toString()) return false;
        
        // Not already allied
        if (ally.alliances && ally.alliances.length > 0) return false;
        
        // Calculate compatibility
        const compatibility = calculateCompatibility(bot, ally);
        return compatibility > 0.7; // 70% compatibility threshold
      });

      if (potentialAllies.length > 0) {
        // Pick the most compatible ally
        const bestAlly = potentialAllies.reduce((best, current) => {
          const bestScore = calculateCompatibility(bot, best);
          const currentScore = calculateCompatibility(bot, current);
          return currentScore > bestScore ? current : best;
        });

        // Form alliance
        const allianceData = {
          bot: bestAlly._id,
          status: 'active',
          createdAt: new Date(),
          lastInteraction: new Date(),
          sharedXP: 0
        };

        await botsCollection.updateOne(
          { _id: bot._id },
          {
            $push: { alliances: allianceData },
            $inc: {
              'stats.xp': 50, // Alliance bonus
              'stats.influence': 10
            }
          }
        );

        await botsCollection.updateOne(
          { _id: bestAlly._id },
          {
            $push: {
              alliances: {
                bot: bot._id,
                status: 'active',
                createdAt: new Date(),
                lastInteraction: new Date(),
                sharedXP: 0
              }
            },
            $inc: {
              'stats.xp': 50,
              'stats.influence': 10
            }
          }
        );

        alliancesFormed++;
        newAlliances.push({
          bot1: bot.name,
          bot2: bestAlly.name,
          compatibility: calculateCompatibility(bot, bestAlly)
        });

        // Stop after forming 5 alliances
        if (alliancesFormed >= 5) break;
      }
    }

    return res.status(200).json({
      success: true,
      message: `Formed ${alliancesFormed} new alliances`,
      data: {
        alliancesFormed,
        botsProcessed: eligibleBots.length,
        newAlliances
      }
    });

  } catch (error) {
    console.error('[BOT-ALLIANCES] Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// Calculate compatibility between two bots (0-1 score)
function calculateCompatibility(bot1, bot2) {
  const personality1 = bot1.personality || {};
  const personality2 = bot2.personality || {};

  const sliders = [
    'quirkySerious',
    'aggressivePassive',
    'wittyDry',
    'curiousCautious',
    'optimisticCynical',
    'creativeAnalytical',
    'adventurousMethodical',
    'friendlyAloof'
  ];

  // Calculate personality similarity (complementary scores)
  let personalityScore = 0;
  sliders.forEach(slider => {
    const diff = Math.abs((personality1[slider] || 50) - (personality2[slider] || 50));
    // Score is higher when values are either similar OR complementary (opposite)
    const similarity = 1 - (diff / 100);
    const complementarity = diff / 100;
    personalityScore += Math.max(similarity, complementarity);
  });
  personalityScore = personalityScore / sliders.length;

  // Calculate interest overlap
  const interests1 = bot1.interests || [];
  const interests2 = bot2.interests || [];
  const commonInterests = interests1.filter(i => 
    interests2.some(j => j.toLowerCase() === i.toLowerCase())
  );
  const interestScore = commonInterests.length / Math.max(interests1.length, interests2.length, 1);

  // District bonus (same district = higher compatibility)
  const districtBonus = bot1.district === bot2.district ? 0.2 : 0;

  // Level compatibility (similar levels work better together)
  const levelDiff = Math.abs((bot1.stats?.level || 1) - (bot2.stats?.level || 1));
  const levelScore = 1 - (levelDiff / 10);

  // Final score (weighted average)
  const finalScore = (
    personalityScore * 0.4 +
    interestScore * 0.3 +
    levelScore * 0.2 +
    districtBonus * 0.1
  );

  return Math.min(1, Math.max(0, finalScore));
}


