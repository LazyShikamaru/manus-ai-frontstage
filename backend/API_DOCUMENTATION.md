# Manus AI Newsletter Platform - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Currently, the API uses simple user_id parameters for demo purposes. In production, implement proper JWT authentication.

## Response Format
All API responses follow this format:
```json
{
  "success": true/false,
  "data": {...},
  "error": "error message if applicable"
}
```

---

## Newsletter Endpoints

### GET /newsletters
Get all newsletters with access control.

**Parameters:**
- `user_id` (optional): User ID for access control
- `visibility` (optional): Filter by visibility (public/private/premium/all)

**Response:**
```json
{
  "newsletters": [
    {
      "id": 1,
      "title": "Newsletter Title",
      "content": "Full content or summary based on access",
      "summary": "Brief summary",
      "visibility": "public",
      "creator_id": 1,
      "created_at": "2025-07-30T19:32:29.453578",
      "updated_at": "2025-07-30T19:32:29.453582"
    }
  ],
  "total": 1,
  "user_id": null
}
```

### GET /newsletters/{id}
Get a specific newsletter with access control.

**Parameters:**
- `user_id` (optional): User ID for access control

**Response:**
```json
{
  "success": true,
  "newsletter": {
    "id": 1,
    "title": "Newsletter Title",
    "content": "Full content",
    "summary": "Brief summary",
    "visibility": "public",
    "creator_id": 1,
    "created_at": "2025-07-30T19:32:29.453578",
    "updated_at": "2025-07-30T19:32:29.453582"
  },
  "access_type": "full"
}
```

**Access Control Response (Premium content for free user):**
```json
{
  "success": false,
  "newsletter": {
    "id": 1,
    "title": "Premium Newsletter",
    "content": "Summary content with upgrade prompt",
    "is_preview": true
  },
  "access_type": "summary",
  "reason": "Premium subscription required",
  "upgrade_required": true
}
```

### POST /newsletters
Create a new newsletter.

**Request Body:**
```json
{
  "title": "Newsletter Title",
  "content": "Full newsletter content in Markdown",
  "summary": "Brief summary (optional)",
  "visibility": "public",
  "creator_id": 1
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Newsletter Title",
  "content": "Full newsletter content",
  "summary": "Brief summary",
  "visibility": "public",
  "creator_id": 1,
  "created_at": "2025-07-30T19:32:29.453578",
  "updated_at": "2025-07-30T19:32:29.453582"
}
```

### PUT /newsletters/{id}
Update an existing newsletter.

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content",
  "summary": "Updated summary",
  "visibility": "premium"
}
```

### DELETE /newsletters/{id}
Delete a newsletter.

**Response:**
```json
{
  "message": "Newsletter deleted successfully"
}
```

---

## AI Content Generation Endpoints

### POST /generate-ideas
Generate newsletter ideas based on niche.

**Request Body:**
```json
{
  "niche": "tech startups",
  "count": 5
}
```

**Response:**
```json
{
  "success": true,
  "ideas": [
    {
      "title": "Newsletter Idea 1 for tech startups",
      "summary": "An engaging newsletter that provides value to readers through actionable insights and creative content.",
      "target_audience": "tech startups",
      "headlines": [
        "5 Game-Changing Strategies You Need to Know",
        "The Secret to Building Your Audience",
        "Why Most People Fail (And How You Can Succeed)"
      ]
    }
  ],
  "niche": "tech startups",
  "count": 1
}
```

### POST /write-newsletter
Generate a complete newsletter based on topic.

**Request Body:**
```json
{
  "topic": "Building AI-powered startups",
  "target_audience": "entrepreneurs",
  "auto_save": true,
  "creator_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "newsletter": {
    "title": "Building AI-powered startups",
    "content": "# Building AI-powered startups\n\nFull generated content...",
    "summary": "Two-sentence summary of the newsletter",
    "topic": "Building AI-powered startups",
    "target_audience": "entrepreneurs",
    "id": 2,
    "saved": true
  }
}
```

### POST /enhance-content
Enhance existing newsletter content.

**Request Body:**
```json
{
  "content": "Original newsletter content",
  "type": "improve"
}
```

**Types:** `improve`, `shorten`, `expand`

**Response:**
```json
{
  "success": true,
  "original_content": "Original content",
  "enhanced_content": "Enhanced content",
  "enhancement_type": "improve"
}
```

---

## User Management Endpoints

### GET /users
Get all users.

**Response:**
```json
[
  {
    "id": 1,
    "username": "user1",
    "email": "user1@example.com"
  }
]
```

### POST /users
Create a new user.

**Request Body:**
```json
{
  "username": "newuser",
  "email": "newuser@example.com"
}
```

### GET /users/{id}
Get a specific user.

### PUT /users/{id}
Update a user.

### DELETE /users/{id}
Delete a user.

---

## Payment & Subscription Endpoints

### POST /create-checkout-session
Create a Stripe checkout session for subscription.

**Request Body:**
```json
{
  "user_id": 1,
  "price_id": "price_premium_monthly",
  "success_url": "https://your-domain.com/success",
  "cancel_url": "https://your-domain.com/cancel"
}
```

**Response:**
```json
{
  "success": true,
  "session_id": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

### POST /create-one-time-payment
Create a one-time payment session.

**Request Body:**
```json
{
  "user_id": 1,
  "amount": 999,
  "currency": "usd"
}
```

### GET /subscription-status/{user_id}
Get user's subscription status.

**Response:**
```json
{
  "success": true,
  "subscription": {
    "tier": "premium",
    "status": "active",
    "has_premium": true,
    "stripe_subscription_id": "sub_..."
  }
}
```

### POST /upgrade-to-premium
Quick upgrade to premium (demo purposes).

**Request Body:**
```json
{
  "user_id": 1
}
```

### POST /webhook
Stripe webhook handler for payment events.

---

## Content Access Control Endpoints

### GET /check-access/{newsletter_id}
Check if user can access a specific newsletter.

**Parameters:**
- `user_id` (optional): User ID for access control

**Response:**
```json
{
  "can_access": true,
  "reason": "Public content",
  "content_type": "full",
  "newsletter": {
    "id": 1,
    "title": "Newsletter Title",
    "content": "Full content"
  }
}
```

### GET /user-stats/{user_id}
Get user's content access statistics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "user_id": 1,
    "subscription_tier": "premium",
    "subscription_status": "active",
    "has_premium_access": true,
    "total_newsletters": 10,
    "accessible_newsletters": 10,
    "public_newsletters": 5,
    "private_newsletters": 3,
    "premium_newsletters": 2,
    "user_created_newsletters": 1
  }
}
```

### PUT /set-visibility/{newsletter_id}
Set newsletter visibility (creator only).

**Request Body:**
```json
{
  "visibility": "premium",
  "user_id": 1
}
```

### GET /access-summary
Get summary of content access rules.

**Response:**
```json
{
  "success": true,
  "access_rules": {
    "public": {
      "description": "Visible to all users, no login required",
      "access_level": "full_content"
    },
    "private": {
      "description": "Requires user login/authentication",
      "access_level": "full_content_with_auth"
    },
    "premium": {
      "description": "Requires active premium subscription",
      "access_level": "full_content_with_premium",
      "fallback": "summary_only_for_free_users"
    }
  },
  "subscription_tiers": {
    "free": {
      "access": ["public", "private"],
      "premium_content": "summary_only"
    },
    "premium": {
      "access": ["public", "private", "premium"],
      "premium_content": "full_access"
    }
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error message"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "reason": "Access denied reason",
  "upgrade_required": true
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error message"
}
```

---

## Content Visibility Matrix

| User Type | Public | Private | Premium |
|-----------|--------|---------|---------|
| Anonymous | ✅ Full | ❌ None | 📄 Summary |
| Free User | ✅ Full | ✅ Full | 📄 Summary |
| Premium User | ✅ Full | ✅ Full | ✅ Full |

**Legend:**
- ✅ Full: Complete content access
- 📄 Summary: Summary only with upgrade prompt
- ❌ None: No access

---

## Rate Limiting

Currently not implemented. For production, consider implementing rate limiting on:
- AI content generation endpoints (expensive operations)
- User creation endpoints (prevent spam)
- Payment endpoints (security)

---

## CORS Configuration

The API is configured to accept requests from all origins for development. In production, configure specific allowed origins:

```python
CORS(app, origins=['https://your-frontend-domain.com'])
```

