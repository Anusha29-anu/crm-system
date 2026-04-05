from app import app, db
from models import User, Contact, Deal, Activity, EmailLog, Note
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta

with app.app_context():
    # Clear existing data
    db.drop_all()
    db.create_all()
    
    # Create users with different roles
    users = [
        User(name='Admin User', email='admin@crm.com', password=generate_password_hash('admin123'), role='admin'),
        User(name='John Smith', email='john@crm.com', password=generate_password_hash('sales123'), role='sales'),
        User(name='Jane Doe', email='jane@crm.com', password=generate_password_hash('manager123'), role='manager'),
        User(name='Mike Johnson', email='mike@crm.com', password=generate_password_hash('sales123'), role='sales'),
    ]
    db.session.add_all(users)
    db.session.commit()
    
    # Create contacts with various lead scores
    contacts = [
        Contact(name='Microsoft Corporation', email='enterprise@microsoft.com', phone='+1-425-882-8080',
                company='Microsoft', position='IT Director', source='website', lead_score=85, status='qualified', assigned_to=2),
        Contact(name='Google Cloud', email='partners@google.com', phone='+1-650-253-0000',
                company='Google', position='Partnership Manager', source='referral', lead_score=95, status='qualified', assigned_to=2),
        Contact(name='Amazon Web Services', email='enterprise@aws.com', phone='+1-206-266-1000',
                company='Amazon', position='VP of Sales', source='conference', lead_score=88, status='contacted', assigned_to=3),
        Contact(name='Netflix Inc', email='tech@netflix.com', phone='+1-408-540-3700',
                company='Netflix', position='Engineering Manager', source='website', lead_score=72, status='qualified', assigned_to=2),
        Contact(name='Spotify', email='business@spotify.com', phone='+1-212-920-7400',
                company='Spotify', position='Product Director', source='referral', lead_score=91, status='qualified', assigned_to=3),
        Contact(name='Startup Innovations', email='founder@startup.com', phone='+1-555-123-4567',
                company='StartupCo', position='CEO', source='cold_call', lead_score=45, status='new', assigned_to=4),
        Contact(name='Local Business Solutions', email='info@localbiz.com', phone='+1-555-987-6543',
                company='LocalBiz', position='Owner', source='direct', lead_score=25, status='new', assigned_to=4),
        Contact(name='Tech Giants Inc', email='contact@techgiants.com', phone='+1-555-456-7890',
                company='TechGiants', position='CTO', source='website', lead_score=78, status='contacted', assigned_to=2),
    ]
    db.session.add_all(contacts)
    db.session.commit()
    
    # Create deals in different pipeline stages
    deals = [
        Deal(title='Enterprise License Agreement', amount=250000, stage='negotiation', probability=70,
             expected_close_date=datetime.now() + timedelta(days=15), contact_id=1, assigned_to=2),
        Deal(title='Cloud Migration Services', amount=500000, stage='proposal', probability=50,
             expected_close_date=datetime.now() + timedelta(days=30), contact_id=2, assigned_to=2),
        Deal(title='SaaS Platform Subscription', amount=150000, stage='contacted', probability=30,
             expected_close_date=datetime.now() + timedelta(days=45), contact_id=3, assigned_to=3),
        Deal(title='Content Delivery Network', amount=75000, stage='qualified', probability=40,
             expected_close_date=datetime.now() + timedelta(days=20), contact_id=4, assigned_to=2),
        Deal(title='Analytics Platform', amount=180000, stage='negotiation', probability=65,
             expected_close_date=datetime.now() + timedelta(days=10), contact_id=5, assigned_to=3),
        Deal(title='Consulting Services', amount=25000, stage='lead', probability=20,
             expected_close_date=datetime.now() + timedelta(days=60), contact_id=6, assigned_to=4),
        Deal(title='Software Implementation', amount=45000, stage='proposal', probability=55,
             expected_close_date=datetime.now() + timedelta(days=25), contact_id=7, assigned_to=4),
        Deal(title='Custom Development', amount=120000, stage='closed_won', probability=100,
             expected_close_date=datetime.now() - timedelta(days=5), contact_id=8, assigned_to=2),
    ]
    db.session.add_all(deals)
    db.session.commit()
    
    # Create activities and tasks
    activities = [
        Activity(type='call', subject='Initial Discovery Call', 
                description='Discussed requirements and timeline with IT director', completed=True,
                due_date=datetime.now() - timedelta(days=2), contact_id=1, deal_id=1, created_by=2),
        Activity(type='email', subject='Sent Proposal Document', 
                description='Proposal sent for enterprise license review', completed=False,
                due_date=datetime.now() + timedelta(days=1), contact_id=2, deal_id=2, created_by=2),
        Activity(type='meeting', subject='Product Demo', 
                description='Demo scheduled with technical team', completed=False,
                due_date=datetime.now() + timedelta(days=3), contact_id=3, deal_id=3, created_by=3),
        Activity(type='task', subject='Follow-up Call', 
                description='Call to discuss pricing and terms', completed=False,
                due_date=datetime.now() + timedelta(days=2), contact_id=1, deal_id=1, created_by=2),
        Activity(type='email', subject='Contract Review', 
                description='Send contract for final signature', completed=False,
                due_date=datetime.now() + timedelta(days=4), contact_id=5, deal_id=5, created_by=3),
        Activity(type='call', subject='Implementation Planning', 
                description='Discuss implementation timeline', completed=True,
                due_date=datetime.now() - timedelta(days=1), contact_id=8, deal_id=8, created_by=2),
        Activity(type='task', subject='Research Competitors', 
                description='Gather competitive intelligence for proposal', completed=False,
                due_date=datetime.now() + timedelta(days=5), contact_id=2, deal_id=2, created_by=2),
        Activity(type='meeting', subject='Executive Presentation', 
                description='Present solution to C-level executives', completed=False,
                due_date=datetime.now() + timedelta(days=7), contact_id=1, deal_id=1, created_by=2),
    ]
    db.session.add_all(activities)
    db.session.commit()
    
    # Create email logs
    emails = [
        EmailLog(to_email='enterprise@microsoft.com', subject='Introduction - Enterprise Solutions',
                body='Dear Microsoft team,\n\nWe would like to introduce our enterprise solutions...', contact_id=1, sent_by=2),
        EmailLog(to_email='partners@google.com', subject='Partnership Opportunity',
                body='Dear Google team,\n\nWe have a strategic partnership proposal...', contact_id=2, sent_by=2),
        EmailLog(to_email='enterprise@aws.com', subject='AWS Integration Proposal',
                body='Dear AWS team,\n\nProposal for platform integration attached...', contact_id=3, sent_by=3),
    ]
    db.session.add_all(emails)
    db.session.commit()
    
    # Create notes for communication history
    notes = [
        Note(content='Initial contact made via website. Sent introductory email.', contact_id=1, created_by=2),
        Note(content='Follow-up call scheduled for next week. Client very interested.', contact_id=1, created_by=2),
        Note(content='Discussed pricing options. Need to prepare custom quote.', contact_id=2, created_by=2),
        Note(content='Product demo went well. Technical team impressed.', contact_id=3, created_by=3),
        Note(content='Contract sent for signature. Waiting for final approval.', contact_id=5, created_by=3),
    ]
    db.session.add_all(notes)
    db.session.commit()
    
    print("=" * 60)
    print("✅ SAMPLE DATA LOADED SUCCESSFULLY!")
    print("=" * 60)
    print("\n📊 DATA STATISTICS:")
    print(f"   👥 Users: {len(users)}")
    print(f"   📞 Contacts: {len(contacts)}")
    print(f"   💼 Deals: {len(deals)}")
    print(f"   ✅ Activities: {len(activities)}")
    print(f"   📧 Emails: {len(emails)}")
    print(f"   📝 Notes: {len(notes)}")
    print("\n🔑 LOGIN CREDENTIALS:")
    print("   Admin:  admin@crm.com / admin123")
    print("   Sales:  john@crm.com / sales123")
    print("   Manager: jane@crm.com / manager123")
    print("\n🤖 AUTOMATION FEATURES:")
    print("   ✅ Lead Scoring (0-100 based on email, position, company, source)")
    print("   ✅ Auto Task Creation for high-value leads (score >= 70)")
    print("   ✅ Auto Email Logging for proposals")
    print("   ✅ Stage-based Probability Updates")
    print("   ✅ Follow-up Task Creation")
    print("=" * 60)