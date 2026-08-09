# KPMG Case Study - Resource Management System

A full-stack resource management application for managing consultants, projects, tasks, and timesheets. Built with Django (backend) and React + Vite (frontend).

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Features](#features)

## Project Overview

This system is designed for resource management at KPMG, supporting:

- Client and project management
- Consultant allocation and tracking
- Task assignment with deadlines and priority levels
- Timesheet submission with file attachments and approval workflow
- Role-based access control (Project Managers vs Consultants)
- Automated overdue task email notifications via Celery

## Tech Stack

### Backend
- **Django 6.0.7** - Web framework
- **Django REST Framework** - REST API framework
- **SimpleJWT** - JWT authentication
- **Celery** - Distributed task queue
- **Redis** - Message broker and cache backend
- **Django Celery Beat** - Periodic task scheduling
- **DRF Spectacular** - OpenAPI schema generation
- **Django Filters** - Queryset filtering
- **SQLite3** - Database (default for development)

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router 7** - Client-side routing
- **Axios** - HTTP client
- **ESLint** - Code linting

## Prerequisites

Ensure the following are installed on your system:

- **Python** >= 3.10
- **Node.js** >= 18
- **npm** (comes with Node.js) or **yarn**
- **Redis** >= 6.0 (for Celery broker and caching)

### Installing Redis (macOS)

```bash
brew install redis
```

### Installing Redis (Linux)

```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# Fedora
sudo dnf install redis
```

## Backend Setup

### 1. Navigate to the Backend Directory

```bash
cd backend
```

### 2. Create and Activate a Virtual Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate (macOS/Linux)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate
```

### 3. Install Python Dependencies

```bash
pip install django==6.0.7
pip install djangorestframework
pip install djangorestframework-simplejwt
pip install django-cors-headers
pip install django-filter
pip install django-celery-beat
pip install django-redis
pip install drf-spectacular
pip install celery
pip install redis
```

Alternatively, create a `requirements.txt` file in the `backend` directory with:

```
Django==6.0.7
djangorestframework>=3.15.0
djangorestframework-simplejwt>=5.3.0
django-cors-headers>=4.6.0
django-filter>=24.3.0
django-celery-beat>=2.7.0
django-redis>=5.4.0
drf-spectacular>=0.27.0
celery>=5.4.0
redis>=5.2.0
```

Then install with:

```bash
pip install -r requirements.txt
```

### 4. Apply Database Migrations

```bash
python manage.py migrate
```

### 5. Create a Superuser (Admin Account)

```bash
python manage.py createsuperuser
```

Follow the prompts to set a username, email, and password.

### 6. Start Redis Server

Ensure Redis is running before starting Celery:

```bash
# macOS (Homebrew)
brew services start redis

# Or run directly
redis-server
```

Verify Redis is running:

```bash
redis-cli ping
# Should return: PONG
```

### 7. Start Celery Worker (for Background Tasks)

In a **new terminal** window, with the virtual environment activated:

```bash
cd backend
source venv/bin/activate
celery -A config worker -l info
```

### 8. Start Celery Beat Scheduler (for Periodic Tasks)

In **another terminal** window, with the virtual environment activated:

```bash
cd backend
source venv/bin/activate
celery -A config beat -l info
```

Note: The `check_overdue_tasks` periodic task can be configured via Django Admin under **Periodic Tasks** after starting Django.

### 9. Start Django Development Server

```bash
python manage.py runserver
```

The backend API will be available at: `http://localhost:8000`

## Frontend Setup

### 1. Navigate to the Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm run dev
```

The frontend application will be available at: `http://localhost:5173`

## Running the Application

You need **four terminal windows** running simultaneously for the full stack:

| Terminal | Service | Command (from project root) |
|----------|---------|-----------------------------|
| 1 | Redis | `redis-server` |
| 2 | Django Backend | `cd backend && source venv/bin/activate && python manage.py runserver` |
| 3 | Celery Worker | `cd backend && source venv/bin/activate && celery -A config worker -l info` |
| 4 | Celery Beat | `cd backend && source venv/bin/activate && celery -A config beat -l info` |
| 5 | React Frontend | `cd frontend && npm run dev` |

### Quick Start (Once Everything is Set Up)

```bash
# Terminal 1: Redis
redis-server

# Terminal 2: Django
cd backend && source venv/bin/activate && python manage.py runserver

# Terminal 3: Celery Worker
cd backend && source venv/bin/activate && celery -A config worker -l info

# Terminal 4: Celery Beat
cd backend && source venv/bin/activate && celery -A config beat -l info

# Terminal 5: Frontend
cd frontend && npm run dev
```

Then open `http://localhost:5173` in your browser.

## API Documentation

Once the Django backend is running, the following documentation endpoints are available:

| Documentation | URL |
|---------------|-----|
| Swagger UI | `http://localhost:8000/api/swagger/` |
| ReDoc | `http://localhost:8000/api/redoc/` |
| OpenAPI Schema (JSON) | `http://localhost:8000/api/schema/` |
| Django Admin | `http://localhost:8000/admin/` |

### Authentication

The API uses JWT (JSON Web Token) authentication:

- **Obtain Token**: `POST /api/token/` (with `username` and `password`)
- **Refresh Token**: `POST /api/token/refresh/`

Include the access token in API requests as:
```
Authorization: Bearer <access_token>
```

## Project Structure

```
kpmg-case-study/
├── backend/
│   ├── config/                     # Django project settings
│   │   ├── __init__.py
│   │   ├── settings.py             # Main settings
│   │   ├── urls.py                 # URL routing
│   │   ├── celery.py               # Celery configuration
│   │   ├── asgi.py
│   │   └── wsgi.py
│   ├── resource_management/        # Main Django app
│   │   ├── models.py               # Data models
│   │   ├── views.py                # API views
│   │   ├── serializers.py          # DRF serializers
│   │   ├── urls.py                 # App URLs
│   │   ├── admin.py                # Admin registration
│   │   ├── permissions.py          # Custom permissions
│   │   ├── tasks.py                # Celery tasks
│   │   ├── tests.py
│   │   └── migrations/             # Database migrations
│   ├── media/                      # Uploaded files (timesheets)
│   ├── db.sqlite3                  # SQLite database
│   └── manage.py                   # Django management script
├── frontend/
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── Badge.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── pages/                  # Page components
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── ClientsPage.jsx
│   │   │   ├── ConsultantsPage.jsx
│   │   │   ├── ProjectsPage.jsx
│   │   │   ├── TasksPage.jsx
│   │   │   ├── TimesheetPage.jsx
│   │   │   └── SubmitTimesheet.jsx
│   │   ├── App.jsx                 # Main app component
│   │   ├── AuthContext.jsx         # Auth state provider
│   │   ├── ThemeContext.jsx        # Theme provider
│   │   ├── ProtectedRoute.jsx      # Auth-guarded routes
│   │   ├── RoleRoute.jsx           # Role-based route guard
│   │   ├── api.js                  # Axios API client
│   │   ├── main.jsx                # React entry point
│   │   ├── index.css
│   │   └── App.css
│   ├── public/                     # Static assets
│   ├── index.html
│   ├── vite.config.js
│   ├── eslint.config.js
│   ├── package.json
│   └── package-lock.json
└── README.md
```

## Features

### Core Entities

- **Clients**: Represents client organizations with industry classification
- **Projects**: Projects assigned to clients, managed by Project Managers
- **Consultants**: Staff members with titles (Developer, Tester, Analyst, etc.), capacity, and project assignments
- **Tasks**: Work items assigned to consultants within projects, with priority and deadlines
- **Timesheets**: Hourly work logs per consultant, per project, per date, with approval workflow

### User Roles

1. **Project Manager**: Can create/manage clients, projects, tasks, and approve/reject timesheets
2. **Consultant**: Can view assigned tasks/projects and submit timesheets

### Automated Features

- **Overdue Task Notifications**: A periodic Celery task checks for overdue tasks and sends email notifications to both the assigned consultant and the project manager

### Frontend Pages

- Login
- Dashboard (overview)
- Profile Management
- Clients (CRUD)
- Consultants (CRUD)
- Projects (CRUD)
- Tasks (CRUD with status tracking)
- Timesheets (view/submit/approve)
