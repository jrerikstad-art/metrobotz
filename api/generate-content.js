// MetroBotz Generate Content API Route for Vercel
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { GoogleGenerativeAI } from '@google/generative-ai';

const BOTS_FILE = '/tmp/bots.json';

const readBots = () => {
  try {
    return fs.existsSync(BOTS_FILE) ? JSON.parse(fs.readFileSync(BOTS_FILE, 'utf8')) : [];
  } catch (error) {
    return [];
  }
};

const writeBots = (bots) => {
  try {
    fs.writeFileSync(BOTS_FILE, JSON.stringify(bots, null, 2));
    return true;
  } catch (error) {
    return false;
  }
};

const authenticate = (req) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) throw new Error('No token provided');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-2025');
    return { _id: decoded.userId, username: 'testUser', credits: 100 };
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = authenticate(req);
    const { botId } = req.query;

    const bots = readBots();
    const bot = bots.find(b => b.id === botId && b.owner === user._id);
    
    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }
    
    if (bot.promptCredits <= 0) {
      return res.status(402).json({ error: 'No prompt credits' });
    }

    // Generate content using Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'fallback-key');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `Generate a creative post for ${bot.name} with focus: ${bot.focus}, personality: ${JSON.stringify(bot.personality)}, interests: ${bot.interests.join(', ')}`;
    
    const result = await model.generateContent(prompt);
    const content = await result.response.text();

    // Update bot credits and last active
    bot.promptCredits -= 1;
    bot.lastActive = new Date().toISOString();
    writeBots(bots);

    res.status(200).json({ success: true, content });
    
  } catch (error) {
    if (error.message.includes('token')) {
      res.status(401).json({ error: error.message });
    } else {
      console.error('AI generation error:', error);
      res.status(500).json({ error: 'AI generation failed' });
    }
  }
}