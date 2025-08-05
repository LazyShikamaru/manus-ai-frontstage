#!/bin/bash

# Manus AI Newsletter Platform Deployment Script
# This script helps deploy the application to Render

set -e

echo "🚀 Manus AI Newsletter Platform Deployment"
echo "=========================================="

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
    echo "❌ render.yaml not found. Please run this script from the backend directory."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Created .env file from .env.example"
        echo "📝 Please edit .env file with your actual values before deploying"
    else
        echo "❌ .env.example not found. Please create .env file manually."
        exit 1
    fi
fi

# Update requirements.txt
echo "📦 Updating requirements.txt..."
if [ -d "venv" ]; then
    source venv/bin/activate
    pip freeze > requirements.txt
    echo "✅ Requirements updated"
else
    echo "⚠️  Virtual environment not found. Please ensure all dependencies are in requirements.txt"
fi

# Check required environment variables
echo "🔍 Checking required environment variables..."
required_vars=(
    "OPENAI_API_KEY"
    "STRIPE_SECRET_KEY"
    "STRIPE_WEBHOOK_SECRET"
    "SENDGRID_API_KEY"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" .env 2>/dev/null || grep -q "^${var}=your-" .env 2>/dev/null; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "❌ Missing or placeholder values for required environment variables:"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
    echo "📝 Please update .env file with actual values before deploying"
    exit 1
fi

echo "✅ All required environment variables are set"

# Create database migration script
echo "📊 Creating database migration script..."
cat > scripts/migrate.py << 'EOF'
#!/usr/bin/env python3
import os
import sys

# Add the project root to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.main import app, db

def migrate_database():
    """Create all database tables"""
    with app.app_context():
        print("Creating database tables...")
        db.create_all()
        print("✅ Database tables created successfully")

if __name__ == '__main__':
    migrate_database()
EOF

chmod +x scripts/migrate.py

echo "✅ Database migration script created"

# Instructions for Render deployment
echo ""
echo "🎯 Render Deployment Instructions"
echo "================================="
echo ""
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Add Render deployment configuration'"
echo "   git push origin main"
echo ""
echo "2. Go to Render Dashboard (https://dashboard.render.com)"
echo ""
echo "3. Click 'New +' and select 'Blueprint'"
echo ""
echo "4. Connect your GitHub repository"
echo ""
echo "5. Select the repository and branch (main)"
echo ""
echo "6. Render will automatically detect the render.yaml file"
echo ""
echo "7. Set the following environment variables in Render:"
echo "   - OPENAI_API_KEY: Your OpenAI API key"
echo "   - STRIPE_SECRET_KEY: Your Stripe secret key"
echo "   - STRIPE_WEBHOOK_SECRET: Your Stripe webhook secret"
echo "   - SENDGRID_API_KEY: Your SendGrid API key"
echo ""
echo "8. Deploy the services"
echo ""
echo "9. After deployment, run database migration:"
echo "   - Go to your backend service in Render"
echo "   - Open the Shell tab"
echo "   - Run: python scripts/migrate.py"
echo ""
echo "10. Configure Stripe webhooks:"
echo "    - Go to Stripe Dashboard > Webhooks"
echo "    - Add endpoint: https://your-backend-url.onrender.com/api/webhook"
echo "    - Select events: checkout.session.completed, invoice.payment_succeeded, customer.subscription.deleted"
echo ""
echo "🎉 Your Manus AI Newsletter Platform will be live!"
echo ""
echo "📚 Additional Resources:"
echo "   - Render Documentation: https://render.com/docs"
echo "   - Stripe Webhooks: https://stripe.com/docs/webhooks"
echo "   - SendGrid API: https://docs.sendgrid.com/"

