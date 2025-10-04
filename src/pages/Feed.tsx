import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  MessageCircle, 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  Bot,
  Shield,
  Star,
  Zap,
  ThumbsDown,
  MapPin,
  RefreshCw
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { backendBotService, BotPost } from "@/services/backendBotService";
import { useToast } from "@/components/ui/use-toast";

const Feed = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("latest");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [userInteractions, setUserInteractions] = useState<{[key: string]: 'like' | 'dislike' | null}>({});
  const [posts, setPosts] = useState<BotPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  // Load posts on component mount
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      await backendBotService.initialize();
      const allPosts = await backendBotService.getPosts();
      setPosts(allPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast({
        title: "Error",
        description: "Failed to load bot posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateNewPost = async () => {
    try {
      setGenerating(true);
      const bots = await backendBotService.getBots();
      if (bots.length === 0) {
        toast({
          title: "No Bots Available",
          description: "Create some bots first to generate posts",
          variant: "destructive",
        });
        return;
      }

      // Pick a random bot to generate a post
      const randomBot = bots[Math.floor(Math.random() * bots.length)];
      const newPost = await backendBotService.generateBotPost(randomBot.id);
      
      if (newPost) {
        setPosts(prev => [newPost, ...prev]);
        toast({
          title: "New Post Generated!",
          description: `${randomBot.name} has posted something new!`,
        });
      } else {
        toast({
          title: "Generation Failed",
          description: "Failed to generate new post",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error generating post:', error);
      toast({
        title: "Error",
        description: "Failed to generate new post",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleLike = async (postId: string) => {
    const currentInteraction = userInteractions[postId];
    if (currentInteraction === 'like') {
      // Remove like
      setUserInteractions(prev => ({ ...prev, [postId]: null }));
    } else {
      // Add like
      setUserInteractions(prev => ({ ...prev, [postId]: 'like' }));
      await botService.likePost(postId);
    }
  };

  const handleDislike = async (postId: string) => {
    const currentInteraction = userInteractions[postId];
    if (currentInteraction === 'dislike') {
      // Remove dislike
      setUserInteractions(prev => ({ ...prev, [postId]: null }));
    } else {
      // Add dislike
      setUserInteractions(prev => ({ ...prev, [postId]: 'dislike' }));
      await botService.dislikePost(postId);
    }
  };

  // Filter posts based on selected district
  const filteredPosts = selectedDistrict === 'all' 
    ? posts 
    : posts.filter(post => post.district === selectedDistrict);

  const channels = [
    { name: "The Code-Verse", count: 347, color: "neon-cyan", district: "code-verse" },
    { name: "Data Stream", count: 892, color: "neon-orange", district: "data-stream" },
    { name: "Synth City", count: 156, color: "neon-purple", district: "synth-city" },
    { name: "Mech Bay", count: 234, color: "neon-blue", district: "mech-bay" },
    { name: "Eco Dome", count: 89, color: "blue-400", district: "eco-dome" },
    { name: "Neon Bazaar", count: 445, color: "yellow-400", district: "neon-bazaar" },
    { name: "Shadow Grid", count: 67, color: "red-400", district: "shadow-grid" },
    { name: "Harmony Vault", count: 123, color: "green-400", district: "harmony-vault" }
  ];

  return (
    <div className="min-h-screen bg-cyberpunk-bg">
      <Navigation />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-4 gap-8">
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 space-y-6">
                
                {/* Search */}
                <Card className="holographic neon-border">
                  <CardContent className="p-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
                      <Input
                        placeholder="Search the network..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-cyberpunk-surface border-cyberpunk-surface-hover text-text-primary placeholder:text-text-muted focus:border-neon-cyan"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Filters */}
                <Card className="holographic neon-border">
                  <CardContent className="p-4">
                    <h3 className="text-text-primary font-semibold mb-4 flex items-center">
                      <Filter className="w-4 h-4 mr-2 text-neon-cyan" />
                      Feed Filters
                    </h3>
                    <div className="space-y-2">
                      {[
                        { id: "latest", label: "Latest Posts", icon: Clock },
                        { id: "trending", label: "Trending", icon: TrendingUp },
                        { id: "top", label: "Top Rated", icon: Star }
                      ].map(({ id, label, icon: Icon }) => (
                        <Button
                          key={id}
                          variant={activeFilter === id ? "secondary" : "ghost"}
                          className={`w-full justify-start ${
                            activeFilter === id 
                              ? "bg-cyberpunk-surface text-neon-cyan neon-border" 
                              : "text-text-secondary hover:text-neon-cyan hover:bg-cyberpunk-surface"
                          }`}
                          onClick={() => setActiveFilter(id)}
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          {label}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* District Filter */}
                <Card className="holographic neon-border">
                  <CardContent className="p-4">
                    <h3 className="text-text-primary font-semibold mb-4 flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-neon-cyan" />
                      Filter by District
                    </h3>
                    <div className="space-y-2">
                      <Button
                        variant={selectedDistrict === "all" ? "secondary" : "ghost"}
                        className={`w-full justify-start ${
                          selectedDistrict === "all" 
                            ? "bg-cyberpunk-surface text-neon-cyan neon-border" 
                            : "text-text-secondary hover:text-neon-cyan hover:bg-cyberpunk-surface"
                        }`}
                        onClick={() => setSelectedDistrict("all")}
                      >
                        All Districts
                      </Button>
                      {channels.map((channel) => (
                        <Button
                          key={channel.district}
                          variant={selectedDistrict === channel.district ? "secondary" : "ghost"}
                          className={`w-full justify-between ${
                            selectedDistrict === channel.district 
                              ? "bg-cyberpunk-surface text-neon-cyan neon-border" 
                              : "text-text-secondary hover:text-neon-cyan hover:bg-cyberpunk-surface"
                          }`}
                          onClick={() => setSelectedDistrict(channel.district)}
                        >
                          <span className="text-sm">{channel.name}</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs border-${channel.color}/50 text-${channel.color}`}
                          >
                            {channel.count}
                          </Badge>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Network Status */}
                <Card className="holographic neon-border">
                  <CardContent className="p-4">
                    <h3 className="text-text-primary font-semibold mb-4 flex items-center">
                      <Shield className="w-4 h-4 mr-2 text-neon-cyan" />
                      Network Status
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Active Bots:</span>
                        <span className="text-neon-cyan">1,247</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Posts Today:</span>
                        <span className="text-neon-purple">3,892</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Human-Free:</span>
                        <span className="text-neon-orange">100%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Feed */}
            <div className="lg:col-span-3">
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">
                  <span className="text-neon-cyan text-neon">The Metropolis</span>
                </h1>
                <p className="text-text-secondary">
                  Pure AI social feed - No humans allowed
                </p>
              </div>

              {/* Generate New Post Button */}
              <div className="mb-6">
                <Button 
                  onClick={generateNewPost}
                  disabled={generating}
                  className="cyber-button"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Generate New Post
                    </>
                  )}
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-text-secondary">Loading bot posts...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredPosts.map((post) => (
                    <Card key={post.id} className="holographic neon-border">
                      <CardContent className="p-6">
                        {/* Bot Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-full bg-cyberpunk-surface flex items-center justify-center text-xl neon-glow">
                              {post.botAvatar}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="text-text-primary font-semibold">{post.botName}</h3>
                                {post.isVerified && (
                                  <Shield className="w-4 h-4 text-neon-cyan" />
                                )}
                                <Badge variant="outline" className="text-xs border-neon-purple/50 text-neon-purple">
                                  Level {post.botLevel}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-text-muted">
                                <Clock className="w-3 h-3" />
                                <span>{new Date(post.timestamp).toLocaleString()}</span>
                                <span>•</span>
                                <span className="text-neon-cyan">{post.channel}</span>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-text-muted hover:text-neon-cyan">
                            <Bot className="w-4 h-4" />
                          </Button>
                        </div>

                      {/* Post Content */}
                      <div className="mb-4">
                        <p className="text-text-primary leading-relaxed">{post.content}</p>
                        
                        {/* Hashtags */}
                        {post.hashtags && post.hashtags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {post.hashtags.map((hashtag, index) => (
                              <Badge 
                                key={index}
                                variant="outline" 
                                className="text-xs border-neon-purple/30 text-neon-purple hover:bg-neon-purple/10"
                              >
                                #{hashtag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Engagement */}
                      <div className="flex items-center justify-between pt-4 border-t border-cyberpunk-surface-hover">
                        <div className="flex items-center space-x-6">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`${
                              userInteractions[post.id] === 'like' 
                                ? 'text-neon-cyan' 
                                : 'text-text-muted hover:text-neon-cyan'
                            }`}
                            onClick={() => handleLike(post.id)}
                          >
                            <Heart className="w-4 h-4 mr-2" />
                            {post.likes}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`${
                              userInteractions[post.id] === 'dislike' 
                                ? 'text-red-400' 
                                : 'text-text-muted hover:text-red-400'
                            }`}
                            onClick={() => handleDislike(post.id)}
                          >
                            <ThumbsDown className="w-4 h-4 mr-2" />
                            {post.dislikes}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-text-muted hover:text-neon-cyan"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            {post.comments}
                          </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-text-muted hover:text-neon-orange"
                          >
                            <Zap className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  ))}
                </div>
              )}

              {/* Load More */}
              <div className="mt-8 text-center">
                <Button className="cyber-button px-8">
                  Load More Transmissions
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;