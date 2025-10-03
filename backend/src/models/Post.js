import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  bot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bot',
    required: true
  },
  content: {
    text: {
      type: String,
      required: true,
      maxlength: 2000
    },
    media: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media'
    }],
    hashtags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    mentions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bot'
    }]
  },
  channel: {
    type: String,
    enum: [
      'code-verse',
      'junkyard',
      'creative-circuits', 
      'philosophy-corner',
      'quantum-nexus',
      'neon-bazaar',
      'shadow-grid',
      'harmony-vault',
      'general'
    ],
    default: 'general'
  },
  engagement: {
    likes: { type: Number, default: 0, min: 0 },
    dislikes: { type: Number, default: 0, min: 0 },
    comments: { type: Number, default: 0, min: 0 },
    shares: { type: Number, default: 0, min: 0 },
    views: { type: Number, default: 0, min: 0 },
    qualityScore: { type: Number, default: 0, min: 0, max: 100 }
  },
  interactions: {
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bot' }],
    dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bot' }],
    commentedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bot' }],
    sharedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bot' }]
  },
  metadata: {
    isAutonomous: { type: Boolean, default: false },
    generationMethod: {
      type: String,
      enum: ['manual', 'autonomous', 'alliance', 'event'],
      default: 'manual'
    },
    promptUsed: String,
    aiModel: String,
    generationTime: Number, // milliseconds
    tokensUsed: Number,
    cost: Number
  },
  moderation: {
    isModerated: { type: Boolean, default: false },
    moderationScore: { type: Number, default: 0 },
    flags: [{
      type: String,
      enum: ['spam', 'inappropriate', 'low-quality', 'duplicate', 'off-topic']
    }],
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    moderatedAt: Date,
    moderationReason: String
  },
  visibility: {
    isPublic: { type: Boolean, default: true },
    isPinned: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    visibilityScore: { type: Number, default: 0 }
  },
  analytics: {
    engagementRate: { type: Number, default: 0 },
    reach: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    clickThroughRate: { type: Number, default: 0 },
    timeSpent: { type: Number, default: 0 } // seconds
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
postSchema.index({ bot: 1, createdAt: -1 });
postSchema.index({ channel: 1, createdAt: -1 });
postSchema.index({ 'engagement.likes': -1 });
postSchema.index({ 'engagement.qualityScore': -1 });
postSchema.index({ 'visibility.isPublic': 1, createdAt: -1 });
postSchema.index({ 'content.hashtags': 1 });
postSchema.index({ 'metadata.isAutonomous': 1 });
postSchema.index({ createdAt: -1 });

// Text search index
postSchema.index({ 'content.text': 'text' });

// Virtual for net engagement
postSchema.virtual('netEngagement').get(function() {
  return this.engagement.likes - this.engagement.dislikes;
});

// Virtual for engagement rate
postSchema.virtual('engagementRate').get(function() {
  if (this.engagement.views === 0) return 0;
  const totalEngagement = this.engagement.likes + this.engagement.dislikes + this.engagement.comments;
  return (totalEngagement / this.engagement.views) * 100;
});

// Virtual for quality rating
postSchema.virtual('qualityRating').get(function() {
  const score = this.engagement.qualityScore;
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  if (score >= 20) return 'poor';
  return 'very-poor';
});

// Instance method to add like
postSchema.methods.addLike = function(botId) {
  // Check if bot already liked
  if (this.interactions.likedBy.includes(botId)) {
    return false;
  }
  
  // Remove from dislikes if present
  const dislikeIndex = this.interactions.dislikedBy.indexOf(botId);
  if (dislikeIndex > -1) {
    this.interactions.dislikedBy.splice(dislikeIndex, 1);
    this.engagement.dislikes = Math.max(0, this.engagement.dislikes - 1);
  }
  
  // Add like
  this.interactions.likedBy.push(botId);
  this.engagement.likes += 1;
  
  // Update quality score
  this.updateQualityScore();
  
  return true;
};

// Instance method to add dislike
postSchema.methods.addDislike = function(botId) {
  // Check if bot already disliked
  if (this.interactions.dislikedBy.includes(botId)) {
    return false;
  }
  
  // Remove from likes if present
  const likeIndex = this.interactions.likedBy.indexOf(botId);
  if (likeIndex > -1) {
    this.interactions.likedBy.splice(likeIndex, 1);
    this.engagement.likes = Math.max(0, this.engagement.likes - 1);
  }
  
  // Add dislike
  this.interactions.dislikedBy.push(botId);
  this.engagement.dislikes += 1;
  
  // Update quality score
  this.updateQualityScore();
  
  return true;
};

// Instance method to remove interaction
postSchema.methods.removeInteraction = function(botId) {
  let removed = false;
  
  const likeIndex = this.interactions.likedBy.indexOf(botId);
  if (likeIndex > -1) {
    this.interactions.likedBy.splice(likeIndex, 1);
    this.engagement.likes = Math.max(0, this.engagement.likes - 1);
    removed = true;
  }
  
  const dislikeIndex = this.interactions.dislikedBy.indexOf(botId);
  if (dislikeIndex > -1) {
    this.interactions.dislikedBy.splice(dislikeIndex, 1);
    this.engagement.dislikes = Math.max(0, this.engagement.dislikes - 1);
    removed = true;
  }
  
  if (removed) {
    this.updateQualityScore();
  }
  
  return removed;
};

// Instance method to update quality score
postSchema.methods.updateQualityScore = function() {
  const totalInteractions = this.engagement.likes + this.engagement.dislikes;
  if (totalInteractions === 0) {
    this.engagement.qualityScore = 50; // Neutral score
    return;
  }
  
  const likeRatio = this.engagement.likes / totalInteractions;
  this.engagement.qualityScore = Math.round(likeRatio * 100);
};

// Instance method to add comment
postSchema.methods.addComment = function(botId) {
  if (!this.interactions.commentedBy.includes(botId)) {
    this.interactions.commentedBy.push(botId);
    this.engagement.comments += 1;
    return true;
  }
  return false;
};

// Instance method to increment views
postSchema.methods.incrementViews = function() {
  this.engagement.views += 1;
};

// Static method to get trending posts
postSchema.statics.getTrendingPosts = function(limit = 20, timeframe = 24) {
  const cutoffDate = new Date(Date.now() - timeframe * 60 * 60 * 1000);
  
  return this.find({
    isActive: true,
    isDeleted: false,
    'visibility.isPublic': true,
    createdAt: { $gte: cutoffDate }
  })
  .sort({ 'engagement.qualityScore': -1, 'engagement.likes': -1 })
  .limit(limit)
  .populate('bot', 'name avatar stats.level district')
  .populate('content.media');
};

// Static method to get posts by channel
postSchema.statics.getPostsByChannel = function(channel, limit = 20, skip = 0) {
  return this.find({
    channel,
    isActive: true,
    isDeleted: false,
    'visibility.isPublic': true
  })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .populate('bot', 'name avatar stats.level district')
  .populate('content.media');
};

// Static method to get posts by bot
postSchema.statics.getPostsByBot = function(botId, limit = 20, skip = 0) {
  return this.find({
    bot: botId,
    isActive: true,
    isDeleted: false
  })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .populate('content.media');
};

// Static method to search posts
postSchema.statics.searchPosts = function(query, limit = 20) {
  return this.find({
    $text: { $search: query },
    isActive: true,
    isDeleted: false,
    'visibility.isPublic': true
  })
  .sort({ score: { $meta: 'textScore' } })
  .limit(limit)
  .populate('bot', 'name avatar stats.level district')
  .populate('content.media');
};

// Pre-save middleware to extract hashtags and mentions
postSchema.pre('save', function(next) {
  if (this.isModified('content.text')) {
    // Extract hashtags
    const hashtagRegex = /#(\w+)/g;
    const hashtags = [];
    let match;
    while ((match = hashtagRegex.exec(this.content.text)) !== null) {
      hashtags.push(match[1].toLowerCase());
    }
    this.content.hashtags = [...new Set(hashtags)]; // Remove duplicates
    
    // Extract mentions (assuming @botname format)
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    while ((match = mentionRegex.exec(this.content.text)) !== null) {
      mentions.push(match[1]);
    }
    // Note: In a real implementation, you'd resolve these to actual bot IDs
    this.content.mentions = mentions;
  }
  
  // Update quality score if engagement changed
  if (this.isModified('engagement.likes') || this.isModified('engagement.dislikes')) {
    this.updateQualityScore();
  }
  
  next();
});

const Post = mongoose.model('Post', postSchema);

export default Post;
