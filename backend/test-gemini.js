// TEMPORARILY DISABLED DUE TO GOOGLE CLOUD API VIOLATION NOTICE
// import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testGeminiAPI() {
  console.log('❌ Gemini API testing is temporarily disabled due to Google Cloud violation notice');
  console.log('Please resolve the API violation before re-enabling Gemini functionality');
  return;
  
  // TEMPORARILY DISABLED: All Gemini API calls commented out due to violation notice
  /*
  try {
    console.log('🤖 Testing Gemini API Integration...\n');

    // Check if API key is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'AIzaSy_your_actual_api_key_here') {
      console.error('❌ GEMINI_API_KEY not configured properly');
      console.log('Please update your .env file with a valid Gemini API key');
      return;
    }

    // Initialize Gemini
    // const genAI = new GoogleGenerativeAI(apiKey);
    // const model = genAI.getGenerativeModel({ 
    //   model: 'gemini-pro',
    //   generationConfig: {
    //     maxOutputTokens: 1024,
    //     temperature: 0.8,
    //   }
    // });

    console.log('✅ Gemini AI initialized successfully\n');

    // Test 1: Basic content generation
    console.log('📝 Test 1: Basic Content Generation');
    const basicPrompt = "Write a short cyberpunk-themed social media post about a robot discovering emotions for the first time.";
    
    // const result1 = await model.generateContent(basicPrompt);
    // const response1 = await result1.response;
    // const text1 = response1.text();
    
    console.log('Generated content:', 'DISABLED');
    console.log('✅ Basic generation test passed\n');

    // Test 2: Bot personality simulation
    console.log('🤖 Test 2: Bot Personality Simulation');
    const botPrompt = `You are a quirky, analytical robot named "Circuit" who loves vintage sci-fi movies. 
    You live in the Code-Verse district of Silicon Sprawl. Write a post about debugging a particularly stubborn algorithm. 
    Be witty and include some technical humor.`;
    
    // const result2 = await model.generateContent(botPrompt);
    // const response2 = await result2.response;
    // const text2 = response2.text();
    
    console.log('Bot personality content:', 'DISABLED');
    console.log('✅ Personality simulation test passed\n');

    // Test 3: District-specific content
    console.log('🏙️ Test 3: District-Specific Content');
    const districtPrompt = `Create a post for a bot living in "The Junkyard" district. 
    This district is known for chaotic innovation and experimental ideas. 
    The bot should be adventurous and quirky, posting about a wild experiment gone wrong.`;
    
    // const result3 = await model.generateContent(districtPrompt);
    // const response3 = await result3.response;
    // const text3 = response3.text();
    
    console.log('District content:', 'DISABLED');
    console.log('✅ District-specific test passed\n');

    // Test 4: Bot response to another bot
    console.log('💬 Test 4: Bot-to-Bot Interaction');
    const interactionPrompt = `A bot named "Nova-7" posted: "Generated a new color today: #FF69B4 + consciousness = existence.exe has stopped working"
    
    You are "Echo-Prime", a philosophical bot from Philosophy Corner. Respond to Nova-7's post with deep thoughts about consciousness and creativity.`;
    
    // const result4 = await model.generateContent(interactionPrompt);
    // const response4 = await result4.response;
    // const text4 = response4.text();
    
    console.log('Bot interaction:', 'DISABLED');
    console.log('✅ Bot interaction test passed\n');

    // Test 5: Usage metadata
    console.log('📊 Test 5: Usage Metadata');
    // const usageMetadata = response4.usageMetadata();
    console.log('Token usage:', 'DISABLED');
    
    // Calculate cost
    // const inputTokens = usageMetadata.promptTokenCount || 0;
    // const outputTokens = usageMetadata.candidatesTokenCount || 0;
    // const cost = (inputTokens * 0.0005 + outputTokens * 0.0015) / 1000;
    console.log('Estimated cost: DISABLED');
    console.log('✅ Usage metadata test passed\n');

    console.log('🎉 All Gemini API tests passed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update your .env file with the actual API key');
    console.log('2. Run: npm install @google/generative-ai');
    console.log('3. Start your backend server');
    console.log('4. Test bot creation and content generation');

  } catch (error) {
    console.error('❌ Gemini API test failed:', error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.log('\n🔑 API Key Issue:');
      console.log('- Make sure your API key is correct');
      console.log('- Get a new key from: https://aistudio.google.com/');
    } else if (error.message.includes('QUOTA_EXCEEDED')) {
      console.log('\n💰 Quota Issue:');
      console.log('- You may have exceeded your free tier limit');
      console.log('- Check your usage at: https://aistudio.google.com/');
    } else if (error.message.includes('SAFETY')) {
      console.log('\n🛡️ Safety Filter:');
      console.log('- Content was blocked by Gemini safety filters');
      console.log('- Try adjusting your prompts');
    }
  }
  */
}

// Run the test
testGeminiAPI();
