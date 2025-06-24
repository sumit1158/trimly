// Debug script for SMS functionality
const testSMS = async () => {
  try {
    console.log('🔍 Debugging SMS functionality...\n');

    // Test 1: Check if environment variables are loaded
    console.log('📋 Environment Check:');
    console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? '✅ Set' : '❌ Not set');
    console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '✅ Set' : '❌ Not set');
    console.log('TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER ? '✅ Set' : '❌ Not set');

    // Test 2: Send a test SMS with detailed error
    console.log('\n📱 Test 2: Sending test SMS...');
    console.log('⚠️  IMPORTANT: Replace "9876543210" with your actual phone number!');
    console.log('📱 For India: +919876543210');
    console.log('📱 For US: +1234567890');
    
    const testResponse = await fetch('http://localhost:5000/api/sms/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: '9876543210', // ⚠️ REPLACE WITH YOUR PHONE NUMBER
        message: '🧪 Test SMS from Trimly Barbershop App! This is a test message to verify SMS functionality.'
      }),
    });

    const responseData = await testResponse.json();
    
    if (testResponse.ok) {
      console.log('✅ Test SMS sent successfully:', responseData.messageId);
      console.log('📱 Check your phone for the test message!');
    } else {
      console.log('❌ Test SMS failed:');
      console.log('Status:', testResponse.status);
      console.log('Error:', responseData.message);
      console.log('Details:', responseData.error);
      
      // Common issues and solutions
      console.log('\n🔧 Common Issues & Solutions:');
      console.log('1. Trial Account: Twilio trial accounts can only send to verified numbers');
      console.log('2. Phone Format: Use international format (e.g., +919876543210 for India)');
      console.log('3. Verify Number: Add your number to Twilio console for trial accounts');
      console.log('4. Environment: Make sure .env file is in src/server/ directory');
    }

    console.log('\n📋 Twilio Trial Account Info:');
    console.log('• Trial accounts can only send SMS to verified phone numbers');
    console.log('• Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
    console.log('• Add your phone number there to receive SMS during trial');

  } catch (error) {
    console.error('❌ Error testing SMS:', error);
  }
};

// Run the test
testSMS(); 