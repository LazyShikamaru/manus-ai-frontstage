import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, Lock, Share2, BookmarkPlus, Mail } from "lucide-react";

const NewsletterView = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  // Mock newsletter data
  const newsletter = {
    id: 1,
    title: "The Future of AI in Creative Writing",
    author: {
      name: "Sarah Chen",
      avatar: "/placeholder-avatar.jpg",
      bio: "AI researcher and creative writing enthusiast"
    },
    publishDate: "March 15, 2024",
    readTime: "5 min read",
    isPremium: true,
    isSubscribed: false,
    content: `# The Future of AI in Creative Writing

Welcome to this week's deep dive into the rapidly evolving landscape of artificial intelligence in creative writing. As someone who's been tracking this space for years, I'm excited to share some fascinating developments that are reshaping how we think about creativity, collaboration, and the writing process itself.

## The Current State of AI Writing Tools

The past year has seen an explosion of AI-powered writing assistants, from general-purpose tools like ChatGPT to specialized platforms designed specifically for creative writers. These tools are no longer just glorified autocomplete systems—they're becoming sophisticated creative partners.

### What's Working Well

- **Brainstorming and ideation**: AI excels at generating fresh angles and perspectives
- **Overcoming writer's block**: Perfect for getting unstuck when inspiration runs dry
- **Research assistance**: Quick fact-checking and background research
- **Style adaptation**: Helping writers experiment with different voices and tones

## The Premium Content Continues...`,
    
    previewContent: `# The Future of AI in Creative Writing

Welcome to this week's deep dive into the rapidly evolving landscape of artificial intelligence in creative writing. As someone who's been tracking this space for years, I'm excited to share some fascinating developments that are reshaping how we think about creativity, collaboration, and the writing process itself.

## The Current State of AI Writing Tools

The past year has seen an explosion of AI-powered writing assistants, from general-purpose tools like ChatGPT to specialized platforms designed specifically for creative writers. These tools are no longer just glorified autocomplete systems—they're becoming sophisticated creative partners.

### What's Working Well

- **Brainstorming and ideation**: AI excels at generating fresh angles and perspectives
- **Overcoming writer's block**: Perfect for getting unstuck when inspiration runs dry
- **Research assistance**: Quick fact-checking and background research
- **Style adaptation**: Helping writers experiment with different voices and tones

---

**🔒 This is premium content. Subscribe to continue reading and get access to:**
- Deep analysis of emerging AI writing trends
- Exclusive interviews with AI researchers
- Practical tips for integrating AI into your creative workflow
- Weekly updates on the latest tools and techniques`
  };

  const handleSubscribe = () => {
    setIsSubscribed(true);
    // Here you would handle the subscription logic
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link to="/dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                {newsletter.isPremium && (
                  <Badge className="bg-gradient-coral text-pure-white">
                    Premium
                  </Badge>
                )}
                <span className="text-sm text-muted-foreground">Newsletter</span>
              </div>
              
              <h1 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-4">
                {newsletter.title}
              </h1>
              
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{newsletter.publishDate}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>{newsletter.readTime}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <BookmarkPlus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Author Section */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={newsletter.author.avatar} />
                <AvatarFallback>
                  {newsletter.author.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{newsletter.author.name}</h3>
                <p className="text-sm text-muted-foreground">{newsletter.author.bio}</p>
              </div>
              {!isSubscribed && (
                <Button onClick={handleSubscribe} className="group">
                  <Mail className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Subscribe
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Newsletter Content */}
        <div className="prose prose-lg max-w-none">
          <div className="whitespace-pre-wrap leading-relaxed">
            {newsletter.isSubscribed || isSubscribed ? newsletter.content : newsletter.previewContent}
          </div>
          
          {newsletter.isPremium && !newsletter.isSubscribed && !isSubscribed && (
            <Card className="mt-8 bg-gradient-to-r from-accent/5 to-primary/5 border-accent/20">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-editorial rounded-2xl flex items-center justify-center">
                    <Lock className="h-8 w-8 text-pure-white" />
                  </div>
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground mb-3">
                  Unlock Premium Content
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Subscribe to get access to the full newsletter, exclusive insights, and join a community of forward-thinking creators.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={handleSubscribe} size="lg" className="group">
                    <Mail className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Subscribe Now
                  </Button>
                  <Button variant="outline" size="lg">
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Success Message */}
        {isSubscribed && (
          <Card className="mt-8 bg-success/10 border-success/20">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold text-success mb-2">Welcome to the community! 🎉</h3>
              <p className="text-sm text-muted-foreground">
                You'll receive new newsletters directly in your inbox. Check your email for a confirmation message.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Newsletter Footer */}
        <Separator className="my-12" />
        
        <div className="text-center">
          <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
            Enjoyed this newsletter?
          </h3>
          <p className="text-muted-foreground mb-6">
            Share it with your network and help others discover great content.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share on Twitter
            </Button>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterView;