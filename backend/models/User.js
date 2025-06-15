// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required.'],
      unique: true, // Ensure usernames are unique
      trim: true,   // Remove leading/trailing whitespace
      minlength: [3, 'Username must be at least 3 characters long.'],
      maxlength: [30, 'Username cannot exceed 30 characters.'],
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores.'], // Example validation
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true, // Ensure emails are unique
      trim: true,
      lowercase: true, // Store emails in lowercase for consistency
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address.',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      minlength: [6, 'Password must be at least 6 characters long.'],
      // Important: We will not return the password in API responses by default
      // select: false, // This can be handled in queries or by transforming the object
    },
    // You can add more fields later, e.g.:
    // profilePicture: { type: String, default: 'default.jpg' },
    // role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Middleware: Hash password before saving a new user document
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate a salt (adds randomness to the hash)
    const salt = await bcrypt.genSalt(10); // 10 is a common salt round value
    // Hash the password with the salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error); // Pass any error to the next middleware or error handler
  }
});

// Instance method: Compare candidate password with the stored hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    // 'this.password' refers to the hashed password of the user instance
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    // It's generally better to throw the error or return false,
    // rather than calling next(error) in an instance method.
    // Let the calling function handle the error.
    console.error("Error comparing password:", error);
    return false; // Or throw error;
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
