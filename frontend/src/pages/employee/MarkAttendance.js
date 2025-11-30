import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {  getTodayStatus } from '../../store/slices/attendanceSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import { format } from 'date-fns';
import './MarkAttendance.css';

const MarkAttendance = () => {
  const dispatch = useDispatch();
  const { todayStatus } = useSelector((state) => state.attendance);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);

  useEffect(() => {
    dispatch(getTodayStatus());
    
    // Update current time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, [dispatch]);

  // Determine if check-in will be on time or late
  const getCheckInStatus = () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    if (hour > 9 || (hour === 9 && minute > 0)) {
      return { status: 'late', color: '#ffc107', message: 'You will be marked as LATE' };
    } else if (hour === 8 && minute > 30) {
      return { status: 'late', color: '#ffc107', message: 'You will be marked as LATE' };
    } else {
      return { status: 'present', color: '#28a745', message: 'You will be marked as PRESENT' };
    }
  };

  const handleCheckIn = async () => {
    setShowCheckInModal(true);
  };

  const confirmCheckIn = async () => {
    setShowCheckInModal(false);
    setLoading(true);
    setMessage('');
    
    try {
      //const result = await dispatch(checkIn()).unwrap();
      toast.success('✅ Checked in successfully!', {
        position: 'top-right',
        autoClose: 3000,
        icon: '🎉',
      });
      setMessage('Checked in successfully!');
      dispatch(getTodayStatus());
      
      // Show success animation
      setTimeout(() => {
        setMessage('');
      }, 5000);
    } catch (error) {
      const errorMsg = error || 'Failed to check in';
      toast.error(`❌ ${errorMsg}`, {
        position: 'top-right',
        autoClose: 4000,
      });
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setShowCheckOutModal(true);
  };

  const confirmCheckOut = async () => {
    setShowCheckOutModal(false);
    setLoading(true);
    setMessage('');
    
    try {
      //const result = await dispatch(checkOut()).unwrap();
      toast.success('✅ Checked out successfully!', {
        position: 'top-right',
        autoClose: 3000,
        icon: '👋',
      });
      setMessage('Checked out successfully!');
      dispatch(getTodayStatus());
      
      setTimeout(() => {
        setMessage('');
      }, 5000);
    } catch (error) {
      const errorMsg = error || 'Failed to check out';
      toast.error(`❌ ${errorMsg}`, {
        position: 'top-right',
        autoClose: 4000,
      });
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const checkInStatus = getCheckInStatus();

  const isCheckedIn = todayStatus?.checkInTime;
  const isCheckedOut = todayStatus?.checkOutTime;

  // Check if today is Sunday (0 = Sunday)
  const today = new Date();
  const isSunday = today.getDay() === 0;

  return (
    <div className="mark-attendance">
      <h1>Mark Attendance</h1>

      {/* Live Clock */}
      {!isCheckedOut && (
        <div className="live-clock">
          <div className="clock-time">{format(currentTime, 'HH:mm:ss')}</div>
          <div className="clock-date">{format(currentTime, 'EEEE, MMMM dd, yyyy')}</div>
        </div>
      )}

      <div className="attendance-card">
        {isSunday && !isCheckedIn && (
          <div className="message error" style={{ marginBottom: '20px' }}>
            ⚠️ Check-in is not allowed on Sundays
          </div>
        )}
        
        <div className="current-status">
          <h2>Today's Status</h2>
          <div className={`status-indicator ${todayStatus?.status || 'absent'}`}>
            {isCheckedIn
              ? isCheckedOut
                ? 'Checked Out'
                : 'Checked In'
              : 'Not Checked In'}
          </div>
        </div>

        {/* Status Preview for Check-in */}
        {!isCheckedIn && !isSunday && (
          <div className="status-preview" style={{ borderColor: checkInStatus.color }}>
            <div className="status-preview-icon" style={{ color: checkInStatus.color }}>
              {checkInStatus.status === 'late' ? '⏰' : '✅'}
            </div>
            <div className="status-preview-text">
              <strong>{checkInStatus.message}</strong>
              <span>Check-in time: {format(currentTime, 'hh:mm a')}</span>
            </div>
          </div>
        )}

        {todayStatus?.checkInTime && (
          <div className="time-info">
            <div className="time-info-item">
              <span className="time-label">🕐 Check In</span>
              <span className="time-value">{format(new Date(todayStatus.checkInTime), 'hh:mm:ss a')}</span>
            </div>
            <div className="time-info-item">
              <span className="time-label">📅 Date</span>
              <span className="time-value">{format(new Date(todayStatus.checkInTime), 'MMMM dd, yyyy')}</span>
            </div>
            {todayStatus.status && (
              <div className="time-info-item">
                <span className="time-label">📊 Status</span>
                <span className={`time-value status-${todayStatus.status}`}>{todayStatus.status.toUpperCase()}</span>
              </div>
            )}
          </div>
        )}

        {todayStatus?.checkOutTime && (
          <div className="time-info">
            <div className="time-info-item">
              <span className="time-label">🕐 Check In</span>
              <span className="time-value">{format(new Date(todayStatus.checkInTime), 'hh:mm:ss a')}</span>
            </div>
            <div className="time-info-item">
              <span className="time-label">🕐 Check Out</span>
              <span className="time-value">{format(new Date(todayStatus.checkOutTime), 'hh:mm:ss a')}</span>
            </div>
            <div className="time-info-item highlight">
              <span className="time-label">⏱️ Total Hours</span>
              <span className="time-value hours">{todayStatus.totalHours || 0} hrs</span>
            </div>
          </div>
        )}

        {message && (
          <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="action-buttons">
          {loading && (
            <div className="loading-overlay">
              <LoadingSpinner size="small" />
              <p>Processing...</p>
            </div>
          )}
          {!isCheckedIn && (
            <button
              onClick={handleCheckIn}
              className="btn-checkin"
              disabled={loading || isSunday}
              title={isSunday ? 'Check-in is not allowed on Sundays' : ''}
            >
              <span className="btn-icon">✓</span>
              <span className="btn-text">Check In Now</span>
              <span className="btn-time">{format(currentTime, 'hh:mm a')}</span>
            </button>
          )}

          {isCheckedIn && !isCheckedOut && (
            <button
              onClick={handleCheckOut}
              className="btn-checkout"
              disabled={loading}
            >
              <span className="btn-icon">→</span>
              <span className="btn-text">Check Out</span>
              <span className="btn-time">{format(currentTime, 'hh:mm a')}</span>
            </button>
          )}

          {isCheckedOut && (
            <div className="completed-message">
              <div className="completed-icon">✓</div>
              <p>You have completed your attendance for today.</p>
              <p className="completed-time">Total: {todayStatus.totalHours || 0} hours</p>
            </div>
          )}
        </div>
      </div>

      {/* Check-in Confirmation Modal */}
      {showCheckInModal && (
        <div className="modal-overlay" onClick={() => setShowCheckInModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Check-In</h3>
              <button className="modal-close" onClick={() => setShowCheckInModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-time-display">
                <div className="modal-time">{format(currentTime, 'hh:mm:ss a')}</div>
                <div className="modal-date">{format(currentTime, 'EEEE, MMMM dd, yyyy')}</div>
              </div>
              <div className="modal-status-preview" style={{ borderColor: checkInStatus.color }}>
                <div style={{ color: checkInStatus.color, fontSize: '2rem' }}>
                  {checkInStatus.status === 'late' ? '⏰' : '✅'}
                </div>
                <div>
                  <strong>{checkInStatus.message}</strong>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowCheckInModal(false)}>
                Cancel
              </button>
              <button className="btn-confirm" onClick={confirmCheckIn}>
                Confirm Check-In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Check-out Confirmation Modal */}
      {showCheckOutModal && (
        <div className="modal-overlay" onClick={() => setShowCheckOutModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Check-Out</h3>
              <button className="modal-close" onClick={() => setShowCheckOutModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-time-display">
                <div className="modal-time">{format(currentTime, 'hh:mm:ss a')}</div>
                <div className="modal-date">{format(currentTime, 'EEEE, MMMM dd, yyyy')}</div>
              </div>
              {todayStatus?.checkInTime && (
                <div className="modal-checkin-info">
                  <p>Check-in: {format(new Date(todayStatus.checkInTime), 'hh:mm a')}</p>
                  <p>Estimated hours: {((currentTime - new Date(todayStatus.checkInTime)) / (1000 * 60 * 60)).toFixed(2)} hrs</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowCheckOutModal(false)}>
                Cancel
              </button>
              <button className="btn-confirm" onClick={confirmCheckOut}>
                Confirm Check-Out
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="info-card">
        <h3>Attendance Guidelines</h3>
        <ul>
          <li>Check in before 9:00 AM to be marked as present</li>
          <li>Check in after 9:00 AM will be marked as late</li>
          <li>Check-in is not allowed on Sundays</li>
          <li>Make sure to check out at the end of your work day</li>
          <li>Working less than 4 hours will be marked as half-day</li>
        </ul>
      </div>
    </div>
  );
};

export default MarkAttendance;

