import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useDarkMode } from '../hooks/useDarkMode';
import './Layout.css';

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [darkMode, toggleDarkMode] = useDarkMode();

  const handleLogout = () => {
    dispatch(logout());
    navigate(user?.role === 'manager' ? '/manager/login' : '/employee/login');
  };

  const isEmployee = user?.role === 'employee';
  const isManager = user?.role === 'manager';

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <h2>Attendance System</h2>
          </div>
          <div className="nav-links">
            {isEmployee && (
              <>
                <Link
                  to="/employee/dashboard"
                  className={location.pathname === '/employee/dashboard' ? 'active' : ''}
                >
                  Dashboard
                </Link>
                <Link
                  to="/employee/mark-attendance"
                  className={location.pathname === '/employee/mark-attendance' ? 'active' : ''}
                >
                  Mark Attendance
                </Link>
                <Link
                  to="/employee/history"
                  className={location.pathname === '/employee/history' ? 'active' : ''}
                >
                  History
                </Link>
                <Link
                  to="/employee/profile"
                  className={location.pathname === '/employee/profile' ? 'active' : ''}
                >
                  Profile
                </Link>
              </>
            )}
            {isManager && (
              <>
                <Link
                  to="/manager/dashboard"
                  className={location.pathname === '/manager/dashboard' ? 'active' : ''}
                >
                  Dashboard
                </Link>
                <Link
                  to="/manager/attendance"
                  className={location.pathname === '/manager/attendance' ? 'active' : ''}
                >
                  All Attendance
                </Link>
                <Link
                  to="/manager/calendar"
                  className={location.pathname === '/manager/calendar' ? 'active' : ''}
                >
                  Calendar
                </Link>
                <Link
                  to="/manager/reports"
                  className={location.pathname === '/manager/reports' ? 'active' : ''}
                >
                  Reports
                </Link>
              </>
            )}
            <div className="user-info">
              <button
                onClick={toggleDarkMode}
                className="dark-mode-toggle"
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              <span>{user?.name}</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;

