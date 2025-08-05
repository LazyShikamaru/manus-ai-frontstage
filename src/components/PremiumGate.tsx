import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock, Zap, ArrowRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface PremiumGateProps {
  children: React.ReactNode;
  contentType?: 'newsletter' | 'feature' | 'content';
  title?: string;
  description?: string;
  showPreview?: boolean;
  previewContent?: string;
  className?: string;
}

interface UserSubscription {
  tier: 'free' | 'premium';
  status: 'active' | 'cancelled' | 'expired';
}

const PremiumGate: React.FC<PremiumGateProps> = ({
  children,
  contentType = 'content',
  title,
  description,
  showPreview = true,
  previewContent,
  className = ''
}) => {
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchUserSubscription();
  }, []);

  const fetchUserSubscription = async () => {
    try {
      const userId = localStorage.getItem('userId') || '1';
      const response = await fetch(`/api/subscription-status/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        setUserSubscription(data.subscription || { tier: 'free', status: 'active' });
      } else {
        // Default to free if API call fails
        setUserSubscription({ tier: 'free', status: 'active' });
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setUserSubscription({ tier: 'free', status: 'active' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    navigate('/subscription');
  };

  const handleQuickUpgrade = async () => {
    try {
      const userId = localStorage.getItem('userId') || '1';
      const response = await fetch('/api/upgrade-to-premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Upgraded to Premium!",
          description: "You now have access to all premium features.",
        });
        
        // Refresh subscription status
        fetchUserSubscription();
      } else {
        throw new Error(data.error || 'Upgrade failed');
      }
    } catch (error) {
      console.error('Error upgrading:', error);
      toast({
        title: "Upgrade Error",
        description: "Failed to upgrade. Please try the full subscription flow.",
        variant: "destructive",
      });
      navigate('/subscription');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 rounded-lg h-64"></div>
      </div>
    );
  }

  // If user has premium access, show the content
  if (userSubscription?.tier === 'premium' && userSubscription?.status === 'active') {
    return <div className={className}>{children}</div>;
  }

  // Show premium gate for free users
  const getContentTypeText = () => {
    switch (contentType) {
      case 'newsletter':
        return 'premium newsletter';
      case 'feature':
        return 'premium feature';
      default:
        return 'premium content';
    }
  };

  return (
    <div className={className}>
      {/* Preview Content */}
      {showPreview && previewContent && (
        <div className="relative mb-6">
          <div className="bg-white rounded-lg p-6 border">
            <div className="prose max-w-none">
              {previewContent}
            </div>
          </div>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white rounded-lg pointer-events-none"></div>
          
          {/* Lock Overlay */}
          <div className="absolute inset-0 flex items-end justify-center pb-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
              <Lock className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>
      )}

      {/* Premium Gate Card */}
      <Card className="border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="bg-purple-100 p-4 rounded-full">
              <Crown className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          
          <Badge variant="outline" className="mx-auto mb-2 border-purple-300 text-purple-700">
            Premium Content
          </Badge>
          
          <CardTitle className="text-2xl font-bold text-gray-900">
            {title || `Unlock this ${getContentTypeText()}`}
          </CardTitle>
          
          <p className="text-gray-600 max-w-md mx-auto">
            {description || `This ${getContentTypeText()} is available exclusively to Premium subscribers. Upgrade now to access this and all other premium content.`}
          </p>
        </CardHeader>
        
        <CardContent className="text-center">
          {/* Benefits List */}
          <div className="bg-white rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-3 text-gray-900">Premium Benefits Include:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 mr-2" />
                <span>Access to all premium newsletters</span>
              </div>
              <div className="flex items-center">
                <Zap className="h-4 w-4 text-blue-500 mr-2" />
                <span>Unlimited AI content generation</span>
              </div>
              <div className="flex items-center">
                <Crown className="h-4 w-4 text-purple-500 mr-2" />
                <span>Priority customer support</span>
              </div>
              <div className="flex items-center">
                <ArrowRight className="h-4 w-4 text-green-500 mr-2" />
                <span>Advanced analytics & insights</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3"
              size="lg"
            >
              <Crown className="h-5 w-5 mr-2" />
              Upgrade to Premium
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            
            {/* Quick Demo Upgrade Button (for demo purposes) */}
            <Button 
              onClick={handleQuickUpgrade}
              variant="outline"
              className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <Zap className="h-4 w-4 mr-2" />
              Quick Demo Upgrade (No Payment)
            </Button>
          </div>

          {/* Pricing Info */}
          <div className="mt-4 text-sm text-gray-500">
            <p>Starting at <span className="font-semibold text-purple-600">$9.99/month</span></p>
            <p>Cancel anytime • 30-day money-back guarantee</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PremiumGate;

