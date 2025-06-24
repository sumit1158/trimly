import express from 'express';
import Appointment from '../models/Appointment.js';
import Queue from '../models/Queue.js';
import User from '../models/User.js';
import SMSService from '../services/smsService.js';

const router = express.Router();

// Create new appointment
router.post('/', async (req, res) => {
  try {
    const {
      barberId,
      userId,
      barberName,
      barberAvatar,
      service,
      date,
      time,
      price,
      status,
      addToQueue = false // New optional parameter
    } = req.body;

    // Validate required fields
    if (!barberId || !userId || !barberName || !service || !date || !time || !price) {
      return res.status(400).json({
        message: 'Missing required fields',
        details: {
          barberId: !barberId ? 'Barber ID is required' : null,
          userId: !userId ? 'User ID is required' : null,
          barberName: !barberName ? 'Barber name is required' : null,
          service: !service ? 'Service is required' : null,
          date: !date ? 'Date is required' : null,
          time: !time ? 'Time is required' : null,
          price: !price ? 'Price is required' : null
        }
      });
    }

    // Fetch user details to get phone number
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create new appointment
    const appointment = new Appointment({
      barberId,
      userId,
      barberName,
      barberAvatar,
      service,
      date,
      time,
      price,
      status: status || 'upcoming'
    });

    await appointment.save();

    // Optionally add to queue
    if (addToQueue) {
      try {
        const queueItem = new Queue({
          barberId,
          customerId: userId,
          customerName: req.body.customerName || user.name,
          customerEmail: req.body.customerEmail || user.email,
          customerPhone: user.phone, // Add phone number to queue
          service,
          estimatedTime: time,
          status: 'waiting'
        });
        await queueItem.save();
      } catch (queueError) {
        console.error('Failed to add to queue:', queueError);
        // Don't fail the appointment creation if queue addition fails
      }
    }

    // Send confirmation SMS (async, don't wait for it)
    try {
      // Use phone number from user profile
      const customerPhone = user.phone;
      if (!customerPhone || customerPhone === 'undefined' || customerPhone === 'null') {
        console.log('No valid phone number found for user, skipping SMS');
      } else {
        const smsData = {
          customerName: req.body.customerName || user.name,
          customerPhone: customerPhone,
          service,
          date,
          time,
          price,
          barberName
        };
        
        SMSService.sendBookingConfirmation(smsData).then(result => {
          if (result.success) {
            console.log('Confirmation SMS sent successfully');
            // Update appointment with SMS tracking
            appointment.smsSent.confirmation = true;
            appointment.smsHistory.push({
              type: 'confirmation',
              messageId: result.messageId,
              success: true
            });
            appointment.save();
          } else {
            console.error('Failed to send confirmation SMS:', result.error);
            appointment.smsHistory.push({
              type: 'confirmation',
              success: false,
              error: result.error
            });
            appointment.save();
          }
        });
      }
    } catch (smsError) {
      console.error('Error sending confirmation SMS:', smsError);
      // Don't fail the appointment creation if SMS fails
    }

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment
    });
  } catch (error) {
    console.error('Appointment creation error:', error);
    res.status(500).json({
      message: 'Failed to create appointment',
      error: error.message
    });
  }
});

// Add appointment to queue
router.post('/:id/add-to-queue', async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Fetch user details to get phone number
    const user = await User.findById(appointment.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already in queue
    const existingInQueue = await Queue.findOne({
      barberId: appointment.barberId,
      customerId: appointment.userId,
      status: { $in: ['waiting', 'in-progress'] }
    });

    if (existingInQueue) {
      return res.status(400).json({ message: 'Customer is already in queue' });
    }

    // Add to queue
    const queueItem = new Queue({
      barberId: appointment.barberId,
      customerId: appointment.userId,
      customerName: req.body.customerName || user.name,
      customerEmail: req.body.customerEmail || user.email,
      customerPhone: user.phone, // Add phone number to queue
      service: appointment.service,
      estimatedTime: appointment.time,
      status: 'waiting'
    });

    await queueItem.save();

    res.json({
      message: 'Appointment added to queue successfully',
      queueItem
    });
  } catch (error) {
    console.error('Add to queue error:', error);
    res.status(500).json({
      message: 'Failed to add appointment to queue',
      error: error.message
    });
  }
});

// Get all appointments
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get appointments for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const appointments = await Appointment.find({ userId });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get appointments for a barber
router.get('/barber/:barberId', async (req, res) => {
  try {
    const { barberId } = req.params;
    const appointments = await Appointment.find({ barberId });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update appointment status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['upcoming', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Send cancellation SMS if status is changed to cancelled
    if (status === 'cancelled') {
      try {
        // Fetch user details to get phone number
        const user = await User.findById(appointment.userId);
        if (user && user.phone) {
          const smsData = {
            customerName: user.name,
            customerPhone: user.phone,
            service: appointment.service,
            date: appointment.date,
            time: appointment.time
          };
          
          SMSService.sendCancellation(smsData).then(result => {
            if (result.success) {
              console.log('Cancellation SMS sent successfully');
              // Update appointment with SMS tracking
              appointment.smsSent.cancellation = true;
              appointment.smsHistory.push({
                type: 'cancellation',
                messageId: result.messageId,
                success: true
              });
              appointment.save();
            } else {
              console.error('Failed to send cancellation SMS:', result.error);
              appointment.smsHistory.push({
                type: 'cancellation',
                success: false,
                error: result.error
              });
              appointment.save();
            }
          });
        } else {
          console.log('No valid phone number found for user, skipping cancellation SMS');
        }
      } catch (smsError) {
        console.error('Error sending cancellation SMS:', smsError);
        // Don't fail the status update if SMS fails
      }
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/appointments/:id/rating
router.patch('/:id/rating', async (req, res) => {
  try {
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    // Update the appointment with the new rating
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { rating },
      { new: true }
    );
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    // Recalculate barber's average rating and rating count
    const barberId = appointment.barberId;
    const ratedAppointments = await Appointment.find({ barberId, rating: { $ne: null } });
    const ratingCount = ratedAppointments.length;
    const ratingSum = ratedAppointments.reduce((sum, apt) => sum + (apt.rating || 0), 0);
    const avgRating = ratingCount > 0 ? ratingSum / ratingCount : 0;
    await User.findByIdAndUpdate(barberId, {
      rating: avgRating,
      ratingCount: ratingCount
    });
    res.json({ message: 'Rating submitted', appointment });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router; 