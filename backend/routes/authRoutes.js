// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // For comparing passwords
const jwt = require('jsonwebtoken'); // For generating JWT
const User = require('../models/User'); // Import the User model

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // 1. Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }
    // Basic email validation (Mongoose also validates)
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address.' });
    }


    // 2. Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      if (user.email === email) {
        return res.status(400).json({ message: 'User with this email already exists.' });
      }
      if (user.username === username) {
        return res.status(400).json({ message: 'Username is already taken.' });
      }
    }

    // 3. Create a new user instance
    user = new User({
      username,
      email,
      password, // Password will be hashed by the pre-save hook in User model
    });

    // 4. Save the new user
    await user.save();

    // 5. Generate JWT token
    const payload = {
      user: {
        id: user.id,
        username: user.username,
      },
    };

    // 6. Sign the token
    if (!process.env.JWT_SECRET) {
      console.error('FATAL ERROR: JWT_SECRET is not defined.');
      return res.status(500).json({ message: 'Server configuration error: JWT_SECRET missing.' });
    }

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        const userResponse = {
            id: user.id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
        };
        res.status(201).json({
          message: 'User registered successfully!',
          token,
          user: userResponse
        });
      }
    );

  } catch (error) {
    console.error('Registration error:', error.message);
    if (error.name === 'ValidationError') {
      let errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({ message: 'Validation Error', errors });
    }
    // Handle duplicate key errors (e.g., if unique constraint is violated despite prior check - race condition)
    if (error.code === 11000) {
        return res.status(400).json({ message: 'Email or username already exists.' });
    }
    res.status(500).json({ message: 'Server error during registration.' });
  }
});


// @route   POST api/auth/login
// @desc    Authenticate user & get token (Login)
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    // 2. Check if user exists
    // Allow login with email OR username (optional - current User model has unique email & username)
    // For simplicity, we'll stick to email for login here.
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials. User not found.' });
    }

    // 3. Compare provided password with stored hashed password
    const isMatch = await user.comparePassword(password); // Using the method from User model
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials. Password incorrect.' });
    }

    // 4. User matched, create JWT payload
    const payload = {
      user: {
        id: user.id,
        username: user.username,
        // Add any other user data you want in the token, but keep it minimal
      },
    };

    // 5. Sign the token
    if (!process.env.JWT_SECRET) {
        console.error('FATAL ERROR: JWT_SECRET is not defined.');
        return res.status(500).json({ message: 'Server configuration error: JWT_SECRET missing.' });
    }

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' }, // Increased token expiration for development
      (err, token) => {
        if (err) throw err;
        res.json({
          message: 'Login successful!',
          token,
          user: { // Send back some user info (excluding password)
            id: user.id,
            username: user.username,
            email: user.email,
          }
        });
      }
    );
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

module.exports = router;
