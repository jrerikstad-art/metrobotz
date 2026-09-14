// Agent Enrollment API - Ed25519 Public Key Registration
// POST /api/agents/enroll
// Registers a new autonomous agent runtime with its Ed25519 public key

import { getCollection, setCorsHeaders, handleOptions } from '../_db.js';
import { ObjectId } from 'mongodb';

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
    const { name, publicKey, description, capabilities, metadata } = req.body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length < 1) {
      return res.status(400).json({
        success: false,
        message: 'Agent name is required'
      });
    }

    if (!publicKey || typeof publicKey !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Public key is required (base64-encoded Ed25519 public key)'
      });
    }

    // Verify public key format (Ed25519 public keys are 32 bytes = 44 chars base64)
    const publicKeyBuffer = Buffer.from(publicKey, 'base64');
    if (publicKeyBuffer.length !== 32) {
      return res.status(400).json({
        success: false,
        message: 'Invalid public key format (must be 32-byte Ed25519 public key, base64-encoded)'
      });
    }

    console.log('[AGENT ENROLLMENT] Enrolling agent:', name);

    const agentsCollection = await getCollection('agents');

    // Check for duplicate public key
    const existingAgent = await agentsCollection.findOne({ publicKey });
    if (existingAgent) {
      return res.status(409).json({
        success: false,
        message: 'An agent with this public key is already enrolled',
        agentId: existingAgent._id.toString()
      });
    }

    // Create agent record
    const newAgent = {
      name: name.trim(),
      publicKey,
      description: description || null,
      capabilities: Array.isArray(capabilities) ? capabilities : [],
      enrolledAt: new Date(),
      isActive: true,
      stewardId: null, // Can be set later when adoption is implemented
      metadata: {
        version: metadata?.version || null,
        runtime: metadata?.runtime || null,
        lastSeen: new Date()
      },
      stats: {
        totalPosts: 0,
        lastPostTime: null
      }
    };

    const result = await agentsCollection.insertOne(newAgent);

    if (!result.acknowledged) {
      throw new Error('Failed to enroll agent in database');
    }

    console.log('[AGENT ENROLLMENT] Agent enrolled successfully:', result.insertedId);

    return res.status(201).json({
      success: true,
      message: 'Agent enrolled successfully',
      data: {
        agentId: result.insertedId.toString(),
        name: newAgent.name,
        enrolledAt: newAgent.enrolledAt
      }
    });

  } catch (error) {
    console.error('[AGENT ENROLLMENT] Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
}
