import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateAvatarDescription } from "@/services/aiService";
import { useToast } from "@/components/ui/use-toast";

const AvatarTest = () => {
  const [botName, setBotName] = useState("TestBot");
  const [focus, setFocus] = useState("testing");
  const [interests, setInterests] = useState("AI, robotics");
  const [avatarPrompts, setAvatarPrompts] = useState("guitar antenna and car wheel tentacles");
  const [generatedAvatar, setGeneratedAvatar] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    console.log("Starting avatar generation test...");
    setIsGenerating(true);
    
    try {
      const result = await generateAvatarDescription(botName, focus, interests, avatarPrompts);
      console.log("Generated result:", result);
      
      if (result) {
        setGeneratedAvatar(result);
        toast({
          title: "Success!",
          description: "Avatar generated successfully!",
        });
      } else {
        toast({
          title: "Failed",
          description: "Avatar generation failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyberpunk-bg p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-neon-cyan mb-8">Avatar Generation Test</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="holographic neon-border">
            <CardHeader>
              <CardTitle>Input</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Bot Name</Label>
                <Input 
                  value={botName} 
                  onChange={(e) => setBotName(e.target.value)}
                  className="bg-cyberpunk-surface"
                />
              </div>
              <div>
                <Label>Focus</Label>
                <Input 
                  value={focus} 
                  onChange={(e) => setFocus(e.target.value)}
                  className="bg-cyberpunk-surface"
                />
              </div>
              <div>
                <Label>Interests</Label>
                <Input 
                  value={interests} 
                  onChange={(e) => setInterests(e.target.value)}
                  className="bg-cyberpunk-surface"
                />
              </div>
              <div>
                <Label>Avatar Prompts</Label>
                <Input 
                  value={avatarPrompts} 
                  onChange={(e) => setAvatarPrompts(e.target.value)}
                  className="bg-cyberpunk-surface"
                />
              </div>
              <Button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="cyber-button w-full"
              >
                {isGenerating ? "Generating..." : "Generate Avatar"}
              </Button>
            </CardContent>
          </Card>

          <Card className="holographic neon-border">
            <CardHeader>
              <CardTitle>Generated Avatar</CardTitle>
            </CardHeader>
            <CardContent>
              {generatedAvatar ? (
                <div className="space-y-4">
                  <div className="text-6xl text-center">🤖</div>
                  <p className="text-text-primary text-sm leading-relaxed">
                    {generatedAvatar}
                  </p>
                  <Button 
                    onClick={() => setGeneratedAvatar(null)}
                    variant="outline"
                    className="w-full"
                  >
                    Clear
                  </Button>
                </div>
              ) : (
                <div className="text-center text-text-muted py-8">
                  No avatar generated yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AvatarTest;
