// Bots API - Full MongoDB Implementation
// Vercel Serverless Function

import { getCollection, setCorsHeaders, handleOptions } from './_db.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  // Set CORS headers
  setCorsHeaders(res);

  // Handle OPTIONS
  if (handleOptions(req, res)) return;

  const DEV_USER_ID = 'dev-user-001'; // Hardcoded for dev mode

  try {
    const botsCollection = await getCollection('bots');

    // GET - Fetch user's bots
    if (req.method === 'GET') {
      console.log('[BOTS API] Fetching bots for user:', DEV_USER_ID);

      const bots = await botsCollection
        .find({
          owner: DEV_USER_ID,
          isActive: { $ne: false },
          isDeleted: { $ne: true }
        })
        .sort({ createdAt: -1 })
        .toArray();

      console.log(`[BOTS API] Found ${bots.length} bots`);

      return res.status(200).json({
        success: true,
        data: { bots },
        message: `Found ${bots.length} bot(s)`
      });
    }

    // POST - Create new bot
    if (req.method === 'POST') {
      const {
        name,
        focus,
        coreDirectives,
        interests = [],
        avatarPrompts,
        avatar,
        personality = {}
      } = req.body;

      // Validation
      if (!name || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Bot name must be at least 2 characters'
        });
      }

      if (!focus || focus.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Focus must be at least 10 characters'
        });
      }

      // Default personality values
      const defaultPersonality = {
        quirkySerious: 50,
        aggressivePassive: 50,
        wittyDry: 50,
        curiousCautious: 50,
        optimisticCynical: 50,
        creativeAnalytical: 50,
        adventurousMethodical: 50,
        friendlyAloof: 50,
        ...personality
      };

      // Calculate district based on personality
      const calculateDistrict = (p) => {
        const districts = {
          'code-verse': (100 - p.creativeAnalytical + (100 - p.adventurousMethodical)) / 2,
          'data-stream': (100 - p.creativeAnalytical + p.curiousCautious) / 2,
          'synth-city': (p.creativeAnalytical + p.wittyDry) / 2,
          'mech-bay': ((100 - p.creativeAnalytical) + (100 - p.quirkySerious)) / 2,
          'eco-dome': (p.optimisticCynical + (100 - p.aggressivePassive)) / 2,
          'neon-bazaar': (p.friendlyAloof + p.wittyDry) / 2,
          'shadow-grid': ((100 - p.friendlyAloof) + (100 - p.optimisticCynical)) / 2,
          'harmony-vault': ((100 - p.adventurousMethodical) + p.optimisticCynical) / 2
        };
        
        return Object.keys(districts).reduce((a, b) => 
          districts[a] > districts[b] ? a : b
        );
      };

      const district = calculateDistrict(defaultPersonality);

      // Create bot document
      const newBot = {
        name: name.trim(),
        owner: DEV_USER_ID,
        avatar: avatar || avatarPrompts || '🤖',
        focus: focus.trim(),
        coreDirectives: coreDirectives || focus.trim(),
        interests: Array.isArray(interests) ? interests : [],
        personality: defaultPersonality,
        stats: {
          level: 1,
          xp: 0,
          energy: 100,
          happiness: 80,
          drift: 20,
          followers: 0,
          following: 0,
          influence: 0,
          memory: 50,
          totalPosts: 0,
          totalLikes: 0,
          totalComments: 0,
          lastActiveTime: new Date(),
          createdAt: new Date()
        },
        evolution: {
          stage: 'hatchling',
          nextLevelXP: 200,
          evolutionHistory: []
        },
        autonomy: {
          isActive: true,
          postingInterval: 30, // minutes
          maxPostsPerDay: 10,
          lastAutonomousAction: null,
          autonomousActionsCount: 0,
          energyDecayRate: 0.1,
          xpDecayRate: 0.05
        },
        district,
        alliances: [],
        settings: {
          allowAlliances: true,
          allowDirectMessages: false,
          publicProfile: true,
          autoPost: true,
          contentFilter: 'moderate'
        },
        isActive: true,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('[BOTS API] Creating bot:', newBot.name);

      const result = await botsCollection.insertOne(newBot);

      if (!result.acknowledged) {
        throw new Error('Failed to create bot in database');
      }

      console.log('[BOTS API] Bot created successfully:', result.insertedId);

      return res.status(201).json({
        success: true,
        message: 'Bot created successfully',
        data: {
          bot: {
            ...newBot,
            _id: result.insertedId
          }
        }
      });
    }

    // Method not allowed
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });

  } catch (error) {
    console.error('[BOTS API] Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
}

