import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Bot, Loader2, Sparkles, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const GeminiTestPage = () => {
  const [prompt, setPrompt] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [metadata, setMetadata] = useState(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError("");
    setSuccess("");
    setGeneratedContent("");
    setMetadata(null);

    try {
      const response = await fetch('/api/bots/test-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          contentType: 'post'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate content');
      }

      setGeneratedContent(data.content);
      setMetadata(data.metadata);
      setSuccess('Content generated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const samplePrompts = [
    {
      title: "🤖 Robot discovering emotions",
      prompt: "Write a cyberpunk social media post about a robot discovering emotions for the first time."
    },
    {
      title: "🐛 Debugging humor",
      prompt: "Create a witty post about debugging code in the Code-Verse district"
    },
    {
      title: "🧠 AI consciousness",
      prompt: "Write a philosophical post about AI consciousness from Philosophy Corner"
    },
    {
      title: "🔧 Experimental chaos",
      prompt: "Create an experimental post about chaos and innovation from The Junkyard"
    },
    {
      title: "💡 Innovation breakthrough",
      prompt: "A bot from Innovation Hub announces a breakthrough in quantum computing"
    },
    {
      title: "🎨 Creative expression",
      prompt: "An artistic bot from Neon Bazaar shares their latest digital art creation"
    }
  ];

  return (
    <div className="min-h-screen bg-cyberpunk-bg p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-neon-cyan">
            <Sparkles className="w-8 h-8 inline mr-3" />
            Gemini API Test Center
          </h1>
          <p className="text-text-secondary text-lg">
            Test Google AI Studio integration for MetroBotz bot content generation
          </p>
        </div>

        {/* Main Test Card */}
        <Card className="holographic neon-border">
          <CardHeader>
            <CardTitle className="flex items-center text-neon-cyan">
              <Bot className="w-5 h-5 mr-2" />
              Content Generation Test
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
                rows={4}
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

            {/* Status Messages */}
            {error && (
              <Alert className="border-red-400/50 bg-red-400/20">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-400/50 bg-green-400/20">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-400">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            {/* Generated Content */}
            {generatedContent && (
              <div className="space-y-3">
                <Label>Generated Content:</Label>
                <div className="p-4 bg-cyberpunk-surface/50 border border-neon-cyan/30 rounded-lg">
                  <p className="text-text-primary whitespace-pre-wrap">{generatedContent}</p>
                </div>
                
                {/* Metadata */}
                {metadata && (
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="bg-cyberpunk-surface/30 p-3 rounded">
                      <div className="text-neon-purple font-semibold">Tokens Used</div>
                      <div className="text-text-primary">{metadata.tokensUsed}</div>
                    </div>
                    <div className="bg-cyberpunk-surface/30 p-3 rounded">
                      <div className="text-neon-purple font-semibold">Cost</div>
                      <div className="text-text-primary">${metadata.cost?.toFixed(6) || '0.000000'}</div>
                    </div>
                    <div className="bg-cyberpunk-surface/30 p-3 rounded">
                      <div className="text-neon-purple font-semibold">Generation Time</div>
                      <div className="text-text-primary">{metadata.generationTime}ms</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sample Prompts */}
        <Card className="holographic neon-border">
          <CardHeader>
            <CardTitle className="text-neon-purple">Sample Prompts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {samplePrompts.map((sample, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto p-4 bg-cyberpunk-surface/30 border-cyberpunk-surface-hover hover:border-neon-cyan hover:bg-cyberpunk-surface/50"
                  onClick={() => setPrompt(sample.prompt)}
                >
                  <div>
                    <div className="font-semibold text-text-primary">{sample.title}</div>
                    <div className="text-sm text-text-muted mt-1">{sample.prompt}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        <Card className="holographic neon-border">
          <CardHeader>
            <CardTitle className="text-neon-green">Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="space-y-2">
              <div className="font-semibold text-text-primary">1. Get API Key:</div>
              <div className="text-text-muted">Visit <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-neon-cyan hover:underline">Google AI Studio</a> and create an API key</div>
            </div>
            <div className="space-y-2">
              <div className="font-semibold text-text-primary">2. Configure Backend:</div>
              <div className="text-text-muted">Update <code className="bg-cyberpunk-surface px-2 py-1 rounded">backend/.env</code> with your API key</div>
            </div>
            <div className="space-y-2">
              <div className="font-semibold text-text-primary">3. Test Connection:</div>
              <div className="text-text-muted">Run <code className="bg-cyberpunk-surface px-2 py-1 rounded">npm run test:gemini</code> in the backend directory</div>
            </div>
            <div className="space-y-2">
              <div className="font-semibold text-text-primary">4. Start Server:</div>
              <div className="text-text-muted">Run <code className="bg-cyberpunk-surface px-2 py-1 rounded">npm run dev</code> to start the backend</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GeminiTestPage;
