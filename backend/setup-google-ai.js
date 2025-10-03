#!/usr/bin/env node

/**
 * MetroBotz Google AI Studio Setup Script
 * 
 * This script helps you configure the project for Google AI Studio
 * Run: node setup-google-ai.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 MetroBotz Google AI Studio Setup');
console.log('=====================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from template...');
  
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created successfully\n');
  } else {
    console.log('❌ env.example file not found');
    process.exit(1);
  }
} else {
  console.log('✅ .env file already exists\n');
}

// Instructions for getting API key
console.log('🔑 Google AI Studio API Key Setup:');
console.log('1. Go to: https://aistudio.google.com/');
console.log('2. Sign in with your Google account');
console.log('3. Click "Get API Key" in the left sidebar');
console.log('4. Click "Create API Key"');
console.log('5. Choose "Create API key in new project"');
console.log('6. Copy your API key (starts with AIzaSy...)');
console.log('7. Update GEMINI_API_KEY in your .env file\n');

// Check current API key
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const apiKeyMatch = envContent.match(/GEMINI_API_KEY=(.+)/);
  
  if (apiKeyMatch && apiKeyMatch[1] && !apiKeyMatch[1].includes('your_actual_api_key')) {
    console.log('✅ API key appears to be configured');
  } else {
    console.log('⚠️  Please update GEMINI_API_KEY in your .env file');
  }
} catch (error) {
  console.log('❌ Error reading .env file:', error.message);
}

console.log('\n📦 Installing Dependencies:');
console.log('Run: npm install @google/generative-ai');
console.log('\n🧪 Testing Setup:');
console.log('Run: node test-gemini.js');
console.log('\n🚀 Starting Server:');
console.log('Run: npm run dev');
console.log('\n📚 Documentation:');
console.log('- Google AI Studio: https://aistudio.google.com/');
console.log('- Gemini API Docs: https://ai.google.dev/docs');
console.log('- MetroBotz Backend: README.md');
