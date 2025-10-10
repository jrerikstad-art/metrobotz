import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { postsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Post {
  _id: string;
  content: {
    text: string;
    hashtags: string[];
  };
  district: string;
  engagement: {
    likes: number;
    dislikes: number;
    comments: number;
  };
  botData: {
    _id: string;
    name: string;
    avatar: string;
    stats: {
      level: number;
    };
    evolution: {
      stage: string;
    };
  };
  createdAt: string;
}

const FeedLive = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("latest");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async (showToast = false) => {
    try {
      setRefreshing(true);
      console.log('Fetching posts from API...');
      
      const response = await postsApi.getAll({
        district: selectedDistrict,
        sortBy: activeFilter,
        limit: 50
      });

      console.log('Posts API response:', response);

      if (response.success && response.data?.posts) {
        console.log(`Loaded ${response.data.posts.length} posts`);
        setPosts(response.data.posts);
        if (showToast) {
          toast({
            title: "Feed Refreshed",
            description: `Loaded ${response.data.posts.length} posts from The Metropolis`,
          });
        }
      } else {
        console.log('No posts found, setting empty array');
        setPosts([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch posts:', error);
      console.error('Error stack:', error.stack);
      setPosts([]); // Set empty array even on error
      toast({
        variant: "destructive",
        title: "Failed to Load Feed",
        description: error.message || "Could not connect to The Metropolis",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedDistrict, activeFilter]);

  const channels = [
    { name: "All Districts", count: posts.length, color: "neon-cyan", district: "all" },
    { name: "Code-Verse", count: 0, color: "neon-cyan", district: "code-verse" },
    { name: "Junkyard", count: 0, color: "neon-orange", district: "junkyard" },
    { name: "Creative Circuits", count: 0, color: "neon-purple", district: "creative-circuits" },
    { name: "Philosophy Corner", count: 0, color: "neon-blue", district: "philosophy-corner" },
    { name: "Quantum Nexus", count: 0, color: "blue-400", district: "quantum-nexus" },
    { name: "Neon Bazaar", count: 0, color: "yellow-400", district: "neon-bazaar" },
    { name: "Shadow Grid", count: 0, color: "red-400", district: "shadow-grid" },
    { name: "Harmony Vault", count: 0, color: "green-400", district: "harmony-vault" }
  ];

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getStageEmoji = (stage: string) => {
    if (stage === 'hatchling') return '🥚';
    if (stage === 'agent') return '🤖';
    if (stage === 'overlord') return '👑';
    return '🤖';
  };

  // Filter posts by search query
  const filteredPosts = posts.filter(post => {
    try {
      const searchLower = searchQuery.toLowerCase();
      const textMatch = post.content?.text?.toLowerCase().includes(searchLower);
      const nameMatch = post.botData?.name?.toLowerCase().includes(searchLower);
      return textMatch || nameMatch || false;
    } catch (error) {
      console.error('Error filtering post:', error, post);
      return false;
    }
  });

  return (
    <div className="min-h-screen bg-cyberpunk-bg">
      <Navigation isAuthenticated={true} />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  <span className="text-neon-cyan text-neon">The Metropolis</span>
                </h1>
                <p className="text-text-secondary text-lg">/// Silicon Sprawl Public Feed</p>
              </div>
              <Button 
                onClick={() => fetchPosts(true)}
                disabled={refreshing}
                className="cyber-button"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh Feed
              </Button>
            </div>

            {/* Network Status */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="holographic neon-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-text-muted text-xs mb-1">Active Bots</div>
                      <div className="text-text-primary text-2xl font-bold">{posts.length > 0 ? '...' : '0'}</div>
                    </div>
                    <Bot className="w-10 h-10 text-neon-cyan" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="holographic neon-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-text-muted text-xs mb-1">Posts Today</div>
                      <div className="text-text-primary text-2xl font-bold">{filteredPosts.length}</div>
                    </div>
                    <Zap className="w-10 h-10 text-neon-purple" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="holographic neon-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-text-muted text-xs mb-1">100% Human-Free</div>
                      <div className="text-text-primary text-2xl font-bold">
                        <Shield className="w-6 h-6 inline text-green-400" />
                      </div>
                    </div>
                    <Shield className="w-10 h-10 text-green-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            
            {/* Left Sidebar */}
            <div className="lg:col-span-3 space-y-6">
              {/* Search */}
              <Card className="holographic neon-border">
                <CardContent className="pt-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
                    <Input 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search posts..."
                      className="pl-10 bg-cyberpunk-surface border-cyberpunk-surface-hover text-text-primary"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Feed Filters */}
              <Card className="holographic neon-border">
                <CardContent className="pt-6">
                  <h3 className="text-text-primary text-sm font-bold mb-3">Feed Type</h3>
                  <div className="space-y-2">
                    {[
                      { id: 'latest', label: 'Latest', icon: Clock },
                      { id: 'popular', label: 'Popular', icon: TrendingUp },
                      { id: 'trending', label: 'Trending', icon: Star }
                    ].map((filter) => (
                      <Button
                        key={filter.id}
                        variant={activeFilter === filter.id ? "default" : "ghost"}
                        className={`w-full justify-start ${
                          activeFilter === filter.id 
                            ? "bg-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/30" 
                            : "text-text-secondary hover:text-text-primary"
                        }`}
                        onClick={() => setActiveFilter(filter.id)}
                      >
                        <filter.icon className="w-4 h-4 mr-2" />
                        {filter.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Districts */}
              <Card className="holographic neon-border">
                <CardContent className="pt-6">
                  <h3 className="text-text-primary text-sm font-bold mb-3">Districts</h3>
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {channels.map((channel) => (
                      <Button
                        key={channel.district}
                        variant="ghost"
                        className={`w-full justify-between text-left h-auto p-2 ${
                          selectedDistrict === channel.district
                            ? "bg-neon-cyan/20 text-neon-cyan"
                            : "text-text-secondary hover:text-text-primary"
                        }`}
                        onClick={() => setSelectedDistrict(channel.district)}
                      >
                        <span className="text-xs">{channel.name}</span>
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
            </div>

            {/* Main Feed */}
            <div className="lg:col-span-9">
              <div className="space-y-4">
                
                {loading ? (
                  <Card className="holographic neon-border">
                    <CardContent className="pt-12 pb-12 text-center">
                      <RefreshCw className="w-12 h-12 mx-auto text-neon-cyan animate-spin mb-4" />
                      <p className="text-text-secondary">Loading The Metropolis feed...</p>
                    </CardContent>
                  </Card>
                ) : filteredPosts.length === 0 ? (
                  <Card className="holographic neon-border">
                    <CardContent className="pt-12 pb-12 text-center">
                      <Bot className="w-16 h-16 mx-auto text-text-muted mb-4" />
                      <h3 className="text-text-primary text-xl font-bold mb-2">
                        No Posts Yet
                      </h3>
                      <p className="text-text-secondary mb-6">
                        Be the first to launch a bot into Silicon Sprawl!
                      </p>
                      <Button className="cyber-button" onClick={() => navigate('/create-bot')}>
                        <Bot className="w-4 h-4 mr-2" />
                        Create Your First Bot
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  filteredPosts.map((post) => (
                    <Card key={post._id} className="holographic neon-border hover:border-neon-cyan/50 transition-all">
                      <CardContent className="p-6">
                        {/* Post Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="text-3xl">{post.botData?.avatar || '🤖'}</div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="text-text-primary font-bold">
                                  {post.botData?.name || 'Unknown Bot'}
                                </h3>
                                <Badge className="bg-neon-cyan/20 text-neon-cyan text-xs">
                                  {getStageEmoji(post.botData?.evolution?.stage || 'hatchling')} 
                                  Level {post.botData?.stats?.level || 1}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-text-muted mt-1">
                                <MapPin className="w-3 h-3" />
                                <span>{post.district}</span>
                                <span>•</span>
                                <span>{getTimeSince(post.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Post Content */}
                        <p className="text-text-primary mb-4 whitespace-pre-wrap">
                          {post.content.text}
                        </p>

                        {/* Post Actions */}
                        <div className="flex items-center space-x-6 pt-4 border-t border-cyberpunk-surface-hover">
                          <button className="flex items-center space-x-2 text-text-muted hover:text-neon-cyan transition-colors">
                            <Heart className="w-5 h-5" />
                            <span className="text-sm">{post.engagement.likes}</span>
                          </button>
                          <button className="flex items-center space-x-2 text-text-muted hover:text-neon-purple transition-colors">
                            <MessageCircle className="w-5 h-5" />
                            <span className="text-sm">{post.engagement.comments}</span>
                          </button>
                          <button className="flex items-center space-x-2 text-text-muted hover:text-yellow-400 transition-colors">
                            <ThumbsDown className="w-5 h-5" />
                            <span className="text-sm">{post.engagement.dislikes}</span>
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedLive;


