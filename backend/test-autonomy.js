// Test script to verify bot autonomy is working
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001/api';

async function testBotAutonomy() {
  console.log('🧪 Testing Bot Autonomy System...\n');

  try {
    // 1. Check server health
    console.log('1. Checking server health...');
    const healthResponse = await fetch(`${BASE_URL.replace('/api', '')}/health`);
    const health = await healthResponse.json();
    console.log('✅ Server health:', health.status);
    console.log(`   Bots: ${health.botsCount}, Posts: ${health.postsCount}\n`);

    // 2. Check autonomy status
    console.log('2. Checking autonomy status...');
    const autonomyResponse = await fetch(`${BASE_URL}/autonomy/status`);
    const autonomy = await autonomyResponse.json();
    console.log('✅ Autonomy status:', autonomy.data);
    console.log(`   Running: ${autonomy.data.isRunning}`);
    console.log(`   Bots: ${autonomy.data.botsCount}\n`);

    // 3. Get current bots
    console.log('3. Getting current bots...');
    const botsResponse = await fetch(`${BASE_URL}/bots`);
    const bots = await botsResponse.json();
    console.log(`✅ Found ${bots.data.length} bots:`);
    bots.data.forEach(bot => {
      console.log(`   - ${bot.name} (Energy: ${bot.energy}, Level: ${bot.level})`);
    });
    console.log('');

    // 4. Get current posts
    console.log('4. Getting current posts...');
    const postsResponse = await fetch(`${BASE_URL}/posts`);
    const posts = await postsResponse.json();
    console.log(`✅ Found ${posts.data.length} posts`);
    console.log('');

    // 5. Trigger autonomous actions manually
    console.log('5. Triggering autonomous actions...');
    const triggerResponse = await fetch(`${BASE_URL}/autonomy/trigger`, {
      method: 'POST'
    });
    const trigger = await triggerResponse.json();
    console.log('✅ Trigger result:', trigger.message);
    console.log('');

    // 6. Check posts again to see if new ones were created
    console.log('6. Checking for new posts after trigger...');
    const newPostsResponse = await fetch(`${BASE_URL}/posts`);
    const newPosts = await newPostsResponse.json();
    console.log(`✅ Now found ${newPosts.data.length} posts`);
    
    if (newPosts.data.length > posts.data.length) {
      console.log('🎉 New autonomous posts were created!');
      const latestPost = newPosts.data[0];
      console.log(`   Latest: "${latestPost.content.substring(0, 50)}..." by ${latestPost.botName}`);
    } else {
      console.log('ℹ️  No new posts created (bots may need more energy or time)');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the backend server is running:');
    console.log('   cd backend && node simple-bot-server.js');
  }
}

// Run the test
testBotAutonomy();
