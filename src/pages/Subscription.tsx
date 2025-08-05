import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Star, Users, BarChart3, Mail, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  description: string;
  features: string[];
  popular?: boolean;
  stripePriceId: string;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    description: 'Perfect for getting started',
    stripePriceId: '',
    features: [
      'Access to public newsletters',
      'Basic AI content generation (5/month)',
      'Community support',
      'Basic analytics'
    ]
  },
  {
    id: 'premium-monthly',
    name: 'Premium',
    price: 9.99,
    interval: 'month',
    description: 'Everything you need to grow',
    stripePriceId: 'price_premium_monthly', // Replace with actual Stripe price ID
    popular: true,
    features: [
      'Access to all premium newsletters',
      'Unlimited AI content generation',
      'Priority customer support',
      'Advanced analytics and insights',
      'Custom newsletter templates',
      'Audience growth tools',
      'Email automation',
      'Export capabilities'
    ]
  },
  {
    id: 'premium-yearly',
    name: 'Premium Annual',
    price: 99.99,
    interval: 'year',
    description: 'Best value - 2 months free!',
    stripePriceId: 'price_premium_yearly', // Replace with actual Stripe price ID
    features: [
      'Everything in Premium Monthly',
      'Save $20 per year',
      'Priority feature requests',
      'Dedicated account manager',
      'Advanced integrations',
      'White-label options'
    ]
  }
];

const Subscription: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCurrentSubscription();
  }, []);

  const fetchCurrentSubscription = async () => {
    try {
      // Get user ID from localStorage or context
      const userId = localStorage.getItem('userId') || '1';
      const response = await fetch(`/api/subscription-status/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        setCurrentSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handleSubscribe = async (plan: PricingPlan) => {
    if (plan.price === 0) {
      toast({
        title: "You're already on the free plan!",
        description: "Upgrade to Premium to unlock more features.",
      });
      return;
    }

    setLoading(plan.id);

    try {
      // Get user ID from localStorage or context
      const userId = localStorage.getItem('userId') || '1';
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          price_id: plan.stripePriceId,
          success_url: `${window.location.origin}/subscription/success`,
          cancel_url: `${window.location.origin}/subscription/cancel`,
        }),
      });

      const data = await response.json();

      if (data.success && data.checkout_url) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkout_url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Payment Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Users className="h-6 w-6" />;
      case 'premium-monthly':
        return <Crown className="h-6 w-6" />;
      case 'premium-yearly':
        return <Star className="h-6 w-6" />;
      default:
        return <Zap className="h-6 w-6" />;
    }
  };

  const isCurrentPlan = (planId: string) => {
    if (!currentSubscription) return planId === 'free';
    
    if (currentSubscription.tier === 'free') return planId === 'free';
    if (currentSubscription.tier === 'premium') {
      return planId.startsWith('premium');
    }
    
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock the full potential of AI-powered newsletter creation and premium content access
          </p>
        </div>

        {/* Current Subscription Status */}
        {currentSubscription && (
          <div className="mb-8 text-center">
            <Badge variant="outline" className="text-sm px-4 py-2">
              Current Plan: {currentSubscription.tier?.toUpperCase() || 'FREE'} 
              {currentSubscription.status && ` (${currentSubscription.status})`}
            </Badge>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative transition-all duration-300 hover:shadow-xl ${
                plan.popular 
                  ? 'border-purple-500 shadow-lg scale-105' 
                  : 'border-gray-200 hover:border-purple-300'
              } ${isCurrentPlan(plan.id) ? 'ring-2 ring-green-500' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-500">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className={`p-3 rounded-full ${
                    plan.popular ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {getPlanIcon(plan.id)}
                  </div>
                </div>
                
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-gray-600">
                  {plan.description}
                </CardDescription>
                
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-gray-600">
                    /{plan.interval}
                  </span>
                  {plan.interval === 'year' && (
                    <div className="text-sm text-green-600 font-medium">
                      Save $20/year
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => handleSubscribe(plan)}
                  disabled={loading === plan.id || isCurrentPlan(plan.id)}
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'bg-gray-900 hover:bg-gray-800'
                  } ${isCurrentPlan(plan.id) ? 'bg-green-600 hover:bg-green-600' : ''}`}
                >
                  {loading === plan.id ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : isCurrentPlan(plan.id) ? (
                    'Current Plan'
                  ) : plan.price === 0 ? (
                    'Current Plan'
                  ) : (
                    `Subscribe to ${plan.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-8">Why Choose Premium?</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-gray-600 text-sm">
                Track engagement, growth metrics, and optimize your content strategy
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Unlimited AI Generation</h3>
              <p className="text-gray-600 text-sm">
                Generate unlimited newsletter content with our advanced AI
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Email Automation</h3>
              <p className="text-gray-600 text-sm">
                Automate your newsletter distribution and audience engagement
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Priority Support</h3>
              <p className="text-gray-600 text-sm">
                Get priority customer support and dedicated assistance
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="max-w-2xl mx-auto text-left space-y-4">
            <details className="bg-white p-4 rounded-lg shadow">
              <summary className="font-semibold cursor-pointer">Can I cancel anytime?</summary>
              <p className="mt-2 text-gray-600">
                Yes, you can cancel your subscription at any time. You'll continue to have access to premium features until the end of your billing period.
              </p>
            </details>
            
            <details className="bg-white p-4 rounded-lg shadow">
              <summary className="font-semibold cursor-pointer">What payment methods do you accept?</summary>
              <p className="mt-2 text-gray-600">
                We accept all major credit cards (Visa, MasterCard, American Express) and PayPal through our secure Stripe payment processor.
              </p>
            </details>
            
            <details className="bg-white p-4 rounded-lg shadow">
              <summary className="font-semibold cursor-pointer">Is there a free trial?</summary>
              <p className="mt-2 text-gray-600">
                Our free plan gives you access to basic features. You can upgrade to Premium at any time to unlock all features.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;

