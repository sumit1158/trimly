// Test script to check server environment variables
const testServerEnv = async () => {
  try {
    console.log('🔍 Testing server environment variables...\n');

    // Test if the server can read environment variables
    const response = await fetch('http://localhost:5000/api/sms/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: '+919876543210', // Test with a proper format
        message: 'Test message'
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Server environment variables are working!');
      console.log('📱 SMS sent successfully:', data.messageId);
    } else {
      console.log('❌ Server environment issue:');
      console.log('Status:', response.status);
      console.log('Error:', data.message);
      console.log('Details:', data.error);
      
      if (data.error === 'SMS service not configured') {
        console.log('\n🔧 The server cannot read the .env file.');
        console.log('📁 Make sure .env is in src/server/ directory');
        console.log('🔄 Restart the server manually');
      }
    }

  } catch (error) {
    console.error('❌ Error testing server:', error.message);
  }
};

testServerEnv(); 