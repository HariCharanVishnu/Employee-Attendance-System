# Employee Attendance System

A comprehensive attendance tracking system with role-based access for employees and managers.

## Tech Stack

- **Frontend**: React + Redux Toolkit
- **Backend**: Node.js + Express
- **Database**: MongoDB

## Features

### Employee Features
- Register/Login
- Mark attendance (Check In / Check Out)
- View attendance history (calendar or table view)
- View monthly summary (Present/Absent/Late days)
- Dashboard with stats

### Manager Features
- Login
- View all employees attendance
- Filter by employee, date, status
- View team attendance summary
- Export attendance reports (CSV)
- Dashboard with team stats
- Team calendar view

## Project Structure

```
Task2/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Attendance.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── attendance.js
│   │   └── dashboard.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── employee/
│   │   │   └── manager/
│   │   ├── store/
│   │   └── utils/
│   └── package.json
└── README.md
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/attendance-system
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

4. Make sure MongoDB is running on your system

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory (optional):
```
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Attendance (Employee)
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `GET /api/attendance/my-history` - Get my attendance history
- `GET /api/attendance/my-summary` - Get monthly summary
- `GET /api/attendance/today` - Get today's status

### Attendance (Manager)
- `GET /api/attendance/all` - Get all employees attendance
- `GET /api/attendance/employee/:id` - Get specific employee attendance
- `GET /api/attendance/summary` - Get team summary
- `GET /api/attendance/export` - Export CSV
- `GET /api/attendance/today-status` - Get today's status for all employees

### Dashboard
- `GET /api/dashboard/employee` - Get employee dashboard stats
- `GET /api/dashboard/manager` - Get manager dashboard stats

## Database Schema

### Users
- id
- name
- email
- password (hashed)
- role (employee/manager)
- employeeId (unique, e.g., EMP001)
- department
- createdAt

### Attendance
- id
- userId
- date
- checkInTime
- checkOutTime
- status (present/absent/late/half-day)
- totalHours
- createdAt

## Usage

1. **Register as Employee**: Go to `/employee/register` and create an account
2. **Register as Manager**: Use the backend API or create a manager account with role 'manager'
3. **Employee Login**: Go to `/employee/login`
4. **Manager Login**: Go to `/manager/login`

## Notes

- Employees are automatically assigned an employee ID (EMP001, EMP002, etc.)
- Check-in before 9:00 AM is marked as "present", after 9:00 AM is marked as "late"
- Working less than 4 hours is marked as "half-day"
- All passwords are hashed using bcrypt
- JWT tokens are used for authentication

