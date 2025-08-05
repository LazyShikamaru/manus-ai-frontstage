import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from celery import current_task
from src.celery_app import celery_app
from src.models.user import db, User
from src.models.subscription import Subscription
from src.models.newsletter import Newsletter
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class EmailService:
    """Enhanced email service supporting both SendGrid and Mailgun"""
    
    def __init__(self):
        self.provider = os.getenv('EMAIL_PROVIDER', 'sendgrid').lower()
        self.from_email = os.getenv('FROM_EMAIL', 'noreply@manusai.com')
        
        if self.provider == 'sendgrid':
            self.api_key = os.getenv('SENDGRID_API_KEY')
            self.base_url = 'https://api.sendgrid.com/v3/mail/send'
        elif self.provider == 'mailgun':
            self.api_key = os.getenv('MAILGUN_API_KEY')
            self.domain = os.getenv('MAILGUN_DOMAIN')
            self.base_url = f'https://api.mailgun.net/v3/{self.domain}/messages'
    
    def send_email_sendgrid(self, to_email, subject, html_content, text_content=None):
        """Send email using SendGrid API"""
        try:
            from sendgrid import SendGridAPIClient
            from sendgrid.helpers.mail import Mail
            
            if not self.api_key:
                logger.warning("SendGrid API key not configured")
                return {'success': False, 'error': 'SendGrid API key not configured'}
            
            message = Mail(
                from_email=self.from_email,
                to_emails=to_email,
                subject=subject,
                html_content=html_content
            )
            
            if text_content:
                message.plain_text_content = text_content
            
            sg = SendGridAPIClient(api_key=self.api_key)
            response = sg.send(message)
            
            if response.status_code in [200, 202]:
                return {'success': True, 'message': 'Email sent successfully'}
            else:
                return {'success': False, 'error': f'SendGrid API error: {response.status_code}'}
                
        except Exception as e:
            logger.error(f"SendGrid error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def send_email_mailgun(self, to_email, subject, html_content, text_content=None):
        """Send email using Mailgun API"""
        try:
            import requests
            
            if not self.api_key or not self.domain:
                logger.warning("Mailgun API key or domain not configured")
                return {'success': False, 'error': 'Mailgun API key or domain not configured'}
            
            data = {
                'from': self.from_email,
                'to': to_email,
                'subject': subject,
                'html': html_content
            }
            
            if text_content:
                data['text'] = text_content
            
            response = requests.post(
                self.base_url,
                auth=('api', self.api_key),
                data=data
            )
            
            if response.status_code == 200:
                return {'success': True, 'message': 'Email sent successfully'}
            else:
                return {'success': False, 'error': f'Mailgun API error: {response.status_code}'}
                
        except Exception as e:
            logger.error(f"Mailgun error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def send_email(self, to_email, subject, html_content, text_content=None):
        """Send email using configured provider"""
        if self.provider == 'sendgrid':
            return self.send_email_sendgrid(to_email, subject, html_content, text_content)
        elif self.provider == 'mailgun':
            return self.send_email_mailgun(to_email, subject, html_content, text_content)
        else:
            logger.error(f"Unknown email provider: {self.provider}")
            return {'success': False, 'error': f'Unknown email provider: {self.provider}'}

email_service = EmailService()

@celery_app.task(bind=True, name='src.tasks.email_tasks.send_welcome_email')
def send_welcome_email(self, user_id):
    """
    Send welcome email to new user
    """
    try:
        # Update task state
        self.update_state(state='PROGRESS', meta={'status': 'Preparing welcome email...'})
        
        # Import Flask app context
        from src.main import app
        with app.app_context():
            user = User.query.get(user_id)
            if not user:
                raise ValueError(f"User with ID {user_id} not found")
            
            # Update task state
            self.update_state(state='PROGRESS', meta={'status': 'Sending email...'})
            
            subject = "Welcome to Manus AI Newsletter Platform!"
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to Manus AI</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #FF5A5F, #7843E6); padding: 40px 20px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Welcome to Manus AI!</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your AI-powered newsletter platform</p>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 40px 30px; background-color: white;">
                        <h2 style="color: #1A1A1A; margin: 0 0 20px 0; font-size: 24px;">Hello {user.username}!</h2>
                        
                        <p style="color: #4D4D4D; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                            Welcome to the Manus AI Newsletter Platform! We're excited to have you join our community of creators and entrepreneurs.
                        </p>
                        
                        <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0;">
                            <h3 style="color: #1A1A1A; margin: 0 0 15px 0; font-size: 18px;">What you can do with Manus AI:</h3>
                            <ul style="color: #4D4D4D; line-height: 1.8; margin: 0; padding-left: 20px;">
                                <li>🤖 Generate AI-powered newsletter content</li>
                                <li>📰 Access premium newsletters from top creators</li>
                                <li>👥 Build and grow your audience</li>
                                <li>💰 Monetize your content with subscriptions</li>
                                <li>📊 Track performance with advanced analytics</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; margin: 35px 0;">
                            <a href="https://manusai.com/dashboard" 
                               style="background-color: #FF5A5F; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                                Get Started Now
                            </a>
                        </div>
                        
                        <div style="border-top: 1px solid #eee; padding-top: 25px; margin-top: 35px;">
                            <p style="color: #4D4D4D; line-height: 1.6; margin: 0 0 15px 0; font-size: 14px;">
                                Need help getting started? Check out our <a href="https://manusai.com/docs" style="color: #7843E6;">documentation</a> 
                                or reach out to our support team.
                            </p>
                            
                            <p style="color: #4D4D4D; margin: 0; font-size: 16px;">
                                Best regards,<br>
                                <strong>The Manus AI Team</strong>
                            </p>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
                        <p style="color: #6c757d; margin: 0; font-size: 12px;">
                            © 2024 Manus AI. All rights reserved.<br>
                            <a href="https://manusai.com/unsubscribe" style="color: #6c757d;">Unsubscribe</a> | 
                            <a href="https://manusai.com/privacy" style="color: #6c757d;">Privacy Policy</a>
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            text_content = f"""
            Welcome to Manus AI Newsletter Platform!
            
            Hello {user.username}!
            
            Welcome to the Manus AI Newsletter Platform! We're excited to have you join our community of creators and entrepreneurs.
            
            What you can do with Manus AI:
            • Generate AI-powered newsletter content
            • Access premium newsletters from top creators
            • Build and grow your audience
            • Monetize your content with subscriptions
            • Track performance with advanced analytics
            
            Get started at: https://manusai.com/dashboard
            
            Need help? Check out our documentation at https://manusai.com/docs or reach out to our support team.
            
            Best regards,
            The Manus AI Team
            
            © 2024 Manus AI. All rights reserved.
            Unsubscribe: https://manusai.com/unsubscribe
            """
            
            result = email_service.send_email(user.email, subject, html_content, text_content)
            
            if result['success']:
                return {
                    'status': 'SUCCESS',
                    'message': f'Welcome email sent to {user.email}',
                    'user_id': user_id
                }
            else:
                raise Exception(result['error'])
        
    except Exception as exc:
        logger.error(f"Error sending welcome email: {str(exc)}")
        self.update_state(
            state='FAILURE',
            meta={'error': str(exc), 'status': 'Failed to send welcome email'}
        )
        raise exc

@celery_app.task(bind=True, name='src.tasks.email_tasks.send_subscription_confirmation')
def send_subscription_confirmation(self, user_id, subscription_tier):
    """
    Send subscription confirmation email
    """
    try:
        # Update task state
        self.update_state(state='PROGRESS', meta={'status': 'Preparing subscription confirmation...'})
        
        # Import Flask app context
        from src.main import app
        with app.app_context():
            user = User.query.get(user_id)
            if not user:
                raise ValueError(f"User with ID {user_id} not found")
            
            subject = f"Subscription Confirmed - {subscription_tier.title()} Plan"
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Subscription Confirmed</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #3ECF8E, #7843E6); padding: 40px 20px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Subscription Confirmed!</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Welcome to {subscription_tier.title()}</p>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 40px 30px; background-color: white;">
                        <h2 style="color: #1A1A1A; margin: 0 0 20px 0; font-size: 24px;">Thank you, {user.username}!</h2>
                        
                        <p style="color: #4D4D4D; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
                            Your {subscription_tier.title()} subscription has been confirmed and is now active. You now have access to all premium features!
                        </p>
                        
                        <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0;">
                            <h3 style="color: #1A1A1A; margin: 0 0 15px 0; font-size: 18px;">🎉 Your Premium Benefits:</h3>
                            <ul style="color: #4D4D4D; line-height: 1.8; margin: 0; padding-left: 20px;">
                                <li>🔓 Access to all premium newsletters</li>
                                <li>🤖 Unlimited AI-powered content generation</li>
                                <li>⚡ Priority customer support</li>
                                <li>📊 Advanced analytics and insights</li>
                                <li>🎨 Custom newsletter templates</li>
                                <li>📈 Audience growth tools</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; margin: 35px 0;">
                            <a href="https://manusai.com/premium" 
                               style="background-color: #3ECF8E; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px; margin-right: 10px;">
                                Explore Premium Content
                            </a>
                            <a href="https://manusai.com/dashboard" 
                               style="background-color: #7843E6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                                Go to Dashboard
                            </a>
                        </div>
                        
                        <div style="border-top: 1px solid #eee; padding-top: 25px; margin-top: 35px;">
                            <p style="color: #4D4D4D; line-height: 1.6; margin: 0 0 15px 0; font-size: 14px;">
                                Questions about your subscription? Visit our <a href="https://manusai.com/billing" style="color: #7843E6;">billing page</a> 
                                or contact our support team.
                            </p>
                            
                            <p style="color: #4D4D4D; margin: 0; font-size: 16px;">
                                Best regards,<br>
                                <strong>The Manus AI Team</strong>
                            </p>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
                        <p style="color: #6c757d; margin: 0; font-size: 12px;">
                            © 2024 Manus AI. All rights reserved.<br>
                            <a href="https://manusai.com/billing" style="color: #6c757d;">Manage Subscription</a> | 
                            <a href="https://manusai.com/privacy" style="color: #6c757d;">Privacy Policy</a>
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            result = email_service.send_email(user.email, subject, html_content)
            
            if result['success']:
                return {
                    'status': 'SUCCESS',
                    'message': f'Subscription confirmation sent to {user.email}',
                    'user_id': user_id,
                    'subscription_tier': subscription_tier
                }
            else:
                raise Exception(result['error'])
        
    except Exception as exc:
        logger.error(f"Error sending subscription confirmation: {str(exc)}")
        self.update_state(
            state='FAILURE',
            meta={'error': str(exc), 'status': 'Failed to send subscription confirmation'}
        )
        raise exc

@celery_app.task(bind=True, name='src.tasks.email_tasks.send_payment_failed_notification')
def send_payment_failed_notification(self, user_id):
    """
    Send payment failed notification email
    """
    try:
        # Import Flask app context
        from src.main import app
        with app.app_context():
            user = User.query.get(user_id)
            if not user:
                raise ValueError(f"User with ID {user_id} not found")
            
            subject = "Payment Failed - Action Required"
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Payment Failed</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white;">
                    <!-- Header -->
                    <div style="background-color: #FF5A5F; padding: 40px 20px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Payment Failed</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Action required to continue your subscription</p>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 40px 30px; background-color: white;">
                        <h2 style="color: #1A1A1A; margin: 0 0 20px 0; font-size: 24px;">Hello {user.username},</h2>
                        
                        <p style="color: #4D4D4D; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
                            We were unable to process your subscription payment. Your premium access will be suspended until payment is updated.
                        </p>
                        
                        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 6px; margin: 25px 0;">
                            <h3 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">⚠️ What happens next:</h3>
                            <ul style="color: #856404; margin: 0; padding-left: 20px; line-height: 1.6;">
                                <li>Your premium features will be suspended in 3 days</li>
                                <li>You'll still have access to free features</li>
                                <li>Update your payment method to restore full access</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; margin: 35px 0;">
                            <a href="https://manusai.com/billing" 
                               style="background-color: #FF5A5F; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                                Update Payment Method
                            </a>
                        </div>
                        
                        <div style="border-top: 1px solid #eee; padding-top: 25px; margin-top: 35px;">
                            <p style="color: #4D4D4D; line-height: 1.6; margin: 0 0 15px 0; font-size: 14px;">
                                Need help? Contact our support team at <a href="mailto:support@manusai.com" style="color: #7843E6;">support@manusai.com</a>
                            </p>
                            
                            <p style="color: #4D4D4D; margin: 0; font-size: 16px;">
                                Best regards,<br>
                                <strong>The Manus AI Team</strong>
                            </p>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
                        <p style="color: #6c757d; margin: 0; font-size: 12px;">
                            © 2024 Manus AI. All rights reserved.<br>
                            <a href="https://manusai.com/billing" style="color: #6c757d;">Manage Subscription</a> | 
                            <a href="https://manusai.com/privacy" style="color: #6c757d;">Privacy Policy</a>
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            result = email_service.send_email(user.email, subject, html_content)
            
            if result['success']:
                return {
                    'status': 'SUCCESS',
                    'message': f'Payment failed notification sent to {user.email}',
                    'user_id': user_id
                }
            else:
                raise Exception(result['error'])
        
    except Exception as exc:
        logger.error(f"Error sending payment failed notification: {str(exc)}")
        raise exc

@celery_app.task(bind=True, name='src.tasks.email_tasks.test_email_service')
def test_email_service(self, to_email):
    """
    Test email service functionality
    """
    try:
        subject = "Manus AI Email Service Test"
        html_content = """
        <h1>Email Service Test</h1>
        <p>This is a test email to verify that the email service is working correctly.</p>
        <p>If you received this email, the service is functioning properly!</p>
        """
        text_content = "Email Service Test\n\nThis is a test email to verify that the email service is working correctly.\n\nIf you received this email, the service is functioning properly!"
        
        result = email_service.send_email(to_email, subject, html_content, text_content)
        
        if result['success']:
            return {
                'status': 'SUCCESS',
                'message': f'Test email sent to {to_email}',
                'provider': email_service.provider
            }
        else:
            raise Exception(result['error'])
        
    except Exception as exc:
        logger.error(f"Error sending test email: {str(exc)}")
        self.update_state(
            state='FAILURE',
            meta={'error': str(exc), 'status': 'Failed to send test email'}
        )
        raise exc

