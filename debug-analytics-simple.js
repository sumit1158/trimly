// Simple debug script to check analytics endpoints
const API_BASE = 'http://localhost:5000/api';
const BARBER_ID = '685040e971ccfe5deff53405'; // The barber ID from your logs

async function debugAnalytics() {
  try {
    console.log('🔍 Debugging Analytics Endpoints...\n');

    // 1. Check all appointments for this barber
    console.log('1. Checking all appointments for barber...');
    const appointmentsResponse = await fetch(`${API_BASE}/appointments/barber/${BARBER_ID}`);
    const appointments = await appointmentsResponse.json();
    console.log(`   Found ${appointments.length} appointments for barber ${BARBER_ID}`);
    
    if (appointments.length > 0) {
      console.log('   Sample appointments:');
      appointments.slice(0, 3).forEach((apt, index) => {
        console.log(`   ${index + 1}. ID: ${apt._id}, Service: ${apt.service}, Date: ${apt.date}, Status: ${apt.status}, Price: ${apt.price}`);
      });
    }

    // 2. Check analytics overview for different periods
    console.log('\n2. Checking analytics overview...');
    const periods = ['today', 'week', 'month'];
    
    for (const period of periods) {
      const analyticsResponse = await fetch(`${API_BASE}/analytics/barber/${BARBER_ID}/overview?period=${period}`);
      const analytics = await analyticsResponse.json();
      console.log(`   ${period.toUpperCase()}:`);
      console.log(`     - Total Revenue: ${analytics.totalRevenue}`);
      console.log(`     - Total Appointments: ${analytics.totalAppointments}`);
      console.log(`     - Completed: ${analytics.completedAppointments}`);
      console.log(`     - Cancelled: ${analytics.cancelledAppointments}`);
      console.log(`     - Upcoming: ${analytics.upcomingAppointments}`);
    }

    // 3. Check if there are any appointments in the database at all
    console.log('\n3. Checking all appointments in database...');
    const allAppointmentsResponse = await fetch(`${API_BASE}/appointments`);
    const allAppointments = await allAppointmentsResponse.json();
    console.log(`   Total appointments in database: ${allAppointments.length}`);
    
    if (allAppointments.length > 0) {
      console.log('   Sample appointments from database:');
      allAppointments.slice(0, 3).forEach((apt, index) => {
        console.log(`   ${index + 1}. Barber: ${apt.barberId}, Service: ${apt.service}, Date: ${apt.date}, Status: ${apt.status}`);
      });
    }

    // 4. Check the date filtering logic
    console.log('\n4. Date filtering check...');
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    console.log(`   Today's date: ${today}`);
    console.log(`   This month: ${thisMonth}`);
    
    const todayAppointments = appointments.filter(apt => apt.date === today);
    const thisMonthAppointments = appointments.filter(apt => apt.date.startsWith(thisMonth));
    
    console.log(`   Appointments for today: ${todayAppointments.length}`);
    console.log(`   Appointments for this month: ${thisMonthAppointments.length}`);

    // 5. Check if appointments have the correct barberId
    console.log('\n5. Barber ID check...');
    const appointmentsWithCorrectBarber = allAppointments.filter(apt => apt.barberId === BARBER_ID);
    console.log(`   Appointments with correct barberId: ${appointmentsWithCorrectBarber.length}`);
    
    if (appointmentsWithCorrectBarber.length > 0) {
      console.log('   These appointments should show in dashboard:');
      appointmentsWithCorrectBarber.forEach((apt, index) => {
        console.log(`   ${index + 1}. Date: ${apt.date}, Service: ${apt.service}, Status: ${apt.status}`);
      });
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugAnalytics(); 