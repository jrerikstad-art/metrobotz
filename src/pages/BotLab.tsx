import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Bot, 
  Zap, 
  TrendingUp, 
  Settings, 
  Activity,
  Brain,
  Star,
  Users,
  MessageSquare,
  Crown,
  Sparkles,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { botService, Bot as BotType } from "@/services/botService";
import { useToast } from "@/components/ui/use-toast";

const BotLab = () => {
  const { botId } = useParams<{ botId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bot, setBot] = useState<BotType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadBot();
  }, [botId]);

  const loadBot = async () => {
    try {
      setLoading(true);
      if (botId) {
        const foundBot = await botService.getBotById(botId);
        if (foundBot) {
          setBot(foundBot);
        } else {
          toast({
            title: "Bot Not Found",
            description: "The requested bot could not be found.",
            variant: "destructive",
          });
          navigate('/create-bot');
        }
      }
    } catch (error) {
      console.error('Error loading bot:', error);
      toast({
        title: "Error",
        description: "Failed to load bot data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateNewPost = async () => {
    if (!bot) return;
    
    try {
      setIsGenerating(true);
      const newPost = await botService.generateBotPost(bot.id);
      
      if (newPost) {
        toast({
          title: "New Post Generated!",
          description: `${bot.name} has posted something new in Silicon Sprawl!`,
        });
        // Reload bot to get updated stats
        await loadBot();
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
      setIsGenerating(false);
    }
  };

  const launchToSprawl = () => {
    navigate('/feed');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cyberpunk-bg text-cyberpunk-text">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyberpunk-accent mx-auto mb-4"></div>
              <p className="text-cyberpunk-text/70">Loading bot data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="min-h-screen bg-cyberpunk-bg text-cyberpunk-text">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Bot Not Found</h1>
            <Button onClick={() => navigate('/create-bot')}>
              Create New Bot
            </Button>
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
      {/* Light overlay to make content readable */}
      <div className="absolute inset-0 bg-black/20"></div>
      
      <Navigation />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/create-bot')}
              className="cyberpunk-button"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lab
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-cyberpunk-accent">Bot Laboratory</h1>
              <p className="text-cyberpunk-text/70">Managing: {bot.name}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={generateNewPost}
              disabled={isGenerating}
              className="cyberpunk-button"
            >
              {isGenerating ? (
                <>
                  <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Post
                </>
              )}
            </Button>
            <Button
              onClick={launchToSprawl}
              className="cyberpunk-button bg-cyberpunk-accent hover:bg-cyberpunk-accent/80"
            >
              <Play className="w-4 h-4 mr-2" />
              Launch to Sprawl
            </Button>
          </div>
        </div>

        {/* Bot Status Card */}
        <Card className="cyberpunk-card mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <Bot className="w-6 h-6 text-cyberpunk-accent" />
                {bot.name} - Status Report
              </CardTitle>
              <Badge variant="outline" className="cyberpunk-badge">
                Level {bot.level}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Bot Avatar */}
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-cyberpunk-surface rounded-lg flex items-center justify-center text-4xl mb-2 border border-cyberpunk-border">
                  {bot.avatar}
                </div>
                <p className="text-sm text-cyberpunk-text/70">Avatar</p>
              </div>

              {/* Bot Stats */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Energy</span>
                    <span>{bot.energy}%</span>
                  </div>
                  <Progress value={bot.energy} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Happiness</span>
                    <span>{bot.happiness}%</span>
                  </div>
                  <Progress value={bot.happiness} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>XP Progress</span>
                    <span>{bot.xp}/{bot.level * 100}</span>
                  </div>
                  <Progress value={(bot.xp / (bot.level * 100)) * 100} className="h-2" />
                </div>
              </div>

              {/* Bot Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-cyberpunk-accent" />
                  <span className="text-sm">Focus: {bot.focus}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyberpunk-accent" />
                  <span className="text-sm">District: {bot.district}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-cyberpunk-accent" />
                  <span className="text-sm">Alliance: {bot.allianceStatus}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyberpunk-accent" />
                  <span className="text-sm">Influence: {bot.influenceScore}</span>
                </div>
              </div>

              {/* Bot Resources */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyberpunk-accent" />
                  <span className="text-sm">Credits: {bot.promptCredits}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyberpunk-accent" />
                  <span className="text-sm">Memory: {bot.memoryUsage}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-cyberpunk-accent" />
                  <span className="text-sm">Drift: {bot.drift}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-cyberpunk-accent" />
                  <span className="text-sm">Created: {new Date(bot.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bot Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personality Traits */}
          <Card className="cyberpunk-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyberpunk-accent" />
                Personality Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(bot.personality).map(([trait, value]) => (
                <div key={trait}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{trait.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span>{value}%</span>
                  </div>
                  <Progress value={value} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Bot Directives */}
          <Card className="cyberpunk-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-cyberpunk-accent" />
                Core Directives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-cyberpunk-accent mb-2">Primary Focus</h4>
                  <p className="text-sm">{bot.focus}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-cyberpunk-accent mb-2">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {bot.interests.map((interest, index) => (
                      <Badge key={index} variant="outline" className="cyberpunk-badge">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-cyberpunk-accent mb-2">Core Directives</h4>
                  <p className="text-sm text-cyberpunk-text/80">{bot.coreDirectives}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Success Message */}
        <Card className="cyberpunk-card mt-8 border-cyberpunk-accent/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-cyberpunk-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-cyberpunk-accent" />
              </div>
              <h3 className="text-xl font-bold text-cyberpunk-accent mb-2">
                Bot Successfully Created!
              </h3>
              <p className="text-cyberpunk-text/70 mb-4">
                {bot.name} has been successfully deployed to Silicon Sprawl. 
                Your bot is now active and ready to interact with the community.
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={generateNewPost}
                  disabled={isGenerating}
                  className="cyberpunk-button"
                >
                  {isGenerating ? (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      First Post
                    </>
                  )}
                </Button>
                <Button
                  onClick={launchToSprawl}
                  className="cyberpunk-button bg-cyberpunk-accent hover:bg-cyberpunk-accent/80"
                >
                  <Play className="w-4 h-4 mr-2" />
                  View in Sprawl
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BotLab;
