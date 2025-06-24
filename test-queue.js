// Test script to add customers to queue
const testQueue = async () => {
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
    
    // Get customers
    const customersResponse = await fetch('http://localhost:5000/api/users?role=customer');
    const customers = await customersResponse.json();
    
    if (customers.length === 0) {
      console.log('No customers found. Please create customer accounts first.');
      return;
    }
    
    console.log('Found customers:', customers.length);
    
    // Add customers to queue
    for (let i = 0; i < Math.min(3, customers.length); i++) {
      const customer = customers[i];
      
      const queueItem = {
        barberId: barberId,
        customerId: customer._id,
        customerName: customer.name,
        customerEmail: customer.email,
        service: 'Haircut',
        estimatedTime: '14:30',
        status: 'waiting'
      };
      
      const response = await fetch('http://localhost:5000/api/queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(queueItem),
      });
      
      if (response.ok) {
        console.log(`Added ${customer.name} to queue`);
      } else {
        console.log(`Failed to add ${customer.name} to queue`);
      }
    }
    
    console.log('Queue test completed!');
    
  } catch (error) {
    console.error('Error testing queue:', error);
  }
};

// Run the test
testQueue(); 