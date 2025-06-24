import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { validateIndianPhoneMiddleware } from '../utils/phoneValidation.js';

const router = express.Router();

// Register new user
router.post('/register', validateIndianPhoneMiddleware, async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      role = 'customer',
      avatar,
      phone,
      location,
      address,
      city,
      state,
      zipCode,
      shopName,
      experience,
      bio,
      specialties,
      services,
      workingHours,
      acceptsWalkins,
      preferences
    } = req.body;

    console.log('Registration attempt:', { email, name, role });

    // Validate required fields
    if (!name || !email || !password || !phone || !location) {
      console.log('Missing required fields:', { name, email, phone, location });
      return res.status(400).json({ 
        message: 'Missing required fields',
        details: {
          name: !name ? 'Name is required' : null,
          email: !email ? 'Email is required' : null,
          password: !password ? 'Password is required' : null,
          phone: !phone ? 'Phone number is required' : null,
          location: !location ? 'Location is required' : null
        }
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Email already registered:', email);
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role,
      avatar,
      phone,
      location,
      address,
      city,
      state,
      zipCode,
      shopName,
      experience,
      bio,
      specialties,
      services,
      workingHours,
      acceptsWalkins,
      preferences,
      isEmailVerified: true
    });

    await user.save();
    console.log('User created successfully:', { email, userId: user._id });

    // Return user data without sensitive information
    const userData = user.toObject();
    delete userData.password;

    res.status(201).json({
      message: 'Registration successful!',
      user: userData
    });
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Registration failed', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    console.log('Login attempt for email:', email);

    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('User found, comparing password...');
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('Login successful for user:', email);

    // Return user data without sensitive information
    const userData = user.toObject();
    delete userData.password;

    res.json({
      message: 'Login successful',
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Get all users
router.get('/', async (req, res) => {
  try {
    const { role, ids, shopId } = req.query;
    
    if (ids) {
      // Get users by multiple IDs
      const userIds = ids.split(',');
      const users = await User.find({ _id: { $in: userIds } }).select('-password');
      res.json(users);
    } else if (shopId) {
      // Get staff members for a specific shop
      const users = await User.find({ shopId, role: { $ne: 'customer' } }).select('-password');
      res.json(users);
    } else {
      // Get users by role or all users
      const query = role ? { role } : {};
      const users = await User.find(query).select('-password');
      res.json(users);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    // Remove sensitive fields from update data
    delete updateData.password;
    delete updateData.email;
    delete updateData.isEmailVerified;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data without sensitive information
    const userData = user.toObject();
    delete userData.password;

    res.json({
      message: 'Profile updated successfully',
      user: userData
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Profile update failed', error: error.message });
  }
});

// Add staff member
router.post('/staff', async (req, res) => {
  try {
    const { name, email, phone, role, specialties, shopId } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !shopId) {
      return res.status(400).json({ 
        message: 'Missing required fields: name, email, phone, and shopId are required' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new staff member
    const staffMember = new User({
      name,
      email,
      phone,
      role: role || 'barber',
      specialties: specialties || [],
      shopId,
      // Generate a random password for staff members
      password: Math.random().toString(36).slice(-8),
      location: 'Staff Member',
      isEmailVerified: true
    });

    await staffMember.save();

    // Return staff data without sensitive information
    const staffData = staffMember.toObject();
    delete staffData.password;

    res.status(201).json({
      message: 'Staff member added successfully',
      staff: staffData
    });
  } catch (error) {
    console.error('Add staff error:', error);
    res.status(500).json({ message: 'Failed to add staff member', error: error.message });
  }
});

// Update staff member
router.put('/staff/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove sensitive fields from update data
    delete updateData.password;
    delete updateData.email;
    delete updateData.isEmailVerified;

    const staffMember = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!staffMember) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    res.json({
      message: 'Staff member updated successfully',
      staff: staffMember
    });
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({ message: 'Failed to update staff member', error: error.message });
  }
});

// Remove staff member
router.delete('/staff/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const staffMember = await User.findByIdAndDelete(id);
    if (!staffMember) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    res.json({ message: 'Staff member removed successfully' });
  } catch (error) {
    console.error('Remove staff error:', error);
    res.status(500).json({ message: 'Failed to remove staff member', error: error.message });
  }
});

// Change password
router.put('/change-password/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long' });
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Return user data without sensitive information
    const userData = user.toObject();
    delete userData.password;

    res.json({
      message: 'Password changed successfully',
      user: userData
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Failed to change password', error: error.message });
  }
});

// Favorites routes
// Add barber to favorites
router.post('/favorites/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { barberId } = req.body;

    if (!barberId) {
      return res.status(400).json({ message: 'Barber ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if barber exists and is actually a barber
    const barber = await User.findById(barberId);
    if (!barber || barber.role !== 'barber') {
      return res.status(404).json({ message: 'Barber not found' });
    }

    // Check if already in favorites
    if (user.favorites.includes(barberId)) {
      return res.status(400).json({ message: 'Barber is already in favorites' });
    }

    // Add to favorites
    user.favorites.push(barberId);
    await user.save();

    res.json({
      message: 'Barber added to favorites successfully',
      favorites: user.favorites
    });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({ message: 'Failed to add to favorites', error: error.message });
  }
});

// Remove barber from favorites
router.delete('/favorites/:userId/:barberId', async (req, res) => {
  try {
    const { userId, barberId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove from favorites
    user.favorites = user.favorites.filter(id => id.toString() !== barberId);
    await user.save();

    res.json({
      message: 'Barber removed from favorites successfully',
      favorites: user.favorites
    });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({ message: 'Failed to remove from favorites', error: error.message });
  }
});

// Get user's favorite barbers
router.get('/favorites/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate('favorites');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Filter out any non-barber users from favorites
    const favoriteBarbers = user.favorites.filter(barber => barber.role === 'barber');

    res.json({
      favorites: favoriteBarbers,
      count: favoriteBarbers.length
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: 'Failed to get favorites', error: error.message });
  }
});

// Check if barber is in user's favorites
router.get('/favorites/:userId/check/:barberId', async (req, res) => {
  try {
    const { userId, barberId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFavorite = user.favorites.includes(barberId);

    res.json({
      isFavorite,
      barberId
    });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ message: 'Failed to check favorite status', error: error.message });
  }
});

export default router; 