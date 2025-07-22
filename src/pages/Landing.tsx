import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import FeatureCard from "@/components/FeatureCard";
import PricingCard from "@/components/PricingCard";
import { ArrowRight, Sparkles, Users, DollarSign, BarChart3, Zap, Pen } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Writing",
      description: "Generate engaging newsletter content with advanced AI that understands your voice and audience."
    },
    {
      icon: Users,
      title: "Audience Growth",
      description: "Smart tools to grow your subscriber base with targeted content and automated engagement."
    },
    {
      icon: DollarSign,
      title: "Monetization Made Easy",
      description: "Create premium content, set subscription tiers, and start earning from your newsletters."
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Track performance, understand your audience, and optimize your content strategy."
    }
  ];

  const faqItems = [
    {
      question: "How does the AI writing assistant work?",
      answer: "Our AI analyzes your writing style, topic preferences, and audience engagement to generate personalized newsletter content. You can provide prompts, and the AI will create full articles, headlines, or help you brainstorm ideas."
    },
    {
      question: "Can I customize the AI-generated content?",
      answer: "Absolutely! The AI serves as your writing partner. You can edit, refine, and personalize all generated content. Think of it as a smart first draft that you can build upon."
    },
    {
      question: "What's included in the Creator Pro plan?",
      answer: "Creator Pro includes unlimited AI-generated content, premium templates, advanced analytics, subscriber management tools, monetization features, and priority support."
    },
    {
      question: "How do I monetize my newsletter?",
      answer: "You can create premium content tiers, set up paid subscriptions, and offer exclusive content to paying subscribers. Our platform handles all the payment processing and subscriber management."
    },
    {
      question: "Is there a limit on subscribers?",
      answer: "The free plan supports up to 1,000 subscribers. Creator Pro offers unlimited subscribers and advanced audience management tools."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:py-32">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-sans text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight px-4 sm:px-0">
              Create newsletters that 
              <span className="text-transparent bg-clip-text bg-gradient-editorial block sm:inline"> captivate</span> and 
              <span className="text-transparent bg-clip-text bg-gradient-coral block sm:inline"> convert</span>
            </h1>
            <p className="font-sans text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto px-4 sm:px-0">
              AI-powered newsletter platform for indie creators, writers, and entrepreneurs. 
              Turn your ideas into engaging content and build a thriving subscriber base.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4 sm:px-0">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button variant="hero" size="lg" className="group w-full sm:w-auto">
                  Start Creating Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                View Examples
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 px-4">
            <h2 className="font-sans text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything you need to succeed
            </h2>
            <p className="font-sans text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              From AI-powered writing to advanced analytics, we've got your newsletter journey covered.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 px-4">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 px-4">
            <h2 className="font-sans text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Choose your plan
            </h2>
            <p className="font-sans text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free and upgrade as you grow. No hidden fees, cancel anytime.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto px-4">
            <PricingCard
              title="Free"
              price="Free"
              description="Perfect for getting started"
              features={[
                "Up to 1,000 subscribers",
                "5 AI-generated newsletters/month",
                "Basic templates",
                "Email support",
                "Analytics dashboard"
              ]}
              ctaText="Start Free"
              ctaVariant="outline"
            />
            <PricingCard
              title="Creator Pro"
              price="$29"
              description="For serious newsletter creators"
              features={[
                "Unlimited subscribers",
                "Unlimited AI-generated content",
                "Premium templates",
                "Advanced analytics",
                "Monetization tools",
                "Priority support",
                "Custom branding"
              ]}
              isPopular={true}
              ctaText="Start Pro Trial"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 px-4">
            <h2 className="font-sans text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Frequently asked questions
            </h2>
            <p className="font-sans text-lg sm:text-xl text-muted-foreground">
              Everything you need to know about Manus AI
            </p>
          </div>
          <Accordion type="single" collapsible className="space-y-4 px-4">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="bg-card border border-border rounded-lg px-6">
                <AccordionTrigger className="font-sans font-medium text-left text-base sm:text-lg">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="font-sans text-muted-foreground text-sm sm:text-base">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="p-12 bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-editorial rounded-2xl flex items-center justify-center">
                <Pen className="h-8 w-8 text-pure-white" />
              </div>
            </div>
            <h2 className="font-sans text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Ready to transform your writing?
            </h2>
            <p className="font-sans text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of creators who are building successful newsletters with AI assistance.
            </p>
            <Link to="/signup">
              <Button variant="hero" size="lg" className="group">
                Start for Free Today
                <Zap className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              </Button>
            </Link>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Landing;