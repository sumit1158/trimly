import cron from 'node-cron';
import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import sendSMS from '../services/smsService.js';
import dotenv from 'dotenv';
dotenv.config();

// Connect to MongoDB if not already connected
if (mongoose.connection.readyState === 0) {
  mongoose.connect('mongodb+srv://users:Sumitp%40til58@trimly.clslanc.mongodb.net/?retryWrites=true&w=majority&appName=trimly');
}

console.log('⏰ SMS Reminder Cron Job Started');

cron.schedule('*/5 * * * *', async () => {
  try {
    const now = new Date();
    const in30 = new Date(now.getTime() + 30 * 60000);
    const in35 = new Date(now.getTime() + 35 * 60000);

    // Find appointments in the next 30-35 minutes, not yet reminded
    const appointments = await Appointment.find({
      status: 'upcoming',
      'smsSent.reminder': false,
      $or: [
        // ISO string date/time comparison
        {
          date: in30.toISOString().slice(0, 10),
          time: { $gte: in30.toTimeString().slice(0, 5), $lte: in35.toTimeString().slice(0, 5) }
        },
        {
          date: in35.toISOString().slice(0, 10),
          time: { $gte: in30.toTimeString().slice(0, 5), $lte: in35.toTimeString().slice(0, 5) }
        }
      ]
    });

    for (const appt of appointments) {
      const user = await User.findById(appt.userId);
      if (!user || !user.phone) continue;
      const message = `Reminder: Your appointment for ${appt.service} at ${appt.barberName} is in 30 minutes.`;
      try {
        await sendSMS(user.phone, message);
        appt.smsSent.reminder = true;
        appt.smsHistory.push({ type: 'reminder', sentAt: new Date(), success: true });
        await appt.save();
        console.log(`✅ Reminder sent to ${user.phone} for appointment ${appt._id}`);
      } catch (err) {
        appt.smsHistory.push({ type: 'reminder', sentAt: new Date(), success: false, error: err.message });
        await appt.save();
        console.error(`❌ Failed to send reminder to ${user.phone}:`, err.message);
      }
    }
  } catch (err) {
    console.error('Error in reminder cron job:', err);
  }
}); 