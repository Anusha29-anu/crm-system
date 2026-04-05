from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, create_access_token
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"])

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///crm.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'super-secret-key-2024'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)

db = SQLAlchemy(app)
jwt = JWTManager(app)

# ============ MODELS ============
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(50), default='sales')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

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

class Activity(db.Model):
    __tablename__ = 'activities'
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50))
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
    sent_at = db.Column(db.DateTime, default=datetime.utcnow)

# Create tables
with app.app_context():
    db.create_all()
    if not User.query.filter_by(email='admin@crm.com').first():
        admin = User(
            name='Admin User',
            email='admin@crm.com',
            password=generate_password_hash('admin123'),
            role='admin'
        )
        db.session.add(admin)
        db.session.commit()
        print("✅ Admin user created!")

# ============ HELPER FUNCTIONS ============
def calculate_lead_score(data):
    score = 0
    email = data.get('email', '')
    if email:
        if any(x in email for x in ['@gmail', '@yahoo', '@hotmail']):
            score += 10
        else:
            score += 30
    if data.get('company'):
        score += 20
    position = data.get('position', '')
    senior_titles = ['CEO', 'CTO', 'Director', 'VP', 'Manager', 'Head']
    if any(title in position for title in senior_titles):
        score += 30
    if data.get('source') == 'referral':
        score += 40
    elif data.get('source') == 'website':
        score += 20
    if data.get('phone'):
        score += 10
    return min(score, 100)

# ============ AUTH ROUTES ============
@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        user = User.query.filter_by(email=data.get('email')).first()
        
        if not user or not check_password_hash(user.password, data.get('password')):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        access_token = create_access_token(identity={'id': user.id, 'role': user.role})
        return jsonify({
            'token': access_token,
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if User.query.filter_by(email=data.get('email')).first():
            return jsonify({'error': 'User exists'}), 400
        
        user = User(
            name=data.get('name'),
            email=data.get('email'),
            password=generate_password_hash(data.get('password')),
            role=data.get('role', 'sales')
        )
        db.session.add(user)
        db.session.commit()
        
        access_token = create_access_token(identity={'id': user.id, 'role': user.role})
        return jsonify({
            'token': access_token,
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role
            }
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============ CONTACT ROUTES ============
@app.route('/api/contacts', methods=['GET'])
@jwt_required()
def get_contacts():
    contacts = Contact.query.all()
    return jsonify([{
        'id': c.id,
        'name': c.name,
        'email': c.email,
        'phone': c.phone,
        'company': c.company,
        'position': c.position,
        'source': c.source,
        'lead_score': c.lead_score,
        'status': c.status,
        'notes': c.notes,
        'created_at': c.created_at.isoformat() if c.created_at else None
    } for c in contacts])

@app.route('/api/contacts', methods=['POST'])
@jwt_required()
def create_contact():
    try:
        data = request.get_json()
        current_user = get_jwt_identity()
        
        lead_score = calculate_lead_score(data)
        
        contact = Contact(
            name=data.get('name'),
            email=data.get('email'),
            phone=data.get('phone'),
            company=data.get('company'),
            position=data.get('position'),
            source=data.get('source', 'direct'),
            lead_score=lead_score,
            status='new',
            notes=data.get('notes'),
            assigned_to=current_user['id']
        )
        
        db.session.add(contact)
        db.session.commit()
        
        if lead_score >= 70:
            task = Activity(
                type='task',
                subject=f'Follow up: {contact.name}',
                description=f'High-value lead (score: {lead_score}) - contact within 24 hours',
                due_date=datetime.utcnow() + timedelta(hours=24),
                contact_id=contact.id,
                created_by=current_user['id']
            )
            db.session.add(task)
            db.session.commit()
        
        return jsonify({
            'message': 'Contact created',
            'id': contact.id,
            'lead_score': lead_score
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/contacts/<int:contact_id>', methods=['PUT'])
@jwt_required()
def update_contact(contact_id):
    try:
        contact = Contact.query.get_or_404(contact_id)
        data = request.json
        
        for key, value in data.items():
            if hasattr(contact, key):
                setattr(contact, key, value)
        
        db.session.commit()
        return jsonify({'message': 'Contact updated'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# FIXED: This line had the error - now corrected
@app.route('/api/contacts/<int:contact_id>', methods=['DELETE'])
@jwt_required()
def delete_contact(contact_id):
    try:
        contact = Contact.query.get_or_404(contact_id)
        db.session.delete(contact)
        db.session.commit()
        return jsonify({'message': 'Contact deleted'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============ DEAL ROUTES ============
@app.route('/api/deals', methods=['GET'])
@jwt_required()
def get_deals():
    deals = Deal.query.all()
    return jsonify([{
        'id': d.id,
        'title': d.title,
        'amount': d.amount,
        'stage': d.stage,
        'probability': d.probability,
        'expected_close_date': d.expected_close_date.isoformat() if d.expected_close_date else None,
        'contact_id': d.contact_id,
        'assigned_to': d.assigned_to,
        'created_at': d.created_at.isoformat() if d.created_at else None
    } for d in deals])

@app.route('/api/deals', methods=['POST'])
@jwt_required()
def create_deal():
    try:
        data = request.get_json()
        current_user = get_jwt_identity()
        
        deal = Deal(
            title=data.get('title'),
            amount=data.get('amount', 0),
            stage='lead',
            probability=20,
            expected_close_date=datetime.strptime(data.get('expected_close_date'), '%Y-%m-%d') if data.get('expected_close_date') else None,
            contact_id=data.get('contact_id'),
            assigned_to=current_user['id']
        )
        
        db.session.add(deal)
        db.session.commit()
        return jsonify({'message': 'Deal created', 'id': deal.id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/deals/<int:deal_id>/stage', methods=['PUT'])
@jwt_required()
def update_deal_stage(deal_id):
    try:
        deal = Deal.query.get_or_404(deal_id)
        new_stage = request.json.get('stage')
        deal.stage = new_stage
        
        stage_probability = {
            'lead': 20, 'contacted': 30, 'proposal': 50,
            'negotiation': 70, 'closed_won': 100, 'closed_lost': 0
        }
        deal.probability = stage_probability.get(new_stage, 20)
        
        db.session.commit()
        return jsonify({'message': 'Stage updated', 'probability': deal.probability})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============ ACTIVITY ROUTES ============
@app.route('/api/activities', methods=['GET'])
@jwt_required()
def get_activities():
    activities = Activity.query.order_by(Activity.created_at.desc()).all()
    return jsonify([{
        'id': a.id,
        'type': a.type,
        'subject': a.subject,
        'description': a.description,
        'due_date': a.due_date.isoformat() if a.due_date else None,
        'completed': a.completed,
        'contact_id': a.contact_id,
        'deal_id': a.deal_id,
        'created_at': a.created_at.isoformat() if a.created_at else None
    } for a in activities])

@app.route('/api/activities/<int:activity_id>/complete', methods=['PUT'])
@jwt_required()
def complete_activity(activity_id):
    activity = Activity.query.get_or_404(activity_id)
    activity.completed = True
    db.session.commit()
    return jsonify({'message': 'Task completed'})

# ============ DASHBOARD ROUTES ============
@app.route('/api/dashboard/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    total_contacts = Contact.query.count()
    total_deals = Deal.query.count()
    won_deals = Deal.query.filter_by(stage='closed_won').count()
    total_value = db.session.query(db.func.sum(Deal.amount)).filter(Deal.stage == 'closed_won').scalar() or 0
    high_value_leads = Contact.query.filter(Contact.lead_score >= 70).count()
    
    pipeline = db.session.query(Deal.stage, db.func.count(Deal.id)).group_by(Deal.stage).all()
    recent_activities = Activity.query.order_by(Activity.created_at.desc()).limit(5).all()
    
    return jsonify({
        'total_leads': total_contacts,
        'total_deals': total_deals,
        'won_deals': won_deals,
        'total_value': float(total_value),
        'high_value_leads': high_value_leads,
        'pipeline': [{'stage': stage, 'count': count} for stage, count in pipeline],
        'recent_activities': [{
            'subject': a.subject,
            'type': a.type,
            'created_at': a.created_at.isoformat() if a.created_at else None
        } for a in recent_activities]
    })

@app.route('/api/emails', methods=['GET'])
@jwt_required()
def get_emails():
    emails = EmailLog.query.order_by(EmailLog.sent_at.desc()).all()
    return jsonify([{
        'id': e.id,
        'to_email': e.to_email,
        'subject': e.subject,
        'body': e.body,
        'sent_at': e.sent_at.isoformat() if e.sent_at else None
    } for e in emails])

# Test route
@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({'message': 'Backend is running!', 'status': 'ok'})

if __name__ == '__main__':
    print("=" * 50)
    print("🚀 Starting CRM Backend Server")
    print("=" * 50)
    print("📍 Server running at: http://localhost:5000")
    print("📝 Test endpoint: http://localhost:5000/api/test")
    print("🔑 Login endpoint: http://localhost:5000/api/auth/login")
    print("=" * 50)
    app.run(debug=True, port=5000, host='0.0.0.0')