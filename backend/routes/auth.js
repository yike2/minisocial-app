const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// JWT Secret (in production, this should be in .env)
const JWT_SECRET = process.env.JWT_SECRET || 'minisocial-development-secret-key';

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId }, 
    JWT_SECRET, 
    { expiresIn: '7d' } // Token expires in 7 days
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Username, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'User Already Exists',
        message: existingUser.email === email 
          ? 'Email is already registered' 
          : 'Username is already taken'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password, // Will be hashed by pre-save middleware
      profileInfo: {
        firstName: firstName || '',
        lastName: lastName || ''
      }
    });

    // Save user to database
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Send response (without password)
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Registration error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: 'Validation Error',
        message: messages.join(', ')
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        error: 'Duplicate Error',
        message: `${field} is already taken`
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or username

    // Validate required fields
    if (!identifier || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email/username and password are required'
      });
    }

    // Find user by email or username
    const user = await User.findByCredentials(identifier);
    
    if (!user) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Account Disabled',
        message: 'Your account has been disabled'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Send response
    res.status(200).json({
      message: 'Login successful',
      token,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong during login'
    });
  }
});

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private (requires JWT token)
router.get('/profile', async (req, res) => {
  try {
    // Extract token from Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Access Denied',
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        error: 'Access Denied',
        message: 'Invalid token'
      });
    }

    res.status(200).json({
      message: 'Profile retrieved successfully',
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Profile error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Access Denied',
        message: 'Invalid token'
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong'
    });
  }
});

module.exports = router;