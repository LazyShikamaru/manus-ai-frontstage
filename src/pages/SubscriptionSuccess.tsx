import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Crown, ArrowRight, Mail, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SubscriptionSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (sessionId) {
      // Verify the session and get subscription details
      verifySession(sessionId);
    } else {
      // If no session ID, redirect to subscription page
      setTimeout(() => {
        navigate('/subscription');
      }, 3000);
    }
  }, [searchParams, navigate]);

  const verifySession = async (sessionId: string) => {
    try {
      // In a real implementation, you would verify the session with your backend
      // For now, we'll simulate a successful verification
      
      // Get user subscription status
      const userId = localStorage.getItem('userId') || '1';
      const response = await fetch(`/api/subscription-status/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        setSubscriptionDetails(data.subscription);
        
        toast({
          title: "Welcome to Premium!",
          description: "Your subscription has been activated successfully.",
        });
      }
    } catch (error) {
      console.error('Error verifying session:', error);
      toast({
        title: "Verification Error",
        description: "There was an issue verifying your subscription. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigate('/dashboard');
  };

  const handleViewPremiumContent = () => {
    navigate('/newsletters?filter=premium');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-6 rounded-full">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to Premium!
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your subscription has been successfully activated. You now have access to all premium features and content.
          </p>
        </div>

        {/* Subscription Details Card */}
        <Card className="mb-8 border-green-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center text-2xl">
              <Crown className="h-6 w-6 mr-2" />
              Premium Subscription Active
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Your Benefits</h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>Access to all premium newsletters</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>Unlimited AI content generation</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>Priority customer support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>Advanced analytics and insights</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>Custom newsletter templates</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>Email automation tools</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Subscription Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan:</span>
                    <span className="font-medium">
                      {subscriptionDetails?.tier?.toUpperCase() || 'Premium'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-green-600">
                      {subscriptionDetails?.status?.toUpperCase() || 'Active'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Billing:</span>
                    <span className="font-medium">Monthly</span>
                  </div>
                  {subscriptionDetails?.expires_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Next billing:</span>
                      <span className="font-medium">
                        {new Date(subscriptionDetails.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 p-3 rounded-full mr-4">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold">Start Creating</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Use our AI-powered tools to create engaging newsletter content in minutes.
              </p>
              <Button 
                onClick={handleContinue}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold">Explore Premium Content</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Browse our collection of premium newsletters from top creators and industry experts.
              </p>
              <Button 
                onClick={handleViewPremiumContent}
                variant="outline"
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                View Premium Newsletters
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Welcome Email Notice */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start">
              <Mail className="h-6 w-6 text-blue-600 mr-3 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Check Your Email</h3>
                <p className="text-blue-800">
                  We've sent you a welcome email with additional information about your premium subscription 
                  and tips to get the most out of Manus AI. If you don't see it, please check your spam folder.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Information */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Need help getting started? 
            <a href="/support" className="text-blue-600 hover:underline ml-1">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;

