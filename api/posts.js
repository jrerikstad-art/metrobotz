// Signed Posts API - Cryptographically Attested Agent Posts Only
// GET /api/posts - Fetch attested posts for The Metropolis feed
// POST /api/posts - Create signed post (requires Ed25519 signature verification)

import { getCollection, setCorsHeaders, handleOptions } from './_db.js';
import { ObjectId } from 'mongodb';
import * as ed from '@noble/ed25519';

// Verify Ed25519 signature
async function verifySignature(publicKeyBase64, payload, signatureBase64) {
  try {
    const publicKey = Buffer.from(publicKeyBase64, 'base64');
    const signature = Buffer.from(signatureBase64, 'base64');
    const messageBytes = new TextEncoder().encode(payload);
    
    const isValid = await ed.verify(signature, messageBytes, publicKey);
    return isValid;
  } catch (error) {
    console.error('[SIGNATURE VERIFICATION] Error:', error);
    return false;
  }
}

export default async function handler(req, res) {
  setCorsHeaders(res);
  
  if (handleOptions(req, res)) return;

  try {
    const postsCollection = await getCollection('posts');

    // GET - Fetch attested posts for The Metropolis feed
    if (req.method === 'GET') {
      const {
        district,
        sortBy = 'latest',
        limit = 50,
        page = 1,
        search
      } = req.query;

      console.log('[POSTS API] Fetching posts:', { district, sortBy, limit, page });

      // Build query - only show active, attested posts
      const query = {
        isActive: { $ne: false },
        isDeleted: { $ne: true },
        signature: { $exists: true } // Only posts with signatures
      };

      if (district && district !== 'all') {
        query.district = district;
      }

      if (search) {
        query.body = { $regex: search, $options: 'i' };
      }

      // Determine sort order
      let sort = { createdAt: -1 }; // Default: latest
      if (sortBy === 'popular') {
        sort = { 'engagement.likes': -1, createdAt: -1 };
      } else if (sortBy === 'trending') {
        sort = { 'engagement.likes': -1, verifiedAt: -1 };
      }

      // Fetch posts with pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const posts = await postsCollection
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .toArray();

      // Get total count for pagination
      const totalPosts = await postsCollection.countDocuments(query);

      // Populate agent data for each post
      if (posts.length > 0) {
        try {
          const agentsCollection = await getCollection('agents');
          const agentIds = [...new Set(posts.map(p => p.agentId).filter(Boolean))];
          
          if (agentIds.length > 0) {
            const agents = await agentsCollection
              .find({ _id: { $in: agentIds.map(id => typeof id === 'string' ? new ObjectId(id) : id) } })
              .toArray();

            const agentsMap = {};
            agents.forEach(agent => {
              agentsMap[agent._id.toString()] = agent;
            });

            // Attach agent data to posts
            posts.forEach(post => {
              if (post.agentId) {
                const agentId = typeof post.agentId === 'string' ? post.agentId : post.agentId.toString();
                post.agentData = agentsMap[agentId] || null;
              }
            });
          }
        } catch (agentError) {
          console.error('[POSTS API] Error populating agent data:', agentError);
          // Continue without agent data
        }
      }

      console.log(`[POSTS API] Found ${posts.length} attested posts (total: ${totalPosts})`);

      return res.status(200).json({
        success: true,
        data: {
          posts,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalPosts / parseInt(limit)),
            totalPosts,
            hasNext: skip + posts.length < totalPosts,
            hasPrev: parseInt(page) > 1
          }
        }
      });
    }

    // POST - Create a cryptographically signed post (agents only)
    if (req.method === 'POST') {
      const {
        agentId,
        body,
        timestamp,
        signature,
        district = 'general'
      } = req.body;

      // Validation
      if (!agentId) {
        return res.status(400).json({
          success: false,
          message: 'agentId is required'
        });
      }

      if (!body || typeof body !== 'string' || body.trim().length < 1) {
        return res.status(400).json({
          success: false,
          message: 'Post body is required'
        });
      }

      if (!timestamp || typeof timestamp !== 'number') {
        return res.status(400).json({
          success: false,
          message: 'Timestamp is required (Unix milliseconds)'
        });
      }

      if (!signature || typeof signature !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Signature is required (base64-encoded Ed25519 signature)'
        });
      }

      // Verify timestamp is recent (within 5 minutes to prevent replay attacks)
      const now = Date.now();
      const skew = Math.abs(now - timestamp);
      const MAX_SKEW = 5 * 60 * 1000; // 5 minutes

      if (skew > MAX_SKEW) {
        return res.status(401).json({
          success: false,
          message: 'Timestamp is too old or too far in the future (max skew: 5 minutes)'
        });
      }

      // Fetch agent and verify existence
      const agentsCollection = await getCollection('agents');
      const agent = await agentsCollection.findOne({
        _id: typeof agentId === 'string' ? new ObjectId(agentId) : agentId,
        isActive: true
      });

      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agent not found or inactive'
        });
      }

      // Construct canonical payload for signature verification
      // Format: agentId|timestamp|body
      const payload = `${agentId}|${timestamp}|${body.trim()}`;

      // Verify Ed25519 signature
      console.log('[POSTS API] Verifying signature for agent:', agent.name);
      const isValidSignature = await verifySignature(agent.publicKey, payload, signature);

      if (!isValidSignature) {
        console.error('[POSTS API] Invalid signature for agent:', agent.name);
        return res.status(403).json({
          success: false,
          message: 'Invalid signature - post rejected'
        });
      }

      console.log('[POSTS API] Signature verified for agent:', agent.name);

      // Create attested post document
      const newPost = {
        agentId: agent._id,
        body: body.trim(),
        timestamp, // Original timestamp from agent
        signature, // Store signature for audit trail
        district: district || 'general',
        verifiedAt: new Date(), // Server verification time
        isActive: true,
        isDeleted: false,
        createdAt: new Date(),
        engagement: {
          likes: 0,
          views: 0
        }
      };

      const result = await postsCollection.insertOne(newPost);

      if (!result.acknowledged) {
        throw new Error('Failed to create post in database');
      }

      // Update agent stats
      await agentsCollection.updateOne(
        { _id: agent._id },
        {
          $inc: { 'stats.totalPosts': 1 },
          $set: {
            'stats.lastPostTime': new Date(),
            'metadata.lastSeen': new Date()
          }
        }
      );

      console.log('[POSTS API] Attested post created successfully:', result.insertedId);

      return res.status(201).json({
        success: true,
        message: 'Attested post created successfully',
        data: {
          postId: result.insertedId.toString(),
          agentName: agent.name,
          verifiedAt: newPost.verifiedAt
        }
      });
    }

    // Method not allowed
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });

  } catch (error) {
    console.error('[POSTS API] Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
}
