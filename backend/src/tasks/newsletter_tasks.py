import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from celery import current_task
from src.celery_app import celery_app
from src.models.user import db, User
from src.models.subscription import Subscription
from src.models.newsletter import Newsletter
from src.tasks.email_tasks import email_service
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

@celery_app.task(bind=True, name='src.tasks.newsletter_tasks.send_newsletter_digest')
def send_newsletter_digest(self):
    """
    Send daily newsletter digest to premium subscribers
    """
    try:
        # Update task state
        self.update_state(state='PROGRESS', meta={'status': 'Preparing newsletter digest...'})
        
        # Import Flask app context
        from src.main import app
        with app.app_context():
            # Get recent newsletters (last 24 hours)
            yesterday = datetime.utcnow() - timedelta(days=1)
            recent_newsletters = Newsletter.query.filter(
                Newsletter.created_at >= yesterday,
                Newsletter.visibility.in_(['public', 'premium'])
            ).order_by(Newsletter.created_at.desc()).limit(5).all()
            
            if not recent_newsletters:
                return {
                    'status': 'SUCCESS',
                    'message': 'No recent newsletters to include in digest',
                    'newsletters_count': 0
                }
            
            # Get premium subscribers
            premium_subscribers = db.session.query(User).join(Subscription).filter(
                Subscription.tier == 'premium',
                Subscription.status == 'active'
            ).all()
            
            if not premium_subscribers:
                return {
                    'status': 'SUCCESS',
                    'message': 'No premium subscribers found',
                    'subscribers_count': 0
                }
            
            # Update task state
            self.update_state(state='PROGRESS', meta={'status': f'Sending digest to {len(premium_subscribers)} subscribers...'})
            
            # Prepare digest content
            newsletter_items = ""
            for newsletter in recent_newsletters:
                newsletter_items += f"""
                <div style="border-bottom: 1px solid #eee; padding: 20px 0;">
                    <h3 style="color: #1A1A1A; margin: 0 0 10px 0;">{newsletter.title}</h3>
                    <p style="color: #4D4D4D; line-height: 1.6; margin: 0 0 10px 0;">
                        {newsletter.summary or newsletter.content[:200] + '...'}
                    </p>
                    <a href="https://manusai.com/newsletters/{newsletter.id}" 
                       style="color: #7843E6; text-decoration: none;">Read More →</a>
                </div>
                """
            
            sent_count = 0
            failed_count = 0
            
            for user in premium_subscribers:
                subject = f"Daily Newsletter Digest - {len(recent_newsletters)} New Articles"
                html_content = f"""
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #FF5A5F, #7843E6); padding: 40px; text-align: center;">
                        <h1 style="color: white; margin: 0;">Daily Newsletter Digest</h1>
                        <p style="color: white; margin: 10px 0 0 0;">Your curated content for today</p>
                    </div>
                    <div style="padding: 30px; background-color: #FAF9F8;">
                        <h2 style="color: #1A1A1A;">Hello {user.username}!</h2>
                        <p style="color: #4D4D4D; line-height: 1.6;">
                            Here are the latest newsletters from our platform:
                        </p>
                        {newsletter_items}
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://manusai.com/newsletters" 
                               style="background-color: #FF5A5F; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                View All Newsletters
                            </a>
                        </div>
                        <p style="color: #4D4D4D; font-size: 12px;">
                            You're receiving this because you have a premium subscription. 
                            <a href="https://manusai.com/unsubscribe" style="color: #7843E6;">Unsubscribe</a>
                        </p>
                    </div>
                </body>
                </html>
                """
                
                result = email_service.send_email(user.email, subject, html_content)
                
                if result['success']:
                    sent_count += 1
                else:
                    failed_count += 1
                    logger.error(f"Failed to send digest to {user.email}: {result['error']}")
            
            return {
                'status': 'SUCCESS',
                'message': f'Newsletter digest sent successfully',
                'newsletters_count': len(recent_newsletters),
                'subscribers_count': len(premium_subscribers),
                'sent_count': sent_count,
                'failed_count': failed_count
            }
        
    except Exception as exc:
        logger.error(f"Error sending newsletter digest: {str(exc)}")
        self.update_state(
            state='FAILURE',
            meta={'error': str(exc), 'status': 'Failed to send newsletter digest'}
        )
        raise exc

@celery_app.task(bind=True, name='src.tasks.newsletter_tasks.send_new_newsletter_notification')
def send_new_newsletter_notification(self, newsletter_id):
    """
    Send notification about new newsletter to subscribers
    """
    try:
        # Import Flask app context
        from src.main import app
        with app.app_context():
            newsletter = Newsletter.query.get(newsletter_id)
            if not newsletter:
                raise ValueError(f"Newsletter with ID {newsletter_id} not found")
            
            # Only send notifications for public and premium newsletters
            if newsletter.visibility == 'private':
                return {
                    'status': 'SUCCESS',
                    'message': 'Private newsletter, no notifications sent',
                    'newsletter_id': newsletter_id
                }
            
            # Get subscribers based on newsletter visibility
            if newsletter.visibility == 'premium':
                subscribers = db.session.query(User).join(Subscription).filter(
                    Subscription.tier == 'premium',
                    Subscription.status == 'active'
                ).all()
            else:  # public
                # For public newsletters, send to all users
                subscribers = User.query.all()
            
            if not subscribers:
                return {
                    'status': 'SUCCESS',
                    'message': 'No subscribers found',
                    'newsletter_id': newsletter_id
                }
            
            sent_count = 0
            failed_count = 0
            
            for user in subscribers:
                subject = f"New Newsletter: {newsletter.title}"
                html_content = f"""
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #FF5A5F, #7843E6); padding: 40px; text-align: center;">
                        <h1 style="color: white; margin: 0;">New Newsletter Published!</h1>
                    </div>
                    <div style="padding: 30px; background-color: #FAF9F8;">
                        <h2 style="color: #1A1A1A;">{newsletter.title}</h2>
                        <p style="color: #4D4D4D; line-height: 1.6;">
                            {newsletter.summary or newsletter.content[:300] + '...'}
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://manusai.com/newsletters/{newsletter.id}" 
                               style="background-color: #FF5A5F; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                Read Newsletter
                            </a>
                        </div>
                        <p style="color: #4D4D4D; font-size: 12px;">
                            <a href="https://manusai.com/unsubscribe" style="color: #7843E6;">Unsubscribe</a>
                        </p>
                    </div>
                </body>
                </html>
                """
                
                result = email_service.send_email(user.email, subject, html_content)
                
                if result['success']:
                    sent_count += 1
                else:
                    failed_count += 1
                    logger.error(f"Failed to send notification to {user.email}: {result['error']}")
            
            return {
                'status': 'SUCCESS',
                'message': f'Newsletter notification sent successfully',
                'newsletter_id': newsletter_id,
                'subscribers_count': len(subscribers),
                'sent_count': sent_count,
                'failed_count': failed_count
            }
        
    except Exception as exc:
        logger.error(f"Error sending newsletter notification: {str(exc)}")
        raise exc

