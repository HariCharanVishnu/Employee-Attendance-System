const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Attendance = require('./models/Attendance');

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance-system';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  seedDatabase();
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

async function seedDatabase() {
  try {
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Attendance.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Create Manager
    console.log('👔 Creating manager...');
    const manager = new User({
      name: 'Sarah Thompson',
      email: 'sarah.thompson@techcorp.com',
      password: 'admin2024',
      role: 'manager',
      employeeId: 'MGR001',
      department: 'Operations'
    });
    await manager.save();
    console.log('✅ Manager created:', manager.email, `(${manager.employeeId})\n`);

    // Create Employees
    console.log('👥 Creating employees...');
    const employees = [
      {
        name: 'Michael Chen',
        email: 'michael.chen@techcorp.com',
        password: 'password123',
        role: 'employee',
        department: 'Software Development'
      },
      {
        name: 'Priya Patel',
        email: 'priya.patel@techcorp.com',
        password: 'password123',
        role: 'employee',
        department: 'Software Development'
      },
      {
        name: 'James Wilson',
        email: 'james.wilson@techcorp.com',
        password: 'password123',
        role: 'employee',
        department: 'Quality Assurance'
      },
      {
        name: 'Sophia Martinez',
        email: 'sophia.martinez@techcorp.com',
        password: 'password123',
        role: 'employee',
        department: 'Product Design'
      },
      {
        name: 'Ryan O\'Connor',
        email: 'ryan.oconnor@techcorp.com',
        password: 'password123',
        role: 'employee',
        department: 'Marketing'
      },
      {
        name: 'Lisa Anderson',
        email: 'lisa.anderson@techcorp.com',
        password: 'password123',
        role: 'employee',
        department: 'Sales'
      },
      {
        name: 'Kevin Kim',
        email: 'kevin.kim@techcorp.com',
        password: 'password123',
        role: 'employee',
        department: 'Customer Support'
      },
      {
        name: 'Amanda Taylor',
        email: 'amanda.taylor@techcorp.com',
        password: 'password123',
        role: 'employee',
        department: 'Human Resources'
      }
    ];

    const createdEmployees = [];
    let employeeCounter = 1;
    for (const emp of employees) {
      const employeeId = `EMP${String(employeeCounter).padStart(3, '0')}`;
      const employee = new User({
        ...emp,
        employeeId: employeeId
      });
      await employee.save();
      createdEmployees.push(employee);
      employeeCounter++;
      console.log(`✅ Created: ${employee.name} (${employee.employeeId}) - ${employee.department}`);
    }
    console.log(`\n✅ ${createdEmployees.length} employees created\n`);

    // Create Sample Attendance Records
    console.log('📅 Creating sample attendance records...');
    
    const today = new Date();
    const attendanceRecords = [];

    // Create attendance for the last 45 days for each employee
    for (let day = 0; day < 45; day++) {
      const date = new Date(today);
      date.setDate(date.getDate() - day);
      date.setHours(0, 0, 0, 0);

      // Skip weekends (Saturday = 6, Sunday = 0)
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      for (const employee of createdEmployees) {
        // Randomly decide if employee was present (85% chance)
        const isPresent = Math.random() > 0.15;
        
        if (isPresent) {
          // Random check-in time between 7:30 AM and 9:30 AM
          const checkInHour = 7 + Math.floor(Math.random() * 2);
          const checkInMinute = Math.random() > 0.5 ? 30 : Math.floor(Math.random() * 30);
          const checkInTime = new Date(date);
          checkInTime.setHours(checkInHour, checkInMinute, 0, 0);

          // Determine status based on check-in time
          let status = 'present';
          if (checkInHour >= 9 || (checkInHour === 8 && checkInMinute > 30)) {
            status = 'late';
          }

          // Random check-out time between 5:00 PM and 6:30 PM
          const checkOutHour = 17 + Math.floor(Math.random() * 2);
          const checkOutMinute = checkOutHour === 17 ? Math.floor(Math.random() * 60) : Math.floor(Math.random() * 30);
          const checkOutTime = new Date(date);
          checkOutTime.setHours(checkOutHour, checkOutMinute, 0, 0);

          // Calculate total hours
          const totalHours = ((checkOutTime - checkInTime) / (1000 * 60 * 60)).toFixed(2);

          // If worked less than 4 hours, mark as half-day
          if (parseFloat(totalHours) < 4) {
            status = 'half-day';
          }

          const attendance = new Attendance({
            userId: employee._id,
            date: date,
            checkInTime: checkInTime,
            checkOutTime: checkOutTime,
            status: status,
            totalHours: parseFloat(totalHours)
          });

          attendanceRecords.push(attendance);
        } else {
          // Absent - no check-in
          const attendance = new Attendance({
            userId: employee._id,
            date: date,
            status: 'absent'
          });
          attendanceRecords.push(attendance);
        }
      }
    }

    // Save all attendance records
    await Attendance.insertMany(attendanceRecords);
    console.log(`✅ Created ${attendanceRecords.length} attendance records\n`);

    // Create today's attendance (some checked in, some not)
    console.log('📅 Creating today\'s attendance...');
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const todayDayOfWeek = todayDate.getDay();

    // Only create today's attendance if it's a weekday
    if (todayDayOfWeek !== 0 && todayDayOfWeek !== 6) {
      // Create attendance for 5 employees today
      for (let i = 0; i < Math.min(5, createdEmployees.length); i++) {
        const employee = createdEmployees[i];
        const checkInHour = 7 + Math.floor(Math.random() * 2);
        const checkInMinute = Math.random() > 0.5 ? 30 : Math.floor(Math.random() * 30);
        const checkInTime = new Date();
        checkInTime.setHours(checkInHour, checkInMinute, 0, 0);

        let status = 'present';
        if (checkInHour >= 9 || (checkInHour === 8 && checkInMinute > 30)) {
          status = 'late';
        }

        const attendance = new Attendance({
          userId: employee._id,
          date: todayDate,
          checkInTime: checkInTime,
          status: status
        });

        await attendance.save();
        console.log(`✅ Today's attendance: ${employee.name} - Checked in at ${checkInTime.toLocaleTimeString()}`);
      }
    } else {
      console.log('ℹ️  Today is a weekend, skipping today\'s attendance creation');
    }

    const todayAttendanceCount = (todayDayOfWeek !== 0 && todayDayOfWeek !== 6) ? Math.min(5, createdEmployees.length) : 0;
    
    console.log('\n📊 Summary:');
    console.log(`   👔 Managers: 1`);
    console.log(`   👥 Employees: ${createdEmployees.length}`);
    console.log(`   📅 Historical Attendance Records: ${attendanceRecords.length}`);
    console.log(`   📅 Today's Attendance Records: ${todayAttendanceCount}`);
    console.log(`   📅 Total Attendance Records: ${attendanceRecords.length + todayAttendanceCount}`);
    console.log('\n✅ New sample data seeded successfully!\n');

    console.log('🔑 Login Credentials:');
    console.log('\n   Manager:');
    console.log('   Email: sarah.thompson@techcorp.com');
    console.log('   Password: admin2024\n');
    console.log('   Employees (all use password: password123):');
    employees.forEach(emp => {
      console.log(`   - ${emp.name}: ${emp.email}`);
    });
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

