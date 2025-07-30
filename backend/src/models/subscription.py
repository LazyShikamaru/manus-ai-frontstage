from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class Subscription(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    tier = db.Column(db.String(20), default='free')  # free, premium
    stripe_subscription_id = db.Column(db.String(100), nullable=True)
    status = db.Column(db.String(20), default='active')  # active, cancelled, expired
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=True)
    
    # Relationship
    user = db.relationship('User', backref=db.backref('subscription', uselist=False))

    def __repr__(self):
        return f'<Subscription {self.user_id} - {self.tier}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'tier': self.tier,
            'stripe_subscription_id': self.stripe_subscription_id,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None
        }

