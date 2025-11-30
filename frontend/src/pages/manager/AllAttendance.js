import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllAttendance } from '../../store/slices/attendanceSlice';
import { format } from 'date-fns';
import './AllAttendance.css';

const AllAttendance = () => {
  const dispatch = useDispatch();
  const { allAttendance } = useSelector((state) => state.attendance);
  const [filters, setFilters] = useState({
    employeeId: '',
    startDate: '',
    endDate: '',
    status: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      await dispatch(getAllAttendance(filters)).unwrap();
    } catch (error) {
      console.error('Failed to load attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApplyFilters = () => {
    loadAttendance();
  };

  const handleClearFilters = () => {
    setFilters({
      employeeId: '',
      startDate: '',
      endDate: '',
      status: '',
    });
  };

  return (
    <div className="all-attendance">
      <h1>All Employees Attendance</h1>

      {/* Filters */}
      <div className="filters-card">
        <h2>Filters</h2>
        <div className="filters-grid">
          <div className="filter-item">
            <label>Employee ID</label>
            <input
              type="text"
              name="employeeId"
              value={filters.employeeId}
              onChange={handleFilterChange}
              placeholder="e.g., EMP001"
            />
          </div>
          <div className="filter-item">
            <label>Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-item">
            <label>End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-item">
            <label>Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half-day">Half Day</option>
            </select>
          </div>
        </div>
        <div className="filter-actions">
          <button onClick={handleApplyFilters} className="btn-primary">
            Apply Filters
          </button>
          <button onClick={handleClearFilters} className="btn-secondary">
            Clear
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="attendance-table-card">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
                <th>Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {allAttendance.length > 0 ? (
                allAttendance.map((record) => (
                  <tr key={record._id}>
                    <td>{record.userId?.employeeId}</td>
                    <td>{record.userId?.name}</td>
                    <td>{record.userId?.department}</td>
                    <td>{format(new Date(record.date), 'MMM dd, yyyy')}</td>
                    <td>
                      {record.checkInTime
                        ? format(new Date(record.checkInTime), 'hh:mm a')
                        : 'N/A'}
                    </td>
                    <td>
                      {record.checkOutTime
                        ? format(new Date(record.checkOutTime), 'hh:mm a')
                        : 'N/A'}
                    </td>
                    <td>
                      <span className={`status-badge ${record.status}`}>
                        {record.status}
                      </span>
                    </td>
                    <td>{record.totalHours || 0} hrs</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center' }}>
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AllAttendance;

