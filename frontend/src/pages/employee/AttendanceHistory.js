import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyHistory, getMySummary } from '../../store/slices/attendanceSlice';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import './AttendanceHistory.css';

const AttendanceHistory = () => {
  const dispatch = useDispatch();
  const { myHistory, mySummary } = useSelector((state) => state.attendance);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'table'

  useEffect(() => {
    const month = selectedDate.getMonth() + 1;
    const year = selectedDate.getFullYear();
    dispatch(getMyHistory({ month, year }));
    dispatch(getMySummary({ month, year }));
  }, [dispatch, selectedDate]);

  const handleMonthChange = (e) => {
    const [year, month] = e.target.value.split('-');
    setSelectedDate(new Date(year, month - 1, 1));
  };

  const getAttendanceForDate = (date) => {
    return myHistory.find((record) =>
      isSameDay(new Date(record.date), date)
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return '#28a745';
      case 'absent':
        return '#dc3545';
      case 'late':
        return '#ffc107';
      case 'half-day':
        return '#fd7e14';
      default:
        return '#e9ecef';
    }
  };

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="attendance-history">
      <div className="history-header">
        <h1>My Attendance History</h1>
        <div className="view-controls">
          <button
            className={viewMode === 'calendar' ? 'active' : ''}
            onClick={() => setViewMode('calendar')}
          >
            Calendar
          </button>
          <button
            className={viewMode === 'table' ? 'active' : ''}
            onClick={() => setViewMode('table')}
          >
            Table
          </button>
        </div>
      </div>

      <div className="month-selector">
        <label>Select Month:</label>
        <input
          type="month"
          value={format(selectedDate, 'yyyy-MM')}
          onChange={handleMonthChange}
        />
      </div>

      {mySummary && (
        <div className="summary-cards">
          <div className="summary-card present">
            <h3>Present</h3>
            <p>{mySummary.present}</p>
          </div>
          <div className="summary-card absent">
            <h3>Absent</h3>
            <p>{mySummary.absent}</p>
          </div>
          <div className="summary-card late">
            <h3>Late</h3>
            <p>{mySummary.late}</p>
          </div>
          <div className="summary-card hours">
            <h3>Total Hours</h3>
            <p>{mySummary.totalHours}</p>
          </div>
        </div>
      )}

      {viewMode === 'calendar' ? (
        <div className="calendar-view">
          <div className="calendar-grid">
            {daysInMonth.map((day) => {
              const attendance = getAttendanceForDate(day);
              const status = attendance?.status || 'absent';
              return (
                <div
                  key={day.toISOString()}
                  className="calendar-day"
                  style={{
                    backgroundColor: getStatusColor(status),
                    color: status === 'absent' ? '#666' : 'white',
                  }}
                  title={attendance ? `${format(day, 'MMM dd')} - ${status}` : format(day, 'MMM dd')}
                >
                  <div className="day-number">{format(day, 'd')}</div>
                  {attendance && (
                    <div className="day-status">{status.substring(0, 1).toUpperCase()}</div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="legend">
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#28a745' }}></span>
              Present
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#dc3545' }}></span>
              Absent
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#ffc107' }}></span>
              Late
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#fd7e14' }}></span>
              Half Day
            </div>
          </div>
        </div>
      ) : (
        <div className="table-view">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {myHistory.length > 0 ? (
                myHistory.map((record) => (
                  <tr key={record._id}>
                    <td>{format(new Date(record.date), 'MMM dd, yyyy')}</td>
                    <td>
                      <span className={`status-badge ${record.status}`}>
                        {record.status}
                      </span>
                    </td>
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
                    <td>{record.totalHours || 0} hrs</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendanceHistory;

