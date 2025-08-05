import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, MessageCircle, CreditCard, HelpCircle } from 'lucide-react';

const SubscriptionCancel: React.FC = () => {
  const navigate = useNavigate();

  const handleRetryPayment = () => {
    navigate('/subscription');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleContactSupport = () => {
    // In a real app, this might open a support chat or redirect to a support page
    window.open('mailto:support@manusai.com?subject=Subscription Help', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Cancel Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 p-6 rounded-full">
              <XCircle className="h-16 w-16 text-red-600" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Subscription Cancelled
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your subscription process was cancelled. Don't worry - no charges were made to your account.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* What Happened */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <HelpCircle className="h-6 w-6 mr-2 text-blue-600" />
                What Happened?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                You cancelled the subscription process before completing payment. This could happen for several reasons:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• You decided to review the pricing plans again</li>
                <li>• You encountered a payment issue</li>
                <li>• You changed your mind about upgrading</li>
                <li>• You accidentally closed the payment window</li>
              </ul>
            </CardContent>
          </Card>

          {/* Your Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <CreditCard className="h-6 w-6 mr-2 text-green-600" />
                Your Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-green-800 mb-2">Free Plan - Still Active</h3>
                <p className="text-green-700 text-sm">
                  You can continue using Manus AI with our free plan features:
                </p>
              </div>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>• Access to public newsletters</li>
                <li>• Basic AI content generation (5/month)</li>
                <li>• Community support</li>
                <li>• Basic analytics</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Try Again</h3>
              <p className="text-gray-600 text-sm mb-4">
                Ready to upgrade? Return to our pricing page and try the subscription process again.
              </p>
              <Button 
                onClick={handleRetryPayment}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                View Pricing Plans
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <ArrowLeft className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="font-semibold mb-2">Continue with Free</h3>
              <p className="text-gray-600 text-sm mb-4">
                Continue using Manus AI with your current free plan and upgrade later when you're ready.
              </p>
              <Button 
                onClick={handleGoToDashboard}
                variant="outline"
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-gray-600 text-sm mb-4">
                Having trouble with the subscription process? Our support team is here to help.
              </p>
              <Button 
                onClick={handleContactSupport}
                variant="outline"
                className="w-full border-purple-600 text-purple-600 hover:bg-purple-50"
              >
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-center">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Was I charged anything?</h4>
                <p className="text-gray-600 text-sm mb-4">
                  No, you were not charged. Payment is only processed after successful completion of the checkout process.
                </p>
                
                <h4 className="font-semibold mb-2">Can I upgrade later?</h4>
                <p className="text-gray-600 text-sm">
                  Absolutely! You can upgrade to Premium at any time from your dashboard or the pricing page.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">What if I have payment issues?</h4>
                <p className="text-gray-600 text-sm mb-4">
                  We accept all major credit cards and PayPal. If you're having payment issues, please contact our support team.
                </p>
                
                <h4 className="font-semibold mb-2">Is there a free trial?</h4>
                <p className="text-gray-600 text-sm">
                  Our free plan gives you access to basic features indefinitely. You can try these features before deciding to upgrade.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom CTA */}
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">
            Still interested in Premium? We'd love to have you join our community of creators.
          </p>
          <div className="space-x-4">
            <Button 
              onClick={handleRetryPayment}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              View Premium Plans
            </Button>
            <Button 
              onClick={handleGoToDashboard}
              variant="outline"
            >
              Continue with Free Plan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCancel;

