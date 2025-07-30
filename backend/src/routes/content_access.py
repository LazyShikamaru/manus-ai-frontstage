from flask import Blueprint, request, jsonify
from src.services.content_manager import ContentVisibilityManager

content_access_bp = Blueprint('content_access', __name__)
content_manager = ContentVisibilityManager()

@content_access_bp.route('/check-access/<int:newsletter_id>', methods=['GET'])
def check_newsletter_access(newsletter_id):
    """Check if user can access a specific newsletter"""
    try:
        user_id = request.args.get('user_id', type=int)
        
        access_result = content_manager.can_access_newsletter(newsletter_id, user_id)
        
        return jsonify(access_result)
        
    except Exception as e:
        return jsonify({
            'can_access': False,
            'reason': f'Error: {str(e)}',
            'content_type': 'none'
        }), 500

@content_access_bp.route('/user-stats/<int:user_id>', methods=['GET'])
def get_user_content_stats(user_id):
    """Get user's content access statistics"""
    try:
        stats = content_manager.get_user_content_stats(user_id)
        
        if 'error' in stats:
            return jsonify(stats), 404
        
        return jsonify({
            'success': True,
            'stats': stats
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@content_access_bp.route('/set-visibility/<int:newsletter_id>', methods=['PUT'])
def set_newsletter_visibility(newsletter_id):
    """Set newsletter visibility (creator only)"""
    try:
        data = request.get_json()
        
        if not data or 'visibility' not in data or 'user_id' not in data:
            return jsonify({
                'success': False,
                'error': 'visibility and user_id are required'
            }), 400
        
        visibility = data['visibility']
        user_id = data['user_id']
        
        result = content_manager.set_newsletter_visibility(newsletter_id, visibility, user_id)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@content_access_bp.route('/access-summary', methods=['GET'])
def get_access_summary():
    """Get summary of content access rules"""
    try:
        return jsonify({
            'success': True,
            'access_rules': {
                'public': {
                    'description': 'Visible to all users, no login required',
                    'access_level': 'full_content'
                },
                'private': {
                    'description': 'Requires user login/authentication',
                    'access_level': 'full_content_with_auth'
                },
                'premium': {
                    'description': 'Requires active premium subscription',
                    'access_level': 'full_content_with_premium',
                    'fallback': 'summary_only_for_free_users'
                }
            },
            'subscription_tiers': {
                'free': {
                    'access': ['public', 'private'],
                    'premium_content': 'summary_only'
                },
                'premium': {
                    'access': ['public', 'private', 'premium'],
                    'premium_content': 'full_access'
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

