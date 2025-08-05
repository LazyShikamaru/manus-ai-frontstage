# Manus AI Newsletter Platform - Deployment Guide

## Overview

This guide covers the complete deployment setup for the Manus AI Newsletter Platform, including:
- Docker containerization for local development
- Render deployment for production
- Celery + Redis task queue setup
- Stripe webhook configuration
- Email service integration (SendGrid/Mailgun)
- Environment variables and secrets management

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Celery        │
│   (React)       │◄──►│   (Flask)       │◄──►│   Worker        │
│   Port: 3000    │    │   Port: 5000    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   PostgreSQL    │    │   Redis         │
                       │   Database      │    │   Message Queue │
                       └─────────────────┘    └─────────────────┘
```

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for frontend development)
- Python 3.11+ (for backend development)
- Render account (for production deployment)
- Stripe account (for payments)
- SendGrid or Mailgun account (for emails)

## Local Development Setup

### 1. Clone and Setup

```bash
git clone https://github.com/LazyShikamaru/manus-ai-frontstage.git
cd manus-ai-frontstage
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Environment Variables

Create `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-secret-key-here

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/manus_ai_db

# Redis (for Celery)
REDIS_URL=redis://localhost:6379/0

# OpenAI API
OPENAI_API_KEY=your-openai-api-key

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Configuration (Choose one)
EMAIL_PROVIDER=sendgrid  # or 'mailgun'
FROM_EMAIL=noreply@yourdomain.com

# SendGrid
SENDGRID_API_KEY=SG.your-sendgrid-api-key

# Mailgun (alternative)
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-mailgun-domain

# Celery Configuration
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

### 4. Database Setup

```bash
# Install PostgreSQL locally or use Docker
docker run --name postgres-manus -e POSTGRES_PASSWORD=password -e POSTGRES_DB=manus_ai_db -p 5432:5432 -d postgres:13

# Run database migrations
python src/main.py  # This will create tables automatically
```

### 5. Start Services with Docker Compose

```bash
cd backend
docker-compose up -d
```

This starts:
- PostgreSQL database
- Redis server
- Flask backend
- Celery worker

### 6. Frontend Setup

```bash
cd ../  # Back to root directory
npm install
npm run dev
```

## Production Deployment on Render

### 1. Prepare Repository

Ensure your repository structure looks like this:

```
manus-ai-frontstage/
├── backend/
│   ├── src/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── render.yaml
│   └── .env.example
├── src/  (frontend)
├── public/
├── package.json
└── README.md
```

### 2. Backend Deployment

#### Create Render Services

1. **PostgreSQL Database**
   - Go to Render Dashboard
   - Create new PostgreSQL database
   - Note the connection details

2. **Redis Instance**
   - Create new Redis instance
   - Note the Redis URL

3. **Flask Backend Service**
   - Create new Web Service
   - Connect your GitHub repository
   - Set build command: `cd backend && pip install -r requirements.txt`
   - Set start command: `cd backend && python src/main.py`
   - Set environment variables (see below)

4. **Celery Worker Service**
   - Create new Background Worker
   - Connect same GitHub repository
   - Set build command: `cd backend && pip install -r requirements.txt`
   - Set start command: `cd backend && celery -A src.celery_app worker --loglevel=info`
   - Set same environment variables as backend

#### Environment Variables for Render

Set these in Render dashboard for both backend and worker services:

```
FLASK_ENV=production
SECRET_KEY=your-production-secret-key
DATABASE_URL=postgresql://user:pass@host:port/db  # From Render PostgreSQL
REDIS_URL=redis://user:pass@host:port  # From Render Redis
OPENAI_API_KEY=your-openai-api-key
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com
CELERY_BROKER_URL=redis://user:pass@host:port
CELERY_RESULT_BACKEND=redis://user:pass@host:port
```

### 3. Frontend Deployment

#### Option A: Deploy to Render (Static Site)

1. Create new Static Site on Render
2. Connect your GitHub repository
3. Set build command: `npm install && npm run build`
4. Set publish directory: `dist`
5. Add environment variable: `VITE_API_URL=https://your-backend-url.onrender.com`

#### Option B: Deploy to Netlify

1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variable: `VITE_API_URL=https://your-backend-url.onrender.com`

## Stripe Webhook Configuration

### 1. Local Development

Install Stripe CLI:
```bash
# Install Stripe CLI
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:5000/api/webhook

# Copy the webhook signing secret to your .env file
```

### 2. Production Setup

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-backend-url.onrender.com/api/webhook`
3. Select events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
4. Copy webhook signing secret to Render environment variables

## Email Service Setup

### SendGrid Setup

1. Create SendGrid account
2. Generate API key
3. Verify sender identity
4. Add API key to environment variables

### Mailgun Setup (Alternative)

1. Create Mailgun account
2. Add and verify domain
3. Get API key and domain
4. Add to environment variables

## Testing the Deployment

### 1. Test Backend Health

```bash
curl https://your-backend-url.onrender.com/api/health
```

### 2. Test Stripe Integration

```bash
# Test webhook endpoint
curl -X POST https://your-backend-url.onrender.com/api/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"type": "test", "user_id": 1}'
```

### 3. Test Celery Tasks

```bash
# Trigger a test email task
curl -X POST https://your-backend-url.onrender.com/api/tasks/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## Monitoring and Logs

### Render Logs

- Backend logs: Render Dashboard → Your Web Service → Logs
- Worker logs: Render Dashboard → Your Background Worker → Logs
- Database logs: Render Dashboard → Your PostgreSQL → Logs

### Health Checks

The backend includes health check endpoints:
- `/api/health` - Basic health check
- `/api/health/db` - Database connectivity
- `/api/health/redis` - Redis connectivity
- `/api/health/celery` - Celery worker status

## Scaling and Performance

### Horizontal Scaling

1. **Backend**: Increase instance count in Render
2. **Celery Workers**: Add more background worker services
3. **Database**: Upgrade PostgreSQL plan
4. **Redis**: Upgrade Redis plan

### Performance Optimization

1. **Database Indexing**: Add indexes for frequently queried fields
2. **Caching**: Implement Redis caching for API responses
3. **CDN**: Use Cloudflare or similar for static assets
4. **Database Connection Pooling**: Configure in production

## Security Considerations

### Environment Variables

- Never commit `.env` files
- Use strong, unique secret keys
- Rotate API keys regularly
- Use different keys for development/production

### HTTPS

- Render provides HTTPS by default
- Ensure all API calls use HTTPS
- Set secure cookie flags in production

### CORS

- Configure CORS properly for your frontend domain
- Don't use wildcard (*) in production

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check DATABASE_URL format
   - Verify database is running
   - Check firewall settings

2. **Celery Worker Not Processing Tasks**
   - Verify Redis connection
   - Check worker logs
   - Ensure CELERY_BROKER_URL is correct

3. **Stripe Webhook Failures**
   - Verify webhook URL is accessible
   - Check webhook signing secret
   - Review Stripe dashboard for failed events

4. **Email Delivery Issues**
   - Verify API keys
   - Check sender verification
   - Review email service logs

### Debug Commands

```bash
# Check Celery worker status
celery -A src.celery_app inspect active

# Test Redis connection
redis-cli ping

# Test database connection
python -c "from src.models.user import db; print(db.engine.execute('SELECT 1').scalar())"
```

## Backup and Recovery

### Database Backups

Render PostgreSQL includes automatic backups. For additional safety:

```bash
# Manual backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### Environment Variables Backup

Keep a secure backup of all environment variables and API keys.

## Support and Maintenance

### Regular Tasks

1. Monitor application logs
2. Check database performance
3. Review Stripe webhook delivery
4. Monitor email delivery rates
5. Update dependencies regularly

### Updates and Deployments

1. Test changes locally first
2. Deploy to staging environment
3. Run integration tests
4. Deploy to production
5. Monitor for issues

For additional support, contact the development team or refer to the individual service documentation (Render, Stripe, SendGrid/Mailgun).

