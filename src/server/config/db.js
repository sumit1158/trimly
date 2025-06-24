import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    console.log('\n=== Attempting MongoDB Connection ===');
    console.log('Connection Status: Connecting...');
    
    const conn = await mongoose.connect('mongodb+srv://users:Sumitp%40til58@trimly.clslanc.mongodb.net/?retryWrites=true&w=majority&appName=trimly');
    
    console.log('\n✅ MongoDB Connection Successful!');
    console.log(`Database: ${conn.connection.name}`);
    console.log('================================\n');

    // Add connection event listeners
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

  } catch (error) {
    console.error('\n❌ MongoDB Connection Failed!');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting steps:');
    console.error('1. Check if MongoDB is installed and running');
    console.error('2. Verify MongoDB service is running on port 27017');
    console.error('3. Check if the connection string is correct');
    console.error('4. Ensure no firewall is blocking the connection\n');
    process.exit(1);
  }
};

export default connectDB; 