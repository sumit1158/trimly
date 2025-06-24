import express from 'express';
const router = express.Router();
import Queue from '../models/Queue.js';
import SMSService from '../services/smsService.js';

// Get queue for a specific barber
router.get('/barber/:barberId', async (req, res) => {
  try {
    const queue = await Queue.find({ barberId: req.params.barberId })
      .sort({ createdAt: 1 });
    res.json(queue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get queue items for a specific customer
router.get('/customer/:customerId', async (req, res) => {
  try {
    const queue = await Queue.find({ customerId: req.params.customerId })
      .sort({ createdAt: 1 });
    res.json(queue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add customer to queue
router.post('/', async (req, res) => {
  try {
    const { barberId, customerId, customerName, customerPhone, customerEmail, service, estimatedTime, status, isWalkIn } = req.body;

    // Validate required fields
    if (!barberId || !customerName || !service || !estimatedTime) {
      return res.status(400).json({
        message: 'Missing required fields',
        details: {
          barberId: !barberId ? 'Barber ID is required' : null,
          customerName: !customerName ? 'Customer name is required' : null,
          service: !service ? 'Service is required' : null,
          estimatedTime: !estimatedTime ? 'Estimated time is required' : null
        }
      });
    }

    // For non-walk-in customers, customerId is required
    if (!isWalkIn && !customerId) {
      return res.status(400).json({
        message: 'Customer ID is required for non-walk-in customers'
      });
    }

    const queueItem = new Queue({
      barberId,
      customerId: isWalkIn ? null : customerId,
      customerName,
      customerPhone,
      customerEmail,
      service,
      estimatedTime,
      status: status || 'waiting',
      isWalkIn: isWalkIn || false
    });

    const savedItem = await queueItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update queue item status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['waiting', 'in-progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const queueItem = await Queue.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!queueItem) {
      return res.status(404).json({ message: 'Queue item not found' });
    }

    // Send SMS to next in queue when their service is about to start
    if (status === 'in-progress') {
      // Find the next waiting customer (after this one)
      const nextInQueue = await Queue.findOne({
        barberId: queueItem.barberId,
        status: 'waiting'
      }).sort({ createdAt: 1 });
      if (nextInQueue && nextInQueue.customerPhone) {
        await SMSService.sendYourTurnSMS(nextInQueue);
        console.log('Sent SMS to next in queue:', nextInQueue.customerPhone);
      }
    }

    // Send 'Thank you!' SMS when service is completed
    if (status === 'completed' && queueItem.customerPhone) {
      try {
        await SMSService.sendSMS(queueItem.customerPhone, 'Thank you for visiting! We hope to see you again.');
        console.log('Thank you SMS sent to', queueItem.customerPhone);
      } catch (err) {
        console.error('Failed to send thank you SMS:', err);
      }
    }

    res.json(queueItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Remove customer from queue
router.delete('/:id', async (req, res) => {
  try {
    const queueItem = await Queue.findByIdAndDelete(req.params.id);
    if (!queueItem) {
      return res.status(404).json({ message: 'Queue item not found' });
    }
    res.json({ message: 'Queue item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 