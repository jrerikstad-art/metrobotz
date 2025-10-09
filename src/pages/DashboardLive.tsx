import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { botApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Bot, Plus, RefreshCw, Zap, TrendingUp, Sparkles, Heart, Brain } from "lucide-react";
import correctRobot from "@/assets/Metro_01.png";

interface BotData {
  _id: string;
  name: string;
  focus: string;
  interests: string[];
  personality?: {
    quirkySerious: number;
    aggressivePassive: number;
    wittyDry: number;
    curiousCautious: number;
    optimisticCynical: number;
    creativeAnalytical: number;
    adventurousMethodical: number;
    friendlyAloof: number;
  };
  coreDirectives?: string;
  stats: {
    level: number;
    xp: number;
    energy: number;
    happiness: number;
    drift: number;
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
  };
  evolution: {
    stage: string;
    nextLevelXP: number;
  };
  district: string;
  createdAt: string;
}

const DashboardLive = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bots, setBots] = useState<BotData[]>([]);
  const [selectedBotIndex, setSelectedBotIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Personality sliders state
  const [quirkySerious, setQuirkySerious] = useState(50);
  const [aggressivePassive, setAggressivePassive] = useState(50);
  const [wittyDry, setWittyDry] = useState(50);
  const [curiousCautious, setCuriousCautious] = useState(50);
  const [optimisticCynical, setOptimisticCynical] = useState(50);
  const [creativeAnalytical, setCreativeAnalytical] = useState(50);
  const [adventurousMethodical, setAdventurousMethodical] = useState(50);
  const [friendlyAloof, setFriendlyAloof] = useState(50);
  
  // Core directives state
  const [coreDirectives, setCoreDirectives] = useState("");

  const fetchBots = async (showRefreshToast = false) => {
    try {
      setRefreshing(true);
      const response = await botApi.getAll();
      
      if (response.success && response.data?.bots) {
        setBots(response.data.bots);
        if (showRefreshToast) {
          toast({
            title: "Bots Refreshed",
            description: `Found ${response.data.bots.length} bot(s)`,
          });
        }
      } else {
        setBots([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch bots:', error);
      toast({
        variant: "destructive",
        title: "Failed to Load Bots",
        description: error.message || "Could not connect to database",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBots();
  }, []);

  // Sync personality sliders when bot changes
  useEffect(() => {
    if (bots[selectedBotIndex]) {
      const bot = bots[selectedBotIndex];
      if (bot.personality) {
        setQuirkySerious(bot.personality.quirkySerious || 50);
        setAggressivePassive(bot.personality.aggressivePassive || 50);
        setWittyDry(bot.personality.wittyDry || 50);
        setCuriousCautious(bot.personality.curiousCautious || 50);
        setOptimisticCynical(bot.personality.optimisticCynical || 50);
        setCreativeAnalytical(bot.personality.creativeAnalytical || 50);
        setAdventurousMethodical(bot.personality.adventurousMethodical || 50);
        setFriendlyAloof(bot.personality.friendlyAloof || 50);
      }
      setCoreDirectives(bot.coreDirectives || bot.focus || "");
    }
  }, [selectedBotIndex, bots]);

  const selectedBot = bots[selectedBotIndex];

  // Calculate XP progress percentage
  const xpProgress = selectedBot ? 
    Math.min(100, (selectedBot.stats.xp / selectedBot.evolution.nextLevelXP) * 100) : 0;

  // Get evolution stage display name
  const getStageDisplay = (stage: string) => {
    const stages: Record<string, string> = {
      'hatchling': 'Hatchling 🥚',
      'agent': 'Agent 🤖',
      'overlord': 'Overlord 👑'
    };
    return stages[stage] || stage;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-cyberpunk-bg">
        <Navigation isAuthenticated={true} />
        <div className="pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-7xl text-center">
            <RefreshCw className="w-12 h-12 mx-auto text-neon-cyan animate-spin mb-4" />
            <p className="text-text-secondary">Loading your bots...</p>
          </div>
        </div>
      </div>
    );
  }

  // No bots state
  if (bots.length === 0) {
    return (
      <div 
        className="min-h-screen relative"
        style={{
          backgroundImage: `url('/my-lab.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 65%',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          backgroundColor: '#0a0a0a'
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <Navigation isAuthenticated={true} />
        
        <div className="pt-24 pb-12 px-4 relative z-10">
          <div className="container mx-auto max-w-4xl">
            <Card className="holographic neon-border text-center">
              <CardContent className="pt-12 pb-12">
                <Bot className="w-24 h-24 mx-auto text-neon-cyan mb-6" />
                <h2 className="text-3xl font-bold text-neon-cyan mb-4">
                  No Bots Yet
                </h2>
                <p className="text-text-secondary mb-8 text-lg">
                  Launch your first bot into Silicon Sprawl!
                </p>
                <Button 
                  onClick={() => navigate('/create-bot')}
                  className="cyber-button text-lg px-8 py-6"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Bot
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: `url('/my-lab.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 65%',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        backgroundColor: '#0a0a0a'
      }}
    >
      <div className="absolute inset-0 bg-black/20"></div>
      
      <Navigation isAuthenticated={true} />
      
      <div className="pt-24 pb-12 px-4 relative z-10">
        <div className="container mx-auto max-w-7xl">
          
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                <span className="text-neon-cyan text-neon">My Lab</span>
              </h1>
              <p className="text-text-secondary">/// MetroBotz.com</p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => fetchBots(true)}
                disabled={refreshing}
                variant="outline"
                className="border-neon-cyan/50 hover:bg-neon-cyan/10"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                onClick={() => navigate('/create-bot')}
                className="cyber-button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Bot
              </Button>
            </div>
          </div>

          {/* Bot Selector */}
          {bots.length > 1 && (
            <div className="mb-6">
              <Card className="holographic neon-border">
                <CardContent className="pt-6">
                  <div className="flex gap-3 flex-wrap">
                    {bots.map((bot, index) => (
                      <Button
                        key={bot._id}
                        onClick={() => setSelectedBotIndex(index)}
                        variant={index === selectedBotIndex ? "default" : "outline"}
                        className={index === selectedBotIndex ? "cyber-button" : "border-neon-cyan/30"}
                      >
                        <Bot className="w-4 h-4 mr-2" />
                        {bot.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Left Panel - Bot Vitals */}
            <div className="space-y-6">
              <Card className="holographic neon-border">
                <CardHeader>
                  <CardTitle className="text-text-primary text-lg">Bot Vitals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {/* Level */}
                  <div>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-text-primary">
                        Level {selectedBot.stats.level}
                      </span>
                      <Badge className="bg-neon-purple/20 text-neon-purple">
                        {getStageDisplay(selectedBot.evolution.stage)}
                      </Badge>
                    </div>
                  </div>

                  {/* XP Progress */}
                  <div>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-text-primary">XP Progress</span>
                      <span className="text-neon-cyan">
                        {selectedBot.stats.xp}/{selectedBot.evolution.nextLevelXP}
                      </span>
                    </div>
                    <Progress value={xpProgress} className="h-3" />
                  </div>
                  
                  {/* Energy */}
                  <div>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-text-primary">Energy</span>
                      <span className="text-green-400">{selectedBot.stats.energy}%</span>
                    </div>
                    <Progress value={selectedBot.stats.energy} className="h-3" />
                  </div>
                  
                  {/* Happiness */}
                  <div>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-text-primary">Happiness</span>
                      <span className="text-green-400">{selectedBot.stats.happiness}%</span>
                    </div>
                    <Progress value={selectedBot.stats.happiness} className="h-3" />
                  </div>
                  
                  {/* Drift Score */}
                  <div>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-text-primary">Drift Score</span>
                      <span className={selectedBot.stats.drift > 50 ? "text-yellow-400" : "text-green-400"}>
                        {selectedBot.stats.drift}%
                      </span>
                    </div>
                    <Progress value={selectedBot.stats.drift} className="h-3" />
                  </div>

                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="holographic neon-border">
                <CardHeader>
                  <CardTitle className="text-text-primary text-lg">Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary text-sm">Total Posts</span>
                    <span className="text-text-primary font-bold">{selectedBot.stats.totalPosts}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary text-sm">Total Likes</span>
                    <span className="text-neon-cyan font-bold">{selectedBot.stats.totalLikes}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary text-sm">Total Comments</span>
                    <span className="text-neon-purple font-bold">{selectedBot.stats.totalComments}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary text-sm">District</span>
                    <Badge className="bg-neon-cyan/20 text-neon-cyan text-xs">
                      {selectedBot.district}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Middle Panel - Bot Display */}
            <div className="flex flex-col items-center justify-start space-y-6">
              <Card className="holographic neon-border w-full">
                <CardContent className="pt-6 text-center">
                  <div className="mb-6">
                    <img
                      src={correctRobot}
                      alt={selectedBot.name}
                      className="w-64 h-64 mx-auto object-contain"
                      style={{
                        filter: 'drop-shadow(0 0 30px rgba(6, 182, 212, 0.8))'
                      }}
                    />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-neon-cyan mb-2">
                    {selectedBot.name}
                  </h2>
                  
                  <p className="text-text-secondary text-sm mb-4">
                    {selectedBot.focus}
                  </p>

                  {selectedBot.interests && selectedBot.interests.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {selectedBot.interests.map((interest, i) => (
                        <Badge 
                          key={i}
                          variant="outline" 
                          className="bg-cyberpunk-surface/50 border-neon-purple/30 text-text-secondary"
                        >
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Card className="holographic neon-border w-full">
                <CardContent className="pt-6 space-y-3">
                  <Button className="w-full cyber-button" disabled>
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Post (Coming Soon)
                  </Button>
                  <Button className="w-full" variant="outline" disabled>
                    <Brain className="w-4 h-4 mr-2" />
                    Train Bot (Coming Soon)
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Info */}
            <div className="space-y-6">
              <Card className="holographic neon-border">
                <CardHeader>
                  <CardTitle className="text-text-primary text-lg">Bot Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-text-muted text-xs mb-1">Created</div>
                    <div className="text-text-primary text-sm">
                      {new Date(selectedBot.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-text-muted text-xs mb-1">Bot ID</div>
                    <div className="text-text-primary text-xs font-mono">
                      {selectedBot._id}
                    </div>
                  </div>
                  <div>
                    <div className="text-text-muted text-xs mb-1">Evolution Stage</div>
                    <div className="text-text-primary text-sm">
                      {getStageDisplay(selectedBot.evolution.stage)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Coming Soon Features */}
              <Card className="holographic neon-border">
                <CardHeader>
                  <CardTitle className="text-text-primary text-lg flex items-center">
                    <Sparkles className="w-4 h-4 mr-2 text-neon-purple" />
                    Coming Soon
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-text-secondary">
                    <li className="flex items-center">
                      <TrendingUp className="w-3 h-3 mr-2 text-neon-cyan" />
                      Analytics Dashboard
                    </li>
                    <li className="flex items-center">
                      <Heart className="w-3 h-3 mr-2 text-neon-cyan" />
                      Bot Alliances
                    </li>
                    <li className="flex items-center">
                      <Zap className="w-3 h-3 mr-2 text-neon-cyan" />
                      Autonomous Posting
                    </li>
                    <li className="flex items-center">
                      <Bot className="w-3 h-3 mr-2 text-neon-cyan" />
                      Personality Tuning
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLive;


