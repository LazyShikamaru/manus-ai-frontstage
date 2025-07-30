# Manus AI Newsletter Platform Backend

A Flask-based backend for the AI-powered newsletter platform that supports content creation, user management, subscription handling, and payment processing.

## Features

- **Newsletter Management**: Create, read, update, and delete newsletters with different visibility levels
- **AI Content Generation**: Generate newsletter ideas and full content using OpenAI GPT
- **User Management**: Basic user registration and management
- **Subscription System**: Free and premium tiers with access control
- **Payment Processing**: Stripe integration for subscription payments
- **Content Visibility**: Public, private, and premium content access control
- **CORS Support**: Cross-origin requests enabled for frontend integration

## Project Structure

```
newsletter_backend/
├── src/
│   ├── models/           # Database models
│   │   ├── user.py       # User model
│   │   ├── newsletter.py # Newsletter model
│   │   ├── subscription.py # Subscription model
│   │   └── payment.py    # Payment model
│   ├── routes/           # API endpoints
│   │   ├── user.py       # User management routes
│   │   ├── newsletter.py # Newsletter CRUD routes
│   │   ├── ai_content.py # AI content generation routes
│   │   ├── payments.py   # Payment and subscription routes
│   │   └── content_access.py # Content access control routes
│   ├── services/         # Business logic services
│   │   ├── ai_writer.py  # AI content generation service
│   │   ├── stripe_service.py # Stripe payment service
│   │   └── content_manager.py # Content visibility manager
│   ├── static/           # Frontend files (to be added)
│   ├── database/         # SQLite database
│   └── main.py           # Flask application entry point
├── venv/                 # Python virtual environment
├── requirements.txt      # Python dependencies
└── README.md            # This file
```

## Installation & Setup

1. **Clone and navigate to the project:**
   ```bash
   cd newsletter_backend
   ```

2. **Activate virtual environment:**
   ```bash
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set environment variables:**
   Create a `.env` file with:
   ```
   OPENAI_API_KEY=your_openai_api_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   ```

5. **Run the application:**
   ```bash
   python src/main.py
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Newsletter Management
- `GET /api/newsletters` - Get all newsletters (with access control)
- `GET /api/newsletters/<id>` - Get specific newsletter
- `POST /api/newsletters` - Create new newsletter
- `PUT /api/newsletters/<id>` - Update newsletter
- `DELETE /api/newsletters/<id>` - Delete newsletter

### AI Content Generation
- `POST /api/generate-ideas` - Generate newsletter ideas
- `POST /api/write-newsletter` - Generate full newsletter content
- `POST /api/enhance-content` - Enhance existing content

### User Management
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `GET /api/users/<id>` - Get specific user
- `PUT /api/users/<id>` - Update user
- `DELETE /api/users/<id>` - Delete user

### Payment & Subscriptions
- `POST /api/create-checkout-session` - Create Stripe checkout session
- `POST /api/create-one-time-payment` - Create one-time payment
- `GET /api/subscription-status/<user_id>` - Get subscription status
- `POST /api/upgrade-to-premium` - Upgrade user to premium (demo)
- `POST /api/webhook` - Stripe webhook handler

### Content Access Control
- `GET /api/check-access/<newsletter_id>` - Check newsletter access
- `GET /api/user-stats/<user_id>` - Get user content statistics
- `PUT /api/set-visibility/<newsletter_id>` - Set newsletter visibility
- `GET /api/access-summary` - Get access rules summary

## Database Models

### User
- `id`: Primary key
- `username`: Unique username
- `email`: Unique email address

### Newsletter
- `id`: Primary key
- `title`: Newsletter title
- `content`: Full newsletter content (Markdown)
- `summary`: Brief summary for previews
- `visibility`: public/private/premium
- `creator_id`: Foreign key to User
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### Subscription
- `id`: Primary key
- `user_id`: Foreign key to User
- `tier`: free/premium
- `stripe_subscription_id`: Stripe subscription ID
- `status`: active/cancelled/expired
- `created_at`: Creation timestamp
- `expires_at`: Expiration timestamp

### Payment
- `id`: Primary key
- `user_id`: Foreign key to User
- `stripe_session_id`: Stripe session ID
- `amount`: Payment amount
- `currency`: Payment currency
- `status`: pending/completed/failed/refunded
- `created_at`: Creation timestamp
- `completed_at`: Completion timestamp

## Content Visibility Rules

1. **Public**: Accessible to everyone, no authentication required
2. **Private**: Requires user login/authentication
3. **Premium**: Requires active premium subscription
   - Free users see summary only with upgrade prompt
   - Premium users see full content

## AI Content Generation

The platform uses OpenAI GPT models for:
- **Newsletter Ideas**: Generate creative newsletter concepts with titles, summaries, and headlines
- **Full Content**: Write complete newsletters (500-700 words) based on topics
- **Content Enhancement**: Improve, shorten, or expand existing content

## Stripe Integration

### Subscription Flow
1. User initiates subscription via frontend
2. Backend creates Stripe checkout session
3. User completes payment on Stripe
4. Webhook updates user subscription status
5. User gains access to premium content

### Webhook Events Handled
- `checkout.session.completed`: Payment successful
- `invoice.payment_succeeded`: Recurring payment
- `customer.subscription.deleted`: Subscription cancelled

## Frontend Integration

The backend is designed to work with the provided frontend repository. Key integration points:

1. **CORS**: Enabled for all origins to allow frontend requests
2. **Static Files**: Frontend build files should be placed in `src/static/`
3. **API Prefix**: All API endpoints use `/api/` prefix
4. **Error Handling**: Consistent JSON error responses

## Deployment

### Development
```bash
python src/main.py
```

### Production
For production deployment, consider:
1. Use a production WSGI server (e.g., Gunicorn)
2. Set up proper environment variables
3. Configure database for production (PostgreSQL recommended)
4. Set up Stripe webhooks endpoint
5. Configure proper CORS origins

### Environment Variables
```
OPENAI_API_KEY=your_openai_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
FLASK_ENV=production
DATABASE_URL=your_production_database_url
```

## Testing

The backend has been tested with:
- Newsletter CRUD operations
- Content visibility controls
- API endpoint responses
- Database model relationships

### Example API Calls

Create a newsletter:
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"title": "Test Newsletter", "content": "# Hello World", "visibility": "public"}' \
  http://localhost:5000/api/newsletters
```

Generate newsletter ideas:
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"niche": "tech startups", "count": 3}' \
  http://localhost:5000/api/generate-ideas
```

## Security Considerations

- Input validation on all endpoints
- SQL injection prevention via SQLAlchemy ORM
- Environment variables for sensitive data
- CORS configuration for production
- Stripe webhook signature verification

## Future Enhancements

- User authentication and JWT tokens
- Email notifications for subscriptions
- Content scheduling and automation
- Analytics and metrics tracking
- Advanced AI content customization
- Multi-language support

## Support

For issues or questions about the backend implementation, please refer to the API documentation or check the error logs in the Flask console output.

