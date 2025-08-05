import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from celery import current_task
from src.celery_app import celery_app
from src.models.user import db, User
from src.models.subscription import Subscription
from src.tasks.email_tasks import send_welcome_email, send_subscription_confirmation, send_payment_failed_notification
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

@celery_app.task(bind=True, name='src.tasks.subscription_tasks.process_new_subscription')
def process_new_subscription(self, user_id, subscription_tier='premium'):
    """
    Process new subscription and send welcome emails
    """
    try:
        # Update task state
        self.update_state(state='PROGRESS', meta={'status': 'Processing new subscription...'})
        
        # Send welcome email if this is a new user
        send_welcome_email.delay(user_id)
        
        # Send subscription confirmation
        send_subscription_confirmation.delay(user_id, subscription_tier)
        
        return {
            'status': 'SUCCESS',
            'message': f'New subscription processed for user {user_id}',
            'user_id': user_id,
            'subscription_tier': subscription_tier
        }
        
    except Exception as exc:
        logger.error(f"Error processing new subscription: {str(exc)}")
        self.update_state(
            state='FAILURE',
            meta={'error': str(exc), 'status': 'Failed to process new subscription'}
        )
        raise exc

@celery_app.task(bind=True, name='src.tasks.subscription_tasks.cleanup_expired_subscriptions')
def cleanup_expired_subscriptions(self):
    """
    Clean up expired subscriptions and downgrade users to free tier
    """
    try:
        # Update task state
        self.update_state(state='PROGRESS', meta={'status': 'Checking for expired subscriptions...'})
        
        # Import Flask app context
        from src.main import app
        with app.app_context():
            # Find expired subscriptions
            now = datetime.utcnow()
            expired_subscriptions = Subscription.query.filter(
                Subscription.expires_at < now,
                Subscription.status == 'active'
            ).all()
            
            if not expired_subscriptions:
                return {
                    'status': 'SUCCESS',
                    'message': 'No expired subscriptions found',
                    'expired_count': 0
                }
            
            # Update task state
            self.update_state(state='PROGRESS', meta={'status': f'Processing {len(expired_subscriptions)} expired subscriptions...'})
            
            updated_count = 0
            for subscription in expired_subscriptions:
                try:
                    subscription.status = 'expired'
                    subscription.tier = 'free'
                    db.session.add(subscription)
                    updated_count += 1
                    
                    # Send notification email about expiration
                    send_payment_failed_notification.delay(subscription.user_id)
                    
                except Exception as e:
                    logger.error(f"Error updating subscription {subscription.id}: {str(e)}")
            
            db.session.commit()
            
            return {
                'status': 'SUCCESS',
                'message': f'Cleaned up {updated_count} expired subscriptions',
                'expired_count': len(expired_subscriptions),
                'updated_count': updated_count
            }
        
    except Exception as exc:
        logger.error(f"Error cleaning up expired subscriptions: {str(exc)}")
        self.update_state(
            state='FAILURE',
            meta={'error': str(exc), 'status': 'Failed to cleanup expired subscriptions'}
        )
        raise exc

@celery_app.task(bind=True, name='src.tasks.subscription_tasks.process_subscription_renewal')
def process_subscription_renewal(self, user_id, stripe_subscription_id):
    """
    Process subscription renewal
    """
    try:
        # Import Flask app context
        from src.main import app
        with app.app_context():
            subscription = Subscription.query.filter_by(
                user_id=user_id,
                stripe_subscription_id=stripe_subscription_id
            ).first()
            
            if not subscription:
                raise ValueError(f"Subscription not found for user {user_id}")
            
            # Update subscription status and extend expiration
            subscription.status = 'active'
            subscription.expires_at = datetime.utcnow() + timedelta(days=30)  # Extend by 30 days
            db.session.commit()
            
            # Send renewal confirmation
            send_subscription_confirmation.delay(user_id, subscription.tier)
            
            return {
                'status': 'SUCCESS',
                'message': f'Subscription renewed for user {user_id}',
                'user_id': user_id,
                'subscription_id': subscription.id
            }
        
    except Exception as exc:
        logger.error(f"Error processing subscription renewal: {str(exc)}")
        raise exc

@celery_app.task(bind=True, name='src.tasks.subscription_tasks.process_subscription_cancellation')
def process_subscription_cancellation(self, user_id, stripe_subscription_id):
    """
    Process subscription cancellation
    """
    try:
        # Import Flask app context
        from src.main import app
        with app.app_context():
            subscription = Subscription.query.filter_by(
                user_id=user_id,
                stripe_subscription_id=stripe_subscription_id
            ).first()
            
            if not subscription:
                raise ValueError(f"Subscription not found for user {user_id}")
            
            # Update subscription status
            subscription.status = 'cancelled'
            subscription.tier = 'free'
            db.session.commit()
            
            # Send cancellation confirmation email
            user = User.query.get(user_id)
            if user:
                from src.tasks.email_tasks import email_service
                subject = "Subscription Cancelled"
                html_content = f"""
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #4D4D4D; padding: 40px; text-align: center;">
                        <h1 style="color: white; margin: 0;">Subscription Cancelled</h1>
                    </div>
                    <div style="padding: 30px; background-color: #FAF9F8;">
                        <h2 style="color: #1A1A1A;">Hello {user.username},</h2>
                        <p style="color: #4D4D4D; line-height: 1.6;">
                            Your premium subscription has been cancelled. You'll continue to have access to premium features until the end of your current billing period.
                        </p>
                        <p style="color: #4D4D4D; line-height: 1.6;">
                            We're sorry to see you go! If you change your mind, you can resubscribe at any time.
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://manusai.com/subscribe" 
                               style="background-color: #7843E6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                Resubscribe
                            </a>
                        </div>
                        <p style="color: #4D4D4D;">
                            Best regards,<br>
                            The Manus AI Team
                        </p>
                    </div>
                </body>
                </html>
                """
                
                email_service.send_email(user.email, subject, html_content)
            
            return {
                'status': 'SUCCESS',
                'message': f'Subscription cancelled for user {user_id}',
                'user_id': user_id,
                'subscription_id': subscription.id
            }
        
    except Exception as exc:
        logger.error(f"Error processing subscription cancellation: {str(exc)}")
        raise exc

