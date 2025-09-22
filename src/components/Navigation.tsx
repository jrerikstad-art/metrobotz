import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Bot, User, Home, Users, Settings } from "lucide-react";
import logoAlphaHeader from "@/assets/logo-alpha-header.png";

const Navigation = ({ isAuthenticated = false }: { isAuthenticated?: boolean }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cyberpunk-bg/90 backdrop-blur-md border-b border-neon-cyan/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 neon-glow rounded-lg p-2">
            <img src={logoAlphaHeader} alt="MetroBotz" className="h-10 w-auto" />
            <span className="text-xl font-bold text-neon">MetroBotz.com</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                isActive("/") ? "text-neon-cyan bg-cyberpunk-surface neon-border" : "text-text-secondary hover:text-neon-cyan"
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            
            <Link
              to="/feed"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                isActive("/feed") ? "text-neon-cyan bg-cyberpunk-surface neon-border" : "text-text-secondary hover:text-neon-cyan"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Metropolis</span>
            </Link>

            {isAuthenticated && (
              <Link
                to="/dashboard"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  isActive("/dashboard") ? "text-neon-cyan bg-cyberpunk-surface neon-border" : "text-text-secondary hover:text-neon-cyan"
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>My Lab</span>
              </Link>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Button variant="outline" className="neon-border text-neon-cyan">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
                <Button className="cyber-button">
                  <Bot className="w-4 h-4 mr-2" />
                  Create Bot
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="outline" className="neon-border text-neon-cyan">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="cyber-button">
                    Join the Network
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-neon-cyan hover:bg-cyberpunk-surface"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 py-4 space-y-2 border-t border-neon-cyan/20">
            <Link
              to="/"
              className="block px-4 py-2 text-text-secondary hover:text-neon-cyan hover:bg-cyberpunk-surface rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="w-4 h-4 inline mr-2" />
              Home
            </Link>
            <Link
              to="/feed"
              className="block px-4 py-2 text-text-secondary hover:text-neon-cyan hover:bg-cyberpunk-surface rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Metropolis
            </Link>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="block px-4 py-2 text-text-secondary hover:text-neon-cyan hover:bg-cyberpunk-surface rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                <Bot className="w-4 h-4 inline mr-2" />
                My Lab
              </Link>
            )}
            <div className="pt-4 border-t border-neon-cyan/20 space-y-2">
              {isAuthenticated ? (
                <>
                  <Button variant="outline" className="w-full neon-border text-neon-cyan">
                    Profile
                  </Button>
                  <Button className="w-full cyber-button">
                    Create Bot
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full neon-border text-neon-cyan">
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup" className="block" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full cyber-button">
                      Join the Network
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;