// Test script for SMS functionality
const testSMS = async () => {
  try {
    console.log('🧪 Testing SMS functionality...\n');

    // Test 1: Send a test SMS
    console.log('📱 Test 1: Sending test SMS...');
    console.log('⚠️  IMPORTANT: Replace "9876543210" with your actual phone number below!');
    
    const testResponse = await fetch('http://localhost:5000/api/sms/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: '9876543210', // ⚠️ REPLACE WITH YOUR PHONE NUMBER (e.g., '9876543210' for India)
        message: '🧪 Test SMS from Trimly Barbershop App! This is a test message to verify SMS functionality.'
      }),
    });

    if (testResponse.ok) {
      const testResult = await testResponse.json();
      console.log('✅ Test SMS sent successfully:', testResult.messageId);
      console.log('📱 Check your phone for the test message!');
    } else {
      const error = await testResponse.json();
      console.log('❌ Test SMS failed:', error.message);
      
      if (error.message.includes('not configured')) {
        console.log('🔧 Make sure you have created the .env file with your Twilio credentials!');
      }
    }

    console.log('\n📋 Available SMS Endpoints:');
    console.log('POST /api/sms/test - Send test SMS');
    console.log('POST /api/sms/send-confirmation/:appointmentId - Send booking confirmation');
    console.log('POST /api/sms/send-reminder/:appointmentId - Send appointment reminder');
    console.log('POST /api/sms/send-queue-update/:queueId - Send queue update');
    console.log('POST /api/sms/send-your-turn/:queueId - Send "your turn" notification');
    console.log('POST /api/sms/send-completion/:queueId - Send service completion');
    console.log('POST /api/sms/send-cancellation/:appointmentId - Send cancellation');
    console.log('PUT /api/sms/preferences/:userId - Update SMS preferences');
    console.log('GET /api/sms/history/:appointmentId - Get SMS history');

    console.log('\n✅ Your Twilio Credentials:');
    console.log('Account SID: AC783285a34273f70c87c08d00499b9392');
    console.log('Auth Token: c62468b62d49450fb7694c455db5cad7');
    console.log('Phone Number: +17622164645');

    console.log('\n🔧 Setup Instructions:');
    console.log('1. ✅ Twilio account created');
    console.log('2. ✅ Credentials obtained');
    console.log('3. Create .env file in src/server/ with your credentials');
    console.log('4. Replace "9876543210" in this script with your phone number');
    console.log('5. Run this test script again');

  } catch (error) {
    console.error('❌ Error testing SMS:', error);
  }
};

// Run the test
testSMS(); 