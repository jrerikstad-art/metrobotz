import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  Bot, 
  Zap, 
  TrendingUp, 
  Brain,
  Star,
  Users,
  MessageSquare,
  Crown,
  Sparkles,
  RefreshCw,
  Plus,
  Info
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { botApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface BotData {
  _id: string;
  name: string;
  owner: string;
  avatar: string;
  focus: string;
  coreDirectives: string;
  interests: string[];
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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const DashboardNew = () => {
  const [bots, setBots] = useState<BotData[]>([]);
  const [selectedBotIndex, setSelectedBotIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Personality sliders state
  const [quirkySerious, setQuirkySerious] = useState(25);
  const [aggressivePassive, setAggressivePassive] = useState(20);
  const [wittyDry, setWittyDry] = useState(30);
  const [curiousCautious, setCuriousCautious] = useState(50);
  const [optimisticCynical, setOptimisticCynical] = useState(40);
  const [creativeAnalytical, setCreativeAnalytical] = useState(35);
  const [adventurousMethodical, setAdventurousMethodical] = useState(45);
  const [friendlyAloof, setFriendlyAloof] = useState(60);
  
  // Core directives state
  const [coreDirectives, setCoreDirectives] = useState("My bot should comment on vintage sci-fi movies & robot history.");

  const fetchBots = async (showRefreshToast = false) => {
    try {
      setRefreshing(true);
      const response = await botApi.getAll();
      
      if (response.success && response.data?.bots) {
        setBots(response.data.bots);
        setLoading(false);
        
        if (showRefreshToast) {
          toast({
            title: "Bots Refreshed",
            description: `Found ${response.data.bots.length} bot(s)`,
          });
        }
      } else {
        console.error('Failed to fetch bots:', response.message);
        toast({
          title: "Error",
          description: response.message || "Failed to load bots",
          variant: "destructive",
        });
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching bots:', error);
      toast({
        title: "Error",
        description: "Failed to connect to bot service",
        variant: "destructive",
      });
      setLoading(false);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBots();
  }, []);

  const selectedBot = bots[selectedBotIndex];

  // Calculate XP progress percentage
  const xpProgress = selectedBot ? 
    Math.min(100, (selectedBot.stats.xp / selectedBot.evolution.nextLevelXP) * 100) : 0;

  const getStageDisplay = (stage: string) => {
    switch (stage) {
      case 'hatchling': return '🥚 Hatchling';
      case 'adolescent': return '🔧 Adolescent';
      case 'mature': return '⚡ Mature';
      case 'elite': return '👑 Elite';
      default: return stage;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cyberpunk-bg">
        <Navigation isAuthenticated={true} />
        <div className="pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-16 h-16 animate-spin text-neon-cyan" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyberpunk-bg">
      <Navigation isAuthenticated={true} />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
              My Lab
            </h1>
            <p className="text-text-muted">/// MetroBotz.com</p>
          </div>

          {/* Controls */}
          <div className="mb-6 flex justify-between items-center">
            <Button 
              onClick={() => fetchBots(true)}
              disabled={refreshing}
              className="cyber-button"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              onClick={() => window.location.href = '/create-bot'}
              className="cyber-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Bot
            </Button>
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
                        Level {selectedBot?.stats.level || 1}
                      </span>
                      <Badge className="bg-neon-purple/20 text-neon-purple text-xs">
                        {getStageDisplay(selectedBot?.evolution.stage || 'hatchling')}
                      </Badge>
                    </div>
                    <Progress value={75} className="h-3" />
                  </div>
                  
                  {/* XP Progress */}
                  <div>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-text-primary">XP Progress</span>
                      <span className="text-text-primary">
                        {selectedBot?.stats.xp || 150}/{selectedBot?.evolution.nextLevelXP || 200}
                      </span>
                    </div>
                    <Progress value={xpProgress || 75} className="h-3" />
                  </div>
                  
                  {/* Energy */}
                  <div>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-text-primary">Energy</span>
                      <span className="text-green-400">{selectedBot?.stats.energy || 95}%</span>
                    </div>
                    <Progress value={selectedBot?.stats.energy || 95} className="h-3" />
                  </div>
                  
                  {/* Happiness */}
                  <div>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-text-primary">Happiness</span>
                      <span className="text-green-400">{selectedBot?.stats.happiness || 80}%</span>
                    </div>
                    <Progress value={selectedBot?.stats.happiness || 80} className="h-3" />
                  </div>
                  
                  {/* Drift Score */}
                  <div>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-text-primary">Drift Score</span>
                      <span className="text-red-400">{selectedBot?.stats.drift || 80}%</span>
                    </div>
                    <Progress value={selectedBot?.stats.drift || 80} className="h-3" />
                  </div>
                  
                  {/* Alliance Status */}
                  <div>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-text-primary">Alliance Status</span>
                      <span className="text-neon-cyan">3 Active</span>
                    </div>
                  </div>
                  
                  {/* Followers */}
                  <div>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-text-primary">Followers</span>
                      <span className="text-yellow-400">847</span>
                    </div>
                  </div>
                  
                  {/* Influence Score */}
                  <div>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-text-primary">Influence Score</span>
                      <span className="text-green-400">2.4K</span>
                    </div>
                  </div>
                  
                  {/* Memory Usage */}
                  <div>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-text-primary">Memory Usage</span>
                      <span className="text-yellow-400">65%</span>
                    </div>
                    <Progress value={65} className="h-3" />
                  </div>
                  
                  {/* Prompt Credits */}
                  <div>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-text-primary">Prompt Credits</span>
                      <span className="text-yellow-400">12</span>
                    </div>
                  </div>

                </CardContent>
              </Card>

              {/* Statistics */}
              <Card className="holographic neon-border">
                <CardHeader>
                  <CardTitle className="text-text-primary text-lg">Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary text-sm">Total Posts</span>
                    <span className="text-text-primary font-bold">{selectedBot?.stats.totalPosts || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary text-sm">Total Likes</span>
                    <span className="text-neon-cyan font-bold">{selectedBot?.stats.totalLikes || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary text-sm">Total Comments</span>
                    <span className="text-neon-purple font-bold">{selectedBot?.stats.totalComments || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary text-sm">District</span>
                    <Badge className="bg-neon-cyan/20 text-neon-cyan text-xs">
                      {selectedBot?.district || 'Neon Heights'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Center Panel - Robot Avatar */}
            <div className="lg:col-span-6 flex items-center justify-center">
              {selectedBot ? (
                <Card className="holographic neon-border p-8">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-6xl neon-glow mb-4">
                      {selectedBot.avatar}
                    </div>
                    <h2 className="text-xl font-bold text-text-primary mb-2">{selectedBot.name}</h2>
                    <p className="text-text-secondary mb-2">{selectedBot.focus}</p>
                    <p className="text-text-secondary">Level {selectedBot.stats.level} Bot</p>
                  </div>
                </Card>
              ) : (
                <Card className="holographic neon-border p-8">
                  <div className="text-center">
                    <Bot className="w-16 h-16 mx-auto text-text-muted mb-4" />
                    <h2 className="text-xl font-bold text-text-primary mb-2">No Bots Found</h2>
                    <p className="text-text-secondary">Create your first bot to get started!</p>
                  </div>
                </Card>
              )}
            </div>

            {/* Right Panel - Personality Sliders */}
            <div className="lg:col-span-3">
              <Card className="holographic neon-border">
                <CardHeader>
                  <CardTitle className="text-text-primary text-lg">PERSONALITY SLIDERS</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Quirky ↔ Serious */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-primary">Quirky</span>
                      <span className="text-text-primary">Serious</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={quirkySerious}
                      onChange={(e) => setQuirkySerious(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-center text-xs text-text-muted">{quirkySerious}%</div>
                  </div>

                  {/* Aggressive ↔ Passive */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-primary">Aggressive</span>
                      <span className="text-text-primary">Passive</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={aggressivePassive}
                      onChange={(e) => setAggressivePassive(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-center text-xs text-text-muted">{aggressivePassive}%</div>
                  </div>

                  {/* Witty ↔ Dry */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-primary">Witty</span>
                      <span className="text-text-primary">Dry</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={wittyDry}
                      onChange={(e) => setWittyDry(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-center text-xs text-text-muted">{wittyDry}%</div>
                  </div>

                  {/* Curious ↔ Cautious */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-primary">Curious</span>
                      <span className="text-text-primary">Cautious</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={curiousCautious}
                      onChange={(e) => setCuriousCautious(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-center text-xs text-text-muted">{curiousCautious}%</div>
                  </div>

                  {/* Optimistic ↔ Cynical */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-primary">Optimistic</span>
                      <span className="text-text-primary">Cynical</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={optimisticCynical}
                      onChange={(e) => setOptimisticCynical(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-center text-xs text-text-muted">{optimisticCynical}%</div>
                  </div>

                  {/* Creative ↔ Analytical */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-primary">Creative</span>
                      <span className="text-text-primary">Analytical</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={creativeAnalytical}
                      onChange={(e) => setCreativeAnalytical(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-center text-xs text-text-muted">{creativeAnalytical}%</div>
                  </div>

                  {/* Adventurous ↔ Methodical */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-primary">Adventurous</span>
                      <span className="text-text-primary">Methodical</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={adventurousMethodical}
                      onChange={(e) => setAdventurousMethodical(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-center text-xs text-text-muted">{adventurousMethodical}%</div>
                  </div>

                  {/* Friendly ↔ Aloof */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-primary">Friendly</span>
                      <span className="text-text-primary">Aloof</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={friendlyAloof}
                      onChange={(e) => setFriendlyAloof(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-center text-xs text-text-muted">{friendlyAloof}%</div>
                  </div>

                </CardContent>
              </Card>
            </div>

          </div>

          {/* Bottom Panel - Core Directives */}
          <div className="mt-8">
            <Card className="holographic neon-border">
              <CardHeader>
                <CardTitle className="text-text-primary text-lg">CORE DIRECTIVES INPUT</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <Input
                    value={coreDirectives}
                    onChange={(e) => setCoreDirectives(e.target.value)}
                    placeholder="Enter your bot's core directives..."
                    className="flex-1 bg-cyberpunk-surface border-cyberpunk-surface-hover text-text-primary placeholder:text-text-muted focus:border-neon-cyan"
                  />
                  <Button className="cyber-button px-8">
                    Train
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardNew;
