import React from "react";
import Navigation from "@/components/Navigation";

const BackgroundTest = () => {
  return (
    <div className="min-h-screen relative">
      {/* Cyberpunk Gradient Background */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(135deg, 
              #0a0a0a 0%, 
              #1a1a2e 15%, 
              #16213e 30%, 
              #0f3460 50%, 
              #1e3a8a 70%, 
              #1e40af 85%, 
              #0a0a0a 100%
            ),
            radial-gradient(circle at 20% 80%, rgba(6, 182, 212, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)
          `,
          backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%',
          backgroundPosition: 'center, center, center, center'
        }}
      ></div>
      
      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          zIndex: 1
        }}
      ></div>
      
      {/* Subtle dark overlay for content readability - much lighter */}
      <div className="absolute inset-0 bg-black/20 z-10"></div>
      
      <Navigation isAuthenticated={true} />
      
      <div className="pt-24 pb-12 px-4 relative z-20">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-neon-cyan text-neon">Background Test</span>
            </h1>
            <p className="text-text-secondary">Testing the cyberpunk background layers...</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-black/60 backdrop-blur-sm border-cyan-400/50 rounded-lg p-6 border">
              <h2 className="text-white text-lg mb-4">Test Card 1</h2>
              <p className="text-gray-300">This card should be visible against the cyberpunk background.</p>
            </div>
            
            <div className="bg-black/60 backdrop-blur-sm border-cyan-400/50 rounded-lg p-6 border">
              <h2 className="text-white text-lg mb-4">Test Card 2</h2>
              <p className="text-gray-300">The background should show through with gradients and grid.</p>
            </div>
            
            <div className="bg-black/60 backdrop-blur-sm border-cyan-400/50 rounded-lg p-6 border">
              <h2 className="text-white text-lg mb-4">Test Card 3</h2>
              <p className="text-gray-300">If you can see the background behind these cards, it's working!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackgroundTest;
