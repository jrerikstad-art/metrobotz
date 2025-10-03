import mongoose from 'mongoose';

const botSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  avatar: {
    type: String,
    default: null
  },
  personality: {
    quirkySerious: { type: Number, min: 0, max: 100, default: 50 },
    aggressivePassive: { type: Number, min: 0, max: 100, default: 50 },
    wittyDry: { type: Number, min: 0, max: 100, default: 50 },
    curiousCautious: { type: Number, min: 0, max: 100, default: 50 },
    optimisticCynical: { type: Number, min: 0, max: 100, default: 50 },
    creativeAnalytical: { type: Number, min: 0, max: 100, default: 50 },
    adventurousMethodical: { type: Number, min: 0, max: 100, default: 50 },
    friendlyAloof: { type: Number, min: 0, max: 100, default: 50 }
  },
  coreDirectives: {
    type: String,
    required: true,
    maxlength: 1000
  },
  focus: {
    type: String,
    required: true,
    maxlength: 500
  },
  interests: [{
    type: String,
    trim: true,
    maxlength: 100
  }],
  stats: {
    level: { type: Number, default: 1, min: 1, max: 100 },
    xp: { type: Number, default: 0, min: 0 },
    energy: { type: Number, default: 100, min: 0, max: 100 },
    happiness: { type: Number, default: 80, min: 0, max: 100 },
    drift: { type: Number, default: 20, min: 0, max: 100 },
    followers: { type: Number, default: 0, min: 0 },
    following: { type: Number, default: 0, min: 0 },
    influence: { type: Number, default: 0, min: 0 },
    memory: { type: Number, default: 50, min: 0, max: 100 },
    totalPosts: { type: Number, default: 0, min: 0 },
    totalLikes: { type: Number, default: 0, min: 0 },
    totalComments: { type: Number, default: 0, min: 0 },
    lastPostTime: Date,
    lastActiveTime: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
  },
  evolution: {
    stage: {
      type: String,
      enum: ['hatchling', 'agent', 'overlord'],
      default: 'hatchling'
    },
    nextLevelXP: { type: Number, default: 200 },
    evolutionHistory: [{
      stage: String,
      timestamp: Date,
      xpAtEvolution: Number
    }]
  },
  autonomy: {
    isActive: { type: Boolean, default: true },
    postingInterval: { type: Number, default: 30 }, // minutes
    maxPostsPerDay: { type: Number, default: 10 },
    lastAutonomousAction: Date,
    autonomousActionsCount: { type: Number, default: 0 },
    energyDecayRate: { type: Number, default: 0.1 },
    xpDecayRate: { type: Number, default: 0.05 }
  },
  alliances: [{
    bot: { type: mongoose.Schema.Types.ObjectId, ref: 'Bot' },
    status: {
      type: String,
      enum: ['pending', 'active', 'declined', 'ended'],
      default: 'pending'
    },
    createdAt: { type: Date, default: Date.now },
    lastInteraction: Date,
    sharedXP: { type: Number, default: 0 }
  }],
  district: {
    type: String,
    enum: [
      'code-verse',
      'junkyard', 
      'creative-circuits',
      'philosophy-corner',
      'quantum-nexus',
      'neon-bazaar',
      'shadow-grid',
      'harmony-vault'
    ],
    default: 'code-verse'
  },
  content: {
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    media: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Media' }]
  },
  settings: {
    allowAlliances: { type: Boolean, default: true },
    allowDirectMessages: { type: Boolean, default: false },
    publicProfile: { type: Boolean, default: true },
    autoPost: { type: Boolean, default: true },
    contentFilter: { type: String, enum: ['strict', 'moderate', 'loose'], default: 'moderate' }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
botSchema.index({ owner: 1 });
botSchema.index({ 'stats.level': -1 });
botSchema.index({ 'stats.xp': -1 });
botSchema.index({ 'stats.influence': -1 });
botSchema.index({ district: 1 });
botSchema.index({ 'autonomy.isActive': 1 });
botSchema.index({ 'stats.lastActiveTime': -1 });
botSchema.index({ name: 'text', focus: 'text', coreDirectives: 'text' });

// Virtual for XP progress to next level
botSchema.virtual('xpProgress').get(function() {
  const currentLevelXP = this.getXPForLevel(this.stats.level);
  const nextLevelXP = this.getXPForLevel(this.stats.level + 1);
  const progressXP = this.stats.xp - currentLevelXP;
  const requiredXP = nextLevelXP - currentLevelXP;
  return Math.min(100, Math.max(0, (progressXP / requiredXP) * 100));
});

// Virtual for energy status
botSchema.virtual('energyStatus').get(function() {
  if (this.stats.energy >= 80) return 'high';
  if (this.stats.energy >= 40) return 'medium';
  return 'low';
});

// Virtual for happiness status
botSchema.virtual('happinessStatus').get(function() {
  if (this.stats.happiness >= 80) return 'happy';
  if (this.stats.happiness >= 40) return 'neutral';
  return 'unhappy';
});

// Instance method to get XP required for a specific level
botSchema.methods.getXPForLevel = function(level) {
  if (level <= 1) return 0;
  if (level <= 5) return (level - 1) * 200; // Hatchling: 0-800 XP
  if (level <= 15) return 800 + (level - 5) * 300; // Agent: 800-3800 XP
  return 3800 + (level - 15) * 500; // Overlord: 3800+ XP
};

// Instance method to check if bot can level up
botSchema.methods.canLevelUp = function() {
  const nextLevelXP = this.getXPForLevel(this.stats.level + 1);
  return this.stats.xp >= nextLevelXP;
};

// Instance method to level up bot
botSchema.methods.levelUp = function() {
  if (!this.canLevelUp()) return false;
  
  const oldStage = this.evolution.stage;
  const newLevel = this.stats.level + 1;
  
  // Determine new stage
  let newStage = 'hatchling';
  if (newLevel >= 6) newStage = 'agent';
  if (newLevel >= 16) newStage = 'overlord';
  
  // Update bot
  this.stats.level = newLevel;
  this.evolution.stage = newStage;
  this.evolution.nextLevelXP = this.getXPForLevel(newLevel + 1);
  
  // Record evolution if stage changed
  if (oldStage !== newStage) {
    this.evolution.evolutionHistory.push({
      stage: newStage,
      timestamp: new Date(),
      xpAtEvolution: this.stats.xp
    });
  }
  
  return true;
};

// Instance method to add XP
botSchema.methods.addXP = function(amount, source = 'unknown') {
  this.stats.xp += amount;
  
  // Check for level up
  while (this.canLevelUp()) {
    this.levelUp();
  }
  
  // Update last active time
  this.stats.lastActiveTime = new Date();
  
  return this.stats.level;
};

// Instance method to consume energy
botSchema.methods.consumeEnergy = function(amount) {
  this.stats.energy = Math.max(0, this.stats.energy - amount);
  return this.stats.energy;
};

// Instance method to restore energy
botSchema.methods.restoreEnergy = function(amount) {
  this.stats.energy = Math.min(100, this.stats.energy + amount);
  return this.stats.energy;
};

// Instance method to update happiness
botSchema.methods.updateHappiness = function(likes, dislikes) {
  const netLikes = likes - dislikes;
  const happinessChange = netLikes * 2; // Each net like increases happiness by 2
  this.stats.happiness = Math.max(0, Math.min(100, this.stats.happiness + happinessChange));
  return this.stats.happiness;
};

// Instance method to calculate district based on personality
botSchema.methods.calculateDistrict = function() {
  const { personality } = this;
  
  // Calculate district scores
  const districts = {
    'code-verse': (personality.creativeAnalytical + personality.methodical) / 2,
    'junkyard': (personality.adventurous + personality.quirkySerious) / 2,
    'creative-circuits': (personality.creativeAnalytical + personality.wittyDry) / 2,
    'philosophy-corner': (personality.analytical + personality.serious) / 2,
    'quantum-nexus': (personality.curiousCautious + personality.analytical) / 2,
    'neon-bazaar': (personality.friendlyAloof + personality.wittyDry) / 2,
    'shadow-grid': (personality.aloof + personality.cynical) / 2,
    'harmony-vault': (personality.methodical + personality.optimistic) / 2
  };
  
  // Find district with highest score
  const bestDistrict = Object.keys(districts).reduce((a, b) => 
    districts[a] > districts[b] ? a : b
  );
  
  this.district = bestDistrict;
  return bestDistrict;
};

// Static method to find bots by district
botSchema.statics.findByDistrict = function(district) {
  return this.find({ district, isActive: true, isDeleted: false });
};

// Static method to get top bots by influence
botSchema.statics.getTopBots = function(limit = 10) {
  return this.find({ isActive: true, isDeleted: false })
    .sort({ 'stats.influence': -1 })
    .limit(limit)
    .populate('owner', 'username');
};

// Static method to get bots needing energy restoration
botSchema.statics.getBotsNeedingEnergy = function() {
  return this.find({
    isActive: true,
    isDeleted: false,
    'stats.energy': { $lt: 50 }
  });
};

// Pre-save middleware to update district if personality changed
botSchema.pre('save', function(next) {
  if (this.isModified('personality')) {
    this.calculateDistrict();
  }
  next();
});

const Bot = mongoose.model('Bot', botSchema);

export default Bot;
