// Test script for cancellation SMS
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

async function getFirstBarberId() {
  const res = await fetch(`${API_BASE}/users?role=barber`);
  const barbers = await res.json();
  if (barbers.length === 0) throw new Error('No barbers found in the database');
  return barbers[0]._id;
}

async function testCancellationSMS() {
  try {
    console.log('Testing Cancellation SMS...\n');

    // Step 0: Get a real barberId
    const barberId = await getFirstBarberId();
    console.log('Using barberId:', barberId);

    // Step 1: Create a test appointment
    console.log('1. Creating test appointment...');
    const appointmentData = {
      barberId,
      userId: '68528dc8a4a299b5d2f68a9c', // Use the user ID from your recent registration
      barberName: 'Test Barber',
      service: 'Haircut',
      date: '2025-06-20',
      time: '14:00',
      price: 500
    };

    const createResponse = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointmentData)
    });

    if (!createResponse.ok) {
      throw new Error(`Failed to create appointment: ${createResponse.statusText}`);
    }

    const appointment = await createResponse.json();
    console.log('✅ Appointment created:', appointment.appointment._id);

    // Step 2: Cancel the appointment (this should trigger SMS)
    console.log('\n2. Cancelling appointment to trigger SMS...');
    const cancelResponse = await fetch(`${API_BASE}/appointments/${appointment.appointment._id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' })
    });

    if (!cancelResponse.ok) {
      throw new Error(`Failed to cancel appointment: ${cancelResponse.statusText}`);
    }

    const cancelledAppointment = await cancelResponse.json();
    console.log('✅ Appointment cancelled successfully');

    // Step 3: Check SMS history
    console.log('\n3. Checking SMS history...');
    const historyResponse = await fetch(`${API_BASE}/sms/history/${appointment.appointment._id}`);
    
    if (historyResponse.ok) {
      const history = await historyResponse.json();
      console.log('📱 SMS History:');
      history.smsHistory.forEach(sms => {
        console.log(`   - Type: ${sms.type}, Success: ${sms.success}`);
        if (sms.error) console.log(`     Error: ${sms.error}`);
      });
    }

    console.log('\n🎉 Cancellation SMS test completed!');
    console.log('Check your phone for the cancellation SMS.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Alternative: Test using the direct SMS endpoint
async function testDirectCancellationSMS() {
  try {
    console.log('\nTesting Direct Cancellation SMS...\n');

    // Use an existing appointment ID from your database
    const appointmentId = '68528dd9a4a299b5d2f68ab4'; // Use a real appointment ID

    const response = await fetch(`${API_BASE}/sms/send-cancellation/${appointmentId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`SMS failed: ${error.message}`);
    }

    const result = await response.json();
    console.log('✅ Direct cancellation SMS sent:', result);

  } catch (error) {
    console.error('❌ Direct SMS test failed:', error.message);
  }
}

// Run tests
testCancellationSMS();
// Uncomment the line below to test direct SMS endpoint
// testDirectCancellationSMS(); 