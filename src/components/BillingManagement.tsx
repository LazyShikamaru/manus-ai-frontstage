import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Crown,
  Download,
  Settings,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Subscription {
  tier: 'free' | 'premium';
  status: 'active' | 'cancelled' | 'expired' | 'past_due';
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  stripe_subscription_id?: string;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

const BillingManagement: React.FC = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      const userId = localStorage.getItem('userId') || '1';
      
      // Fetch subscription status
      const subResponse = await fetch(`/api/subscription-status/${userId}`);
      if (subResponse.ok) {
        const subData = await subResponse.json();
        setSubscription(subData.subscription);
      }

      // Fetch payment methods
      const pmResponse = await fetch(`/api/payment-methods/${userId}`);
      if (pmResponse.ok) {
        const pmData = await pmResponse.json();
        setPaymentMethods(pmData.payment_methods || []);
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
      toast({
        title: "Error",
        description: "Failed to load billing information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription?.stripe_subscription_id) return;

    setActionLoading('cancel');
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription_id: subscription.stripe_subscription_id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Subscription Cancelled",
          description: "Your subscription will remain active until the end of your billing period.",
        });
        fetchBillingData(); // Refresh data
      } else {
        throw new Error(data.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: "Cancellation Error",
        description: "Failed to cancel subscription. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!subscription?.stripe_subscription_id) return;

    setActionLoading('reactivate');
    try {
      const response = await fetch('/api/reactivate-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription_id: subscription.stripe_subscription_id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Subscription Reactivated",
          description: "Your subscription has been reactivated successfully.",
        });
        fetchBillingData(); // Refresh data
      } else {
        throw new Error(data.error || 'Failed to reactivate subscription');
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      toast({
        title: "Reactivation Error",
        description: "Failed to reactivate subscription. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    setActionLoading('payment');
    try {
      const userId = localStorage.getItem('userId') || '1';
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          return_url: window.location.href,
        }),
      });

      const data = await response.json();

      if (data.success && data.portal_url) {
        window.location.href = data.portal_url;
      } else {
        throw new Error(data.error || 'Failed to create portal session');
      }
    } catch (error) {
      console.error('Error creating portal session:', error);
      toast({
        title: "Portal Error",
        description: "Failed to open billing portal. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="border-orange-300 text-orange-700">Cancelled</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      case 'past_due':
        return <Badge variant="destructive">Past Due</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="bg-gray-200 rounded-lg h-48"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Crown className="h-5 w-5 mr-2" />
            Current Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold capitalize">
                {subscription?.tier || 'Free'} Plan
              </h3>
              <p className="text-gray-600">
                {subscription?.tier === 'premium' 
                  ? 'Access to all premium features and content'
                  : 'Basic features with limited access'
                }
              </p>
            </div>
            <div className="text-right">
              {getStatusBadge(subscription?.status || 'active')}
              {subscription?.tier === 'premium' && (
                <p className="text-sm text-gray-600 mt-1">
                  $9.99/month
                </p>
              )}
            </div>
          </div>

          {subscription?.tier === 'premium' && (
            <>
              <Separator className="my-4" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subscription.current_period_start && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Billing Period</p>
                      <p className="text-sm text-gray-600">
                        {new Date(subscription.current_period_start).toLocaleDateString()} - {' '}
                        {subscription.current_period_end && new Date(subscription.current_period_end).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {subscription.current_period_end && (
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Next Billing Date</p>
                      <p className="text-sm text-gray-600">
                        {new Date(subscription.current_period_end).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {subscription.cancel_at_period_end && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-orange-600" />
                    <p className="text-sm text-orange-800">
                      Your subscription will end on {subscription.current_period_end && new Date(subscription.current_period_end).toLocaleDateString()}. 
                      You'll still have access to premium features until then.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods */}
      {subscription?.tier === 'premium' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paymentMethods.length > 0 ? (
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-3 text-gray-500" />
                      <div>
                        <p className="font-medium">
                          {method.brand.toUpperCase()} •••• {method.last4}
                        </p>
                        <p className="text-sm text-gray-600">
                          Expires {method.exp_month}/{method.exp_year}
                        </p>
                      </div>
                    </div>
                    {method.is_default && (
                      <Badge variant="outline">Default</Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No payment methods on file.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Billing Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {subscription?.tier === 'free' ? (
              <Button 
                onClick={() => window.location.href = '/subscription'}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Premium
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handleUpdatePaymentMethod}
                  disabled={actionLoading === 'payment'}
                  className="w-full"
                  variant="outline"
                >
                  {actionLoading === 'payment' ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                      Opening Portal...
                    </div>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Manage Billing & Payment Methods
                    </>
                  )}
                </Button>

                {subscription.cancel_at_period_end ? (
                  <Button 
                    onClick={handleReactivateSubscription}
                    disabled={actionLoading === 'reactivate'}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {actionLoading === 'reactivate' ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Reactivating...
                      </div>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Reactivate Subscription
                      </>
                    )}
                  </Button>
                ) : (
                  <Button 
                    onClick={handleCancelSubscription}
                    disabled={actionLoading === 'cancel'}
                    variant="outline"
                    className="w-full border-red-300 text-red-700 hover:bg-red-50"
                  >
                    {actionLoading === 'cancel' ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                        Cancelling...
                      </div>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Cancel Subscription
                      </>
                    )}
                  </Button>
                )}
              </>
            )}

            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => window.open('/api/download-invoice', '_blank')}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Latest Invoice
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="font-semibold text-blue-900 mb-2">Need Help with Billing?</h3>
            <p className="text-blue-800 mb-4">
              Our support team is here to help with any billing questions or issues.
            </p>
            <Button 
              variant="outline" 
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
              onClick={() => window.open('mailto:billing@manusai.com', '_blank')}
            >
              Contact Billing Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingManagement;

