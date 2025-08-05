# Stripe Integration Guide - Manus AI Newsletter Platform

## Overview

This guide covers the complete Stripe integration for the Manus AI Newsletter Platform, including subscription management, webhook handling, and testing procedures.

## Architecture

```
Frontend (React) ──► Backend (Flask) ──► Stripe API
       │                    │
       │                    ▼
       │              Webhook Handler
       │                    │
       │                    ▼
       └──────────► Celery Tasks (Emails)
```

## Stripe Setup

### 1. Create Stripe Account

1. Sign up at [stripe.com](https://stripe.com)
2. Complete account verification
3. Switch to test mode for development

### 2. Get API Keys

From Stripe Dashboard → Developers → API Keys:

- **Publishable Key**: `pk_test_...` (for frontend)
- **Secret Key**: `sk_test_...` (for backend)

### 3. Create Products and Prices

#### Using Stripe Dashboard

1. Go to Products → Add Product
2. Create "Premium Newsletter Subscription"
3. Add pricing:
   - Monthly: $9.99/month
   - Yearly: $99.99/year (save $20)

#### Using Stripe CLI

```bash
# Create product
stripe products create \
  --name "Premium Newsletter Subscription" \
  --description "Access to all premium newsletters and AI features"

# Create monthly price
stripe prices create \
  --product prod_xxx \
  --unit-amount 999 \
  --currency usd \
  --recurring interval=month \
  --nickname "Premium Monthly"

# Create yearly price
stripe prices create \
  --product prod_xxx \
  --unit-amount 9999 \
  --currency usd \
  --recurring interval=year \
  --nickname "Premium Yearly"
```

## Backend Integration

### 1. Install Dependencies

```bash
pip install stripe flask-cors
```

### 2. Environment Variables

Add to your `.env` file:

```env
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Stripe Service Implementation

The backend includes a complete Stripe service at `src/services/stripe_service.py`:

```python
import stripe
import os

stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

class StripeService:
    def create_checkout_session(self, user_id, price_id, success_url, cancel_url):
        # Creates Stripe Checkout session
        
    def create_portal_session(self, customer_id, return_url):
        # Creates customer portal session
        
    def handle_webhook(self, payload, signature):
        # Processes webhook events
```

### 4. API Endpoints

#### Create Checkout Session

```http
POST /api/create-checkout-session
Content-Type: application/json

{
  "user_id": 1,
  "price_id": "price_xxx",
  "success_url": "https://yoursite.com/success",
  "cancel_url": "https://yoursite.com/cancel"
}
```

Response:
```json
{
  "success": true,
  "checkout_url": "https://checkout.stripe.com/pay/cs_xxx"
}
```

#### Subscription Status

```http
GET /api/subscription-status/1
```

Response:
```json
{
  "success": true,
  "subscription": {
    "tier": "premium",
    "status": "active",
    "current_period_end": "2024-09-01T00:00:00Z"
  }
}
```

#### Webhook Handler

```http
POST /api/webhook
Stripe-Signature: t=xxx,v1=xxx
Content-Type: application/json

{
  "type": "checkout.session.completed",
  "data": { ... }
}
```

## Frontend Integration

### 1. Install Dependencies

```bash
npm install @stripe/stripe-js
```

### 2. Environment Variables

Add to your `.env.local`:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:5000
```

### 3. Stripe Integration

#### Subscription Page

The frontend includes a complete subscription page at `src/pages/Subscription.tsx`:

- Pricing plans display
- Stripe Checkout integration
- Current subscription status
- Responsive design

#### Premium Content Gating

Use the `PremiumGate` component to protect premium content:

```tsx
import PremiumGate from '@/components/PremiumGate';

<PremiumGate
  contentType="newsletter"
  title="Premium Newsletter"
  description="This newsletter is available to Premium subscribers only"
>
  <PremiumNewsletterContent />
</PremiumGate>
```

#### Billing Management

The `BillingManagement` component provides:

- Current subscription details
- Payment method management
- Subscription cancellation
- Billing portal access

## Webhook Configuration

### 1. Local Development

#### Install Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux/Windows
# Download from https://github.com/stripe/stripe-cli/releases
```

#### Forward Webhooks

```bash
# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:5000/api/webhook

# Copy the webhook signing secret (whsec_xxx) to your .env file
```

#### Test Webhook Events

```bash
# Trigger test events
stripe trigger checkout.session.completed
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
stripe trigger customer.subscription.deleted
```

### 2. Production Setup

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-backend-url.onrender.com/api/webhook`
3. Select events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
4. Copy webhook signing secret to production environment

## Webhook Event Handling

### Supported Events

#### checkout.session.completed
- Triggered when user completes payment
- Creates/updates subscription in database
- Sends welcome email via Celery
- Upgrades user to premium tier

#### invoice.payment_succeeded
- Triggered on successful recurring payment
- Updates subscription status
- Sends payment confirmation email

#### invoice.payment_failed
- Triggered when payment fails
- Sends payment failure notification
- May downgrade user after grace period

#### customer.subscription.deleted
- Triggered when subscription is cancelled
- Downgrades user to free tier
- Sends cancellation confirmation

### Webhook Processing Flow

```python
@app.route('/api/webhook', methods=['POST'])
def stripe_webhook():
    payload = request.get_data()
    sig_header = request.headers.get('Stripe-Signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError:
        return 'Invalid payload', 400
    except stripe.error.SignatureVerificationError:
        return 'Invalid signature', 400
    
    # Handle the event
    if event['type'] == 'checkout.session.completed':
        handle_checkout_completed(event['data']['object'])
    elif event['type'] == 'invoice.payment_failed':
        handle_payment_failed(event['data']['object'])
    
    return 'Success', 200
```

## Testing

### 1. Test Cards

Use Stripe's test card numbers:

```
# Successful payments
4242424242424242  # Visa
4000056655665556  # Visa (debit)
5555555555554444  # Mastercard

# Failed payments
4000000000000002  # Card declined
4000000000009995  # Insufficient funds
4000000000000069  # Expired card
```

### 2. Test Scenarios

#### Successful Subscription Flow

1. Navigate to `/subscription`
2. Click "Subscribe to Premium"
3. Use test card: `4242424242424242`
4. Complete checkout
5. Verify redirect to success page
6. Check database for subscription record
7. Verify welcome email sent

#### Failed Payment Flow

1. Use declined card: `4000000000000002`
2. Verify error handling
3. Check user remains on free tier

#### Webhook Testing

```bash
# Test webhook endpoint directly
curl -X POST http://localhost:5000/api/webhook/test \
  -H "Content-Type: application/json" \
  -d '{
    "type": "checkout.session.completed",
    "user_id": 1,
    "customer_id": "cus_test123"
  }'
```

### 3. Automated Testing Script

Use the provided test script:

```bash
cd backend
python scripts/test_stripe_webhook.py
```

This script:
- Tests webhook endpoints
- Creates test products
- Provides setup instructions
- Validates integration

## Error Handling

### Common Errors

#### Invalid API Key
```json
{
  "error": {
    "type": "authentication_error",
    "message": "Invalid API Key provided"
  }
}
```

**Solution**: Verify API key in environment variables

#### Webhook Signature Verification Failed
```json
{
  "error": "Invalid signature"
}
```

**Solution**: Check webhook secret and payload handling

#### Customer Not Found
```json
{
  "error": {
    "type": "invalid_request_error",
    "message": "No such customer"
  }
}
```

**Solution**: Ensure customer exists before creating subscription

### Error Handling Best Practices

1. **Graceful Degradation**: Continue with limited functionality if Stripe is unavailable
2. **Retry Logic**: Implement exponential backoff for failed API calls
3. **Logging**: Log all Stripe interactions for debugging
4. **User Feedback**: Provide clear error messages to users

## Security Considerations

### 1. API Key Security

- Never expose secret keys in frontend code
- Use environment variables for all keys
- Rotate keys regularly
- Use restricted API keys when possible

### 2. Webhook Security

- Always verify webhook signatures
- Use HTTPS endpoints only
- Implement idempotency for webhook handlers
- Log webhook events for audit trail

### 3. Customer Data

- Store minimal customer data
- Use Stripe Customer Portal for sensitive operations
- Implement proper access controls
- Follow PCI compliance guidelines

## Production Checklist

### Before Going Live

- [ ] Switch to live API keys
- [ ] Update webhook endpoints to production URLs
- [ ] Test with real bank account (small amounts)
- [ ] Verify tax settings in Stripe Dashboard
- [ ] Set up proper error monitoring
- [ ] Configure email notifications
- [ ] Test subscription cancellation flow
- [ ] Verify refund process
- [ ] Set up customer support procedures

### Monitoring

1. **Stripe Dashboard**: Monitor payments, disputes, and failed charges
2. **Webhook Logs**: Track webhook delivery and processing
3. **Application Logs**: Monitor subscription status changes
4. **Email Delivery**: Track welcome and notification emails
5. **Customer Support**: Set up channels for billing inquiries

## Advanced Features

### 1. Proration

Handle mid-cycle plan changes:

```python
stripe.Subscription.modify(
    subscription_id,
    items=[{
        'id': subscription_item_id,
        'price': new_price_id,
    }],
    proration_behavior='create_prorations'
)
```

### 2. Coupons and Discounts

```python
# Create coupon
stripe.Coupon.create(
    percent_off=25,
    duration='once',
    id='25OFF'
)

# Apply to checkout
stripe.checkout.Session.create(
    discounts=[{'coupon': '25OFF'}],
    # ... other parameters
)
```

### 3. Usage-Based Billing

For AI content generation limits:

```python
# Report usage
stripe.SubscriptionItem.create_usage_record(
    subscription_item_id,
    quantity=10,  # AI generations used
    timestamp=int(time.time())
)
```

## Support and Resources

### Documentation

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Checkout](https://stripe.com/docs/checkout)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Testing](https://stripe.com/docs/testing)

### Tools

- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Webhook Testing Tool](https://webhook.site)

### Support

- Stripe Support: Available in dashboard
- Community: [Stripe Discord](https://discord.gg/stripe)
- Stack Overflow: Tag questions with `stripe-payments`

For platform-specific issues, contact the development team.

