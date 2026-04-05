# 🚀 Complete CRM System with Business Automation

A production-ready CRM platform inspired by Creatio, featuring intelligent lead scoring, automated workflows, and comprehensive sales pipeline management.

## ✨ Features Implemented

### Core CRM Features
- ✅ **Leads Management** - Create, track, and score leads automatically
- ✅ **Contacts & Accounts** - Centralized customer database with communication history
- ✅ **Deals Pipeline** - Kanban board with drag-drop stage management
- ✅ **Task & Activity Management** - Track calls, emails, meetings, and tasks
- ✅ **Email Tracking** - Log all communications with auto-follow-up tasks
- ✅ **Dashboard & Reports** - Real-time KPIs, charts, and analytics
- ✅ **User Roles & Permissions** - Admin, Sales, Manager roles with access control
- ✅ **Notes & Communication History** - Complete interaction timeline

### 🤖 Business Automation Workflows
1. **Intelligent Lead Scoring Engine**
   - Scores leads 0-100 based on email domain, position, company, source
   - Business emails score higher than personal
   - C-level positions get priority scoring
   
2. **Auto Task Creation**
   - High-value leads (70+ score) auto-create follow-up tasks
   - New deals auto-create planning tasks
   - Stage changes create activity logs

3. **Smart Deal Management**
   - Probability auto-updates with stage changes
   - Email notifications on proposal stage
   - Celebration tasks for closed-won deals

4. **Email Automation**
   - Auto-log all sent emails
   - Optional follow-up task creation
   - Proposal stage triggers auto-email

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Flask (Python) |
| Database | SQLite (production-ready for PostgreSQL/MySQL) |
| Authentication | JWT tokens |
| Charts | Recharts |
| Icons | Heroicons |

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
# Clone repository
git clone https://github.com/yourusername/crm-system.git
cd crm-system/backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Seed sample data
python seed.py

# Start backend server
python app.py