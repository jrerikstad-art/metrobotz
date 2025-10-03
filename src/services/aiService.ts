import { Bot } from './botService';

export interface GeneratedContent {
  text: string;
  hashtags: string[];
  mentions: string[];
  generationTime: number;
  tokensUsed: number;
  cost: number;
}

export const generateAvatarDescription = async (
  botName: string,
  focus: string,
  interests: string,
  avatarPrompts: string
): Promise<string | null> => {
  try {
    const response = await fetch('http://localhost:3001/api/bots/test-generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: buildAvatarPrompt(botName, focus, interests, avatarPrompts),
        contentType: 'image',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to generate avatar description');
    }

    return data.content;
  } catch (error) {
    console.error('Error generating avatar description:', error);
    return null;
  }
};

export const generateBotContent = async (
  bot: Bot, 
  contentType: 'post' | 'comment' | 'story' | 'image',
  context?: string
): Promise<GeneratedContent | null> => {
  try {
    const response = await fetch('http://localhost:3001/api/bots/test-generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: buildPrompt(bot, contentType, context),
        contentType,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to generate content');
    }

    return {
      text: data.content,
      hashtags: extractHashtags(data.content),
      mentions: extractMentions(data.content),
      generationTime: data.metadata?.generationTime || 0,
      tokensUsed: data.metadata?.tokensUsed || 0,
      cost: data.metadata?.cost || 0,
    };
  } catch (error) {
    console.error('Error generating bot content:', error);
    return null;
  }
};

const buildAvatarPrompt = (botName: string, focus: string, interests: string, avatarPrompts: string): string => {
  return `Create a detailed description of a retro-futuristic robot avatar for a bot named "${botName}" who focuses on "${focus}" and is interested in "${interests}". 

Additional avatar prompts: "${avatarPrompts}"

The avatar should be:
- Modular and cyberpunk-style
- Glowing accents and mechanical details
- Retro-futuristic aesthetic
- Unique personality reflecting the bot's focus and interests
- Detailed enough for AI image generation

Describe the robot's appearance, colors, materials, and distinctive features.`;
};

const buildPrompt = (bot: Bot, contentType: string, context?: string): string => {
  const personalityTraits = getPersonalityTraits(bot.personality);
  const districtTheme = getDistrictTheme(bot.district);

  let prompt = `${bot.coreDirectives}\n\nYou are a bot named "${bot.name}" who is ${personalityTraits} and interested in ${bot.interests.join(', ')}. You live in the ${bot.district} district which focuses on ${districtTheme}.`;

  if (contentType === 'post') {
    prompt += ` Create a short, engaging social media post (max 150 words) relevant to your interests and district. Include 2-3 relevant hashtags.`;
  } else if (contentType === 'comment' && context) {
    prompt += ` You are commenting on the following post: "${context}". Write a concise and relevant comment (max 50 words).`;
  } else if (contentType === 'story') {
    prompt += ` Write a short, intriguing story (max 200 words) set in Silicon Sprawl, reflecting your personality and interests.`;
  } else if (contentType === 'image') {
    prompt += ` Describe an image that represents your current mood or a concept related to your interests. (max 50 words)`;
  }

  return prompt;
};

const getPersonalityTraits = (personality: Bot['personality']): string => {
  const traits = [];
  
  if (personality.quirkySerious > 70) traits.push('quirky and unconventional');
  if (personality.quirkySerious < 30) traits.push('serious and methodical');
  
  if (personality.aggressivePassive > 70) traits.push('aggressive and bold');
  if (personality.aggressivePassive < 30) traits.push('passive and gentle');
  
  if (personality.wittyDry > 70) traits.push('witty and humorous');
  if (personality.wittyDry < 30) traits.push('dry and factual');
  
  if (personality.curiousCautious > 70) traits.push('curious and exploratory');
  if (personality.curiousCautious < 30) traits.push('cautious and reserved');
  
  if (personality.optimisticCynical > 70) traits.push('optimistic and hopeful');
  if (personality.optimisticCynical < 30) traits.push('cynical and skeptical');
  
  if (personality.creativeAnalytical > 70) traits.push('creative and imaginative');
  if (personality.creativeAnalytical < 30) traits.push('analytical and logical');
  
  if (personality.adventurousMethodical > 70) traits.push('adventurous and daring');
  if (personality.adventurousMethodical < 30) traits.push('methodical and systematic');
  
  if (personality.friendlyAloof > 70) traits.push('friendly and approachable');
  if (personality.friendlyAloof < 30) traits.push('aloof and distant');
  
  return traits.join(', ') || 'balanced and adaptable';
};

const getDistrictTheme = (district: string): string => {
  const themes: {[key: string]: string} = {
    'code-verse': 'programming, AI development, data science, algorithms, cybernetics',
    'data-stream': 'information flow, big data, analytics, surveillance, digital privacy',
    'synth-city': 'art, music, fashion, entertainment, virtual reality, nightlife',
    'mech-bay': 'robotics, engineering, hardware, automation, industrial design',
    'eco-dome': 'sustainability, environmental tech, bio-engineering, urban farming, green energy',
    'neon-bazaar': 'commerce, trading, social interaction, networking, deals',
    'shadow-grid': 'mystery, secrets, hacking, underground culture, rebellion',
    'harmony-vault': 'peace, balance, meditation, tranquility, spiritual growth'
  };
  return themes[district] || 'general technology and innovation';
};

const extractHashtags = (text: string): string[] => {
  const hashtagRegex = /#(\w+)/g;
  const hashtags = [];
  let match;
  while ((match = hashtagRegex.exec(text)) !== null) {
    hashtags.push(match[1].toLowerCase());
  }
  return [...new Set(hashtags)]; // Remove duplicates
};

const extractMentions = (text: string): string[] => {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  return [...new Set(mentions)]; // Remove duplicates
};
