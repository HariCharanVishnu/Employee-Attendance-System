const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @desc    Get employee dashboard stats
// @access  Private (Employee)
const getEmployeeDashboard = async (req, res) => {
  try {
    if (req.user.role !== 'employee') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's status
    const todayAttendance = await Attendance.findOne({
      userId: req.user._id,
      date: today
    });

    // Current month stats
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    const monthAttendance = await Attendance.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    });

    const present = monthAttendance.filter(a => a.status === 'present').length;
    const absent = monthAttendance.filter(a => a.status === 'absent').length;
    const late = monthAttendance.filter(a => a.status === 'late').length;
    const totalHours = monthAttendance.reduce((sum, a) => sum + parseFloat(a.totalHours || 0), 0);

    // Recent attendance (last 7 days)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentAttendance = await Attendance.find({
      userId: req.user._id,
      date: { $gte: sevenDaysAgo, $lte: today }
    }).sort({ date: -1 }).limit(7);

    res.json({
      todayStatus: {
        isCheckedIn: todayAttendance?.checkInTime ? true : false,
        isCheckedOut: todayAttendance?.checkOutTime ? true : false,
        checkInTime: todayAttendance?.checkInTime || null,
        checkOutTime: todayAttendance?.checkOutTime || null,
        status: todayAttendance?.status || 'absent'
      },
      monthStats: {
        present,
        absent,
        late,
        totalHours: totalHours.toFixed(2)
      },
      recentAttendance: recentAttendance.map(a => ({
        date: a.date,
        checkInTime: a.checkInTime,
        checkOutTime: a.checkOutTime,
        status: a.status,
        totalHours: a.totalHours
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get manager dashboard stats
// @access  Private (Manager)
const getManagerDashboard = async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total employees
    const totalEmployees = await User.countDocuments({ role: 'employee' });

    // Today's attendance
    const todayAttendance = await Attendance.find({ date: today })
      .populate('userId', 'name employeeId department');

    const allEmployees = await User.find({ role: 'employee' });
    const presentEmployees = todayAttendance.filter(a => a.checkInTime).map(a => a.userId._id.toString());
    const absentEmployees = allEmployees.filter(emp => !presentEmployees.includes(emp._id.toString()));
    const lateToday = todayAttendance.filter(a => a.status === 'late').length;

    // Weekly attendance trend (last 7 days)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyAttendance = await Attendance.find({
      date: { $gte: sevenDaysAgo, $lte: today }
    });

    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dayAttendance = weeklyAttendance.filter(a => {
        const aDate = new Date(a.date);
        aDate.setHours(0, 0, 0, 0);
        return aDate.getTime() === date.getTime();
      });

      weeklyTrend.push({
        date: date.toISOString().split('T')[0],
        present: dayAttendance.filter(a => a.checkInTime).length,
        absent: totalEmployees - dayAttendance.filter(a => a.checkInTime).length
      });
    }

    // Department-wise attendance
    const departmentStats = {};
    todayAttendance.forEach(record => {
      const dept = record.userId.department;
      if (!departmentStats[dept]) {
        departmentStats[dept] = { present: 0, absent: 0, total: 0 };
      }
      if (record.checkInTime) {
        departmentStats[dept].present++;
      }
      departmentStats[dept].total++;
    });

    // Add departments with no attendance
    allEmployees.forEach(emp => {
      if (!departmentStats[emp.department]) {
        departmentStats[emp.department] = { present: 0, absent: 0, total: 0 };
      }
      departmentStats[emp.department].total++;
      if (!presentEmployees.includes(emp._id.toString())) {
        departmentStats[emp.department].absent++;
      }
    });

    res.json({
      totalEmployees,
      todayStats: {
        present: todayAttendance.filter(a => a.checkInTime).length,
        absent: absentEmployees.length,
        late: lateToday
      },
      weeklyTrend,
      departmentStats: Object.entries(departmentStats).map(([dept, stats]) => ({
        department: dept,
        present: stats.present,
        absent: stats.absent,
        total: stats.total
      })),
      absentEmployeesToday: absentEmployees.map(emp => ({
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

module.exports = {
  getEmployeeDashboard,
  getManagerDashboard
};

