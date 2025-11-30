import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { checkIn, checkOut, getTodayStatus } from '../../store/slices/attendanceSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import './MarkAttendance.css';

const MarkAttendance = () => {
  const dispatch = useDispatch();
  const { todayStatus } = useSelector((state) => state.attendance);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState('');

  useEffect(() => {
    dispatch(getTodayStatus());
  }, [dispatch]);

  const handleCheckIn = async () => {
    // Get current time for confirmation
    const currentTime = new Date();
    const timeString = currentTime.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    // Show confirmation alert with time
    const confirmed = window.confirm(
      `Confirm Check-In\n\n` +
      `Time: ${timeString}\n\n` +
      `Do you want to check in now?`
    );

    if (!confirmed) {
      return; // User cancelled
    }

    setLoading(true);
    setMessage('');
    try {
      await dispatch(checkIn()).unwrap();
      toast.success('✅ Checked in successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
      setMessage('Checked in successfully!');
      dispatch(getTodayStatus());
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
    setLoading(true);
    setMessage('');
    try {
      await dispatch(checkOut()).unwrap();
      toast.success('✅ Checked out successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
      setMessage('Checked out successfully!');
      dispatch(getTodayStatus());
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

  const isCheckedIn = todayStatus?.checkInTime;
  const isCheckedOut = todayStatus?.checkOutTime;

  // Check if today is Sunday (0 = Sunday)
  const today = new Date();
  const isSunday = today.getDay() === 0;

  return (
    <div className="mark-attendance">
      <h1>Mark Attendance</h1>

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

        {todayStatus?.checkInTime && (
          <div className="time-info">
            <p>
              <strong>Check In:</strong>{' '}
              {new Date(todayStatus.checkInTime).toLocaleString()}
            </p>
          </div>
        )}

        {todayStatus?.checkOutTime && (
          <div className="time-info">
            <p>
              <strong>Check Out:</strong>{' '}
              {new Date(todayStatus.checkOutTime).toLocaleString()}
            </p>
            <p>
              <strong>Total Hours:</strong> {todayStatus.totalHours || 0} hours
            </p>
          </div>
        )}

        {message && (
          <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="action-buttons">
          {loading && <LoadingSpinner size="small" />}
          {!isCheckedIn && (
            <button
              onClick={handleCheckIn}
              className="btn-checkin"
              disabled={loading || isSunday}
              title={isSunday ? 'Check-in is not allowed on Sundays' : ''}
            >
              {loading ? 'Processing...' : 'Check In'}
            </button>
          )}

          {isCheckedIn && !isCheckedOut && (
            <button
              onClick={handleCheckOut}
              className="btn-checkout"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Check Out'}
            </button>
          )}

          {isCheckedOut && (
            <p className="completed-message">
              You have completed your attendance for today.
            </p>
          )}
        </div>
      </div>

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

