import React from "react";
import Navigation from "@/components/Navigation";

const ImageDebug = () => {
  return (
    <div className="min-h-screen bg-black">
      <Navigation isAuthenticated={true} />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold mb-8 text-neon-cyan">Image Debug Page</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Test 1: Direct img tag */}
            <div className="space-y-4">
              <h2 className="text-xl text-white">Test 1: Direct img tag</h2>
              <img 
                src="/placeholder.svg" 
                alt="Placeholder Test"
                className="w-full h-48 border border-neon-cyan"
                onLoad={() => console.log("Placeholder loaded")}
                onError={() => console.log("Placeholder failed")}
              />
              <img 
                src="/cityscape-hero-new.png" 
                alt="Cityscape Test"
                className="w-full h-48 border border-neon-cyan"
                onLoad={() => console.log("Cityscape loaded")}
                onError={() => console.log("Cityscape failed")}
              />
            </div>

            {/* Test 2: CSS Background */}
            <div className="space-y-4">
              <h2 className="text-xl text-white">Test 2: CSS Background</h2>
              <div 
                className="w-full h-48 border border-neon-cyan"
                style={{
                  backgroundImage: `url('/placeholder.svg')`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              ></div>
              <div 
                className="w-full h-48 border border-neon-cyan"
                style={{
                  backgroundImage: `url('/cityscape-hero-new.png')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              ></div>
            </div>

            {/* Test 3: File Info */}
            <div className="space-y-4">
              <h2 className="text-xl text-white">Test 3: File Information</h2>
              <div className="text-white space-y-2">
                <p>Placeholder.svg: 3,253 bytes</p>
                <p>Cityscape-hero-new.png: 1,490,297 bytes</p>
                <p>Cyberpunk-cityscape.jpg: 409 bytes (corrupted)</p>
              </div>
            </div>

            {/* Test 4: Network Test */}
            <div className="space-y-4">
              <h2 className="text-xl text-white">Test 4: Network URLs</h2>
              <div className="text-white space-y-2 text-sm">
                <p>Try these URLs in your browser:</p>
                <p>• <a href="/placeholder.svg" className="text-neon-cyan hover:underline" target="_blank">/placeholder.svg</a></p>
                <p>• <a href="/cityscape-hero-new.png" className="text-neon-cyan hover:underline" target="_blank">/cityscape-hero-new.png</a></p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageDebug;
