import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from celery import current_task
from src.celery_app import celery_app
from src.services.ai_writer import AIWriter
from src.models.user import db
from src.models.newsletter import Newsletter
import logging

logger = logging.getLogger(__name__)

@celery_app.task(bind=True, name='src.tasks.ai_tasks.generate_newsletter_content')
def generate_newsletter_content(self, topic, target_audience=None, creator_id=1, auto_save=True):
    """
    Generate newsletter content asynchronously using AI
    """
    try:
        # Update task state
        self.update_state(state='PROGRESS', meta={'status': 'Initializing AI writer...'})
        
        ai_writer = AIWriter()
        
        # Update task state
        self.update_state(state='PROGRESS', meta={'status': 'Generating content...'})
        
        # Generate newsletter content
        newsletter_data = ai_writer.write_newsletter(topic, target_audience)
        
        if auto_save:
            # Update task state
            self.update_state(state='PROGRESS', meta={'status': 'Saving to database...'})
            
            # Import Flask app context
            from src.main import app
            with app.app_context():
                newsletter = Newsletter(
                    title=newsletter_data['title'],
                    content=newsletter_data['content'],
                    summary=newsletter_data['summary'],
                    visibility='public',
                    creator_id=creator_id
                )
                
                db.session.add(newsletter)
                db.session.commit()
                
                newsletter_data['id'] = newsletter.id
                newsletter_data['saved'] = True
        
        return {
            'status': 'SUCCESS',
            'newsletter': newsletter_data,
            'message': 'Newsletter content generated successfully'
        }
        
    except Exception as exc:
        logger.error(f"Error generating newsletter content: {str(exc)}")
        self.update_state(
            state='FAILURE',
            meta={'error': str(exc), 'status': 'Failed to generate content'}
        )
        raise exc

@celery_app.task(bind=True, name='src.tasks.ai_tasks.generate_newsletter_ideas')
def generate_newsletter_ideas(self, niche=None, count=5):
    """
    Generate newsletter ideas asynchronously using AI
    """
    try:
        # Update task state
        self.update_state(state='PROGRESS', meta={'status': 'Generating ideas...'})
        
        ai_writer = AIWriter()
        ideas = ai_writer.generate_newsletter_ideas(niche, count)
        
        return {
            'status': 'SUCCESS',
            'ideas': ideas,
            'niche': niche,
            'count': len(ideas),
            'message': 'Newsletter ideas generated successfully'
        }
        
    except Exception as exc:
        logger.error(f"Error generating newsletter ideas: {str(exc)}")
        self.update_state(
            state='FAILURE',
            meta={'error': str(exc), 'status': 'Failed to generate ideas'}
        )
        raise exc

@celery_app.task(bind=True, name='src.tasks.ai_tasks.enhance_newsletter_content')
def enhance_newsletter_content(self, content, enhancement_type='improve'):
    """
    Enhance existing newsletter content asynchronously
    """
    try:
        # Update task state
        self.update_state(state='PROGRESS', meta={'status': 'Enhancing content...'})
        
        ai_writer = AIWriter()
        
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
        
        return {
            'status': 'SUCCESS',
            'original_content': content,
            'enhanced_content': enhanced_content,
            'enhancement_type': enhancement_type,
            'message': 'Content enhanced successfully'
        }
        
    except Exception as exc:
        logger.error(f"Error enhancing content: {str(exc)}")
        self.update_state(
            state='FAILURE',
            meta={'error': str(exc), 'status': 'Failed to enhance content'}
        )
        raise exc

