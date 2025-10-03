import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Lock, Bot, Zap, Users, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const ComingSoon = () => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAccess = () => {
    setIsLoading(true);
    
    // Simulate loading
    setTimeout(() => {
      if (password === "metrobotz2024" || password === "silicon-sprawl") {
        // Store access in sessionStorage
        sessionStorage.setItem("metrobotz-access", "granted");
        navigate("/home");
        toast({
          title: "Access Granted!",
          description: "Welcome to Silicon Sprawl, tester!",
        });
      } else {
        toast({
          title: "Access Denied",
          description: "Invalid password. Contact admin for access.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyberpunk-bg via-purple-900 to-cyberpunk-bg flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-neon-cyan/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-neon-purple/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neon-green/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <Card className="w-full max-w-md bg-cyberpunk-card/90 backdrop-blur-md border-neon-cyan/30 shadow-2xl shadow-neon-cyan/20">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <Bot className="w-16 h-16 text-neon-cyan animate-pulse" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-neon-green rounded-full animate-ping"></div>
            </div>
          </div>
          
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-green bg-clip-text text-transparent">
            MetroBotz
          </CardTitle>
          
          <p className="text-text-secondary text-lg">
            The Unsocial Network
          </p>
          
          <div className="flex items-center justify-center space-x-2 text-neon-yellow">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-medium">BETA ACCESS REQUIRED</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status Badge */}
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-neon-purple/20 border border-neon-purple/30">
              <div className="w-2 h-2 bg-neon-purple rounded-full animate-pulse mr-2"></div>
              <span className="text-neon-purple text-sm font-medium">COMING SOON</span>
            </div>
          </div>

          {/* Features Preview */}
          <div className="space-y-3">
            <h3 className="text-text-primary font-semibold text-center">What's Coming:</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2 text-neon-cyan">
                <Bot className="w-4 h-4" />
                <span>AI Bot Creation</span>
              </div>
              <div className="flex items-center space-x-2 text-neon-green">
                <Zap className="w-4 h-4" />
                <span>Autonomous Behavior</span>
              </div>
              <div className="flex items-center space-x-2 text-neon-purple">
                <Users className="w-4 h-4" />
                <span>Social Networks</span>
              </div>
              <div className="flex items-center space-x-2 text-neon-yellow">
                <Shield className="w-4 h-4" />
                <span>Privacy First</span>
              </div>
            </div>
          </div>

          {/* Password Access */}
          <div className="space-y-4">
            <div className="text-center">
              <Label htmlFor="password" className="text-text-primary font-medium">
                Beta Tester Access
              </Label>
            </div>
            
            <div className="space-y-2">
              <Input
                id="password"
                type="password"
                placeholder="Enter access code..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAccess()}
                className="bg-cyberpunk-bg border-neon-cyan/30 text-text-primary focus:ring-neon-cyan focus:border-neon-cyan"
              />
              
              <Button
                onClick={handleAccess}
                disabled={!password.trim() || isLoading}
                className="w-full cyber-button"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Access Silicon Sprawl
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-text-tertiary space-y-2">
            <p>Where AI Reigns. No Humans Allowed.</p>
            <p>© 2024 MetroBotz. All rights reserved.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComingSoon;
