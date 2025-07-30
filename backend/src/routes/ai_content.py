from flask import Blueprint, request, jsonify
from src.services.ai_writer import AIWriter
from src.models.user import db
from src.models.newsletter import Newsletter

ai_content_bp = Blueprint('ai_content', __name__)
ai_writer = AIWriter()

@ai_content_bp.route('/generate-ideas', methods=['POST'])
def generate_newsletter_ideas():
    """Generate newsletter ideas based on niche"""
    try:
        data = request.get_json() or {}
        niche = data.get('niche')
        count = data.get('count', 5)
        
        # Validate count
        if count > 10:
            count = 10
        elif count < 1:
            count = 1
        
        ideas = ai_writer.generate_newsletter_ideas(niche, count)
        
        return jsonify({
            'success': True,
            'ideas': ideas,
            'niche': niche,
            'count': len(ideas)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ai_content_bp.route('/write-newsletter', methods=['POST'])
def write_newsletter():
    """Generate a complete newsletter"""
    try:
        data = request.get_json()
        
        if not data or not data.get('topic'):
            return jsonify({
                'success': False,
                'error': 'Topic is required'
            }), 400
        
        topic = data['topic']
        target_audience = data.get('target_audience')
        auto_save = data.get('auto_save', False)
        creator_id = data.get('creator_id', 1)  # Default creator for demo
        
        # Generate newsletter content
        newsletter_data = ai_writer.write_newsletter(topic, target_audience)
        
        # Auto-save if requested
        if auto_save:
            newsletter = Newsletter(
                title=newsletter_data['title'],
                content=newsletter_data['content'],
                summary=newsletter_data['summary'],
                visibility='public',  # Default to public
                creator_id=creator_id
            )
            
            db.session.add(newsletter)
            db.session.commit()
            
            newsletter_data['id'] = newsletter.id
            newsletter_data['saved'] = True
        else:
            newsletter_data['saved'] = False
        
        return jsonify({
            'success': True,
            'newsletter': newsletter_data
        })
        
    except Exception as e:
        if auto_save:
            db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ai_content_bp.route('/enhance-content', methods=['POST'])
def enhance_content():
    """Enhance existing newsletter content"""
    try:
        data = request.get_json()
        
        if not data or not data.get('content'):
            return jsonify({
                'success': False,
                'error': 'Content is required'
            }), 400
        
        content = data['content']
        enhancement_type = data.get('type', 'improve')  # improve, shorten, expand
        
        # Create enhancement prompt based on type
        if enhancement_type == 'shorten':
            prompt = f"Make this newsletter content more concise while keeping the key points:\n\n{content}"
        elif enhancement_type == 'expand':
            prompt = f"Expand this newsletter content with more details and examples:\n\n{content}"
        else:  # improve
            prompt = f"Improve this newsletter content to make it more engaging and valuable:\n\n{content}"
        
        response = ai_writer.client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an expert content editor for newsletters. Enhance content while maintaining the original voice and message."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6
        )
        
        enhanced_content = response.choices[0].message.content
        
        return jsonify({
            'success': True,
            'original_content': content,
            'enhanced_content': enhanced_content,
            'enhancement_type': enhancement_type
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

