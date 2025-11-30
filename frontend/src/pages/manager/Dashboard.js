import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTodayStatusAll } from '../../store/slices/attendanceSlice';
import api from '../../utils/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const ManagerDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { todayStatusAll } = useSelector((state) => state.attendance);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(getTodayStatusAll());
    fetchDashboardData();
  }, [dispatch]);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/manager');
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
    <div className="manager-dashboard">
      <h1>Welcome, {user?.name}!</h1>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Employees</h3>
          <p className="stat-number">{dashboardData?.totalEmployees || 0}</p>
        </div>
        <div className="stat-card present">
          <h3>Present Today</h3>
          <p className="stat-number">{dashboardData?.todayStats?.present || 0}</p>
        </div>
        <div className="stat-card absent">
          <h3>Absent Today</h3>
          <p className="stat-number">{dashboardData?.todayStats?.absent || 0}</p>
        </div>
        <div className="stat-card late">
          <h3>Late Today</h3>
          <p className="stat-number">{dashboardData?.todayStats?.late || 0}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <h2>Weekly Attendance Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData?.weeklyTrend || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="present" stroke="#28a745" name="Present" />
              <Line type="monotone" dataKey="absent" stroke="#dc3545" name="Absent" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Department-wise Attendance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData?.departmentStats || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="#28a745" name="Present" />
              <Bar dataKey="absent" fill="#dc3545" name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Absent Employees Today */}
      <div className="dashboard-card">
        <h2>Absent Employees Today</h2>
        {dashboardData?.absentEmployeesToday?.length > 0 ? (
          <div className="employees-list">
            {dashboardData.absentEmployeesToday.map((emp) => (
              <div key={emp.id} className="employee-item">
                <div className="employee-info">
                  <strong>{emp.name}</strong>
                  <span>{emp.employeeId}</span>
                  <span>{emp.department}</span>
                </div>
                <span className="status-badge absent">Absent</span>
              </div>
            ))}
          </div>
        ) : (
          <p>All employees are present today!</p>
        )}
      </div>

      {/* Present Employees Today */}
      <div className="dashboard-card">
        <h2>Present Employees Today</h2>
        {todayStatusAll?.presentEmployees?.length > 0 ? (
          <div className="employees-list">
            {todayStatusAll.presentEmployees.map((emp, index) => (
              <div key={index} className="employee-item">
                <div className="employee-info">
                  <strong>{emp.name}</strong>
                  <span>{emp.employeeId}</span>
                  <span>{emp.department}</span>
                </div>
                <div className="employee-status">
                  <span className={`status-badge ${emp.status}`}>{emp.status}</span>
                  {emp.checkInTime && (
                    <span className="check-in-time">
                      Checked in: {new Date(emp.checkInTime).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No employees checked in yet.</p>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;

