// Helper script to URL-encode your MongoDB password
// Usage: node encode-password.js "your-password-here"

const password = process.argv[2];

if (!password) {
  console.log('Usage: node encode-password.js "your-password-here"');
  console.log('\nExample:');
  console.log('  node encode-password.js "myP@ssw0rd!"');
  process.exit(1);
}

const encoded = encodeURIComponent(password);
console.log('\n📝 Original password:', password);
console.log('🔐 URL-encoded password:', encoded);
console.log('\n💡 Use this in your connection string:');
console.log(`   mongodb+srv://username:${encoded}@cluster0.xxxxx.mongodb.net/attendance-system?retryWrites=true&w=majority\n`);

