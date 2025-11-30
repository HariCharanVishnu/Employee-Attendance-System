import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllAttendance } from '../../store/slices/attendanceSlice';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import './TeamCalendar.css';

const TeamCalendar = () => {
  const dispatch = useDispatch();
  const { allAttendance } = useSelector((state) => state.attendance);
  
  // Ensure initial date is valid
  const getInitialDate = () => {
    const today = new Date();
    if (isNaN(today.getTime())) {
      return new Date(2024, 0, 1); // Fallback date
    }
    return today;
  };
  
  const [selectedDate, setSelectedDate] = useState(getInitialDate());
  const [selectedDayAttendance, setSelectedDayAttendance] = useState([]);

  useEffect(() => {
    loadAttendance();
  }, [selectedDate]);

  const loadAttendance = async () => {
    try {
      // Use a valid date - either selectedDate or current date
      const dateToUse = (selectedDate && !isNaN(selectedDate.getTime())) 
        ? selectedDate 
        : new Date();

      const month = dateToUse.getMonth() + 1;
      const year = dateToUse.getFullYear();
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      // Validate the calculated dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error('Invalid date range calculated');
        return;
      }

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
    try {
      const [year, month] = e.target.value.split('-');
      const newDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      
      // Validate the date
      if (isNaN(newDate.getTime())) {
        console.error('Invalid date created, using current date');
        setSelectedDate(new Date());
        return;
      }
      
      setSelectedDate(newDate);
    } catch (error) {
      console.error('Error changing month:', error);
      setSelectedDate(new Date());
    }
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

  // Safely get month start and end dates
  const getMonthDays = () => {
    try {
      // Ensure selectedDate is valid
      if (!selectedDate || isNaN(selectedDate.getTime())) {
        const today = new Date();
        const monthStart = startOfMonth(today);
        const monthEnd = endOfMonth(today);
        return eachDayOfInterval({ start: monthStart, end: monthEnd });
      }

      const monthStart = startOfMonth(selectedDate);
      const monthEnd = endOfMonth(selectedDate);

      // Validate dates before using eachDayOfInterval
      if (!monthStart || !monthEnd || isNaN(monthStart.getTime()) || isNaN(monthEnd.getTime())) {
        const today = new Date();
        const fallbackStart = startOfMonth(today);
        const fallbackEnd = endOfMonth(today);
        return eachDayOfInterval({ start: fallbackStart, end: fallbackEnd });
      }

      // Ensure start is before or equal to end
      if (monthStart > monthEnd) {
        const today = new Date();
        const fallbackStart = startOfMonth(today);
        const fallbackEnd = endOfMonth(today);
        return eachDayOfInterval({ start: fallbackStart, end: fallbackEnd });
      }

      return eachDayOfInterval({ start: monthStart, end: monthEnd });
    } catch (error) {
      console.error('Error generating month days:', error);
      // Fallback to current month
      const today = new Date();
      const fallbackStart = startOfMonth(today);
      const fallbackEnd = endOfMonth(today);
      return eachDayOfInterval({ start: fallbackStart, end: fallbackEnd });
    }
  };

  const daysInMonth = getMonthDays();

  return (
    <div className="team-calendar">
      <h1>Team Calendar View</h1>

      <div className="calendar-controls">
        <label>Select Month:</label>
        <input
          type="month"
          value={selectedDate && !isNaN(selectedDate.getTime()) ? format(selectedDate, 'yyyy-MM') : format(new Date(), 'yyyy-MM')}
          onChange={handleMonthChange}
        />
      </div>

      <div className="calendar-container">
        <div className="calendar-view">
          <div className="calendar-grid">
            {daysInMonth && daysInMonth.length > 0 ? daysInMonth.map((day) => {
              if (!day || isNaN(day.getTime())) return null;
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
            }) : (
              <div className="calendar-error">Unable to load calendar. Please try again.</div>
            )}
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

