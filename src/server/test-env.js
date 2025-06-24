const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Test environment variables
console.log('\n=== Testing Environment Variables ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✓ Set' : '✗ Not Set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set' : '✗ Not Set');
console.log('JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN);
console.log('================================\n'); 