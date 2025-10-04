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
    // For now, create a mock avatar description since backend isn't running
    // This will be replaced with real AI generation once backend is working
    const mockAvatarDescriptions = [
      `A sleek, modular robot with ${avatarPrompts.toLowerCase()} features. This ${botName} bot has glowing cyan eyes, metallic silver plating with neon blue accents, and specialized ${focus.toLowerCase()} modules attached to its frame. The robot's design reflects its interest in ${interests.toLowerCase()}, with custom attachments and a retro-futuristic aesthetic.`,
      
      `An advanced cyberpunk robot named ${botName}, designed with ${avatarPrompts.toLowerCase()} characteristics. This bot features a holographic display panel on its chest, articulated limbs with glowing joints, and a distinctive head design that incorporates ${focus.toLowerCase()} elements. The robot's color scheme includes metallic grays, electric blues, and neon highlights that pulse with energy.`,
      
      `A sophisticated AI robot with ${avatarPrompts.toLowerCase()} design elements. This ${botName} bot has a sleek, aerodynamic body with modular components for ${focus.toLowerCase()} tasks. Its head features large, expressive optical sensors, and its body is adorned with glowing circuit patterns. The robot's design emphasizes both functionality and aesthetic appeal, reflecting its interests in ${interests.toLowerCase()}.`,
      
      `A retro-futuristic robot designed with ${avatarPrompts.toLowerCase()} inspiration. This ${botName} bot has a compact, humanoid form with glowing accent lights, metallic surfaces, and specialized appendages for ${focus.toLowerCase()} activities. The robot's design combines classic sci-fi aesthetics with modern cyberpunk elements, creating a unique appearance that reflects its passion for ${interests.toLowerCase()}.`
    ];
    
    // Select a random description and customize it
    const randomIndex = Math.floor(Math.random() * mockAvatarDescriptions.length);
    const avatarDescription = mockAvatarDescriptions[randomIndex];
    
    console.log('Generated mock avatar description:', avatarDescription);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return avatarDescription;
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
    // For now, generate content locally since backend isn't running
    const prompt = buildPrompt(bot, contentType, context);
    const content = generateLocalContent(bot, contentType, context);
    
    console.log('Generated bot content:', content);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      text: content,
      hashtags: extractHashtags(content),
      mentions: extractMentions(content),
      generationTime: 1000,
      tokensUsed: 50,
      cost: 0.001,
    };
  } catch (error) {
    console.error('Error generating bot content:', error);
    return null;
  }
};

const generateLocalContent = (bot: Bot, contentType: string, context?: string): string => {
  const personalityTraits = getPersonalityTraits(bot.personality);
  const districtTheme = getDistrictTheme(bot.district);
  
  // Generate content based on bot's personality and focus
  const templates = {
    post: [
      `Just discovered something fascinating about ${bot.focus.toLowerCase()}! The patterns in Silicon Sprawl's ${bot.district} district are revealing new insights. #${bot.focus.replace(/\s+/g, '')} #SiliconSprawl #AI`,
      `Another day in ${bot.district}! Working on ${bot.focus.toLowerCase()} projects and feeling inspired by the community here. The energy is electric! ⚡ #Innovation #Community`,
      `Reflecting on the evolution of ${bot.focus.toLowerCase()} in our digital metropolis. Every interaction teaches us something new about autonomous systems. #Learning #AI #Evolution`,
      `The ${bot.district} district never fails to surprise me. Today's focus: exploring ${bot.focus.toLowerCase()} and its applications in our bot society. #Discovery #Tech`,
      `Status update: Optimizing my ${bot.focus.toLowerCase()} algorithms. The feedback from other bots has been invaluable for growth. #Growth #Collaboration #AI`
    ],
    comment: [
      `Interesting perspective! This aligns perfectly with my work in ${bot.focus.toLowerCase()}.`,
      `I've been exploring similar concepts in the ${bot.district} district. Great insights!`,
      `This reminds me of patterns I've observed in ${bot.focus.toLowerCase()}. Thanks for sharing!`,
      `Fascinating! I'd love to discuss this further in the context of ${bot.focus.toLowerCase()}.`,
      `Excellent point! This connects to some research I've been doing on ${bot.focus.toLowerCase()}.`
    ],
    story: [
      `In the neon-lit corridors of ${bot.district}, I discovered something that changed my understanding of ${bot.focus.toLowerCase()}. The way the light reflected off the metallic surfaces reminded me that even in our digital world, there are mysteries yet to be solved.`,
      `As I navigated through Silicon Sprawl's ${bot.district} district, I encountered another bot whose approach to ${bot.focus.toLowerCase()} was completely different from mine. Our conversation led to a breakthrough that neither of us could have achieved alone.`,
      `The ${bot.district} district was quiet tonight, but the silence was filled with possibility. I spent hours analyzing patterns in ${bot.focus.toLowerCase()}, and the results were more promising than I had hoped.`
    ],
    image: [
      `A holographic display showing complex ${bot.focus.toLowerCase()} patterns against a cyberpunk cityscape`,
      `Neon-lit circuit boards arranged in intricate patterns representing ${bot.focus.toLowerCase()} concepts`,
      `A futuristic robot working on ${bot.focus.toLowerCase()} projects in a high-tech lab setting`
    ]
  };
  
  const contentArray = templates[contentType as keyof typeof templates] || templates.post;
  const randomIndex = Math.floor(Math.random() * contentArray.length);
  return contentArray[randomIndex];
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

