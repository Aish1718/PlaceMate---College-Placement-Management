# placeMate - College Placement Management System

A comprehensive full-stack web application for managing college placement processes, connecting students, placement coordinators, college management, and company recruiters in a transparent, efficient, and data-driven digital platform.

## 🎯 Overview

placeMate streamlines the entire placement process from job postings to final placements. It provides role-based dashboards, automated workflows, and powerful analytics to help colleges manage their placement activities effectively.

## ✨ Key Features

### For Students
- **Job Discovery**: Browse and search available job postings with filters
- **Application Management**: Apply to jobs, track application status, and manage cover letters
- **Resume Management**: Upload, update, and manage resumes and academic documents
- **ATS Resume Analyzer**: Get instant feedback on resume quality with scores and keyword analysis
- **Job Recommendations**: Receive personalized job recommendations based on skills and department
- **Campus Events**: View and register for campus events and workshops
- **Recruitment Drives**: View approved recruitment drives from companies
- **Notifications**: Real-time notifications for application updates and announcements

### For Placement Coordinators
- **User Management**: Approve/reject new user registrations (students, companies)
- **Job Approval**: Review and approve job postings from companies
- **Application Oversight**: View all applications across all jobs
- **Recruitment Drive Management**: Create, approve, and manage recruitment drives
- **Campus Event Management**: Create, approve, and manage campus events
- **Mass Announcements**: Send notifications to all students, companies, or all users
- **Analytics Dashboard**: View comprehensive statistics and insights

### For College Management
- **Analytics & Reports**: View detailed analytics with charts and graphs
- **User Approval**: Approve/reject new user registrations
- **Data Export**: Export placement reports and student data as CSV
- **Overview Dashboard**: High-level view of placement activities

### For Companies/Recruiters
- **Job Posting**: Create and manage job postings
- **Application Review**: Review student applications, download resumes
- **Interview Scheduling**: Schedule interviews with date, time, and location
- **Application Management**: Shortlist, reject, or make offers to candidates
- **Recruitment Drives**: Create and manage recruitment drives (requires approval)
- **Campus Events**: Create and manage campus events (requires approval)
- **Company Dashboard**: View statistics and manage all company activities

## 🛠️ Tech Stack

### Backend
- **Framework**: Django 4.2.7
- **API**: Django REST Framework
- **Authentication**: JWT (JSON Web Tokens) with refresh tokens
- **Database**: SQLite (development) / PostgreSQL (production ready)
- **File Storage**: Local file system for resumes and documents
- **Additional**: django-cors-headers, django-filter, djangorestframework-simplejwt

### Frontend
- **Framework**: React.js
- **UI Library**: Material-UI (MUI)
- **Routing**: React Router
- **HTTP Client**: Axios
- **State Management**: React Context API

## 📋 Prerequisites

- Python 3.9+
- Node.js 14+ and npm
- pip (Python package manager)

## 🚀 Quick Start

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations**
   ```bash
   python manage.py migrate
   ```

5. **Create superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

6. **Create test users (optional)**
   ```bash
   python create_test_users.py
   ```

7. **Run development server**
   ```bash
   python manage.py runserver
   ```

   Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

   Frontend will be available at `http://localhost:3000`

## 📁 Project Structure

```
placeMate/
├── backend/
│   ├── cpms/              # Django project settings
│   ├── users/              # User authentication & management
│   ├── students/           # Student profiles & management
│   ├── companies/          # Company profiles & management
│   ├── jobs/               # Job postings
│   ├── applications/       # Job applications
│   ├── notifications/      # Notification system
│   ├── recruitment_drives/ # Recruitment drive scheduling
│   ├── events/             # Campus event management
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts (Auth)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── App.js
│   └── package.json
│
└── README.md
```

## 🔐 User Roles

1. **Student**: Can apply to jobs, manage profile, view events
2. **Company/Recruiter**: Can post jobs, review applications, schedule interviews
3. **Placement Coordinator**: Can approve users/jobs, manage drives/events, send announcements
4. **College Management**: Can view analytics, export reports, approve users
5. **Admin (Superuser)**: Full access to all features

## 🔑 Test Credentials

After running `create_test_users.py`, you can use these credentials:

### Student
- Username: `student1`
- Password: `student123`

### Company
- Username: `company1`
- Password: `company123`

### Placement Coordinator
- Username: `coordinator1`
- Password: `coordinator123`

### College Management
- Username: `management1`
- Password: `management123`

See `TEST_USERS_CREDENTIALS.md` for complete list.

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login (JWT)
- `POST /api/auth/refresh/` - Refresh JWT token
- `POST /api/auth/change-password/` - Change password

### Students
- `GET /api/students/profiles/` - List student profiles
- `GET /api/students/profiles/me/` - Get current student profile
- `PUT /api/students/profiles/me/` - Update student profile
- `POST /api/students/profiles/upload-resume/` - Upload resume
- `GET /api/students/profiles/recommendations/` - Get job recommendations

### Companies
- `GET /api/companies/` - List companies
- `GET /api/companies/me/` - Get current company profile
- `PUT /api/companies/me/` - Update company profile

### Jobs
- `GET /api/jobs/` - List job postings
- `POST /api/jobs/` - Create job posting
- `GET /api/jobs/{id}/` - Get job details
- `POST /api/jobs/{id}/approve/` - Approve job (coordinator/admin)
- `POST /api/jobs/{id}/reject/` - Reject job (coordinator/admin)

### Applications
- `GET /api/applications/` - List applications
- `POST /api/applications/` - Submit application
- `PATCH /api/applications/{id}/` - Update application status
- `GET /api/applications/{id}/download-resume/` - Download student resume

### Notifications
- `GET /api/notifications/` - List notifications
- `PATCH /api/notifications/{id}/mark-read/` - Mark notification as read
- `POST /api/notifications/send-announcement/` - Send mass announcement

### Recruitment Drives
- `GET /api/recruitment-drives/drives/` - List recruitment drives
- `POST /api/recruitment-drives/drives/` - Create recruitment drive
- `POST /api/recruitment-drives/drives/{id}/approve/` - Approve drive
- `POST /api/recruitment-drives/drives/{id}/reject/` - Reject drive

### Campus Events
- `GET /api/events/events/` - List campus events
- `POST /api/events/events/` - Create campus event
- `POST /api/events/events/{id}/approve/` - Approve event
- `POST /api/events/registrations/` - Register for event

### Dashboard
- `GET /api/dashboard/stats/` - Get dashboard statistics
- `GET /api/dashboard/export/placement/` - Export placement report (CSV)
- `GET /api/dashboard/export/students/` - Export students report (CSV)

## 🧪 Testing

### Backend API Testing
```bash
cd backend
source venv/bin/activate
python test_all_apis.py
```

### Test New APIs (Recruitment Drives & Events)
```bash
cd backend
source venv/bin/activate
python test_new_apis.py
```

## 📝 Key Features Explained

### ATS Resume Analyzer
- Analyzes uploaded resumes and provides:
  - Overall score (0-100)
  - Missing keywords
  - Suggestions for improvement
  - Skills extraction

### Job Recommendation System
- Recommends jobs based on:
  - Student's department
  - Required skills match
  - CGPA requirements
  - Job type preferences

### Approval Workflow
- New users require coordinator/management approval
- Job postings require coordinator approval
- Recruitment drives created by companies require approval
- Campus events created by companies require approval

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Password hashing (Django's default PBKDF2)
- CORS configuration for frontend-backend communication
- File upload validation and secure storage

## 📊 Database Models

- **User**: Custom user model with roles and approval status
- **StudentProfile**: Extended student information
- **Company**: Company profiles
- **JobPosting**: Job listings with requirements
- **Application**: Job applications with status tracking
- **Notification**: System notifications
- **RecruitmentDrive**: Scheduled recruitment events
- **CampusEvent**: Campus events and workshops
- **EventRegistration**: Student event registrations

## 🚧 Development Notes

- Backend uses SQLite for development (easily switchable to PostgreSQL)
- Media files (resumes, documents) stored in `backend/media/`
- Frontend proxy configured for API calls to `http://localhost:8000`
- JWT tokens expire after 60 minutes (configurable)

## 📚 Documentation

- `PROJECT_SUMMARY.md` - Detailed project overview
- `PRESENTATION_GUIDE.md` - Code walkthrough guide (10-15 mins)
- `FEATURES_COMPLETE.md` - Complete feature list
- `TEST_USERS_CREDENTIALS.md` - Test user credentials
- `SETUP.md` - Detailed setup instructions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 👥 Support

For issues, questions, or contributions, please contact the development team.

---


**Built with ❤️ for efficient college placement management**


------backend------

cd backend
python -m venv env
env\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
pip install --upgrade setuptools
pip uninstall setuptools -y
pip install setuptools
python manage.py migrate
python manage.py createsuperuser

<!-- Username: admin1
Email address: admin1@gmail.com
Password:admin123
Password (again): -->
python create_test_users.py
python manage.py runserver