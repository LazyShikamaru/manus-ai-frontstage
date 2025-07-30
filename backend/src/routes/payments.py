from flask import Blueprint, request, jsonify
from src.services.stripe_service import StripeService
from src.models.user import db, User
from src.models.subscription import Subscription

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
    """Handle Stripe webhook events"""
    try:
        payload = request.get_data(as_text=True)
        sig_header = request.headers.get('Stripe-Signature')
        
        if not sig_header:
            return jsonify({'error': 'Missing Stripe signature'}), 400
        
        result = stripe_service.handle_webhook(payload, sig_header)
        
        if result['success']:
            return jsonify({'status': 'success'})
        else:
            return jsonify({'error': result['error']}), 400
            
    except Exception as e:
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

