import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from './store/slices/authSlice';

// Employee Pages
import EmployeeLogin from './pages/employee/Login';
import EmployeeRegister from './pages/employee/Register';
import EmployeeDashboard from './pages/employee/Dashboard';
import MarkAttendance from './pages/employee/MarkAttendance';
import AttendanceHistory from './pages/employee/AttendanceHistory';
import EmployeeProfile from './pages/employee/Profile';

// Manager Pages
import ManagerLogin from './pages/manager/Login';
import ManagerDashboard from './pages/manager/Dashboard';
import AllAttendance from './pages/manager/AllAttendance';
import TeamCalendar from './pages/manager/TeamCalendar';
import Reports from './pages/manager/Reports';

// Layout
import Layout from './components/Layout';

function App() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  const PrivateRoute = ({ children, allowedRoles }) => {
    if (!isAuthenticated) {
      return <Navigate to={allowedRoles.includes('manager') ? '/manager/login' : '/employee/login'} />;
    }
    if (!allowedRoles.includes(user?.role)) {
      return <Navigate to={user?.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard'} />;
    }
    return children;
  };

  return (
    <Routes>
      {/* Employee Routes */}
      <Route path="/employee/login" element={<EmployeeLogin />} />
      <Route path="/employee/register" element={<EmployeeRegister />} />
      
      <Route
        path="/employee/*"
        element={
          <PrivateRoute allowedRoles={['employee']}>
            <Layout>
              <Routes>
                <Route path="dashboard" element={<EmployeeDashboard />} />
                <Route path="mark-attendance" element={<MarkAttendance />} />
                <Route path="history" element={<AttendanceHistory />} />
                <Route path="profile" element={<EmployeeProfile />} />
                <Route path="*" element={<Navigate to="/employee/dashboard" />} />
              </Routes>
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Manager Routes */}
      <Route path="/manager/login" element={<ManagerLogin />} />
      
      <Route
        path="/manager/*"
        element={
          <PrivateRoute allowedRoles={['manager']}>
            <Layout>
              <Routes>
                <Route path="dashboard" element={<ManagerDashboard />} />
                <Route path="attendance" element={<AllAttendance />} />
                <Route path="calendar" element={<TeamCalendar />} />
                <Route path="reports" element={<Reports />} />
                <Route path="*" element={<Navigate to="/manager/dashboard" />} />
              </Routes>
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Default Route */}
      <Route path="/" element={<Navigate to={isAuthenticated ? (user?.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard') : '/employee/login'} />} />
    </Routes>
  );
}

export default App;

