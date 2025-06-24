const BASE_URL = 'http://localhost:5000/api';

// Test data
const testCustomerId = '68528dc8a4a299b5d2f68a9c'; // Replace with actual customer ID
const testBarberId = '685040e971ccfe5deff53405'; // Replace with actual barber ID

async function testFavorites() {
  console.log('🧪 Testing Favorites Functionality\n');

  try {
    // Test 1: Add barber to favorites
    console.log('1. Testing: Add barber to favorites');
    const addResponse = await fetch(`${BASE_URL}/users/favorites/${testCustomerId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ barberId: testBarberId }),
    });
    
    if (addResponse.ok) {
      const addData = await addResponse.json();
      console.log('✅ Successfully added barber to favorites');
      console.log('   Response:', addData);
    } else {
      const errorData = await addResponse.json();
      console.log('❌ Failed to add barber to favorites');
      console.log('   Error:', errorData);
    }

    // Test 2: Check if barber is in favorites
    console.log('\n2. Testing: Check if barber is in favorites');
    const checkResponse = await fetch(`${BASE_URL}/users/favorites/${testCustomerId}/check/${testBarberId}`);
    
    if (checkResponse.ok) {
      const checkData = await checkResponse.json();
      console.log('✅ Successfully checked favorite status');
      console.log('   Is favorite:', checkData.isFavorite);
    } else {
      const errorData = await checkResponse.json();
      console.log('❌ Failed to check favorite status');
      console.log('   Error:', errorData);
    }

    // Test 3: Get user's favorite barbers
    console.log('\n3. Testing: Get user\'s favorite barbers');
    const getFavoritesResponse = await fetch(`${BASE_URL}/users/favorites/${testCustomerId}`);
    
    if (getFavoritesResponse.ok) {
      const favoritesData = await getFavoritesResponse.json();
      console.log('✅ Successfully retrieved favorite barbers');
      console.log('   Count:', favoritesData.count);
      console.log('   Favorites:', favoritesData.favorites.map(b => ({ id: b._id, name: b.name, shopName: b.shopName })));
    } else {
      const errorData = await getFavoritesResponse.json();
      console.log('❌ Failed to get favorite barbers');
      console.log('   Error:', errorData);
    }

    // Test 4: Remove barber from favorites
    console.log('\n4. Testing: Remove barber from favorites');
    const removeResponse = await fetch(`${BASE_URL}/users/favorites/${testCustomerId}/${testBarberId}`, {
      method: 'DELETE',
    });
    
    if (removeResponse.ok) {
      const removeData = await removeResponse.json();
      console.log('✅ Successfully removed barber from favorites');
      console.log('   Response:', removeData);
    } else {
      const errorData = await removeResponse.json();
      console.log('❌ Failed to remove barber from favorites');
      console.log('   Error:', errorData);
    }

    // Test 5: Verify removal
    console.log('\n5. Testing: Verify barber was removed from favorites');
    const verifyResponse = await fetch(`${BASE_URL}/users/favorites/${testCustomerId}/check/${testBarberId}`);
    
    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      console.log('✅ Successfully verified removal');
      console.log('   Is favorite:', verifyData.isFavorite);
    } else {
      const errorData = await verifyResponse.json();
      console.log('❌ Failed to verify removal');
      console.log('   Error:', errorData);
    }

    // Test 6: Get updated favorites list
    console.log('\n6. Testing: Get updated favorites list');
    const updatedFavoritesResponse = await fetch(`${BASE_URL}/users/favorites/${testCustomerId}`);
    
    if (updatedFavoritesResponse.ok) {
      const updatedFavoritesData = await updatedFavoritesResponse.json();
      console.log('✅ Successfully retrieved updated favorite barbers');
      console.log('   Count:', updatedFavoritesData.count);
      console.log('   Favorites:', updatedFavoritesData.favorites.map(b => ({ id: b._id, name: b.name, shopName: b.shopName })));
    } else {
      const errorData = await updatedFavoritesResponse.json();
      console.log('❌ Failed to get updated favorite barbers');
      console.log('   Error:', errorData);
    }

    console.log('\n🎉 All favorites tests completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Test barber appointments
async function testBarberAppointments() {
  console.log('\n🧪 Testing Barber Appointments\n');

  try {
    // Test: Get barber's upcoming appointments
    console.log('1. Testing: Get barber\'s upcoming appointments');
    const appointmentsResponse = await fetch(`${BASE_URL}/appointments/barber/${testBarberId}?status=upcoming`);
    
    if (appointmentsResponse.ok) {
      const appointmentsData = await appointmentsResponse.json();
      console.log('✅ Successfully retrieved barber appointments');
      console.log('   Count:', appointmentsData.length);
      console.log('   Appointments:', appointmentsData.map(app => ({
        id: app._id,
        service: app.service,
        date: app.date,
        time: app.time,
        status: app.status
      })));
    } else {
      const errorData = await appointmentsResponse.json();
      console.log('❌ Failed to get barber appointments');
      console.log('   Error:', errorData);
    }

  } catch (error) {
    console.error('❌ Barber appointments test failed with error:', error);
  }
}

// Run tests
async function runAllTests() {
  await testFavorites();
  await testBarberAppointments();
}

// Run tests if this file is executed directly
runAllTests(); 