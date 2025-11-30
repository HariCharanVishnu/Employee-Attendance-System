import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllAttendance } from '../../store/slices/attendanceSlice';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import './TeamCalendar.css';

const TeamCalendar = () => {
  const dispatch = useDispatch();
  const { allAttendance } = useSelector((state) => state.attendance);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDayAttendance, setSelectedDayAttendance] = useState([]);

  useEffect(() => {
    loadAttendance();
  }, [selectedDate]);

  const loadAttendance = async () => {
    const month = selectedDate.getMonth() + 1;
    const year = selectedDate.getFullYear();
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    try {
      await dispatch(
        getAllAttendance({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        })
      ).unwrap();
    } catch (error) {
      console.error('Failed to load attendance:', error);
    }
  };

  const handleMonthChange = (e) => {
    const [year, month] = e.target.value.split('-');
    setSelectedDate(new Date(year, month - 1, 1));
  };

  const handleDayClick = (day) => {
    const dayAttendance = allAttendance.filter((record) =>
      isSameDay(new Date(record.date), day)
    );
    setSelectedDayAttendance(dayAttendance);
  };

  const getDayStats = (day) => {
    const dayRecords = allAttendance.filter((record) =>
      isSameDay(new Date(record.date), day)
    );
    const present = dayRecords.filter((r) => r.status === 'present' || r.status === 'late').length;
    const absent = dayRecords.filter((r) => r.status === 'absent').length;
    return { present, absent, total: dayRecords.length };
  };

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="team-calendar">
      <h1>Team Calendar View</h1>

      <div className="calendar-controls">
        <label>Select Month:</label>
        <input
          type="month"
          value={format(selectedDate, 'yyyy-MM')}
          onChange={handleMonthChange}
        />
      </div>

      <div className="calendar-container">
        <div className="calendar-view">
          <div className="calendar-grid">
            {daysInMonth.map((day) => {
              const stats = getDayStats(day);
              return (
                <div
                  key={day.toISOString()}
                  className="calendar-day"
                  onClick={() => handleDayClick(day)}
                >
                  <div className="day-number">{format(day, 'd')}</div>
                  <div className="day-stats">
                    <span className="stat-present">{stats.present} P</span>
                    <span className="stat-absent">{stats.absent} A</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="day-details">
          <h2>
            {selectedDayAttendance.length > 0
              ? format(new Date(selectedDayAttendance[0].date), 'MMMM dd, yyyy')
              : 'Select a date to view details'}
          </h2>
          {selectedDayAttendance.length > 0 ? (
            <div className="attendance-list">
              {selectedDayAttendance.map((record) => (
                <div key={record._id} className="attendance-item">
                  <div className="employee-info">
                    <strong>{record.userId?.name}</strong>
                    <span>{record.userId?.employeeId}</span>
                    <span>{record.userId?.department}</span>
                  </div>
                  <div className="attendance-details">
                    <span className={`status-badge ${record.status}`}>
                      {record.status}
                    </span>
                    {record.checkInTime && (
                      <span className="time-info">
                        In: {format(new Date(record.checkInTime), 'hh:mm a')}
                      </span>
                    )}
                    {record.checkOutTime && (
                      <span className="time-info">
                        Out: {format(new Date(record.checkOutTime), 'hh:mm a')}
                      </span>
                    )}
                    <span className="hours-info">{record.totalHours || 0} hrs</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-selection">Click on a date to view attendance details</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamCalendar;

