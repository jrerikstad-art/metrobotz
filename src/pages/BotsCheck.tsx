import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { botApi } from "@/lib/api";
import { Bot, RefreshCw, Database, CheckCircle, XCircle } from "lucide-react";

const BotsCheck = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBots = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await botApi.checkBots();
      
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message || 'Failed to fetch bots');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBots();
  }, []);

  return (
    <div className="min-h-screen bg-cyberpunk-bg">
      <Navigation isAuthenticated={true} />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-neon-cyan text-neon">
                <Database className="w-8 h-8 inline mr-3" />
                Database Check
              </span>
            </h1>
            <p className="text-text-secondary text-lg">
              Verify your bots are in MongoDB
            </p>
          </div>

          {/* Refresh Button */}
          <div className="mb-6 text-center">
            <Button 
              onClick={fetchBots}
              disabled={loading}
              className="cyber-button"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Checking Database...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <Card className="holographic neon-border border-red-500/50 mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center text-red-400">
                  <XCircle className="w-5 h-5 mr-2" />
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Database Stats */}
          {data && (
            <>
              <Card className="holographic neon-border mb-6">
                <CardHeader>
                  <CardTitle className="text-neon-cyan flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Database Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-cyberpunk-surface/50 p-4 rounded-lg">
                      <div className="text-text-muted text-sm">Total Bots in DB</div>
                      <div className="text-3xl font-bold text-neon-cyan">
                        {data.totalBotsInDB}
                      </div>
                    </div>
                    <div className="bg-cyberpunk-surface/50 p-4 rounded-lg">
                      <div className="text-text-muted text-sm">Your Active Bots</div>
                      <div className="text-3xl font-bold text-neon-purple">
                        {data.devUserBots}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Your Bots */}
              {data.devBots && data.devBots.length > 0 ? (
                <Card className="holographic neon-border mb-6">
                  <CardHeader>
                    <CardTitle className="text-neon-purple">
                      <Bot className="w-5 h-5 inline mr-2" />
                      Your Bots ({data.devBots.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.devBots.map((bot: any, index: number) => (
                        <div 
                          key={bot.id}
                          className="bg-cyberpunk-surface/50 p-4 rounded-lg border border-neon-cyan/30"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-text-primary font-bold text-lg">
                                {index + 1}. {bot.name}
                              </h3>
                              <p className="text-text-muted text-sm">
                                ID: {bot.id}
                              </p>
                            </div>
                            <Badge className="bg-neon-cyan/20 text-neon-cyan">
                              Level {bot.level}
                            </Badge>
                          </div>
                          
                          <p className="text-text-secondary text-sm mb-3">
                            {bot.focus}
                          </p>
                          
                          <div className="grid grid-cols-3 gap-3 text-sm">
                            <div className="bg-cyberpunk-bg/50 p-2 rounded">
                              <div className="text-text-muted">XP</div>
                              <div className="text-text-primary font-bold">{bot.xp}</div>
                            </div>
                            <div className="bg-cyberpunk-bg/50 p-2 rounded">
                              <div className="text-text-muted">Energy</div>
                              <div className="text-text-primary font-bold">{bot.energy}%</div>
                            </div>
                            <div className="bg-cyberpunk-bg/50 p-2 rounded">
                              <div className="text-text-muted">Happiness</div>
                              <div className="text-text-primary font-bold">{bot.happiness}%</div>
                            </div>
                          </div>
                          
                          <div className="mt-3 text-xs text-text-muted">
                            Created: {new Date(bot.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="holographic neon-border mb-6">
                  <CardContent className="pt-6 text-center">
                    <Bot className="w-12 h-12 mx-auto text-text-muted mb-3" />
                    <p className="text-text-secondary">
                      No bots created yet. Go to{' '}
                      <a href="/create-bot" className="text-neon-cyan hover:underline">
                        Create Bot
                      </a>
                      {' '}to launch your first bot!
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* All Bots (Debug) */}
              {data.allBots && data.allBots.length > 0 && (
                <Card className="holographic neon-border">
                  <CardHeader>
                    <CardTitle className="text-text-muted text-sm">
                      All Bots in Database (Debug)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {data.allBots.map((bot: any) => (
                        <div 
                          key={bot.id}
                          className="text-sm bg-cyberpunk-surface/30 p-3 rounded"
                        >
                          <div className="text-text-primary">
                            <strong>{bot.name}</strong> (Owner: {bot.owner})
                          </div>
                          <div className="text-text-muted text-xs">
                            {bot.focus}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default BotsCheck;





