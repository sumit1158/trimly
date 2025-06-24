// Check SMS status and debug script
import twilio from 'twilio';
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } from './config/twilio.js';

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

async function checkSMSStatus() {
  try {
    console.log('Checking recent SMS messages...\n');
    
    // Get recent messages
    const messages = await client.messages.list({ limit: 10 });
    
    console.log('Recent SMS Messages:');
    console.log('====================');
    
    messages.forEach((message, index) => {
      console.log(`${index + 1}. Message ID: ${message.sid}`);
      console.log(`   To: ${message.to}`);
      console.log(`   From: ${message.from}`);
      console.log(`   Status: ${message.status}`);
      console.log(`   Date: ${message.dateCreated}`);
      console.log(`   Body: ${message.body.substring(0, 50)}...`);
      console.log(`   Error Code: ${message.errorCode || 'None'}`);
      console.log(`   Error Message: ${message.errorMessage || 'None'}`);
      console.log('---');
    });
    
    // Check account status
    const account = await client.api.accounts(TWILIO_ACCOUNT_SID).fetch();
    console.log('\nAccount Status:');
    console.log('===============');
    console.log(`Status: ${account.status}`);
    console.log(`Type: ${account.type}`);
    console.log(`Friendly Name: ${account.friendlyName}`);
    
    if (account.status === 'trial') {
      console.log('\n⚠️  TRIAL ACCOUNT LIMITATIONS:');
      console.log('- You can only send SMS to verified numbers');
      console.log('- Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
      console.log('- Add and verify your phone number');
    }
    
  } catch (error) {
    console.error('Error checking SMS status:', error);
  }
}

checkSMSStatus(); 