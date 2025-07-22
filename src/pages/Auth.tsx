import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Lock, User } from "lucide-react";

interface AuthProps {
  type: "login" | "signup";
}

const Auth = ({ type }: AuthProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const isLogin = type === "login";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would handle authentication
    console.log({ email, password, name });
    // Redirect to dashboard after successful auth
    navigate("/dashboard");
  };

  const motivationalQuote = isLogin 
    ? "Welcome back! Your audience is waiting for your next brilliant newsletter."
    : "Every expert was once a beginner. Every pro was once an amateur.";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Motivational content */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-editorial p-12 flex-col justify-center">
        <div className="max-w-md">
          <Link to="/" className="inline-flex items-center text-pure-white/80 hover:text-pure-white mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Link>
          <h1 className="font-serif text-4xl font-bold text-pure-white mb-6">
            {isLogin ? "Welcome back to" : "Welcome to"} Manus AI
          </h1>
          <blockquote className="text-xl text-pure-white/90 italic leading-relaxed mb-8">
            "{motivationalQuote}"
          </blockquote>
          <div className="space-y-4 text-pure-white/80">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-pure-white rounded-full"></div>
              <span>AI-powered writing assistance</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-pure-white rounded-full"></div>
              <span>Grow your subscriber base</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-pure-white rounded-full"></div>
              <span>Monetize your content</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to home
            </Link>
            <h1 className="font-serif text-3xl font-bold text-foreground">Manus AI</h1>
          </div>

          <Card className="border-border shadow-soft">
            <CardHeader className="text-center">
              <CardTitle className="font-serif text-2xl">
                {isLogin ? "Sign in to your account" : "Create your account"}
              </CardTitle>
              <CardDescription>
                {isLogin 
                  ? "Welcome back! Please sign in to continue." 
                  : "Start your journey with AI-powered newsletters."
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-accent">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-accent">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="font-accent">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  {isLogin ? "Sign In" : "Create Account"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground font-accent">Or continue with</span>
                </div>
              </div>

              <Button variant="outline" className="w-full" size="lg">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                </span>
                <Link 
                  to={isLogin ? "/signup" : "/login"} 
                  className="text-accent hover:underline font-medium"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;