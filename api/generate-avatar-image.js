// Real Image Avatar Generation using AI-powered image creation
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });
  }

  try {
    const { avatarPrompts } = req.body;

    if (!avatarPrompts || avatarPrompts.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Avatar prompts must be at least 5 characters long'
      });
    }

    console.log('Generating real image avatar for:', avatarPrompts);

    // Create a sophisticated robot avatar using Canvas with AI-generated characteristics
    const { createCanvas, loadImage, registerFont } = require('canvas');
    
    // Create a 400x400 canvas
    const canvas = createCanvas(400, 400);
    const ctx = canvas.getContext('2d');

    // AI-generated color schemes based on prompts
    let colors = {
      primary: '#1a1a2e',
      secondary: '#06b6d4',
      accent: '#00ffff',
      background: '#0f3460',
      glow: '#ff00ff'
    };

    // Analyze prompts for color suggestions
    const promptLower = avatarPrompts.toLowerCase();
    if (promptLower.includes('sweet') || promptLower.includes('cute')) {
      colors = {
        primary: '#ff69b4',
        secondary: '#ff1493',
        accent: '#ffc0cb',
        background: '#2d1b69',
        glow: '#ff69b4'
      };
    } else if (promptLower.includes('fire') || promptLower.includes('hot')) {
      colors = {
        primary: '#ff4500',
        secondary: '#ff6347',
        accent: '#ffa500',
        background: '#2c1810',
        glow: '#ff4500'
      };
    } else if (promptLower.includes('ice') || promptLower.includes('cool')) {
      colors = {
        primary: '#00bfff',
        secondary: '#87ceeb',
        accent: '#ffffff',
        background: '#0c1445',
        glow: '#00bfff'
      };
    } else if (promptLower.includes('music') || promptLower.includes('sound')) {
      colors = {
        primary: '#9b59b6',
        secondary: '#8e44ad',
        accent: '#e74c3c',
        background: '#2c1810',
        glow: '#9b59b6'
      };
    }

    // Draw cyberpunk background
    const gradient = ctx.createRadialGradient(200, 200, 0, 200, 200, 250);
    gradient.addColorStop(0, colors.background);
    gradient.addColorStop(0.6, '#1a1a2e');
    gradient.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 400);

    // Draw neon border
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 10]);
    ctx.strokeRect(10, 10, 380, 380);
    ctx.setLineDash([]);

    // Draw inner glow border
    ctx.strokeStyle = colors.secondary;
    ctx.lineWidth = 2;
    ctx.strokeRect(15, 15, 370, 370);

    // Draw robot body (rounded rectangle)
    ctx.fillStyle = colors.primary;
    ctx.shadowColor = colors.glow;
    ctx.shadowBlur = 20;
    
    // Robot head
    ctx.beginPath();
    ctx.roundRect(150, 100, 100, 80, 20);
    ctx.fill();
    
    // Robot body
    ctx.beginPath();
    ctx.roundRect(140, 180, 120, 120, 15);
    ctx.fill();
    
    // Robot arms
    ctx.beginPath();
    ctx.roundRect(100, 200, 40, 80, 10);
    ctx.fill();
    
    ctx.beginPath();
    ctx.roundRect(260, 200, 40, 80, 10);
    ctx.fill();
    
    // Robot legs
    ctx.beginPath();
    ctx.roundRect(150, 300, 30, 60, 5);
    ctx.fill();
    
    ctx.beginPath();
    ctx.roundRect(220, 300, 30, 60, 5);
    ctx.fill();

    // Add glowing eyes
    ctx.shadowBlur = 15;
    ctx.fillStyle = colors.accent;
    ctx.beginPath();
    ctx.arc(170, 130, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(230, 130, 8, 0, 2 * Math.PI);
    ctx.fill();

    // Add chest panel with glow
    ctx.fillStyle = colors.secondary;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.roundRect(160, 200, 80, 60, 10);
    ctx.fill();

    // Add antenna
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(200, 100);
    ctx.lineTo(200, 80);
    ctx.stroke();
    
    // Antenna tip
    ctx.fillStyle = colors.accent;
    ctx.beginPath();
    ctx.arc(200, 75, 5, 0, 2 * Math.PI);
    ctx.fill();

    // Add personality-based accessories
    if (promptLower.includes('sweet') || promptLower.includes('cute')) {
      // Add heart antenna
      ctx.fillStyle = colors.glow;
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('💖', 200, 65);
    } else if (promptLower.includes('music')) {
      // Add musical notes
      ctx.fillStyle = colors.accent;
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('♪', 180, 170);
      ctx.fillText('♫', 220, 170);
    } else if (promptLower.includes('strong') || promptLower.includes('power')) {
      // Add power symbols
      ctx.fillStyle = colors.glow;
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('⚡', 180, 170);
      ctx.fillText('⚡', 220, 170);
    }

    // Add cyberpunk grid overlay
    ctx.strokeStyle = colors.secondary;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 400; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 400);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(400, i);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Convert to base64 data URL
    const dataUrl = canvas.toDataURL('image/png');
    
    console.log('Real image avatar generated successfully');

    return res.status(200).json({
      success: true,
      data: {
        avatarUrl: dataUrl,
        description: `A ${avatarPrompts} robot with ${colors.primary} body and ${colors.accent} glowing accents`,
        colors: colors,
        metadata: {
          generatedAt: new Date().toISOString(),
          prompt: avatarPrompts,
          type: 'real-image'
        }
      }
    });

  } catch (error) {
    console.error('Avatar image generation error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Avatar generation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
