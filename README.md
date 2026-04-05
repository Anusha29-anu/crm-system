# 🚀 Complete CRM System with Business Automation

<div align="center">

![CRM System Banner](https://img.shields.io/badge/CRM-Business%20Automation-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14.2.0-black?style=flat-square&logo=next.js)
![Flask](https://img.shields.io/badge/Flask-2.3.3-black?style=flat-square&logo=flask)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.0-38B2AC?style=flat-square&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)

**A production-ready CRM platform inspired by Creatio, featuring intelligent lead scoring, automated workflows, and comprehensive sales pipeline management.**

[📹 Demo Video](#-demo-video) • [🚀 Quick Start](#-quick-start) • [📸 Screenshots](#-screenshots) • [🤖 Automation](#-automation-features)

</div>

---

## 📋 Table of Contents
- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Quick Start](#-quick-start)
- [Demo Video](#-demo-video)
- [Screenshots](#-screenshots)
- [Automation Features](#-automation-features)
- [API Endpoints](#-api-endpoints)
- [Project Structure](#-project-structure)
- [Troubleshooting](#-troubleshooting)
- [Future Enhancements](#-future-enhancements)

---

## 📖 Overview

This CRM system is a complete business automation platform that helps organizations manage their sales pipeline, track leads with intelligent scoring, automate follow-up tasks, and monitor business performance through real-time analytics.

**Built for the task requirement:** CRM System Development inspired by Creatio and modern Business CRM platforms.

### Key Achievements:
- ✅ **12+ Core CRM Features** implemented
- ✅ **4 Business Automation Rules** built-in
- ✅ **Fully Responsive** across all devices
- ✅ **Production-Ready Code** with TypeScript
- ✅ **Real-time Dashboard** with interactive charts

---

## ✨ Features

### Core CRM Features

| Feature | Status | Description |
|---------|--------|-------------|
| **Leads Management** | ✅ | Create, track, and score leads automatically |
| **Contacts & Accounts** | ✅ | Centralized customer database with notes |
| **Deals Pipeline** | ✅ | Kanban board with stage management |
| **Task Management** | ✅ | Track calls, emails, meetings, tasks |
| **Email Tracking** | ✅ | Auto-log all communications |
| **Dashboard** | ✅ | Real-time KPIs and charts |
| **Reports** | ✅ | Business analytics and insights |
| **User Roles** | ✅ | Admin, Sales, Manager roles |
| **Notes History** | ✅ | Complete communication timeline |
| **Responsive Design** | ✅ | Mobile, Tablet, Desktop |
| **Dark Mode Ready** | ✅ | Tailwind CSS ready |
| **Real-time Stats** | ✅ | Live data updates |

### 🤖 Business Automation Rules

| Automation | Trigger | Action |
|------------|---------|--------|
| **Lead Scoring** | Contact creation | Scores 0-100 based on 5+ parameters |
| **Auto Tasks** | High-value leads (70+) | Creates follow-up task automatically |
| **Smart Deals** | Stage changes | Updates probability (20% → 100%) |
| **Email Logging** | Email sent | Auto-logs with follow-up option |

---

## 🛠️ Technology Stack

### Frontend

crm-system/
├── backend/
│   ├── app.py              # Flask application
│   ├── models.py           # Database models
│   ├── seed.py             # Sample data
│   ├── requirements.txt    # Python dependencies
│   └── crm.db              # SQLite database
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx      # Root layout
│   │   ├── globals.css     # Global styles
│   │   ├── login/
│   │   │   └── page.tsx    # Login page
│   │   ├── dashboard/
│   │   │   └── page.tsx    # Dashboard
│   │   ├── contacts/
│   │   │   └── page.tsx    # Contacts
│   │   ├── deals/
│   │   │   └── page.tsx    # Deals pipeline
│   │   ├── activities/
│   │   │   └── page.tsx    # Activities
│   │   ├── reports/
│   │   │   └── page.tsx    # Reports
│   │   └── emails/
│   │       └── page.tsx    # Email tracking
│   │
│   ├── components/
│   │   └── Layout.tsx      # Main layout
│   │
│   ├── lib/
│   │   └── api.ts          # API client
│   │
│   ├── package.json        # Node dependencies
│   └── tailwind.config.js  # Tailwind config
│
├── screenshots/            # Screenshots for README
└── README.md               # This file

Test the Connection

# Test backend API
curl http://localhost:5000/api/test

# Expected response:
# {"message":"Backend is running!","status":"ok"}

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@crm.com","password":"admin123"}'

# Expected response:
# {"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...","user":{"id":1,"name":"Admin User","email":"admin@crm.com","role":"admin"}}

Terminal 1 - Backend:

cd backend
venv\Scripts\activate  # Windows
# OR
source venv/bin/activate  # Mac/Linux
python app.py

Terminal 2 - Frontend:

cd frontend
npm run dev


## 📹 Demo Video

Watch the full demo here: [https://www.loom.com/share/b6dd70a7cb7c4b31bd824cf6782b2cbf]

[![Demo Video](https://www.loom.com/share/b6dd70a7cb7c4b31bd824cf6782b2cbf)]
