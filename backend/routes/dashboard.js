const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getEmployeeDashboard, getManagerDashboard } = require('../controllers/dashboardController');

// @route   GET /api/dashboard/employee
// @desc    Get employee dashboard stats
// @access  Private (Employee)
router.get('/employee', auth, getEmployeeDashboard);

// @route   GET /api/dashboard/manager
// @desc    Get manager dashboard stats
// @access  Private (Manager)
router.get('/manager', auth, getManagerDashboard);

module.exports = router;

