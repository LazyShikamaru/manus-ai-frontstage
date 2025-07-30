from typing import Dict, Optional
from src.models.newsletter import Newsletter
from src.models.subscription import Subscription
from src.models.user import User

class ContentVisibilityManager:
    """Manages content access based on user subscription and newsletter visibility"""
    
    def __init__(self):
        pass
    
    def can_access_newsletter(self, newsletter_id: int, user_id: Optional[int] = None) -> Dict:
        """Check if user can access a newsletter based on visibility rules"""
        try:
            newsletter = Newsletter.query.get(newsletter_id)
            if not newsletter:
                return {
                    'can_access': False,
                    'reason': 'Newsletter not found',
                    'content_type': 'none'
                }
            
            # Public content - everyone can access
            if newsletter.visibility == 'public':
                return {
                    'can_access': True,
                    'reason': 'Public content',
                    'content_type': 'full',
                    'newsletter': newsletter.to_dict()
                }
            
            # Private content - requires login
            if newsletter.visibility == 'private':
                if not user_id:
                    return {
                        'can_access': False,
                        'reason': 'Login required for private content',
                        'content_type': 'none',
                        'upgrade_required': False
                    }
                
                # Check if user exists
                user = User.query.get(user_id)
                if not user:
                    return {
                        'can_access': False,
                        'reason': 'Invalid user',
                        'content_type': 'none'
                    }
                
                return {
                    'can_access': True,
                    'reason': 'Authenticated user access',
                    'content_type': 'full',
                    'newsletter': newsletter.to_dict()
                }
            
            # Premium content - requires active premium subscription
            if newsletter.visibility == 'premium':
                if not user_id:
                    return {
                        'can_access': False,
                        'reason': 'Login required for premium content',
                        'content_type': 'summary',
                        'upgrade_required': True,
                        'newsletter': self._get_summary_version(newsletter)
                    }
                
                # Check user subscription
                subscription = Subscription.query.filter_by(user_id=user_id).first()
                
                if not subscription or subscription.tier != 'premium' or subscription.status != 'active':
                    return {
                        'can_access': False,
                        'reason': 'Premium subscription required',
                        'content_type': 'summary',
                        'upgrade_required': True,
                        'newsletter': self._get_summary_version(newsletter)
                    }
                
                return {
                    'can_access': True,
                    'reason': 'Premium subscriber access',
                    'content_type': 'full',
                    'newsletter': newsletter.to_dict()
                }
            
            # Unknown visibility type
            return {
                'can_access': False,
                'reason': 'Unknown content visibility type',
                'content_type': 'none'
            }
            
        except Exception as e:
            return {
                'can_access': False,
                'reason': f'Error checking access: {str(e)}',
                'content_type': 'none'
            }
    
    def _get_summary_version(self, newsletter: Newsletter) -> Dict:
        """Get summary version of newsletter for non-premium users"""
        newsletter_dict = newsletter.to_dict()
        
        # Replace content with summary or teaser
        if newsletter.summary:
            newsletter_dict['content'] = newsletter.summary + "\n\n**Upgrade to Premium to read the full newsletter!**"
        else:
            # Generate a teaser from the first 200 characters
            content_preview = newsletter.content[:200] + "..." if len(newsletter.content) > 200 else newsletter.content
            newsletter_dict['content'] = content_preview + "\n\n**Upgrade to Premium to read the full newsletter!**"
        
        newsletter_dict['is_preview'] = True
        return newsletter_dict
    
    def filter_newsletters_by_access(self, newsletters: list, user_id: Optional[int] = None) -> list:
        """Filter a list of newsletters based on user access rights"""
        accessible_newsletters = []
        
        for newsletter in newsletters:
            access_result = self.can_access_newsletter(newsletter.id, user_id)
            
            if access_result['can_access'] or access_result['content_type'] == 'summary':
                if 'newsletter' in access_result:
                    accessible_newsletters.append(access_result['newsletter'])
                else:
                    accessible_newsletters.append(newsletter.to_dict())
        
        return accessible_newsletters
    
    def get_user_content_stats(self, user_id: int) -> Dict:
        """Get statistics about user's content access"""
        try:
            user = User.query.get(user_id)
            if not user:
                return {'error': 'User not found'}
            
            subscription = Subscription.query.filter_by(user_id=user_id).first()
            
            # Count newsletters by visibility
            public_count = Newsletter.query.filter_by(visibility='public').count()
            private_count = Newsletter.query.filter_by(visibility='private').count()
            premium_count = Newsletter.query.filter_by(visibility='premium').count()
            
            # Count user's own newsletters
            user_newsletters = Newsletter.query.filter_by(creator_id=user_id).count()
            
            has_premium = (subscription and 
                          subscription.tier == 'premium' and 
                          subscription.status == 'active')
            
            accessible_count = public_count + private_count
            if has_premium:
                accessible_count += premium_count
            
            return {
                'user_id': user_id,
                'subscription_tier': subscription.tier if subscription else 'free',
                'subscription_status': subscription.status if subscription else 'none',
                'has_premium_access': has_premium,
                'total_newsletters': public_count + private_count + premium_count,
                'accessible_newsletters': accessible_count,
                'public_newsletters': public_count,
                'private_newsletters': private_count,
                'premium_newsletters': premium_count,
                'user_created_newsletters': user_newsletters
            }
            
        except Exception as e:
            return {'error': str(e)}
    
    def set_newsletter_visibility(self, newsletter_id: int, visibility: str, user_id: int) -> Dict:
        """Set newsletter visibility (only creator can change)"""
        try:
            newsletter = Newsletter.query.get(newsletter_id)
            if not newsletter:
                return {'success': False, 'error': 'Newsletter not found'}
            
            # Check if user is the creator
            if newsletter.creator_id != user_id:
                return {'success': False, 'error': 'Only the creator can change visibility'}
            
            # Validate visibility value
            valid_visibilities = ['public', 'private', 'premium']
            if visibility not in valid_visibilities:
                return {'success': False, 'error': f'Invalid visibility. Must be one of: {valid_visibilities}'}
            
            newsletter.visibility = visibility
            from src.models.user import db
            db.session.commit()
            
            return {
                'success': True,
                'message': f'Newsletter visibility updated to {visibility}',
                'newsletter': newsletter.to_dict()
            }
            
        except Exception as e:
            from src.models.user import db
            db.session.rollback()
            return {'success': False, 'error': str(e)}

