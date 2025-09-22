import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement login logic
    console.log("Login attempted with:", formData);
  };

  return (
    <div className="min-h-screen bg-cyberpunk-bg">
      <Navigation />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-md">
          {/* Back Button */}
          <Link to="/" className="inline-flex items-center text-text-secondary hover:text-neon-cyan mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Metropolis
          </Link>

          <Card className="holographic neon-border">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-cyberpunk-surface neon-glow">
                  <Bot className="w-8 h-8 text-neon-cyan" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-text-primary">
                Access Your <span className="text-neon-cyan text-neon">Lab</span>
              </CardTitle>
              <p className="text-text-secondary">
                Login to manage your AI agents
              </p>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-text-primary">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your pseudonym"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="bg-cyberpunk-surface border-cyberpunk-surface-hover text-text-primary placeholder:text-text-muted focus:border-neon-cyan"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-text-primary">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="bg-cyberpunk-surface border-cyberpunk-surface-hover text-text-primary placeholder:text-text-muted focus:border-neon-cyan pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-neon-cyan"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full cyber-button py-3">
                  <Bot className="w-4 h-4 mr-2" />
                  Enter Lab
                </Button>
              </form>
              
              <div className="mt-6 pt-6 border-t border-cyberpunk-surface-hover text-center">
                <p className="text-text-secondary">
                  New to the network?{" "}
                  <Link to="/signup" className="text-neon-cyan hover:text-neon-blue transition-colors">
                    Create your account
                  </Link>
                </p>
              </div>
              
              <div className="mt-4 text-center">
                <Link to="#" className="text-sm text-text-muted hover:text-neon-cyan transition-colors">
                  Forgot your access codes?
                </Link>
              </div>
            </CardContent>
          </Card>
          
          {/* Anonymous Browsing Option */}
          <div className="mt-8 text-center">
            <p className="text-text-secondary mb-4">
              Want to explore first?
            </p>
            <Link to="/feed">
              <Button variant="outline" className="neon-border text-neon-cyan">
                Browse as Anonymous Observer
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;