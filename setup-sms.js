// Setup script for SMS configuration
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up SMS configuration...\n');

// Your Twilio credentials
const credentials = {
  TWILIO_ACCOUNT_SID: 'AC783285a34273f70c87c08d00499b9392',
  TWILIO_AUTH_TOKEN: 'c62468b62d49450fb7694c455db5cad7',
  TWILIO_PHONE_NUMBER: '+17622164645'
};

// Environment file content
const envContent = `# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/trimly

# Server Configuration
PORT=5000
NODE_ENV=development

# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=${credentials.TWILIO_ACCOUNT_SID}
TWILIO_AUTH_TOKEN=${credentials.TWILIO_AUTH_TOKEN}
TWILIO_PHONE_NUMBER=${credentials.TWILIO_PHONE_NUMBER}

# JWT Secret (if using JWT)
JWT_SECRET=your_jwt_secret_here
`;

// Path to .env file
const envPath = path.join(__dirname, 'src', 'server', '.env');

try {
  // Check if .env file already exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env file already exists!');
    console.log('📁 Location:', envPath);
    console.log('🔧 Please manually update it with the following content:\n');
    console.log(envContent);
  } else {
    // Create .env file
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully!');
    console.log('📁 Location:', envPath);
  }

  console.log('\n📋 Next Steps:');
  console.log('1. ✅ Environment file is ready');
  console.log('2. 🔄 Restart your server (if running)');
  console.log('3. 📱 Update test-sms.js with your phone number');
  console.log('4. 🧪 Run: node test-sms.js');
  
  console.log('\n📱 To test SMS:');
  console.log('1. Open test-sms.js');
  console.log('2. Replace "9876543210" with your phone number');
  console.log('3. Run: node test-sms.js');
  console.log('4. Check your phone for the test message!');

  console.log('\n🎯 Your Twilio Details:');
  console.log('Account SID:', credentials.TWILIO_ACCOUNT_SID);
  console.log('Auth Token:', credentials.TWILIO_AUTH_TOKEN);
  console.log('Phone Number:', credentials.TWILIO_PHONE_NUMBER);

} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  console.log('\n🔧 Manual Setup:');
  console.log('1. Create a file named .env in src/server/ directory');
  console.log('2. Add the following content:');
  console.log(envContent);
} 