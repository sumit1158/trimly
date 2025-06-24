// Test script to add walk-in customers to queue
const testWalkIn = async () => {
  try {
    // First, let's get a barber ID
    const barbersResponse = await fetch('http://localhost:5000/api/users?role=barber');
    const barbers = await barbersResponse.json();
    
    if (barbers.length === 0) {
      console.log('No barbers found. Please create a barber account first.');
      return;
    }
    
    const barberId = barbers[0]._id;
    console.log('Using barber ID:', barberId);
    
    // Sample walk-in customers
    const walkInCustomers = [
      {
        customerName: 'John Smith',
        customerPhone: '+91 98765 43210',
        customerEmail: 'john.smith@email.com',
        service: 'Haircut',
        estimatedTime: '15:30'
      },
      {
        customerName: 'Mike Johnson',
        customerPhone: '+91 87654 32109',
        customerEmail: 'mike.j@email.com',
        service: 'Beard Trim',
        estimatedTime: '16:00'
      },
      {
        customerName: 'David Wilson',
        customerPhone: '+91 76543 21098',
        customerEmail: 'david.w@email.com',
        service: 'Haircut & Beard Trim',
        estimatedTime: '16:30'
      }
    ];
    
    console.log('Adding walk-in customers to queue...');
    
    // Add walk-in customers to queue
    for (const customer of walkInCustomers) {
      const queueItem = {
        barberId: barberId,
        customerName: customer.customerName,
        customerPhone: customer.customerPhone,
        customerEmail: customer.customerEmail,
        service: customer.service,
        estimatedTime: customer.estimatedTime,
        status: 'waiting',
        isWalkIn: true
      };
      
      const response = await fetch('http://localhost:5000/api/queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(queueItem),
      });
      
      if (response.ok) {
        console.log(`✅ Added walk-in customer: ${customer.customerName}`);
      } else {
        const error = await response.json();
        console.log(`❌ Failed to add ${customer.customerName}:`, error.message);
      }
    }
    
    console.log('Walk-in customer test completed!');
    console.log('Check the barber queue page to see the walk-in customers.');
    
  } catch (error) {
    console.error('Error testing walk-in customers:', error);
  }
};

// Run the test
testWalkIn(); 