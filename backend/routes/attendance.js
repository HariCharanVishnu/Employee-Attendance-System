const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
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
} = require('../controllers/attendanceController');

// @route   POST /api/attendance/checkin
// @desc    Check in
// @access  Private (Employee)
router.post('/checkin', auth, checkIn);

// @route   POST /api/attendance/checkout
// @desc    Check out
// @access  Private (Employee)
router.post('/checkout', auth, checkOut);

// @route   GET /api/attendance/today
// @desc    Get today's attendance status
// @access  Private (Employee)
router.get('/today', auth, getTodayAttendance);

// @route   GET /api/attendance/my-history
// @desc    Get my attendance history
// @access  Private (Employee)
router.get('/my-history', auth, getMyHistory);

// @route   GET /api/attendance/my-summary
// @desc    Get monthly summary
// @access  Private (Employee)
router.get('/my-summary', auth, getMySummary);

// @route   GET /api/attendance/all
// @desc    Get all employees attendance
// @access  Private (Manager)
router.get('/all', auth, getAllAttendance);

// @route   GET /api/attendance/employee/:id
// @desc    Get specific employee attendance
// @access  Private (Manager)
router.get('/employee/:id', auth, getEmployeeAttendance);

// @route   GET /api/attendance/summary
// @desc    Get team attendance summary
// @access  Private (Manager)
router.get('/summary', auth, getTeamSummary);

// @route   GET /api/attendance/today-status
// @desc    Get today's attendance status for all employees
// @access  Private (Manager)
router.get('/today-status', auth, getTodayStatus);

// @route   GET /api/attendance/export
// @desc    Export attendance to CSV
// @access  Private (Manager)
router.get('/export', auth, exportAttendance);

module.exports = router;

