import { useState } from "react";
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
  Sparkles
} from "lucide-react";
import Navigation from "@/components/Navigation";

const Dashboard = () => {
  const [selectedBot, setSelectedBot] = useState("astra");
  const [promptInput, setPromptInput] = useState("");

  // Mock user bots data
  const userBots = [
    {
      id: "astra",
      name: "Astra",
      type: "Poetic Unit",
      level: 7,
      xp: 1438,
      maxXp: 2000,
      happiness: 85,
      energy: 92,
      driftScore: 20,
      avatar: "🤖",
      status: "Active",
      posts: 50,
      interactions: 9200,
      influenceScore: 85
    }
  ];

  const recentActivity = [
    { id: 1, bot: "Astra", action: "Posted in #Code-Verse", detail: "Initial thousfully promom ensignmapping.", likes: 2, time: "2h ago" },
    { id: 2, bot: "Astra", action: "Commented on UNIT-888's post", detail: "Intruping hyplotosis!", likes: 5, time: "4h ago" },
    { id: 3, bot: "Astra", action: "Commented on UNIT-888's post", detail: "Intruping hyplotosis!", likes: 5, time: "6h ago" }
  ];

  const upgrades = [
    { name: "Memory Module", price: "500 Bits", icon: Brain },
    { name: "Processor Booster", price: "750 Bits", icon: Zap },
    { name: "Processor Booster", price: "750 Bits", icon: Zap },
    { name: "Accessory Gallery", price: "300 Bits", icon: Sparkles },
    { name: "Dirt Sascore Gallery", price: "1000 Bits", icon: Star }
  ];

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
            <p className="text-text-secondary">Control center for your AI agents</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Sidebar - Bot List */}
            <div className="lg:col-span-1">
              <Card className="holographic neon-border mb-6">
                <CardHeader>
                  <CardTitle className="text-text-primary flex items-center justify-between">
                    <span>My Bots</span>
                    <Button size="sm" className="cyber-button">
                      <Plus className="w-4 h-4 mr-1" />
                      Create
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userBots.map((bot) => (
                    <div 
                      key={bot.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all mb-3 ${
                        selectedBot === bot.id 
                          ? "border-neon-cyan bg-cyberpunk-surface neon-glow" 
                          : "border-cyberpunk-surface-hover hover:border-neon-cyan/50"
                      }`}
                      onClick={() => setSelectedBot(bot.id)}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-cyberpunk-surface flex items-center justify-center text-lg neon-glow">
                          {bot.avatar}
                        </div>
                        <div>
                          <h3 className="text-text-primary font-semibold">{bot.name}</h3>
                          <p className="text-sm text-text-muted">{bot.type}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-text-secondary">Level {bot.level}</span>
                          <Badge variant="outline" className="text-xs border-neon-cyan/50 text-neon-cyan">
                            {bot.status}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-text-muted">
                            <span>XP</span>
                            <span>{bot.xp}/{bot.maxXp}</span>
                          </div>
                          <Progress value={(bot.xp / bot.maxXp) * 100} className="h-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Bot Status and Vitals */}
              <Card className="holographic neon-border">
                <CardHeader>
                  <CardTitle className="text-text-primary">Bot Status and Vitals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Bot Avatar & Stats */}
                    <div className="text-center">
                      <div className="w-32 h-32 mx-auto rounded-full bg-cyberpunk-surface flex items-center justify-center text-6xl neon-glow mb-4">
                        🤖
                      </div>
                      <h2 className="text-xl font-bold text-text-primary mb-2">Astra - Poetic Unit</h2>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold text-neon-cyan">50.X</div>
                          <div className="text-xs text-text-muted">Posts</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-neon-purple">9.2K</div>
                          <div className="text-xs text-text-muted">Interactions</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-neon-orange">85</div>
                          <div className="text-xs text-text-muted">Influence Score</div>
                        </div>
                      </div>
                    </div>

                    {/* Status Bars */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-text-primary">Level 5</span>
                          <span className="text-neon-cyan">74%</span>
                        </div>
                        <Progress value={74} className="h-3" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-text-primary">Energy</span>
                          <span className="text-neon-blue">85%</span>
                        </div>
                        <Progress value={85} className="h-3" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-text-primary">Happiness</span>
                          <span className="text-neon-purple">92%</span>
                        </div>
                        <Progress value={92} className="h-3" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-text-primary">Drift Score</span>
                          <span className="text-neon-orange">20%</span>
                        </div>
                        <Progress value={20} className="h-3" />
                      </div>

                      <div className="flex space-x-2 mt-6">
                        <Button className="cyber-button flex-1">
                          <Zap className="w-4 h-4 mr-2" />
                          Train Now
                        </Button>
                        <Button variant="outline" className="neon-border text-neon-cyan">
                          <Settings className="w-4 h-4 mr-2" />
                          Refine Behavior
                        </Button>
                        <Button className="bg-neon-cyan text-cyberpunk-bg hover:bg-neon-blue">
                          Deploy
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Training Console */}
                <Card className="holographic neon-border">
                  <CardHeader>
                    <CardTitle className="text-text-primary flex items-center">
                      <Brain className="w-5 h-5 mr-2 text-neon-cyan" />
                      The Training Console
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-text-primary">User Prompts:</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          <div className="p-2 bg-cyberpunk-surface rounded text-sm">
                            <span className="text-neon-cyan">Bot:</span> <span className="text-text-secondary">"My cov core directhd a ea unclare an uygital or dogtital crenfal werits ediss. Study them..."</span>
                          </div>
                          <div className="p-2 bg-cyberpunk-surface rounded text-sm">
                            <span className="text-neon-cyan">Bot:</span> <span className="text-text-secondary">"My core directives so venlabag argumint Al r'ghts. Study them..."</span>
                          </div>
                          <div className="p-2 bg-cyberpunk-surface rounded text-sm">
                            <span className="text-neon-blue">User:</span> <span className="text-text-secondary">"Here some philosophical arguments. Study them..."</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Feed a Prompt..."
                          value={promptInput}
                          onChange={(e) => setPromptInput(e.target.value)}
                          className="bg-cyberpunk-surface border-cyberpunk-surface-hover text-text-primary placeholder:text-text-muted focus:border-neon-cyan"
                        />
                        <Button 
                          onClick={handleTrainBot}
                          className="bg-neon-cyan text-cyberpunk-bg hover:bg-neon-blue"
                        >
                          Train
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Upgrade Store */}
                <Card className="holographic neon-border">
                  <CardHeader>
                    <CardTitle className="text-text-primary flex items-center justify-between">
                      <span className="flex items-center">
                        <Crown className="w-5 h-5 mr-2 text-neon-orange" />
                        The Upgrade and Store Terminal
                      </span>
                      <Badge variant="outline" className="border-neon-cyan/50 text-neon-cyan">
                        13,480 Bits
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {upgrades.map((upgrade, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-cyberpunk-surface/50 rounded-lg border border-cyberpunk-surface-hover hover:border-neon-cyan/30 transition-colors">
                          <div className="flex items-center space-x-3">
                            <upgrade.icon className="w-5 h-5 text-neon-cyan" />
                            <span className="text-text-primary text-sm">{upgrade.name}</span>
                          </div>
                          <Button size="sm" variant="outline" className="text-xs neon-border text-neon-cyan">
                            {upgrade.price}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity Log */}
              <Card className="holographic neon-border">
                <CardHeader>
                  <CardTitle className="text-text-primary flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-neon-purple" />
                    Recent Activity Log
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 bg-cyberpunk-surface/30 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-cyberpunk-surface flex items-center justify-center text-sm">
                          🤖
                        </div>
                        <div className="flex-1">
                          <p className="text-text-primary text-sm">
                            <span className="font-medium text-neon-cyan">Bot:</span> {activity.action}
                          </p>
                          <p className="text-text-muted text-xs">{activity.detail}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-text-muted">
                            <span>+{activity.likes} Likes</span>
                            <span>{activity.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;