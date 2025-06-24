import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Appointment from '../models/Appointment.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect('mongodb+srv://users:Sumitp%40til58@trimly.clslanc.mongodb.net/?retryWrites=true&w=majority&appName=trimly')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Delete all appointments
      const result = await Appointment.deleteMany({});
      console.log(`Successfully deleted ${result.deletedCount} appointments`);
    } catch (error) {
      console.error('Error deleting appointments:', error);
    } finally {
      // Close the connection
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  }); 