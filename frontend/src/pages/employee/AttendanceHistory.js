import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyHistory, getMySummary } from '../../store/slices/attendanceSlice';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import LoadingSpinner from '../../components/LoadingSpinner';
import './AttendanceHistory.css';

const AttendanceHistory = () => {
  const dispatch = useDispatch();
  const { myHistory, mySummary, loading } = useSelector((state) => state.attendance);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'table'
  
  // Table state
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'present', 'absent', 'late', 'half-day'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Filter and sort table data
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...myHistory];

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(record => record.status === filterStatus);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(record => {
        const dateStr = format(new Date(record.date), 'MMM dd, yyyy');
        const statusStr = record.status.toLowerCase();
        return dateStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
               statusStr.includes(searchTerm.toLowerCase());
      });
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortConfig.key) {
          case 'date':
            aValue = new Date(a.date);
            bValue = new Date(b.date);
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          case 'checkIn':
            aValue = a.checkInTime ? new Date(a.checkInTime) : new Date(0);
            bValue = b.checkInTime ? new Date(b.checkInTime) : new Date(0);
            break;
          case 'checkOut':
            aValue = a.checkOutTime ? new Date(a.checkOutTime) : new Date(0);
            bValue = b.checkOutTime ? new Date(b.checkOutTime) : new Date(0);
            break;
          case 'hours':
            aValue = parseFloat(a.totalHours || 0);
            bValue = parseFloat(b.totalHours || 0);
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [myHistory, filterStatus, searchTerm, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Status', 'Check In', 'Check Out', 'Total Hours'];
    const rows = filteredAndSortedData.map(record => [
      format(new Date(record.date), 'MMM dd, yyyy'),
      record.status,
      record.checkInTime ? format(new Date(record.checkInTime), 'hh:mm a') : 'N/A',
      record.checkOutTime ? format(new Date(record.checkOutTime), 'hh:mm a') : 'N/A',
      `${record.totalHours || 0} hrs`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${format(selectedDate, 'yyyy-MM')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <div className="calendar-grid">
                {daysInMonth.map((day) => {
                  const attendance = getAttendanceForDate(day);
                  const status = attendance?.status || 'absent';
                  const isToday = isSameDay(day, new Date());
                  const tooltipText = attendance
                    ? `${format(day, 'MMM dd, yyyy')}\nStatus: ${status}\n${attendance.checkInTime ? `Check In: ${format(new Date(attendance.checkInTime), 'hh:mm a')}` : ''}\n${attendance.checkOutTime ? `Check Out: ${format(new Date(attendance.checkOutTime), 'hh:mm a')}` : ''}\nHours: ${attendance.totalHours || 0}`
                    : `${format(day, 'MMM dd, yyyy')}\nNo attendance record`;
                  
                  return (
                    <div
                      key={day.toISOString()}
                      className={`calendar-day ${status} ${isToday ? 'today' : ''}`}
                      style={{
                        backgroundColor: getStatusColor(status),
                        color: status === 'absent' ? '#666' : 'white',
                      }}
                      data-tooltip={tooltipText}
                    >
                      <div className="day-number">{format(day, 'd')}</div>
                      {attendance && (
                        <div className="day-status">{status.substring(0, 1).toUpperCase()}</div>
                      )}
                      {isToday && <div className="today-indicator">Today</div>}
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
            </>
          )}
        </div>
      ) : (
        <div className="table-view">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <div className="table-controls">
                <div className="search-filter-group">
                  <input
                    type="text"
                    placeholder="Search by date or status..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                  />
                  <select
                    value={filterStatus}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Status</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="half-day">Half Day</option>
                  </select>
                  <button onClick={exportToCSV} className="export-btn">
                    📥 Export CSV
                  </button>
                </div>
              </div>
              
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('date')} className="sortable">
                        Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('status')} className="sortable">
                        Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('checkIn')} className="sortable">
                        Check In {sortConfig.key === 'checkIn' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('checkOut')} className="sortable">
                        Check Out {sortConfig.key === 'checkOut' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('hours')} className="sortable">
                        Total Hours {sortConfig.key === 'hours' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((record) => (
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

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="page-btn"
                  >
                    Previous
                  </button>
                  <span className="page-info">
                    Page {currentPage} of {totalPages} ({filteredAndSortedData.length} records)
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="page-btn"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceHistory;

