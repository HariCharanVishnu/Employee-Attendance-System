import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getTodayStatus } from '../../store/slices/attendanceSlice';
import api from '../../utils/api';
import './Dashboard.css';

const EmployeeDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { todayStatus } = useSelector((state) => state.attendance);
  const [dashboardData, setDashboardData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    dispatch(getTodayStatus());
    fetchDashboardData();
  }, [dispatch]);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/employee');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Welcome, {user?.name}!</h1>

      {/* Today's Status Card */}
      <div className="dashboard-card today-status">
        <h2>Today's Status</h2>
        <div className="status-info">
          <div className={`status-badge ${dashboardData?.todayStatus?.status || 'absent'}`}>
            {dashboardData?.todayStatus?.isCheckedIn
              ? dashboardData?.todayStatus?.isCheckedOut
                ? 'Checked Out'
                : 'Checked In'
              : 'Not Checked In'}
          </div>
          {dashboardData?.todayStatus?.checkInTime && (
            <p>Check In: {new Date(dashboardData.todayStatus.checkInTime).toLocaleTimeString()}</p>
          )}
          {dashboardData?.todayStatus?.checkOutTime && (
            <p>Check Out: {new Date(dashboardData.todayStatus.checkOutTime).toLocaleTimeString()}</p>
          )}
        </div>
        <Link to="/employee/mark-attendance" className="btn-primary">
          {dashboardData?.todayStatus?.isCheckedIn && !dashboardData?.todayStatus?.isCheckedOut
            ? 'Check Out'
            : 'Check In'}
        </Link>
      </div>

      {/* Month Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Present</h3>
          <p className="stat-number">{dashboardData?.monthStats?.present || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Absent</h3>
          <p className="stat-number">{dashboardData?.monthStats?.absent || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Late</h3>
          <p className="stat-number">{dashboardData?.monthStats?.late || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Hours</h3>
          <p className="stat-number">{dashboardData?.monthStats?.totalHours || 0}</p>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="dashboard-card">
        <h2>Recent Attendance (Last 7 Days)</h2>
        <div className="attendance-list">
          {dashboardData?.recentAttendance?.length > 0 ? (
            dashboardData.recentAttendance.map((record, index) => (
              <div key={index} className="attendance-item">
                <div className="attendance-date">
                  {new Date(record.date).toLocaleDateString()}
                </div>
                <div className={`attendance-status ${record.status}`}>
                  {record.status}
                </div>
                <div className="attendance-time">
                  {record.checkInTime
                    ? `In: ${new Date(record.checkInTime).toLocaleTimeString()}`
                    : 'Not checked in'}
                  {record.checkOutTime &&
                    ` | Out: ${new Date(record.checkOutTime).toLocaleTimeString()}`}
                </div>
                <div className="attendance-hours">
                  {record.totalHours || 0} hrs
                </div>
              </div>
            ))
          ) : (
            <p>No attendance records found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;

