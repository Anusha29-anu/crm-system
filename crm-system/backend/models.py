from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flask_jwt_extended import create_access_token

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(50), default='sales')  # admin, sales, manager
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def get_token(self):
        return create_access_token(identity={'id': self.id, 'role': self.role})

class Contact(db.Model):
    __tablename__ = 'contacts'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    company = db.Column(db.String(100))
    position = db.Column(db.String(100))
    source = db.Column(db.String(50))
    lead_score = db.Column(db.Integer, default=0)
    status = db.Column(db.String(50), default='new')
    notes = db.Column(db.Text)
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Deal(db.Model):
    __tablename__ = 'deals'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    amount = db.Column(db.Float, default=0)
    stage = db.Column(db.String(50), default='lead')
    probability = db.Column(db.Integer, default=20)
    expected_close_date = db.Column(db.Date)
    contact_id = db.Column(db.Integer, db.ForeignKey('contacts.id'))
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Activity(db.Model):
    __tablename__ = 'activities'
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50))  # call, email, meeting, task
    subject = db.Column(db.String(200))
    description = db.Column(db.Text)
    due_date = db.Column(db.DateTime)
    completed = db.Column(db.Boolean, default=False)
    contact_id = db.Column(db.Integer, db.ForeignKey('contacts.id'))
    deal_id = db.Column(db.Integer, db.ForeignKey('deals.id'))
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class EmailLog(db.Model):
    __tablename__ = 'email_logs'
    id = db.Column(db.Integer, primary_key=True)
    to_email = db.Column(db.String(100))
    subject = db.Column(db.String(200))
    body = db.Column(db.Text)
    contact_id = db.Column(db.Integer, db.ForeignKey('contacts.id'))
    sent_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    sent_at = db.Column(db.DateTime, default=datetime.utcnow)

class Note(db.Model):
    __tablename__ = 'notes'
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    contact_id = db.Column(db.Integer, db.ForeignKey('contacts.id'))
    deal_id = db.Column(db.Integer, db.ForeignKey('deals.id'))
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)