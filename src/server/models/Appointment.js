import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  barberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  barberName: {
    type: String,
    required: true
  },
  barberAvatar: String,
  service: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },

  // SMS Tracking
  smsSent: {
    confirmation: {
      type: Boolean,
      default: false
    },
    reminder: {
      type: Boolean,
      default: false
    },
    cancellation: {
      type: Boolean,
      default: false
    }
  },
  smsHistory: [{
    type: {
      type: String,
      enum: ['confirmation', 'reminder', 'cancellation', 'queue_update', 'your_turn', 'completion']
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    messageId: String,
    success: Boolean,
    error: String
  }]
}, {
  timestamps: true
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment; 