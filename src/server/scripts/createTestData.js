import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect('mongodb+srv://users:Sumitp%40til58@trimly.clslanc.mongodb.net/?retryWrites=true&w=majority&appName=trimly')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Get a barber and some customers
      const barber = await User.findOne({ role: 'barber' });
      const customers = await User.find({ role: 'customer' }).limit(5);
      
      if (!barber) {
        console.log('No barber found. Please create a barber account first.');
        return;
      }
      
      if (customers.length === 0) {
        console.log('No customers found. Please create customer accounts first.');
        return;
      }

      console.log(`Found barber: ${barber.name}`);
      console.log(`Found ${customers.length} customers`);

      // Clear existing appointments for this barber
      await Appointment.deleteMany({ barberId: barber._id });
      console.log('Cleared existing appointments');

      // Create test appointments for the last 30 days
      const services = ['Haircut', 'Beard Trim', 'Hot Towel Shave', 'Hair Coloring', 'Kids Haircut'];
      const prices = [25, 15, 30, 45, 20];
      
      const appointments = [];
      const today = new Date();
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Create 1-4 appointments per day
        const appointmentsPerDay = Math.floor(Math.random() * 4) + 1;
        
        for (let j = 0; j < appointmentsPerDay; j++) {
          const serviceIndex = Math.floor(Math.random() * services.length);
          const customer = customers[Math.floor(Math.random() * customers.length)];
          const time = `${9 + Math.floor(Math.random() * 8)}:${Math.random() > 0.5 ? '00' : '30'}`;
          
          // Determine status based on date
          let status = 'upcoming';
          if (date < today) {
            status = Math.random() > 0.1 ? 'completed' : 'cancelled';
          }
          
          appointments.push({
            barberId: barber._id,
            userId: customer._id,
            barberName: barber.shopName || barber.name,
            barberAvatar: barber.avatar,
            service: services[serviceIndex],
            date: dateStr,
            time: time,
            price: prices[serviceIndex],
            status: status
          });
        }
      }

      // Insert appointments
      await Appointment.insertMany(appointments);
      console.log(`Created ${appointments.length} test appointments`);
      
      // Show summary
      const completed = appointments.filter(apt => apt.status === 'completed').length;
      const upcoming = appointments.filter(apt => apt.status === 'upcoming').length;
      const cancelled = appointments.filter(apt => apt.status === 'cancelled').length;
      
      console.log('\nAppointment Summary:');
      console.log(`- Completed: ${completed}`);
      console.log(`- Upcoming: ${upcoming}`);
      console.log(`- Cancelled: ${cancelled}`);
      console.log(`- Total Revenue: $${appointments.filter(apt => apt.status === 'completed').reduce((sum, apt) => sum + apt.price, 0)}`);

    } catch (error) {
      console.error('Error creating test data:', error);
    } finally {
      // Close the connection
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  }); 