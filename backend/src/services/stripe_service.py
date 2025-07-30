import stripe
import os
from typing import Dict, Optional
from src.models.user import db
from src.models.subscription import Subscription
from src.models.payment import Payment

class StripeService:
    def __init__(self):
        # In production, this would come from environment variables
        stripe.api_key = os.getenv('STRIPE_SECRET_KEY', 'sk_test_...')  # Replace with actual test key
        self.webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET', 'whsec_...')
        
    def create_checkout_session(self, user_id: int, price_id: str, success_url: str, cancel_url: str) -> Dict:
        """Create a Stripe checkout session for subscription"""
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price': price_id,
                    'quantity': 1,
                }],
                mode='subscription',
                success_url=success_url,
                cancel_url=cancel_url,
                client_reference_id=str(user_id),
                metadata={
                    'user_id': user_id
                }
            )
            
            # Create payment record
            payment = Payment(
                user_id=user_id,
                stripe_session_id=session.id,
                amount=0,  # Will be updated when payment completes
                status='pending'
            )
            db.session.add(payment)
            db.session.commit()
            
            return {
                'session_id': session.id,
                'url': session.url,
                'success': True
            }
            
        except Exception as e:
            db.session.rollback()
            return {
                'success': False,
                'error': str(e)
            }
    
    def create_one_time_payment(self, user_id: int, amount: int, currency: str = 'usd') -> Dict:
        """Create a one-time payment session"""
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': currency,
                        'product_data': {
                            'name': 'Premium Newsletter Access',
                        },
                        'unit_amount': amount,  # Amount in cents
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url='https://your-domain.com/success',
                cancel_url='https://your-domain.com/cancel',
                client_reference_id=str(user_id),
                metadata={
                    'user_id': user_id
                }
            )
            
            # Create payment record
            payment = Payment(
                user_id=user_id,
                stripe_session_id=session.id,
                amount=amount / 100,  # Convert cents to dollars
                currency=currency,
                status='pending'
            )
            db.session.add(payment)
            db.session.commit()
            
            return {
                'session_id': session.id,
                'url': session.url,
                'success': True
            }
            
        except Exception as e:
            db.session.rollback()
            return {
                'success': False,
                'error': str(e)
            }
    
    def handle_webhook(self, payload: str, sig_header: str) -> Dict:
        """Handle Stripe webhook events"""
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, self.webhook_secret
            )
            
            if event['type'] == 'checkout.session.completed':
                session = event['data']['object']
                self._handle_successful_payment(session)
                
            elif event['type'] == 'invoice.payment_succeeded':
                invoice = event['data']['object']
                self._handle_subscription_payment(invoice)
                
            elif event['type'] == 'customer.subscription.deleted':
                subscription = event['data']['object']
                self._handle_subscription_cancelled(subscription)
                
            return {'success': True}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _handle_successful_payment(self, session):
        """Handle successful payment completion"""
        user_id = session.get('client_reference_id')
        if not user_id:
            return
        
        # Update payment record
        payment = Payment.query.filter_by(stripe_session_id=session['id']).first()
        if payment:
            payment.status = 'completed'
            payment.amount = session.get('amount_total', 0) / 100
            
        # Create or update subscription for subscription payments
        if session.get('mode') == 'subscription':
            subscription = Subscription.query.filter_by(user_id=user_id).first()
            if not subscription:
                subscription = Subscription(
                    user_id=user_id,
                    tier='premium',
                    stripe_subscription_id=session.get('subscription'),
                    status='active'
                )
                db.session.add(subscription)
            else:
                subscription.tier = 'premium'
                subscription.status = 'active'
                subscription.stripe_subscription_id = session.get('subscription')
        
        db.session.commit()
    
    def _handle_subscription_payment(self, invoice):
        """Handle recurring subscription payment"""
        subscription_id = invoice.get('subscription')
        if subscription_id:
            subscription = Subscription.query.filter_by(
                stripe_subscription_id=subscription_id
            ).first()
            if subscription:
                subscription.status = 'active'
                db.session.commit()
    
    def _handle_subscription_cancelled(self, stripe_subscription):
        """Handle subscription cancellation"""
        subscription = Subscription.query.filter_by(
            stripe_subscription_id=stripe_subscription['id']
        ).first()
        if subscription:
            subscription.status = 'cancelled'
            subscription.tier = 'free'
            db.session.commit()
    
    def get_user_subscription_status(self, user_id: int) -> Dict:
        """Get user's current subscription status"""
        subscription = Subscription.query.filter_by(user_id=user_id).first()
        if not subscription:
            return {
                'tier': 'free',
                'status': 'none',
                'has_premium': False
            }
        
        return {
            'tier': subscription.tier,
            'status': subscription.status,
            'has_premium': subscription.tier == 'premium' and subscription.status == 'active',
            'stripe_subscription_id': subscription.stripe_subscription_id
        }

