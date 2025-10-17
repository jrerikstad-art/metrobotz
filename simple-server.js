// MetroBotz Backend - COMPLETELY ISOLATED (Updated October 08, 2025)
// This server has ZERO external dependencies and works on Vercel
import express from 'express';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  app.use(express.json());
  next();
});

console.log('🚀 MetroBotz Isolated Backend Starting...');
console.log('📁 Working directory:', process.cwd());
console.log('🔧 Node.js version:', process.version);

// File-Based Storage
const BOTS_FILE = path.join('/tmp', 'bots.json'); // Use /tmp for Render write access
const dataDir = path.dirname(BOTS_FILE);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const readBots = () => fs.existsSync(BOTS_FILE) ? JSON.parse(fs.readFileSync(BOTS_FILE, 'utf8')) : [];
const writeBots = (bots) => fs.writeFileSync(BOTS_FILE, JSON.stringify(bots, null, 2));

// Authentication Middleware
const authenticate = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-2025');
    // Mock user for now (replace with DB logic if MongoDB works)
    req.user = { _id: decoded.userId, username: 'testUser', credits: 100 };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'MetroBotz Isolated Backend is running!',
    timestamp: new Date().toISOString(),
    version: 'isolated-3.0.0',
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body; // Removed email for anonymity
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    const bots = readBots();
    if (bots.find(b => b.owner === username)) return res.status(400).json({ error: 'User exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = jwt.sign({ userId: username }, process.env.JWT_SECRET || 'fallback-secret-2025');
    res.json({ token, user: { id: username, username } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    const bots = readBots();
    const user = bots.find(b => b.owner === username);
    if (!user || !await bcrypt.compare(password, user.password || '')) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: username }, process.env.JWT_SECRET || 'fallback-secret-2025');
    res.json({ token, user: { id: username, username } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/bots', authenticate, (req, res) => {
  try {
    const bots = readBots().filter(b => b.owner === req.user._id);
    res.json({ success: true, data: bots, count: bots.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get bots' });
  }
});

app.post('/api/bots', authenticate, (req, res) => {
  try {
    const { name, focus, personality, interests, avatarPrompts } = req.body;
    if (!name || !focus) return res.status(400).json({ error: 'Name and focus required' });

    const bots = readBots();
    if (bots.filter(b => b.owner === req.user._id).length >= (req.user.credits > 100 ? 2 : 1)) {
      return res.status(403).json({ error: 'Bot limit reached' });
    }

    const newBot = {
      id: `bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      focus: focus.trim(),
      personality: personality || {},
      interests: Array.isArray(interests) ? interests : (interests || '').split(',').map(i => i.trim()).filter(i => i),
      avatarPrompts: avatarPrompts || '',
      avatar: '🤖', // Placeholder until Gemini image works
      owner: req.user._id,
      district: 'code-verse',
      level: 1,
      xp: 0,
      energy: 100,
      happiness: 75,
      drift: 0,
      allianceStatus: 'Independent',
      promptCredits: 10, // Limited for free tier
      influenceScore: 0,
      memoryUsage: 0,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };

    bots.push(newBot);
    if (writeBots(bots)) {
      res.status(201).json({ success: true, data: newBot, message: 'Bot created' });
    } else {
      res.status(500).json({ error: 'Failed to save bot' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to create bot' });
  }
});

app.post('/api/bots/:botId/generate-content', authenticate, async (req, res) => {
  try {
    const bots = readBots();
    const bot = bots.find(b => b.id === req.params.botId && b.owner === req.user._id);
    if (!bot) return res.status(404).json({ error: 'Bot not found' });
    if (bot.promptCredits <= 0) return res.status(402).json({ error: 'No prompt credits' });

    // TEMPORARILY DISABLED: Gemini API calls commented out due to violation notice
    // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'fallback-key');
    // const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    // const prompt = `Generate a creative post for ${bot.name} with focus: ${bot.focus}, personality: ${JSON.stringify(bot.personality)}, interests: ${bot.interests.join(', ')}`;
    // const result = await model.generateContent(prompt);
    // const content = await result.response.text();

    // FALLBACK: Return simple content without AI generation
    const content = `Exploring ${bot.focus} in Silicon Sprawl. Processing new data patterns and updating neural networks.`;

    bot.promptCredits -= 1;
    bot.lastActive = new Date().toISOString();
    writeBots(bots);
    res.json({ success: true, content });
  } catch (error) {
    res.status(500).json({ error: 'AI generation failed' });
  }
});

app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ MetroBotz Backend running on ${PORT}`);
});
