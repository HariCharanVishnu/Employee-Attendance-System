// Quick API test script using Node's built-in fetch
const API_URL = 'http://localhost:5000/api';

async function makeRequest(method, url, data = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  const responseData = await response.json();

  if (!response.ok) {
    throw { response: { status: response.status, data: responseData } };
  }

  return { data: responseData };
}

async function testAPI() {
  console.log('🧪 Testing Attendance System API\n');
  console.log('='.repeat(50));

  try {
    // Test 1: Employee Login
    console.log('\n1️⃣ Testing Employee Login...');
    const loginResponse = await makeRequest('POST', `${API_URL}/auth/login`, {
      email: 'alice@company.com',
      password: 'employee123'
    });
    console.log('✅ Login successful!');
    console.log(`   User: ${loginResponse.data.user.name} (${loginResponse.data.user.employeeId})`);
    console.log(`   Role: ${loginResponse.data.user.role}`);
    console.log(`   Token: ${loginResponse.data.token.substring(0, 20)}...`);
    
    const token = loginResponse.data.token;
    const userId = loginResponse.data.user.id;

    // Test 2: Get Current User
    console.log('\n2️⃣ Testing Get Current User...');
    const meResponse = await makeRequest('GET', `${API_URL}/auth/me`, null, token);
    console.log('✅ Get current user successful!');
    console.log(`   User: ${meResponse.data.user.name}`);

    // Test 3: Get Today's Attendance
    console.log('\n3️⃣ Testing Get Today\'s Attendance...');
    const todayResponse = await makeRequest('GET', `${API_URL}/attendance/today`, null, token);
    console.log('✅ Get today\'s attendance successful!');
    console.log(`   Checked In: ${todayResponse.data.isCheckedIn}`);
    console.log(`   Checked Out: ${todayResponse.data.isCheckedOut}`);
    if (todayResponse.data.attendance) {
      console.log(`   Status: ${todayResponse.data.attendance.status}`);
    }

    // Test 4: Get Attendance History
    console.log('\n4️⃣ Testing Get Attendance History...');
    const historyResponse = await makeRequest('GET', `${API_URL}/attendance/my-history`, null, token);
    console.log('✅ Get attendance history successful!');
    console.log(`   Records found: ${historyResponse.data.attendance.length}`);

    // Test 5: Get Monthly Summary
    console.log('\n5️⃣ Testing Get Monthly Summary...');
    const summaryResponse = await makeRequest('GET', `${API_URL}/attendance/my-summary`, null, token);
    console.log('✅ Get monthly summary successful!');
    console.log(`   Present: ${summaryResponse.data.present}`);
    console.log(`   Absent: ${summaryResponse.data.absent}`);
    console.log(`   Late: ${summaryResponse.data.late}`);
    console.log(`   Total Hours: ${summaryResponse.data.totalHours}`);

    // Test 6: Get Employee Dashboard
    console.log('\n6️⃣ Testing Employee Dashboard...');
    const dashboardResponse = await makeRequest('GET', `${API_URL}/dashboard/employee`, null, token);
    console.log('✅ Get employee dashboard successful!');
    console.log(`   Today Status: ${dashboardResponse.data.todayStatus.status}`);
    console.log(`   Month Present: ${dashboardResponse.data.monthStats.present}`);
    console.log(`   Month Hours: ${dashboardResponse.data.monthStats.totalHours}`);

    // Test 7: Manager Login
    console.log('\n7️⃣ Testing Manager Login...');
    const managerLoginResponse = await makeRequest('POST', `${API_URL}/auth/login`, {
      email: 'manager@company.com',
      password: 'manager123'
    });
    console.log('✅ Manager login successful!');
    const managerToken = managerLoginResponse.data.token;

    // Test 8: Get All Attendance (Manager)
    console.log('\n8️⃣ Testing Get All Attendance (Manager)...');
    const allAttendanceResponse = await makeRequest('GET', `${API_URL}/attendance/all`, null, managerToken);
    console.log('✅ Get all attendance successful!');
    console.log(`   Records found: ${allAttendanceResponse.data.attendance.length}`);

    // Test 9: Get Team Summary (Manager)
    console.log('\n9️⃣ Testing Get Team Summary (Manager)...');
    const teamSummaryResponse = await makeRequest('GET', `${API_URL}/attendance/summary`, null, managerToken);
    console.log('✅ Get team summary successful!');
    console.log(`   Employees in summary: ${teamSummaryResponse.data.summary.length}`);

    // Test 10: Get Manager Dashboard
    console.log('\n🔟 Testing Manager Dashboard...');
    const managerDashboardResponse = await makeRequest('GET', `${API_URL}/dashboard/manager`, null, managerToken);
    console.log('✅ Get manager dashboard successful!');
    console.log(`   Total Employees: ${managerDashboardResponse.data.totalEmployees}`);
    console.log(`   Today Present: ${managerDashboardResponse.data.todayStats.present}`);
    console.log(`   Today Absent: ${managerDashboardResponse.data.todayStats.absent}`);

    // Test 11: Register New Employee
    console.log('\n1️⃣1️⃣ Testing Employee Registration...');
    const registerResponse = await makeRequest('POST', `${API_URL}/auth/register`, {
      name: 'Test User',
      email: `test${Date.now()}@company.com`,
      password: 'test123',
      role: 'employee',
      department: 'Testing'
    });
    console.log('✅ Registration successful!');
    console.log(`   New User: ${registerResponse.data.user.name} (${registerResponse.data.user.employeeId})`);

    console.log('\n' + '='.repeat(50));
    console.log('✅ All API tests passed successfully!');
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('\n❌ Test failed!');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data?.message || JSON.stringify(error.response.data)}`);
    } else if (error.message && error.message.includes('fetch')) {
      console.error('   Error: No response from server');
      console.error('   Make sure the backend is running on http://localhost:5000');
    } else {
      console.error(`   Error: ${error.message}`);
    }
    process.exit(1);
  }
}

// Wait a bit for server to start, then test
setTimeout(() => {
  testAPI();
}, 2000);

