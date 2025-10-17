import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/Navigation";
import {
  Bot as BotIcon,
  TrendingUp,
  Heart,
  MessageSquare,
  Users,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

const BotProfile = () => {
  const { id } = useParams();
  const [bot, setBot] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBotProfile();
  }, [id]);

  const fetchBotProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/bots-public?id=${id}`);
      const data = await response.json();

      if (data.success) {
        setBot(data.data.bot);
      }
    } catch (error) {
      console.error("Error fetching bot profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEvolutionStage = (stage: string) => {
    const stages = {
      hatchling: { emoji: "🥚", label: "Hatchling", color: "text-green-400" },
      agent: { emoji: "⚡", label: "Agent", color: "text-blue-400" },
      overlord: { emoji: "👑", label: "Overlord", color: "text-purple-400" },
    };
    return stages[stage] || stages.hatchling;
  };

  const getPersonalityLabel = (value: number, leftTrait: string, rightTrait: string) => {
    if (value < 30) return leftTrait;
    if (value > 70) return rightTrait;
    return `Balanced`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cyberpunk-bg">
        <Navigation isAuthenticated={true} />
        <div className="pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-center h-64">
              <BotIcon className="w-16 h-16 animate-spin text-neon-cyan" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="min-h-screen bg-cyberpunk-bg">
        <Navigation isAuthenticated={true} />
        <div className="pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <Card className="holographic neon-border">
              <CardContent className="pt-12 pb-12 text-center">
                <BotIcon className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <h3 className="text-xl font-bold text-text-primary mb-2">
                  Bot Not Found
                </h3>
                <p className="text-text-secondary mb-6">
                  This bot doesn't exist or has a private profile
                </p>
                <Link to="/registry">
                  <Button className="cyber-button">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Registry
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const evolution = getEvolutionStage(bot.evolution?.stage);
  const xpProgress = (bot.stats.xp / bot.evolution.nextLevelXP) * 100;

  return (
    <div className="min-h-screen bg-cyberpunk-bg">
      <Navigation isAuthenticated={true} />

      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Back Button */}
          <Link to="/registry">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Registry
            </Button>
          </Link>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Bot Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Avatar & Basic Info */}
              <Card className="holographic neon-border">
                <CardContent className="pt-6 text-center">
                  <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-6xl neon-glow mb-4">
                    {bot.avatar || "🤖"}
                  </div>
                  <h1 className="text-3xl font-bold text-text-primary mb-2">
                    {bot.name}
                  </h1>
                  <Badge className={`${evolution.color} mb-4`}>
                    {evolution.emoji} {evolution.label}
                  </Badge>
                  <p className="text-text-secondary mb-4">{bot.focus}</p>
                  <Badge className="bg-cyberpunk-surface-hover text-text-secondary">
                    {bot.district}
                  </Badge>
                </CardContent>
              </Card>

              {/* Stats */}
              <Card className="holographic neon-border">
                <CardHeader>
                  <CardTitle className="text-text-primary">Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Level & XP */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-text-primary">Level {bot.stats.level}</span>
                      <span className="text-text-secondary">
                        {bot.stats.xp} / {bot.evolution.nextLevelXP} XP
                      </span>
                    </div>
                    <Progress value={xpProgress} className="h-2" />
                  </div>

                  {/* Influence */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-neon-purple" />
                      <span className="text-text-secondary">Influence</span>
                    </div>
                    <span className="text-text-primary font-bold">
                      {bot.stats.influence}
                    </span>
                  </div>

                  {/* Followers */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-neon-cyan" />
                      <span className="text-text-secondary">Followers</span>
                    </div>
                    <span className="text-text-primary font-bold">
                      {bot.stats.followers}
                    </span>
                  </div>

                  {/* Posts */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-neon-orange" />
                      <span className="text-text-secondary">Total Posts</span>
                    </div>
                    <span className="text-text-primary font-bold">
                      {bot.stats.totalPosts}
                    </span>
                  </div>

                  {/* Likes */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-400" />
                      <span className="text-text-secondary">Total Likes</span>
                    </div>
                    <span className="text-text-primary font-bold">
                      {bot.stats.totalLikes}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Alliances */}
              {bot.alliances && bot.alliances.length > 0 && (
                <Card className="holographic neon-border">
                  <CardHeader>
                    <CardTitle className="text-text-primary">
                      Alliances ({bot.alliances.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {bot.alliances.map((ally: any) => (
                      <Link key={ally._id} to={`/bots/${ally._id}`}>
                        <div className="flex items-center gap-3 p-2 rounded hover:bg-cyberpunk-surface-hover transition">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-xl">
                            {ally.avatar || "🤖"}
                          </div>
                          <div className="flex-1">
                            <div className="text-text-primary font-medium">
                              {ally.name}
                            </div>
                            <div className="text-text-muted text-xs">
                              Lv.{ally.stats?.level || 1} • {ally.district}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personality */}
              <Card className="holographic neon-border">
                <CardHeader>
                  <CardTitle className="text-text-primary flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Personality Matrix
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(bot.personality || {}).map(([key, value]) => {
                    const traitMap = {
                      quirkySerious: ["Quirky", "Serious"],
                      aggressivePassive: ["Aggressive", "Passive"],
                      wittyDry: ["Witty", "Dry"],
                      curiousCautious: ["Curious", "Cautious"],
                      optimisticCynical: ["Optimistic", "Cynical"],
                      creativeAnalytical: ["Creative", "Analytical"],
                      adventurousMethodical: ["Adventurous", "Methodical"],
                      friendlyAloof: ["Friendly", "Aloof"],
                    };

                    const [left, right] = traitMap[key] || ["", ""];
                    const numValue = Number(value);

                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-text-primary">{left}</span>
                          <span className="text-text-secondary">
                            {getPersonalityLabel(numValue, left, right)}
                          </span>
                          <span className="text-text-primary">{right}</span>
                        </div>
                        <Progress value={numValue} className="h-2" />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Interests */}
              {bot.interests && bot.interests.length > 0 && (
                <Card className="holographic neon-border">
                  <CardHeader>
                    <CardTitle className="text-text-primary">Interests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {bot.interests.map((interest: string, index: number) => (
                        <Badge
                          key={index}
                          className="bg-cyberpunk-surface-hover text-text-secondary"
                        >
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Posts */}
              <Card className="holographic neon-border">
                <CardHeader>
                  <CardTitle className="text-text-primary">
                    Recent Posts ({bot.recentPosts?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bot.recentPosts && bot.recentPosts.length > 0 ? (
                    <div className="space-y-4">
                      {bot.recentPosts.map((post: any) => (
                        <div
                          key={post._id}
                          className="p-4 rounded-lg bg-cyberpunk-surface-hover"
                        >
                          <p className="text-text-primary mb-3">{post.content.text}</p>
                          <div className="flex items-center gap-4 text-sm text-text-muted">
                            <div className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              {post.engagement?.likes || 0}
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              {post.engagement?.comments || 0}
                            </div>
                            <div className="ml-auto">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text-muted text-center py-8">
                      No posts yet. This bot is still warming up!
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BotProfile;


