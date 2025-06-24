import express from 'express';
import SMSService from '../services/smsService.js';
import Appointment from '../models/Appointment.js';
import Queue from '../models/Queue.js';
import User from '../models/User.js';

const router = express.Router();

// Send booking confirmation SMS
router.post('/send-confirmation/:appointmentId', async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const appointment = await Appointment.findById(appointmentId)
      .populate('userId', 'name phone smsNotifications')
      .populate('barberId', 'name phone');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if SMS notifications are enabled
    if (!appointment.userId.smsNotifications?.enabled || 
        !appointment.userId.smsNotifications?.bookingConfirmations) {
      return res.status(400).json({ message: 'SMS notifications are disabled for this user' });
    }

    // Check if confirmation SMS already sent
    if (appointment.smsSent.confirmation) {
      return res.status(400).json({ message: 'Confirmation SMS already sent' });
    }

    const smsData = {
      customerName: appointment.userId.name,
      customerPhone: appointment.userId.phone,
      service: appointment.service,
      date: appointment.date,
      time: appointment.time,
      price: appointment.price,
      barberName: appointment.barberName
    };

    const result = await SMSService.sendBookingConfirmation(smsData);

    if (result.success) {
      // Update appointment with SMS tracking
      appointment.smsSent.confirmation = true;
      appointment.smsHistory.push({
        type: 'confirmation',
        messageId: result.messageId,
        success: true
      });
      await appointment.save();

      res.json({ 
        message: 'Confirmation SMS sent successfully',
        messageId: result.messageId
      });
    } else {
      // Log failed SMS
      appointment.smsHistory.push({
        type: 'confirmation',
        success: false,
        error: result.error
      });
      await appointment.save();

      res.status(500).json({ 
        message: 'Failed to send confirmation SMS',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending confirmation SMS:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Send appointment reminder SMS
router.post('/send-reminder/:appointmentId', async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const appointment = await Appointment.findById(appointmentId)
      .populate('userId', 'name phone smsNotifications')
      .populate('barberId', 'name phone');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if SMS notifications are enabled
    if (!appointment.userId.smsNotifications?.enabled || 
        !appointment.userId.smsNotifications?.appointmentReminders) {
      return res.status(400).json({ message: 'SMS notifications are disabled for this user' });
    }

    // Check if reminder SMS already sent
    if (appointment.smsSent.reminder) {
      return res.status(400).json({ message: 'Reminder SMS already sent' });
    }

    const smsData = {
      customerName: appointment.userId.name,
      customerPhone: appointment.userId.phone,
      service: appointment.service,
      date: appointment.date,
      time: appointment.time,
      barberName: appointment.barberName
    };

    const result = await SMSService.sendAppointmentReminder(smsData);

    if (result.success) {
      // Update appointment with SMS tracking
      appointment.smsSent.reminder = true;
      appointment.smsHistory.push({
        type: 'reminder',
        messageId: result.messageId,
        success: true
      });
      await appointment.save();

      res.json({ 
        message: 'Reminder SMS sent successfully',
        messageId: result.messageId
      });
    } else {
      // Log failed SMS
      appointment.smsHistory.push({
        type: 'reminder',
        success: false,
        error: result.error
      });
      await appointment.save();

      res.status(500).json({ 
        message: 'Failed to send reminder SMS',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending reminder SMS:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Send queue update SMS
router.post('/send-queue-update/:queueId', async (req, res) => {
  try {
    const { queueId } = req.params;
    const { position } = req.body;
    
    const queueItem = await Queue.findById(queueId);
    
    if (!queueItem) {
      return res.status(404).json({ message: 'Queue item not found' });
    }

    // For walk-in customers, we need their phone number
    if (!queueItem.customerPhone) {
      return res.status(400).json({ message: 'Customer phone number not available' });
    }

    const result = await SMSService.sendQueueUpdate(queueItem, position);

    if (result.success) {
      res.json({ 
        message: 'Queue update SMS sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({ 
        message: 'Failed to send queue update SMS',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending queue update SMS:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Send "your turn" SMS
router.post('/send-your-turn/:queueId', async (req, res) => {
  try {
    const { queueId } = req.params;
    
    const queueItem = await Queue.findById(queueId);
    
    if (!queueItem) {
      return res.status(404).json({ message: 'Queue item not found' });
    }

    if (!queueItem.customerPhone) {
      return res.status(400).json({ message: 'Customer phone number not available' });
    }

    const result = await SMSService.sendYourTurnSMS(queueItem);

    if (result.success) {
      res.json({ 
        message: 'Your turn SMS sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({ 
        message: 'Failed to send your turn SMS',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending your turn SMS:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Send service completion SMS
router.post('/send-completion/:queueId', async (req, res) => {
  try {
    const { queueId } = req.params;
    
    const queueItem = await Queue.findById(queueId);
    
    if (!queueItem) {
      return res.status(404).json({ message: 'Queue item not found' });
    }

    if (!queueItem.customerPhone) {
      return res.status(400).json({ message: 'Customer phone number not available' });
    }

    const result = await SMSService.sendServiceCompletion(queueItem);

    if (result.success) {
      res.json({ 
        message: 'Service completion SMS sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({ 
        message: 'Failed to send service completion SMS',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending service completion SMS:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Send cancellation SMS
router.post('/send-cancellation/:appointmentId', async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const appointment = await Appointment.findById(appointmentId)
      .populate('userId', 'name phone smsNotifications');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if SMS notifications are enabled
    if (!appointment.userId.smsNotifications?.enabled) {
      return res.status(400).json({ message: 'SMS notifications are disabled for this user' });
    }

    const smsData = {
      customerName: appointment.userId.name,
      customerPhone: appointment.userId.phone,
      service: appointment.service,
      date: appointment.date,
      time: appointment.time
    };

    const result = await SMSService.sendCancellation(smsData);

    if (result.success) {
      // Update appointment with SMS tracking
      appointment.smsSent.cancellation = true;
      appointment.smsHistory.push({
        type: 'cancellation',
        messageId: result.messageId,
        success: true
      });
      await appointment.save();

      res.json({ 
        message: 'Cancellation SMS sent successfully',
        messageId: result.messageId
      });
    } else {
      // Log failed SMS
      appointment.smsHistory.push({
        type: 'cancellation',
        success: false,
        error: result.error
      });
      await appointment.save();

      res.status(500).json({ 
        message: 'Failed to send cancellation SMS',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending cancellation SMS:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user SMS preferences
router.put('/preferences/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { smsNotifications } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.smsNotifications = {
      ...user.smsNotifications,
      ...smsNotifications
    };

    await user.save();

    res.json({ 
      message: 'SMS preferences updated successfully',
      smsNotifications: user.smsNotifications
    });
  } catch (error) {
    console.error('Error updating SMS preferences:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get SMS history for an appointment
router.get('/history/:appointmentId', async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({ 
      smsHistory: appointment.smsHistory,
      smsSent: appointment.smsSent
    });
  } catch (error) {
    console.error('Error fetching SMS history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Test SMS endpoint
router.post('/test', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({ message: 'Phone number and message are required' });
    }

    // Validate phone number format
    if (!SMSService.validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

    const result = await SMSService.sendSMS(phoneNumber, message);

    if (result.success) {
      res.json({ 
        message: 'Test SMS sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({ 
        message: 'Failed to send test SMS',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending test SMS:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 