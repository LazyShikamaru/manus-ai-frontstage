#!/usr/bin/env python3
"""
Script to test Stripe webhooks locally using the Stripe CLI
"""

import os
import sys
import subprocess
import requests
import json
import time

def test_webhook_endpoint():
    """Test the webhook endpoint with sample data"""
    print("🧪 Testing webhook endpoint...")
    
    # Test data for different webhook events
    test_events = [
        {
            'type': 'checkout.session.completed',
            'user_id': 1,
            'description': 'Successful subscription checkout'
        },
        {
            'type': 'invoice.payment_failed',
            'user_id': 1,
            'description': 'Failed payment notification'
        }
    ]
    
    base_url = 'http://localhost:5000'
    
    for event in test_events:
        print(f"\n📤 Testing: {event['description']}")
        
        try:
            response = requests.post(
                f"{base_url}/api/webhook/test",
                json=event,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Success: {result.get('message', 'OK')}")
            else:
                print(f"❌ Failed: {response.status_code} - {response.text}")
                
        except requests.exceptions.ConnectionError:
            print(f"❌ Connection failed. Make sure Flask server is running on {base_url}")
            return False
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            return False
    
    return True

def setup_stripe_cli():
    """Instructions for setting up Stripe CLI"""
    print("🔧 Stripe CLI Setup Instructions")
    print("=" * 40)
    print()
    print("1. Install Stripe CLI:")
    print("   - macOS: brew install stripe/stripe-cli/stripe")
    print("   - Linux: Download from https://github.com/stripe/stripe-cli/releases")
    print("   - Windows: Download from https://github.com/stripe/stripe-cli/releases")
    print()
    print("2. Login to Stripe:")
    print("   stripe login")
    print()
    print("3. Forward webhooks to local server:")
    print("   stripe listen --forward-to localhost:5000/api/webhook")
    print()
    print("4. Copy the webhook signing secret from the CLI output")
    print("   and set it in your .env file as STRIPE_WEBHOOK_SECRET")
    print()
    print("5. In another terminal, trigger test events:")
    print("   stripe trigger checkout.session.completed")
    print("   stripe trigger invoice.payment_succeeded")
    print("   stripe trigger invoice.payment_failed")
    print("   stripe trigger customer.subscription.deleted")
    print()

def create_test_products():
    """Create test products and prices in Stripe"""
    print("🛍️  Creating test products in Stripe...")
    
    try:
        import stripe
        stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
        
        if not stripe.api_key:
            print("❌ STRIPE_SECRET_KEY not found in environment variables")
            return False
        
        # Create premium subscription product
        try:
            product = stripe.Product.create(
                name='Premium Newsletter Subscription',
                description='Access to all premium newsletters and AI features',
                type='service'
            )
            print(f"✅ Created product: {product.id}")
            
            # Create monthly price
            monthly_price = stripe.Price.create(
                product=product.id,
                unit_amount=999,  # $9.99
                currency='usd',
                recurring={'interval': 'month'},
                nickname='Premium Monthly'
            )
            print(f"✅ Created monthly price: {monthly_price.id}")
            
            # Create yearly price
            yearly_price = stripe.Price.create(
                product=product.id,
                unit_amount=9999,  # $99.99
                currency='usd',
                recurring={'interval': 'year'},
                nickname='Premium Yearly'
            )
            print(f"✅ Created yearly price: {yearly_price.id}")
            
            print("\n📝 Add these price IDs to your frontend:")
            print(f"   Monthly: {monthly_price.id}")
            print(f"   Yearly: {yearly_price.id}")
            
            return True
            
        except stripe.error.StripeError as e:
            print(f"❌ Stripe error: {str(e)}")
            return False
            
    except ImportError:
        print("❌ Stripe library not installed. Run: pip install stripe")
        return False

def main():
    """Main function to run webhook tests"""
    print("🚀 Stripe Webhook Testing Tool")
    print("=" * 40)
    
    # Check if Flask server is running
    print("\n1. Checking Flask server...")
    if not test_webhook_endpoint():
        print("\n❌ Flask server test failed")
        print("   Make sure your Flask server is running: python src/main.py")
        return
    
    print("\n2. Setting up Stripe CLI...")
    setup_stripe_cli()
    
    print("\n3. Creating test products...")
    if os.getenv('STRIPE_SECRET_KEY'):
        create_test_products()
    else:
        print("⚠️  STRIPE_SECRET_KEY not found. Skipping product creation.")
        print("   Set your Stripe secret key in .env file to create test products.")
    
    print("\n🎉 Webhook testing setup complete!")
    print("\nNext steps:")
    print("1. Start Stripe CLI webhook forwarding")
    print("2. Trigger test events using Stripe CLI")
    print("3. Check your Flask server logs for webhook processing")
    print("4. Monitor Celery worker logs for background task execution")

if __name__ == '__main__':
    main()

