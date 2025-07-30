from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class Payment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    stripe_session_id = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), default='USD')
    status = db.Column(db.String(20), default='pending')  # pending, completed, failed, refunded
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)
    
    # Relationship
    user = db.relationship('User', backref=db.backref('payments', lazy=True))

    def __repr__(self):
        return f'<Payment {self.stripe_session_id} - {self.status}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'stripe_session_id': self.stripe_session_id,
            'amount': self.amount,
            'currency': self.currency,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }

