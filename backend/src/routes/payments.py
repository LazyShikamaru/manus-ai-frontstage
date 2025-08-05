from flask import Blueprint, request, jsonify
from src.services.stripe_service import StripeService
from src.models.user import db, User
from src.models.subscription import Subscription
from src.tasks.subscription_tasks import process_new_subscription, process_subscription_renewal, process_subscription_cancellation
from src.tasks.email_tasks import send_payment_failed_notification
import logging

logger = logging.getLogger(__name__)

payments_bp = Blueprint('payments', __name__)
stripe_service = StripeService()

@payments_bp.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    """Create a Stripe checkout session for subscription"""
    try:
        data = request.get_json()
        
        if not data or not data.get('user_id'):
            return jsonify({
                'success': False,
                'error': 'User ID is required'
            }), 400
        
        user_id = data['user_id']
        price_id = data.get('price_id', 'price_premium_monthly')  # Default price ID
        success_url = data.get('success_url', 'https://your-domain.com/success')
        cancel_url = data.get('cancel_url', 'https://your-domain.com/cancel')
        
        result = stripe_service.create_checkout_session(
            user_id=user_id,
            price_id=price_id,
            success_url=success_url,
            cancel_url=cancel_url
        )
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@payments_bp.route('/create-one-time-payment', methods=['POST'])
def create_one_time_payment():
    """Create a one-time payment for premium content"""
    try:
        data = request.get_json()
        
        if not data or not data.get('user_id') or not data.get('amount'):
            return jsonify({
                'success': False,
                'error': 'User ID and amount are required'
            }), 400
        
        user_id = data['user_id']
        amount = int(data['amount'])  # Amount in cents
        currency = data.get('currency', 'usd')
        
        result = stripe_service.create_one_time_payment(
            user_id=user_id,
            amount=amount,
            currency=currency
        )
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@payments_bp.route('/subscription-status/<int:user_id>', methods=['GET'])
def get_subscription_status(user_id):
    """Get user's subscription status"""
    try:
        status = stripe_service.get_user_subscription_status(user_id)
        return jsonify({
            'success': True,
            'subscription': status
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@payments_bp.route('/webhook', methods=['POST'])
def stripe_webhook():
    """Enhanced Stripe webhook handler with Celery task integration"""
    try:
        payload = request.get_data(as_text=True)
        sig_header = request.headers.get('Stripe-Signature')
        
        if not sig_header:
            logger.error("Missing Stripe signature header")
            return jsonify({'error': 'Missing Stripe signature'}), 400
        
        # Verify webhook signature and parse event
        import stripe
        webhook_secret = stripe_service.webhook_secret
        
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
        except ValueError as e:
            logger.error(f"Invalid payload: {e}")
            return jsonify({'error': 'Invalid payload'}), 400
        except stripe.SignatureVerificationError as e:
            logger.error(f"Invalid signature: {e}")
            return jsonify({'error': 'Invalid signature'}), 400
        
        logger.info(f"Received Stripe webhook event: {event['type']}")
        
        # Handle different event types
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            user_id = session.get('client_reference_id')
            
            if user_id:
                logger.info(f"Processing successful checkout for user {user_id}")
                
                # Update payment and subscription in database
                stripe_service._handle_successful_payment(session)
                
                # Process subscription asynchronously
                if session.get('mode') == 'subscription':
                    process_new_subscription.delay(
                        user_id=int(user_id),
                        subscription_tier='premium'
                    )
                
        elif event['type'] == 'invoice.payment_succeeded':
            invoice = event['data']['object']
            subscription_id = invoice.get('subscription')
            customer_id = invoice.get('customer')
            
            if subscription_id:
                logger.info(f"Processing successful payment for subscription {subscription_id}")
                
                # Find user by Stripe customer ID or subscription ID
                subscription = Subscription.query.filter_by(
                    stripe_subscription_id=subscription_id
                ).first()
                
                if subscription:
                    # Process renewal asynchronously
                    process_subscription_renewal.delay(
                        user_id=subscription.user_id,
                        stripe_subscription_id=subscription_id
                    )
                
        elif event['type'] == 'invoice.payment_failed':
            invoice = event['data']['object']
            subscription_id = invoice.get('subscription')
            
            if subscription_id:
                logger.info(f"Processing failed payment for subscription {subscription_id}")
                
                subscription = Subscription.query.filter_by(
                    stripe_subscription_id=subscription_id
                ).first()
                
                if subscription:
                    # Send payment failed notification asynchronously
                    send_payment_failed_notification.delay(subscription.user_id)
                
        elif event['type'] == 'customer.subscription.deleted':
            stripe_subscription = event['data']['object']
            subscription_id = stripe_subscription['id']
            
            logger.info(f"Processing subscription cancellation for {subscription_id}")
            
            subscription = Subscription.query.filter_by(
                stripe_subscription_id=subscription_id
            ).first()
            
            if subscription:
                # Process cancellation asynchronously
                process_subscription_cancellation.delay(
                    user_id=subscription.user_id,
                    stripe_subscription_id=subscription_id
                )
        
        elif event['type'] == 'customer.subscription.updated':
            stripe_subscription = event['data']['object']
            subscription_id = stripe_subscription['id']
            status = stripe_subscription['status']
            
            logger.info(f"Processing subscription update for {subscription_id}: {status}")
            
            subscription = Subscription.query.filter_by(
                stripe_subscription_id=subscription_id
            ).first()
            
            if subscription:
                # Update subscription status
                if status == 'active':
                    subscription.status = 'active'
                elif status in ['canceled', 'unpaid', 'past_due']:
                    subscription.status = 'cancelled'
                    subscription.tier = 'free'
                
                db.session.commit()
        
        else:
            logger.info(f"Unhandled webhook event type: {event['type']}")
        
        return jsonify({'status': 'success'})
        
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        return jsonify({'error': str(e)}), 400

@payments_bp.route('/upgrade-to-premium', methods=['POST'])
def upgrade_to_premium():
    """Quick endpoint to upgrade user to premium (for demo purposes)"""
    try:
        data = request.get_json()
        
        if not data or not data.get('user_id'):
            return jsonify({
                'success': False,
                'error': 'User ID is required'
            }), 400
        
        user_id = data['user_id']
        
        # Check if user exists
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        # Create or update subscription
        subscription = Subscription.query.filter_by(user_id=user_id).first()
        if not subscription:
            subscription = Subscription(
                user_id=user_id,
                tier='premium',
                status='active'
            )
            db.session.add(subscription)
        else:
            subscription.tier = 'premium'
            subscription.status = 'active'
        
        db.session.commit()
        
        # Process subscription asynchronously
        process_new_subscription.delay(user_id=user_id, subscription_tier='premium')
        
        return jsonify({
            'success': True,
            'message': 'User upgraded to premium successfully',
            'subscription': subscription.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@payments_bp.route('/webhook/test', methods=['POST'])
def test_webhook():
    """Test webhook endpoint for local development"""
    try:
        data = request.get_json()
        event_type = data.get('type', 'checkout.session.completed')
        
        logger.info(f"Test webhook received: {event_type}")
        
        if event_type == 'checkout.session.completed':
            # Simulate successful checkout
            user_id = data.get('user_id', 1)
            process_new_subscription.delay(user_id=user_id, subscription_tier='premium')
            
        elif event_type == 'invoice.payment_failed':
            # Simulate failed payment
            user_id = data.get('user_id', 1)
            send_payment_failed_notification.delay(user_id)
        
        return jsonify({
            'success': True,
            'message': f'Test webhook {event_type} processed'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

