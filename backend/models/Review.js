const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  contentId: {
    type: String,
    required: true,
  },
  mediaType: {
    type: String,
    required: true,
    enum: ['movie', 'tv'], // Ensure it's either movie or tv
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

reviewSchema.index({ contentId: 1, mediaType: 1 }); // Index for faster lookup by content

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review; 