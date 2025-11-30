import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { exportAttendance, getAllAttendance } from '../../store/slices/attendanceSlice';
import { format } from 'date-fns';
import './Reports.css';

const Reports = () => {
  const dispatch = useDispatch();
  const [filters, setFilters] = useState({
    employeeId: '',
    startDate: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const result = await dispatch(getAllAttendance(filters)).unwrap();
      setAttendanceData(result.attendance || []);
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await dispatch(exportAttendance(filters)).unwrap();
    } catch (error) {
      console.error('Failed to export:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="reports">
      <h1>Attendance Reports</h1>

      {/* Report Filters */}
      <div className="filters-card">
        <h2>Report Filters</h2>
        <div className="filters-grid">
          <div className="filter-item">
            <label>Employee ID (Optional)</label>
            <input
              type="text"
              name="employeeId"
              value={filters.employeeId}
              onChange={handleFilterChange}
              placeholder="Leave empty for all employees"
            />
          </div>
          <div className="filter-item">
            <label>Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              required
            />
          </div>
          <div className="filter-item">
            <label>End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              required
            />
          </div>
        </div>
        <div className="filter-actions">
          <button onClick={handleGenerateReport} className="btn-primary" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
          {attendanceData.length > 0 && (
            <button onClick={handleExport} className="btn-export" disabled={exporting}>
              {exporting ? 'Exporting...' : 'Export to CSV'}
            </button>
          )}
        </div>
      </div>

      {/* Report Summary */}
      {attendanceData.length > 0 && (
        <div className="report-summary">
          <h2>Report Summary</h2>
          <div className="summary-stats">
            <div className="summary-stat">
              <span className="stat-label">Total Records</span>
              <span className="stat-value">{attendanceData.length}</span>
            </div>
            <div className="summary-stat">
              <span className="stat-label">Date Range</span>
              <span className="stat-value">
                {format(new Date(filters.startDate), 'MMM dd, yyyy')} -{' '}
                {format(new Date(filters.endDate), 'MMM dd, yyyy')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Report Table */}
      {attendanceData.length > 0 && (
        <div className="report-table-card">
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
                <th>Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((record) => (
                <tr key={record._id}>
                  <td>{record.userId?.employeeId}</td>
                  <td>{record.userId?.name}</td>
                  <td>{record.userId?.email}</td>
                  <td>{record.userId?.department}</td>
                  <td>{format(new Date(record.date), 'MMM dd, yyyy')}</td>
                  <td>
                    {record.checkInTime
                      ? format(new Date(record.checkInTime), 'MMM dd, yyyy hh:mm a')
                      : 'N/A'}
                  </td>
                  <td>
                    {record.checkOutTime
                      ? format(new Date(record.checkOutTime), 'MMM dd, yyyy hh:mm a')
                      : 'N/A'}
                  </td>
                  <td>
                    <span className={`status-badge ${record.status}`}>
                      {record.status}
                    </span>
                  </td>
                  <td>{record.totalHours || 0} hrs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && attendanceData.length === 0 && (
        <div className="no-data">
          <p>Generate a report to view attendance data</p>
        </div>
      )}
    </div>
  );
};

export default Reports;

