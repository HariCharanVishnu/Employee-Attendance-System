const Attendance = require('../models/Attendance');
const User = require('../models/User');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');

// Helper function to calculate total hours
const calculateHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const diff = checkOut - checkIn;
  return (diff / (1000 * 60 * 60)).toFixed(2);
};

// Helper function to determine status
const determineStatus = (checkInTime) => {
  if (!checkInTime) return 'absent';
  const checkInHour = new Date(checkInTime).getHours();
  if (checkInHour >= 9) return 'late';
  return 'present';
};

// @desc    Check in
// @access  Private (Employee)
const checkIn = async (req, res) => {
  try {
    if (req.user.role !== 'employee') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if today is Sunday (0 = Sunday, 6 = Saturday)
    const dayOfWeek = today.getDay();
    if (dayOfWeek === 0) {
      return res.status(400).json({ message: 'Check-in is not allowed on Sundays' });
    }

    // Check if already checked in today
    let attendance = await Attendance.findOne({
      userId: req.user._id,
      date: today
    });

    if (attendance && attendance.checkInTime) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    const checkInTime = new Date();
    const status = determineStatus(checkInTime);

    if (attendance) {
      attendance.checkInTime = checkInTime;
      attendance.status = status;
    } else {
      attendance = new Attendance({
        userId: req.user._id,
        date: today,
        checkInTime: checkInTime,
        status: status
      });
    }

    await attendance.save();

    res.json({
      message: 'Checked in successfully',
      attendance: {
        checkInTime: attendance.checkInTime,
        status: attendance.status
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Check out
// @access  Private (Employee)
const checkOut = async (req, res) => {
  try {
    if (req.user.role !== 'employee') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date: today
    });

    if (!attendance || !attendance.checkInTime) {
      return res.status(400).json({ message: 'Please check in first' });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    const checkOutTime = new Date();
    attendance.checkOutTime = checkOutTime;
    attendance.totalHours = calculateHours(attendance.checkInTime, checkOutTime);

    // If worked less than 4 hours, mark as half-day
    if (attendance.totalHours < 4) {
      attendance.status = 'half-day';
    }

    await attendance.save();

    res.json({
      message: 'Checked out successfully',
      attendance: {
        checkOutTime: attendance.checkOutTime,
        totalHours: attendance.totalHours,
        status: attendance.status
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get today's attendance status
// @access  Private (Employee)
const getTodayAttendance = async (req, res) => {
  try {
    if (req.user.role !== 'employee') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date: today
    });

    res.json({
      attendance: attendance || null,
      isCheckedIn: attendance?.checkInTime ? true : false,
      isCheckedOut: attendance?.checkOutTime ? true : false
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get my attendance history
// @access  Private (Employee)
const getMyHistory = async (req, res) => {
  try {
    if (req.user.role !== 'employee') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { month, year } = req.query;
    let query = { userId: req.user._id };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .limit(100);

    res.json({ attendance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get monthly summary
// @access  Private (Employee)
const getMySummary = async (req, res) => {
  try {
    if (req.user.role !== 'employee') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month || currentDate.getMonth() + 1;
    const targetYear = year || currentDate.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const attendance = await Attendance.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    });

    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const late = attendance.filter(a => a.status === 'late').length;
    const halfDay = attendance.filter(a => a.status === 'half-day').length;
    const totalHours = attendance.reduce((sum, a) => sum + parseFloat(a.totalHours || 0), 0);

    res.json({
      month: targetMonth,
      year: targetYear,
      present,
      absent,
      late,
      halfDay,
      totalHours: totalHours.toFixed(2),
      totalDays: attendance.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all employees attendance
// @access  Private (Manager)
const getAllAttendance = async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { employeeId, startDate, endDate, status } = req.query;
    let query = {};

    if (employeeId) {
      const user = await User.findOne({ employeeId });
      if (user) {
        query.userId = user._id;
      } else {
        return res.json({ attendance: [] });
      }
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (status) {
      query.status = status;
    }

    const attendance = await Attendance.find(query)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 })
      .limit(500);

    res.json({ attendance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get specific employee attendance
// @access  Private (Manager)
const getEmployeeAttendance = async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { month, year } = req.query;
    let query = { userId: req.params.id };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 });

    res.json({ attendance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get team attendance summary
// @access  Private (Manager)
const getTeamSummary = async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month || currentDate.getMonth() + 1;
    const targetYear = year || currentDate.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const attendance = await Attendance.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate('userId', 'name employeeId department');

    const summary = {};
    attendance.forEach(record => {
      const empId = record.userId.employeeId;
      if (!summary[empId]) {
        summary[empId] = {
          employeeId: empId,
          name: record.userId.name,
          department: record.userId.department,
          present: 0,
          absent: 0,
          late: 0,
          halfDay: 0,
          totalHours: 0
        };
      }
      summary[empId][record.status]++;
      summary[empId].totalHours += parseFloat(record.totalHours || 0);
    });

    res.json({ summary: Object.values(summary) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get today's attendance status for all employees
// @access  Private (Manager)
const getTodayStatus = async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.find({ date: today })
      .populate('userId', 'name email employeeId department');

    const allEmployees = await User.find({ role: 'employee' });
    const presentEmployees = attendance.filter(a => a.checkInTime).map(a => a.userId._id.toString());
    const absentEmployees = allEmployees.filter(emp => !presentEmployees.includes(emp._id.toString()));

    res.json({
      present: attendance.filter(a => a.checkInTime).length,
      absent: absentEmployees.length,
      late: attendance.filter(a => a.status === 'late').length,
      presentEmployees: attendance.filter(a => a.checkInTime).map(a => ({
        ...a.userId.toObject(),
        checkInTime: a.checkInTime,
        status: a.status
      })),
      absentEmployees: absentEmployees.map(emp => ({
        id: emp._id,
        name: emp.name,
        email: emp.email,
        employeeId: emp.employeeId,
        department: emp.department
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Export attendance to CSV
// @access  Private (Manager)
const exportAttendance = async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { startDate, endDate, employeeId } = req.query;
    let query = {};

    if (employeeId) {
      const user = await User.findOne({ employeeId });
      if (user) {
        query.userId = user._id;
      }
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 });

    const csvData = attendance.map(record => ({
      'Employee ID': record.userId.employeeId,
      'Name': record.userId.name,
      'Email': record.userId.email,
      'Department': record.userId.department,
      'Date': new Date(record.date).toLocaleDateString(),
      'Check In': record.checkInTime ? new Date(record.checkInTime).toLocaleString() : 'N/A',
      'Check Out': record.checkOutTime ? new Date(record.checkOutTime).toLocaleString() : 'N/A',
      'Status': record.status,
      'Total Hours': record.totalHours
    }));

    const csvWriter = createCsvWriter({
      path: 'attendance-export.csv',
      header: [
        { id: 'Employee ID', title: 'Employee ID' },
        { id: 'Name', title: 'Name' },
        { id: 'Email', title: 'Email' },
        { id: 'Department', title: 'Department' },
        { id: 'Date', title: 'Date' },
        { id: 'Check In', title: 'Check In' },
        { id: 'Check Out', title: 'Check Out' },
        { id: 'Status', title: 'Status' },
        { id: 'Total Hours', title: 'Total Hours' }
      ]
    });

    await csvWriter.writeRecords(csvData);

    res.download('attendance-export.csv', 'attendance-export.csv', (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: 'Error downloading file' });
      } else {
        // Clean up file after download
        fs.unlinkSync('attendance-export.csv');
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getTodayAttendance,
  getMyHistory,
  getMySummary,
  getAllAttendance,
  getEmployeeAttendance,
  getTeamSummary,
  getTodayStatus,
  exportAttendance
};

