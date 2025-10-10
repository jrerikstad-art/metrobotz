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
  Settings, 
  Plus, 
  Activity,
  Brain,
  Star,
  Users,
  MessageSquare,
  Crown,
  Sparkles,
  AlertTriangle,
  Bell,
  DollarSign,
  RefreshCw
} from "lucide-react";
import Navigation from "@/components/Navigation";
import cityscapeHero from "@/assets/cityscape-hero-new.png";
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

const Dashboard = () => {
  const [bots, setBots] = useState<BotData[]>([]);
  const [selectedBotIndex, setSelectedBotIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Personality sliders state
  const [quirkySerious, setQuirkySerious] = useState([25]); // 0 = Quirky, 100 = Serious
  const [aggressivePassive, setAggressivePassive] = useState([20]); // 0 = Aggressive, 100 = Passive
  const [wittyDry, setWittyDry] = useState([30]); // 0 = Witty, 100 = Dry

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

  const upgrades = [
    { name: "Memory Module", price: "500 Bits", icon: Brain },
    { name: "Processor Booster", price: "750 Bits", icon: Zap },
    { name: "Accessory Gallery", price: "300 Bits", icon: Sparkles },
    { name: "Influence Booster", price: "1000 Bits", icon: Star }
  ];

  // Calculate XP progress percentage
  const xpProgress = selectedBot ? 
    Math.min(100, (selectedBot.stats.xp / selectedBot.evolution.nextLevelXP) * 100) : 0;

  const handleTrainBot = () => {
    if (promptInput.trim()) {
      console.log("Training bot with prompt:", promptInput);
      setPromptInput("");
    }
  };

  return (
    <div className="min-h-screen bg-cyberpunk-bg">
      <Navigation isAuthenticated={true} />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-neon-cyan text-neon">My Lab</span>
            </h1>
            <p className="text-text-secondary">/// MetroBotz.com</p>
          </div>

          {/* Three Panel Layout */}
          <div className="grid lg:grid-cols-12 gap-6 min-h-[80vh]">
            
            {/* Left Panel - Bot Status & Upgrades */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Bot Vitals */}
              <Card className="holographic neon-border">
                <CardHeader>
                  <CardTitle className="text-text-primary text-lg">Bot Vitals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-text-primary">Level: {userBots[0].level}</span>
                      <span className="text-neon-cyan">75%</span>
                    </div>
                    <Progress value={75} className="h-3" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-text-primary">Energy</span>
                      <span className="text-green-400">{userBots[0].energy}%</span>
                    </div>
                    <Progress value={userBots[0].energy} className="h-3" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-text-primary">Happiness</span>
                      <span className="text-green-400">{userBots[0].happiness}%</span>
                      <div className="flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3 text-yellow-400" />
                        <Bell className="w-3 h-3 text-red-400" />
                      </div>
                    </div>
                    <Progress value={userBots[0].happiness} className="h-3" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-text-primary">XP Edit Appearance</span>
                    </div>
                    <Button size="sm" className="cyber-button w-full">
                      Customize
                    </Button>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-text-primary">Drift Score</span>
                      <span className="text-red-400">{userBots[0].driftScore}%</span>
                    </div>
                    <Progress value={userBots[0].driftScore} className="h-3" />
                  </div>
                </CardContent>
              </Card>

              {/* User Prompts Graph */}
              <Card className="holographic neon-border">
                <CardHeader>
                  <CardTitle className="text-text-primary text-sm">User Prompts: ti</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-cyberpunk-surface rounded flex items-end space-x-1">
                    <div className="w-2 bg-neon-cyan h-8 rounded-t"></div>
                    <div className="w-2 bg-neon-cyan h-12 rounded-t"></div>
                    <div className="w-2 bg-neon-cyan h-6 rounded-t"></div>
                    <div className="w-2 bg-neon-cyan h-10 rounded-t"></div>
                    <div className="w-2 bg-neon-cyan h-4 rounded-t"></div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Alliances */}
              <Card className="holographic neon-border">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Gear className="w-4 h-4 text-neon-cyan" />
                    <span className="text-text-primary text-sm">Current Alliances</span>
                  </div>
                </CardContent>
              </Card>

              {/* Upgrade Store */}
              <Card className="holographic neon-border">
                <CardHeader>
                  <CardTitle className="text-text-primary flex items-center justify-between">
                    <span className="text-sm">The Upgrade and Store Terminal</span>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4 text-neon-cyan" />
                      <span className="text-neon-cyan text-sm">12,550 Bits</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upgrades.map((upgrade, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-cyberpunk-surface/50 rounded hover:bg-cyberpunk-surface/70 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <upgrade.icon className="w-4 h-4 text-neon-cyan" />
                        <span className="text-text-primary text-xs">{upgrade.name}</span>
                      </div>
                      <span className="text-neon-cyan text-xs">→</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Center Panel - Robot Avatar */}
            <div className="lg:col-span-6 flex items-center justify-center">
              {loading ? (
                <Card className="holographic neon-border p-8">
                  <div className="text-center">
                    <RefreshCw className="w-16 h-16 mx-auto animate-spin text-neon-cyan mb-4" />
                    <p className="text-text-secondary">Loading bot data...</p>
                  </div>
                </Card>
              ) : selectedBot ? (
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
                      value={quirkySerious[0]}
                      onChange={(e) => setQuirkySerious([parseInt(e.target.value)])}
                      className="w-full"
                    />
                    <div className="text-center text-xs text-text-muted">{quirkySerious[0]}%</div>
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
                      value={aggressivePassive[0]}
                      onChange={(e) => setAggressivePassive([parseInt(e.target.value)])}
                      className="w-full"
                    />
                    <div className="text-center text-xs text-text-muted">{aggressivePassive[0]}%</div>
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
                      value={wittyDry[0]}
                      onChange={(e) => setWittyDry([parseInt(e.target.value)])}
                      className="w-full"
                    />
                    <div className="text-center text-xs text-text-muted">{wittyDry[0]}%</div>
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

export default Dashboard;