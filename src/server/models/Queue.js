import mongoose from 'mongoose';

const queueSchema = new mongoose.Schema({
  barberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  customerName: {
    type: String,
    required: true,
  },
  customerPhone: String,
  customerEmail: String,
  service: {
    type: String,
    required: true,
  },
  estimatedTime: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['waiting', 'in-progress', 'completed', 'cancelled'],
    default: 'waiting',
  },
  isWalkIn: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Queue', queueSchema); 