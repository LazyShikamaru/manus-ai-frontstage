import os
from celery import Celery
from kombu import Queue

# Create Celery instance
celery_app = Celery('manus_ai_newsletter')

# Configuration
celery_app.conf.update(
    broker_url=os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0'),
    result_backend=os.getenv('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0'),
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
    task_routes={
        'src.tasks.email_tasks.*': {'queue': 'email'},
        'src.tasks.ai_tasks.*': {'queue': 'ai'},
        'src.tasks.newsletter_tasks.*': {'queue': 'newsletter'},
    },
    task_default_queue='default',
    task_queues=(
        Queue('default'),
        Queue('email'),
        Queue('ai'),
        Queue('newsletter'),
    ),
    beat_schedule={
        'send-newsletter-digest': {
            'task': 'src.tasks.newsletter_tasks.send_newsletter_digest',
            'schedule': 86400.0,  # Run daily
        },
        'cleanup-expired-subscriptions': {
            'task': 'src.tasks.subscription_tasks.cleanup_expired_subscriptions',
            'schedule': 3600.0,  # Run hourly
        },
    },
)

# Auto-discover tasks
celery_app.autodiscover_tasks([
    'src.tasks.email_tasks',
    'src.tasks.ai_tasks',
    'src.tasks.newsletter_tasks',
    'src.tasks.subscription_tasks',
])

if __name__ == '__main__':
    celery_app.start()

