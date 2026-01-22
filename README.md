# Face Attendance System

A complete face recognition-based attendance system with real-time face detection, web dashboard, and automatic attendance marking.

## Overview

This system combines FastAPI backend, React frontend, and OpenCV-based face recognition to provide automated attendance tracking. Students are registered with their face encodings, and attendance is automatically marked when their faces are recognized in real-time.

## Features

- **Face Recognition**: Real-time face detection and matching with OpenCV
- **Automatic Attendance**: One-click attendance marking (prevents duplicates per day)
- **Web Dashboard**: Admin and student portals with analytics
- **Live Camera Feed**: Real-time processing with visual feedback (green/red boxes)
- **Analytics**: 30-day attendance trends and student statistics
- **Role-Based Access**: Separate admin and student features
- **JWT Authentication**: Secure token-based authentication
- **MongoDB Storage**: All data including face encodings

## Quick Start

### 1. Backend Setup (Terminal 1)

```powershell
cd backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup (Terminal 2)

```powershell
cd frontend
npm install
npm run dev
```

Open: `http://localhost:5173`

### 3. Face Recognition (Terminal 3)

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python app/face/recognize_camera.py
```

Or double-click: `backend/launch_recognition.bat`

## Setup & Installation

### Prerequisites

- Python 3.8+
- Node.js 16+
- MongoDB (local or cloud)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

Create `.env` file in backend/:

```
MONGO_URI=mongodb://localhost:27017
```

### Frontend

```bash
cd frontend
npm install
```

## How to Use

### Register Students

1. Login to dashboard: `http://localhost:5173`
2. Use admin credentials: `admin@example.com` / `password123`
3. Click "Register New Student"
4. Fill details and capture face via webcam
5. Submit to create account

### Mark Attendance

1. Run face recognition: `python app/face/recognize_camera.py`
2. Stand in front of camera
3. System automatically marks attendance when recognized
4. See green box with Student ID on successful recognition
5. Red box indicates unknown face
6. Press 'q' to quit

### View Attendance (Students & Admins)

1. Login to dashboard
2. Student: View own attendance with filters
3. Admin: View all students with analytics and trends

## Tech Stack

| Layer              | Technology                                    |
| ------------------ | --------------------------------------------- |
| **Backend**        | FastAPI, MongoDB, JWT, face_recognition       |
| **Frontend**       | React 19, Vite, Tailwind CSS, Recharts, Axios |
| **Face Detection** | OpenCV, face_recognition library              |
| **Database**       | MongoDB with face encodings                   |

## Project Structure

```
face-attendance-system/
├── backend/
│   ├── app/
│   │   ├── api/          # REST API endpoints
│   │   ├── attendance/   # Attendance logic
│   │   ├── face/         # Face recognition
│   │   ├── models/       # Database models
│   │   ├── services/     # Business logic
│   │   └── db/           # Database connection
│   ├── recognize_camera.py    # Face recognition app
│   └── launch_recognition.bat # Windows launcher
├── frontend/
│   └── src/
│       ├── pages/        # Dashboard pages
│       ├── components/   # React components
│       └── api/          # API client
└── README.md
```

## API Endpoints

| Method | Endpoint                  | Purpose                  |
| ------ | ------------------------- | ------------------------ |
| POST   | `/auth/login`             | User login               |
| GET    | `/users/me`               | Get current user         |
| POST   | `/users/create`           | Register student (admin) |
| GET    | `/attendance/me`          | Get own records          |
| GET    | `/attendance/all`         | Get all records (admin)  |
| GET    | `/attendance/summary/day` | Daily summary (admin)    |

## Troubleshooting

| Issue                  | Solution                                      |
| ---------------------- | --------------------------------------------- |
| Camera not detected    | Check permissions, try different browser      |
| API connection failed  | Verify backend running on 8000                |
| Attendance not marking | Check MongoDB connection, student registered  |
| Charts not showing     | Clear browser cache, verify data exists       |
| Face not recognized    | Ensure face is clearly visible, good lighting |

## Default Credentials

- **Admin**: Email: `admin@example.com`, Password: `password123`
- **Create students** via admin dashboard

## Key Technical Details

- **Face Tolerance**: 0.45 (Euclidean distance threshold)
- **Processing**: Every 3rd frame for performance optimization
- **Attendance**: Marked once per calendar day per student
- **Frontend Port**: 5173
- **Backend Port**: 8000
- **Database**: MongoDB

---

**Built with FastAPI & React** | Production Ready
