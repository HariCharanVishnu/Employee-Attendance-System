const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance-system';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully');
  console.log(`📊 Database: ${mongoURI.split('/').pop().split('?')[0]}`);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  if (err.message.includes('authentication failed') || err.message.includes('bad auth')) {
    console.error('\n🔐 Authentication Error - Please check:');
    console.error('1. Username and password in your MONGODB_URI');
    console.error('2. If password has special characters, they must be URL-encoded');
    console.error('3. Database user exists in MongoDB Atlas');
    console.error('4. Database user has correct permissions');
    console.error('\n💡 Tip: Get your connection string from MongoDB Atlas:');
    console.error('   Cluster → Connect → Connect your application');
  }
  process.exit(1);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

