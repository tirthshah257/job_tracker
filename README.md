# 🎓 College Job Tracker System

A modern, full-stack **College Job Tracker & Campus Placement Management System** developed with the **MERN** stack (MongoDB, Express.js, React.js, Node.js) and styled using **Tailwind CSS**.

The system streamlines campus recruitment drives for college placement cells by providing dedicated portals for **Placement Administrators** and **Students**.

---

## 🚀 Key Features

### 🔑 Placement Admin Portal
- **Secure Admin Authentication:** Protected JWT-based access with role verification.
- **Company Management:** Add, edit, list, and cascade-delete recruiting companies with logos, website URLs, and descriptions.
- **Job Posting & Eligibility Engine:** Create job positions with criteria including:
  - Minimum required CGPA
  - Eligible branch filters (CSE, IT, ECE, EE, ME, CE, AI/ML, etc.)
  - CTC / Package details
  - Application deadlines
  - Recruitment rounds & process description
  - Drive status (`Upcoming`, `Open`, `Closed`)
- **Multi-PDF Preparation Materials:** Upload and organize syllabus guides, aptitude practice sets, recruitment guidelines, and interview questions.
- **Application Review & Pipeline Tracker:** Inspect applied student profiles, review academic performance, view/download PDF resumes, and update candidate stages (`Applied` ➔ `Shortlisted` ➔ `Interview` ➔ `Selected` ➔ `Rejected`).
- **Placement Results Publication:** Record selected students per job drive and publish official results visible to students.
- **Drive Announcements:** Post real-time schedule announcements, test links, and postponement notices.

### 🎓 Student Portal
- **Student Registration & Profile:** Sign up with name, email, roll number, phone, branch, semester, graduation year, CGPA, and resume PDF upload.
- **Clean Dashboard:** Overview of open job opportunities, participating companies, recent personal applications, and the latest drive updates.
- **Company & Job Catalog:** Search companies, view active roles, CTC, eligibility criteria, and process.
- **Smart Application System:** Validates minimum CGPA and eligible branches before submission; prevents duplicate applications and submissions after deadlines.
- **Application Status Tracking:** Track your progress across recruitment rounds in real-time with color-coded status badges.
- **Study Materials Library:** View and download company-specific preparation guides and PDF resources.
- **Placement Results:** View official selected candidate lists for published drives.
- **Profile Management:** Edit contact and academic details and upload an updated resume.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React.js (Vite), Tailwind CSS, React Router v7, React Hot Toast, React Icons, Axios |
| **Backend** | Node.js, Express.js (REST APIs, MVC Architecture), Multer |
| **Database** | MongoDB with Mongoose ODM |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs password hashing |
| **Storage** | Local disk storage with static serving for resumes, study PDFs, and company logos |

---

## 📂 Project Structure

```
job tracker/
├── package.json               # Root scripts for running server & client
├── .gitignore                 # Git ignore rules for node_modules, .env, uploads
├── README.md                  # Project documentation
├── server/
│   ├── .env.example           # Example environment variables
│   ├── server.js              # Express app entry point
│   ├── seed.js                # Database seed script for admin account
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── models/                # User, Company, Job, Material, Application, Announcement, PlacementResult
│   ├── middleware/            # JWT auth, role guard, Multer upload, global error handler
│   ├── controllers/           # Auth, Company, Job, Material, Application, Announcement, Result
│   ├── routes/                # REST API routes
│   └── uploads/               # Stored logos, student resumes, and study materials
└── client/
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── api/axios.js       # Axios instance with interceptors
        ├── context/           # AuthContext (state, rehydration, login/register/logout)
        ├── components/
        │   ├── common/        # Button, Modal, ConfirmDialog, StatusBadge, Loader, EmptyState
        │   ├── layout/        # AdminLayout (Sidebar), StudentLayout (Navbar)
        │   └── forms/         # CompanyForm, JobForm, MaterialForm, AnnouncementForm, ResultForm
        └── pages/
            ├── auth/          # Login, Register
            ├── admin/         # Dashboard, Companies, Jobs, Materials, Applications, Results, Announcements
            └── student/       # Dashboard, Companies, CompanyDetail, MyApplications, Results, Announcements, Profile
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/tirthshah257/job_tracker.git
cd job_tracker
```

### 2. Configure Backend Environment
Navigate to the `server/` directory and configure `.env`:
```bash
cd server
copy .env.example .env
```
Fill in your configuration:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

### 3. Install Dependencies

**Server:**
```bash
cd server
npm install
```

**Client:**
```bash
cd ../client
npm install
```

### 4. Seed Default Admin User
```bash
cd ../server
npm run seed
```
This creates the default administrator:
- **Email:** `admin@college.com`
- **Password:** `admin123`

---

## 🏃 Running the Application

### Start Backend Server (Port 5000)
```bash
cd server
npm run dev
```

### Start Frontend Client (Port 5173)
```bash
cd client
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## 📡 API Reference

### Authentication & Users
- `POST /api/auth/register` — Register a student with resume PDF
- `POST /api/auth/login` — Sign in as admin or student
- `GET /api/auth/me` — Get current logged-in user details
- `PUT /api/auth/profile` — Update student profile & upload new resume

### Companies & Jobs
- `GET /api/companies` — List all recruiting companies
- `POST /api/companies` — Add new company with logo (Admin)
- `PUT /api/companies/:id` — Update company details (Admin)
- `DELETE /api/companies/:id` — Cascade delete company and related jobs/materials (Admin)
- `GET /api/jobs` — List jobs (supports `?company=` and `?status=`)
- `POST /api/jobs` — Post a new job position (Admin)
- `PUT /api/jobs/:id` — Edit job opening (Admin)
- `DELETE /api/jobs/:id` — Delete job (Admin)

### Materials (PDFs)
- `GET /api/materials` — List all preparation materials
- `POST /api/materials` — Upload multiple PDF study guides (Admin)
- `GET /api/materials/download/:id` — Stream and download PDF file
- `DELETE /api/materials/:id` — Delete document from server (Admin)

### Applications
- `POST /api/applications` — Apply for a job (Validates CGPA, Branch, Deadline, Duplicate)
- `GET /api/applications/my` — Get logged-in student's applications
- `GET /api/applications/job/:jobId` — Get applicants for a job (Admin)
- `PUT /api/applications/:id` — Update candidate status in pipeline (Admin)

### Results & Announcements
- `GET /api/results` — View placement results (Students see published only)
- `POST /api/results` — Record selected candidates (Admin)
- `PUT /api/results/:id` — Publish/unpublish or update result (Admin)
- `DELETE /api/results/:id` — Delete placement result (Admin)
- `GET /api/announcements` — View drive updates and announcements
- `POST /api/announcements` — Publish an announcement (Admin)
- `DELETE /api/announcements/:id` — Delete an announcement (Admin)

---

## 📄 License
This project is licensed under the ISC License.
