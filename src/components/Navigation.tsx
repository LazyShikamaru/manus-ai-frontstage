import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-editorial rounded-lg flex items-center justify-center">
              <span className="text-pure-white font-accent font-bold text-lg">M</span>
            </div>
            <span className="font-serif text-xl font-bold text-foreground">Manus AI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/features" 
              className={`font-accent text-sm ${isActive('/features') ? 'text-accent' : 'text-muted-foreground hover:text-foreground'} transition-colors`}
            >
              Features
            </Link>
            <Link 
              to="/pricing" 
              className={`font-accent text-sm ${isActive('/pricing') ? 'text-accent' : 'text-muted-foreground hover:text-foreground'} transition-colors`}
            >
              Pricing
            </Link>
            <Link 
              to="/login" 
              className="font-accent text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Log in
            </Link>
            <Link to="/signup">
              <Button variant="default">Get Started</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-border">
            <Link 
              to="/features" 
              className="block font-accent text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Features
            </Link>
            <Link 
              to="/pricing" 
              className="block font-accent text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              to="/login" 
              className="block font-accent text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Log in
            </Link>
            <Link to="/signup" onClick={() => setIsOpen(false)}>
              <Button variant="default" className="w-full">Get Started</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;