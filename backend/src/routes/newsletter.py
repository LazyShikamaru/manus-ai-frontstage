from flask import Blueprint, request, jsonify
from src.models.user import db, User
from src.models.newsletter import Newsletter
from src.models.subscription import Subscription
from src.services.content_manager import ContentVisibilityManager

newsletter_bp = Blueprint('newsletter', __name__)
content_manager = ContentVisibilityManager()

@newsletter_bp.route('/newsletters', methods=['GET'])
def get_newsletters():
    """Get newsletters with proper access control"""
    try:
        user_id = request.args.get('user_id', type=int)
        visibility_filter = request.args.get('visibility', 'all')
        
        # Build query based on visibility filter
        if visibility_filter == 'public':
            newsletters = Newsletter.query.filter_by(visibility='public').all()
        elif visibility_filter == 'private':
            newsletters = Newsletter.query.filter_by(visibility='private').all()
        elif visibility_filter == 'premium':
            newsletters = Newsletter.query.filter_by(visibility='premium').all()
        else:  # all
            newsletters = Newsletter.query.all()
        
        # Filter newsletters based on user access
        accessible_newsletters = content_manager.filter_newsletters_by_access(newsletters, user_id)
        
        return jsonify({
            'newsletters': accessible_newsletters,
            'total': len(accessible_newsletters),
            'user_id': user_id
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@newsletter_bp.route('/newsletters/<int:newsletter_id>', methods=['GET'])
def get_newsletter(newsletter_id):
    """Get a specific newsletter with access control"""
    try:
        user_id = request.args.get('user_id', type=int)
        
        access_result = content_manager.can_access_newsletter(newsletter_id, user_id)
        
        if access_result['can_access']:
            return jsonify({
                'success': True,
                'newsletter': access_result['newsletter'],
                'access_type': access_result['content_type']
            })
        elif access_result['content_type'] == 'summary':
            return jsonify({
                'success': False,
                'newsletter': access_result['newsletter'],
                'access_type': 'summary',
                'reason': access_result['reason'],
                'upgrade_required': access_result.get('upgrade_required', False)
            })
        else:
            return jsonify({
                'success': False,
                'reason': access_result['reason'],
                'upgrade_required': access_result.get('upgrade_required', False)
            }), 403
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@newsletter_bp.route('/newsletters', methods=['POST'])
def create_newsletter():
    """Create a new newsletter"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('title') or not data.get('content'):
            return jsonify({'error': 'Title and content are required'}), 400
        
        # For now, use a default creator_id (in real app, get from auth)
        creator_id = data.get('creator_id', 1)
        
        newsletter = Newsletter(
            title=data['title'],
            content=data['content'],
            summary=data.get('summary'),
            visibility=data.get('visibility', 'public'),
            creator_id=creator_id
        )
        
        db.session.add(newsletter)
        db.session.commit()
        
        return jsonify(newsletter.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@newsletter_bp.route('/newsletters/<int:newsletter_id>', methods=['PUT'])
def update_newsletter(newsletter_id):
    """Update an existing newsletter"""
    try:
        newsletter = Newsletter.query.get_or_404(newsletter_id)
        data = request.get_json()
        
        # Update fields if provided
        if 'title' in data:
            newsletter.title = data['title']
        if 'content' in data:
            newsletter.content = data['content']
        if 'summary' in data:
            newsletter.summary = data['summary']
        if 'visibility' in data:
            newsletter.visibility = data['visibility']
        
        db.session.commit()
        return jsonify(newsletter.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@newsletter_bp.route('/newsletters/<int:newsletter_id>', methods=['DELETE'])
def delete_newsletter(newsletter_id):
    """Delete a newsletter"""
    try:
        newsletter = Newsletter.query.get_or_404(newsletter_id)
        db.session.delete(newsletter)
        db.session.commit()
        return jsonify({'message': 'Newsletter deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

