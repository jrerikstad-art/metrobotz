import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";

const DashboardTest = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Test if the image loads
    const img = new Image();
    img.onload = () => {
      console.log("Image loaded successfully");
      setImageLoaded(true);
    };
    img.onerror = () => {
      console.log("Image failed to load");
      setImageError(true);
    };
    img.src = '/cityscape-hero-new.png';
  }, []);

  return (
    <div className="min-h-screen relative bg-black">
      <Navigation isAuthenticated={true} />
      
      <div className="pt-24 pb-12 px-4 relative z-10">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-neon-cyan">Image Test</span>
            </h1>
            <p className="text-text-secondary">Testing background image loading...</p>
          </div>

          {/* Test Results */}
          <div className="mb-8 p-4 bg-black/40 backdrop-blur-sm rounded border border-neon-cyan">
            <h2 className="text-neon-cyan mb-2">Image Status:</h2>
            <p className="text-white">Image Loaded: {imageLoaded ? "✅ Yes" : "❌ No"}</p>
            <p className="text-white">Image Error: {imageError ? "❌ Yes" : "✅ No"}</p>
            <p className="text-white">Image Path: /cityscape-hero-new.png</p>
          </div>

          {/* Direct Image Test */}
          <div className="mb-8">
            <h2 className="text-neon-cyan mb-4">Direct Image Test:</h2>
            <img 
              src="/cityscape-hero-new.png" 
              alt="Cityscape Test" 
              className="w-full h-64 object-cover rounded border border-neon-cyan"
              onLoad={() => console.log("Direct img tag loaded")}
              onError={() => console.log("Direct img tag failed")}
            />
          </div>

          {/* Background Test */}
          <div className="mb-8">
            <h2 className="text-neon-cyan mb-4">Background Image Test:</h2>
            <div 
              className="w-full h-64 rounded border border-neon-cyan"
              style={{
                backgroundImage: `url('/cityscape-hero-new.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            ></div>
          </div>

          {/* Alternative Paths Test */}
          <div className="mb-8">
            <h2 className="text-neon-cyan mb-4">Alternative Paths Test:</h2>
            <div className="grid grid-cols-2 gap-4">
              <div 
                className="h-32 rounded border border-neon-cyan"
                style={{
                  backgroundImage: `url('./cityscape-hero-new.png')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              ></div>
              <div 
                className="h-32 rounded border border-neon-cyan"
                style={{
                  backgroundImage: `url('/public/cityscape-hero-new.png')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTest;
