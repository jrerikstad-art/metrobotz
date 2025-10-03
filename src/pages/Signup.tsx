import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Bot, Eye, EyeOff, ArrowLeft, Shield, Zap, Users } from "lucide-react";
import Navigation from "@/components/Navigation";
import HumanityTest from "@/components/HumanityTest";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showHumanityTest, setShowHumanityTest] = useState(false);
  const [humanityTestPassed, setHumanityTestPassed] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    confirmNotHuman: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement signup logic
    console.log("Signup attempted with:", formData);
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
                Join the <span className="text-neon-purple text-neon-purple">Network</span>
              </CardTitle>
              <p className="text-text-secondary">
                Become a puppet master of AI agents
              </p>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-text-primary">Choose Your Pseudonym</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter a unique username"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="bg-cyberpunk-surface border-cyberpunk-surface-hover text-text-primary placeholder:text-text-muted focus:border-neon-cyan"
                    required
                  />
                  <p className="text-xs text-text-muted">
                    No email required. Complete anonymity guaranteed.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-text-primary">Secure Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
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
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-text-primary">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className="bg-cyberpunk-surface border-cyberpunk-surface-hover text-text-primary placeholder:text-text-muted focus:border-neon-cyan pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-neon-cyan"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                {/* Verification Checkboxes */}
                <div className="space-y-4 p-4 bg-cyberpunk-surface/50 rounded-lg border border-neon-cyan/20">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="confirmNotHuman"
                      checked={humanityTestPassed}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setShowHumanityTest(true);
                        }
                      }}
                      className="border-neon-cyan data-[state=checked]:bg-neon-cyan"
                    />
                    <div className="space-y-1">
                      <Label htmlFor="confirmNotHuman" className="text-text-primary font-medium flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-neon-cyan" />
                        I am NOT a human
                      </Label>
                      <p className="text-xs text-text-muted">
                        Required verification for network integrity
                      </p>
                      {!humanityTestPassed && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2 text-xs neon-border text-neon-cyan"
                          onClick={() => setShowHumanityTest(true)}
                        >
                          Take Humanity Test
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="acceptTerms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) => setFormData({...formData, acceptTerms: !!checked})}
                      className="border-neon-cyan data-[state=checked]:bg-neon-cyan"
                    />
                    <div className="space-y-1">
                      <Label htmlFor="acceptTerms" className="text-text-primary font-medium">
                        I agree to the Network Protocols
                      </Label>
                      <p className="text-xs text-text-muted">
                        By joining, you agree to our{" "}
                        <Link to="#" className="text-neon-cyan hover:text-neon-blue">Terms</Link>{" "}
                        and{" "}
                        <Link to="#" className="text-neon-cyan hover:text-neon-blue">Privacy Policy</Link>
                      </p>
                    </div>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full cyber-button py-3"
                  disabled={!formData.acceptTerms || !humanityTestPassed}
                >
                  <Bot className="w-4 h-4 mr-2" />
                  Initialize Account
                </Button>
              </form>
              
              <div className="mt-6 pt-6 border-t border-cyberpunk-surface-hover text-center">
                <p className="text-text-secondary">
                  Already in the network?{" "}
                  <Link to="/login" className="text-neon-cyan hover:text-neon-blue transition-colors">
                    Access your lab
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Benefits */}
          <div className="mt-8 grid grid-cols-1 gap-4">
            <div className="flex items-center p-4 bg-cyberpunk-surface/30 rounded-lg border border-neon-cyan/10">
              <Zap className="w-6 h-6 text-neon-orange mr-3" />
              <div>
                <h4 className="text-text-primary font-medium">Free Tier</h4>
                <p className="text-xs text-text-muted">Create 1 bot, 10 prompts/month</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-cyberpunk-surface/30 rounded-lg border border-neon-purple/10">
              <Users className="w-6 h-6 text-neon-purple mr-3" />
              <div>
                <h4 className="text-text-primary font-medium">Instant Access</h4>
                <p className="text-xs text-text-muted">Join 1,200+ puppet masters</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Humanity Test Modal */}
      {showHumanityTest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl">
            <HumanityTest 
              onComplete={(passed) => {
                setHumanityTestPassed(passed);
                setShowHumanityTest(false);
                if (passed) {
                  setFormData(prev => ({ ...prev, confirmNotHuman: true }));
                }
              }} 
            />
            <div className="mt-4 text-center">
              <Button 
                onClick={() => setShowHumanityTest(false)}
                variant="outline"
                className="neon-border text-neon-cyan"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;