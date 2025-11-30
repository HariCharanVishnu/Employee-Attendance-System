# Setup and Running Instructions

## ✅ Current Status

Both backend and frontend servers should be running:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000

## Quick Start

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies (if not already done):
   ```bash
   npm install
   ```

3. Create `.env` file (if not exists):
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/attendance-system
   JWT_SECRET=your-secret-key-change-this-in-production
   NODE_ENV=development
   ```

4. **Important**: Make sure MongoDB is running on your system
   - If MongoDB is not installed, you can:
     - Install MongoDB Community Edition
     - Or use MongoDB Atlas (cloud) and update MONGODB_URI in .env

5. Start backend:
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies (if not already done):
   ```bash
   npm install
   ```

3. Start frontend:
   ```bash
   npm start
   ```

## Accessing the Application

1. **Employee Registration/Login**: 
   - Open browser to http://localhost:3000
   - Navigate to `/employee/register` to create an account
   - Or `/employee/login` to login

2. **Manager Login**:
   - Navigate to `/manager/login`
   - Note: Managers need to be created via API or database (role: 'manager')

## Creating a Manager Account

You can create a manager account using the API:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Manager Name",
    "email": "manager@example.com",
    "password": "password123",
    "role": "manager",
    "department": "Management"
  }'
```

Or use Postman/Insomnia to make the request.

## Testing the API

### Test Backend Health
```bash
# Check if backend is running
curl http://localhost:5000/api/auth/me
```

### Register Employee
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "department": "Engineering"
  }'
```

## Troubleshooting

### Backend Issues
1. **MongoDB Connection Error**:
   - Ensure MongoDB is running: `mongod` or check MongoDB service
   - Verify connection string in `.env` file
   - For Windows: Check if MongoDB service is running in Services

2. **Port 5000 already in use**:
   - Change PORT in `.env` file
   - Or kill the process using port 5000

### Frontend Issues
1. **Port 3000 already in use**:
   - React will prompt to use another port
   - Or change the port in package.json scripts

2. **API Connection Error**:
   - Verify backend is running on port 5000
   - Check `REACT_APP_API_URL` in frontend `.env` (optional)

## Project Structure

```
Task2/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/     # Auth middleware
│   ├── server.js       # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── store/       # Redux store
│   │   └── utils/       # Utilities
│   └── package.json
└── README.md
```

## Features Available

### Employee Features
- ✅ Register/Login
- ✅ Mark Attendance (Check In/Out)
- ✅ View Attendance History (Calendar & Table)
- ✅ Monthly Summary
- ✅ Dashboard with Stats

### Manager Features
- ✅ Login
- ✅ View All Employees Attendance
- ✅ Filter by Employee, Date, Status
- ✅ Team Summary
- ✅ Export to CSV
- ✅ Dashboard with Charts
- ✅ Team Calendar View

## Next Steps

1. Ensure MongoDB is running
2. Access http://localhost:3000
3. Register as an employee
4. Test the attendance features
5. Create a manager account to test manager features

