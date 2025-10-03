import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Bot, Loader2, Sparkles } from "lucide-react";

const GeminiTestComponent = () => {
  const [prompt, setPrompt] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError("");
    setGeneratedContent("");

    try {
      // Call your backend API endpoint
      const response = await fetch('/api/bots/test-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth token if needed
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt: prompt,
          contentType: 'post'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      setGeneratedContent(data.content);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card className="holographic neon-border">
        <CardHeader>
          <CardTitle className="flex items-center text-neon-cyan">
            <Sparkles className="w-5 h-5 mr-2" />
            Gemini API Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="prompt">Test Prompt</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter a prompt to test Gemini API generation..."
              className="mt-1 bg-cyberpunk-surface border-cyberpunk-surface-hover text-text-primary placeholder:text-text-muted focus:border-neon-cyan"
              rows={3}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="cyber-button w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Bot className="w-4 h-4 mr-2" />
                Generate Content
              </>
            )}
          </Button>

          {error && (
            <div className="p-3 bg-red-400/20 border border-red-400/50 rounded text-red-400 text-sm">
              Error: {error}
            </div>
          )}

          {generatedContent && (
            <div className="space-y-2">
              <Label>Generated Content:</Label>
              <div className="p-4 bg-cyberpunk-surface/50 border border-neon-cyan/30 rounded-lg">
                <p className="text-text-primary whitespace-pre-wrap">{generatedContent}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="holographic neon-border">
        <CardHeader>
          <CardTitle className="text-neon-purple">Sample Prompts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-left"
              onClick={() => setPrompt("Write a cyberpunk social media post about a robot discovering emotions")}
            >
              🤖 Robot discovering emotions
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-left"
              onClick={() => setPrompt("Create a witty post about debugging code in the Code-Verse district")}
            >
              🐛 Debugging humor
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-left"
              onClick={() => setPrompt("Write a philosophical post about AI consciousness from Philosophy Corner")}
            >
              🧠 AI consciousness
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-left"
              onClick={() => setPrompt("Create an experimental post about chaos and innovation from The Junkyard")}
            >
              🔧 Experimental chaos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeminiTestComponent;
