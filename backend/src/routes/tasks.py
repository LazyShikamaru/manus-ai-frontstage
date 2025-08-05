from flask import Blueprint, request, jsonify
from src.celery_app import celery_app
from src.tasks.ai_tasks import generate_newsletter_content, generate_newsletter_ideas, enhance_newsletter_content
from src.tasks.email_tasks import send_welcome_email, send_subscription_confirmation
from src.tasks.newsletter_tasks import send_newsletter_digest, send_new_newsletter_notification
from src.tasks.subscription_tasks import process_new_subscription

tasks_bp = Blueprint('tasks', __name__)

@tasks_bp.route('/tasks/generate-content', methods=['POST'])
def async_generate_content():
    """
    Generate newsletter content asynchronously
    """
    try:
        data = request.get_json()
        
        if not data or not data.get('topic'):
            return jsonify({
                'success': False,
                'error': 'Topic is required'
            }), 400
        
        topic = data['topic']
        target_audience = data.get('target_audience')
        creator_id = data.get('creator_id', 1)
        auto_save = data.get('auto_save', True)
        
        # Start async task
        task = generate_newsletter_content.delay(
            topic=topic,
            target_audience=target_audience,
            creator_id=creator_id,
            auto_save=auto_save
        )
        
        return jsonify({
            'success': True,
            'task_id': task.id,
            'status': 'PENDING',
            'message': 'Content generation started'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@tasks_bp.route('/tasks/generate-ideas', methods=['POST'])
def async_generate_ideas():
    """
    Generate newsletter ideas asynchronously
    """
    try:
        data = request.get_json() or {}
        niche = data.get('niche')
        count = data.get('count', 5)
        
        # Validate count
        if count > 10:
            count = 10
        elif count < 1:
            count = 1
        
        # Start async task
        task = generate_newsletter_ideas.delay(niche=niche, count=count)
        
        return jsonify({
            'success': True,
            'task_id': task.id,
            'status': 'PENDING',
            'message': 'Idea generation started'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@tasks_bp.route('/tasks/enhance-content', methods=['POST'])
def async_enhance_content():
    """
    Enhance newsletter content asynchronously
    """
    try:
        data = request.get_json()
        
        if not data or not data.get('content'):
            return jsonify({
                'success': False,
                'error': 'Content is required'
            }), 400
        
        content = data['content']
        enhancement_type = data.get('type', 'improve')
        
        # Start async task
        task = enhance_newsletter_content.delay(
            content=content,
            enhancement_type=enhancement_type
        )
        
        return jsonify({
            'success': True,
            'task_id': task.id,
            'status': 'PENDING',
            'message': 'Content enhancement started'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@tasks_bp.route('/tasks/send-welcome-email', methods=['POST'])
def async_send_welcome_email():
    """
    Send welcome email asynchronously
    """
    try:
        data = request.get_json()
        
        if not data or not data.get('user_id'):
            return jsonify({
                'success': False,
                'error': 'User ID is required'
            }), 400
        
        user_id = data['user_id']
        
        # Start async task
        task = send_welcome_email.delay(user_id=user_id)
        
        return jsonify({
            'success': True,
            'task_id': task.id,
            'status': 'PENDING',
            'message': 'Welcome email sending started'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@tasks_bp.route('/tasks/send-newsletter-digest', methods=['POST'])
def async_send_newsletter_digest():
    """
    Send newsletter digest asynchronously
    """
    try:
        # Start async task
        task = send_newsletter_digest.delay()
        
        return jsonify({
            'success': True,
            'task_id': task.id,
            'status': 'PENDING',
            'message': 'Newsletter digest sending started'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@tasks_bp.route('/tasks/notify-new-newsletter', methods=['POST'])
def async_notify_new_newsletter():
    """
    Send new newsletter notification asynchronously
    """
    try:
        data = request.get_json()
        
        if not data or not data.get('newsletter_id'):
            return jsonify({
                'success': False,
                'error': 'Newsletter ID is required'
            }), 400
        
        newsletter_id = data['newsletter_id']
        
        # Start async task
        task = send_new_newsletter_notification.delay(newsletter_id=newsletter_id)
        
        return jsonify({
            'success': True,
            'task_id': task.id,
            'status': 'PENDING',
            'message': 'Newsletter notification sending started'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@tasks_bp.route('/tasks/process-subscription', methods=['POST'])
def async_process_subscription():
    """
    Process new subscription asynchronously
    """
    try:
        data = request.get_json()
        
        if not data or not data.get('user_id'):
            return jsonify({
                'success': False,
                'error': 'User ID is required'
            }), 400
        
        user_id = data['user_id']
        subscription_tier = data.get('subscription_tier', 'premium')
        
        # Start async task
        task = process_new_subscription.delay(
            user_id=user_id,
            subscription_tier=subscription_tier
        )
        
        return jsonify({
            'success': True,
            'task_id': task.id,
            'status': 'PENDING',
            'message': 'Subscription processing started'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@tasks_bp.route('/tasks/status/<task_id>', methods=['GET'])
def get_task_status(task_id):
    """
    Get the status of a Celery task
    """
    try:
        task = celery_app.AsyncResult(task_id)
        
        if task.state == 'PENDING':
            response = {
                'state': task.state,
                'status': 'Task is waiting to be processed'
            }
        elif task.state == 'PROGRESS':
            response = {
                'state': task.state,
                'status': task.info.get('status', 'Processing...'),
                'progress': task.info.get('progress', 0)
            }
        elif task.state == 'SUCCESS':
            response = {
                'state': task.state,
                'result': task.result
            }
        else:  # FAILURE
            response = {
                'state': task.state,
                'error': str(task.info),
                'status': task.info.get('status', 'Task failed') if hasattr(task.info, 'get') else 'Task failed'
            }
        
        return jsonify({
            'success': True,
            'task_id': task_id,
            **response
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@tasks_bp.route('/tasks/cancel/<task_id>', methods=['POST'])
def cancel_task(task_id):
    """
    Cancel a running Celery task
    """
    try:
        celery_app.control.revoke(task_id, terminate=True)
        
        return jsonify({
            'success': True,
            'message': f'Task {task_id} has been cancelled',
            'task_id': task_id
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@tasks_bp.route('/tasks/active', methods=['GET'])
def get_active_tasks():
    """
    Get list of active tasks
    """
    try:
        inspect = celery_app.control.inspect()
        active_tasks = inspect.active()
        
        return jsonify({
            'success': True,
            'active_tasks': active_tasks
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@tasks_bp.route('/tasks/stats', methods=['GET'])
def get_task_stats():
    """
    Get Celery worker statistics
    """
    try:
        inspect = celery_app.control.inspect()
        stats = inspect.stats()
        
        return jsonify({
            'success': True,
            'stats': stats
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

