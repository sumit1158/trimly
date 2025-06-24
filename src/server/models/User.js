import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  role: {
    type: String,
    enum: ['customer', 'barber', 'admin'],
    default: 'customer'
  },
  avatar: {
    type: String,
    default: ''
  },

  // Contact Information
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(v) {
        return /^\+?[\d\s-]{10,}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' }
  },

  // Professional Information (for barbers)
  shopName: {
    type: String,
    default: ''
  },
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  experience: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  specialties: [{
    type: String
  }],
  services: [
    {
      name: { type: String, required: true },
      duration: { type: Number, required: true },
      price: { type: Number, required: true },
      description: { type: String },
    },
  ],
  workingHours: {
    monday: { start: String, end: String, closed: Boolean },
    tuesday: { start: String, end: String, closed: Boolean },
    wednesday: { start: String, end: String, closed: Boolean },
    thursday: { start: String, end: String, closed: Boolean },
    friday: { start: String, end: String, closed: Boolean },
    saturday: { start: String, end: String, closed: Boolean },
    sunday: { start: String, end: String, closed: Boolean }
  },
  acceptsWalkins: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratingCount: {
    type: Number,
    default: 0,
    min: 0
  },

  // Customer Preferences
  preferences: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // SMS Notification Preferences
  smsNotifications: {
    enabled: {
      type: Boolean,
      default: true
    },
    bookingConfirmations: {
      type: Boolean,
      default: true
    },
    appointmentReminders: {
      type: Boolean,
      default: true
    },
    queueUpdates: {
      type: Boolean,
      default: true
    },
    serviceCompletion: {
      type: Boolean,
      default: true
    }
  },

  // Additional Information
  reviewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  },

  // Email Verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

// Generate email verification token
userSchema.methods.generateVerificationToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = token;
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

const User = mongoose.model('User', userSchema);

export default User; 