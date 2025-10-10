// MongoDB Connection Utility for Vercel Serverless Functions
// Uses native MongoDB driver for better performance and faster cold starts

import { MongoClient } from 'mongodb';

// Global cached connection
let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  // Return cached connection if available
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Check for MongoDB URI
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  try {
    // Create new client with optimized settings for Vercel
    const client = new MongoClient(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    // Connect to MongoDB
    await client.connect();
    
    // Get database (extract from URI or use default)
    const dbName = process.env.MONGODB_URI.split('/').pop().split('?')[0] || 'metrobotz';
    const db = client.db(dbName);

    // Cache the connection
    cachedClient = client;
    cachedDb = db;

    console.log('✅ MongoDB connected successfully');

    return { client, db };
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

// Helper to get collections
export async function getCollection(collectionName) {
  const { db } = await connectToDatabase();
  return db.collection(collectionName);
}

// Set CORS headers
export function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
}

// Handle OPTIONS requests
export function handleOptions(req, res) {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    return res.status(200).json({ success: true });
  }
  return false;
}

