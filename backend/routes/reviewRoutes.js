// backend/routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const auth = require('../middleware/auth'); // Assuming you have an auth middleware

// @route   POST api/reviews
// @desc    Submit a review for a movie or TV show
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { contentId, mediaType, rating, text } = req.body;

    // Basic validation
    if (!contentId || !mediaType || !rating || !text) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ msg: 'Rating must be between 1 and 5' });
    }

    const newReview = new Review({
      contentId,
      mediaType,
      userId: req.user.id,
      username: req.user.username, // Assuming username is available on req.user
      rating,
      text,
    });

    const review = await newReview.save();
    res.status(201).json(review);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/reviews/:contentId/:mediaType
// @desc    Get all reviews for a specific movie or TV show
// @access  Public
router.get('/:contentId/:mediaType', async (req, res) => {
  try {
    const { contentId, mediaType } = req.params;
    const reviews = await Review.find({ contentId, mediaType })
      .populate('userId', 'username') // Populate userId and select only username
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/reviews/:id
// @desc    Update a review
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { rating, text } = req.body;

    // Find the review by ID
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ msg: 'Review not found' });
    }

    // Check if the user owns the review
    if (review.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized to update this review' });
    }

    // Update review fields if provided
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ msg: 'Rating must be between 1 and 5' });
      }
      review.rating = rating;
    }
    if (text !== undefined) {
      review.text = text.trim();
    }

    // Save the updated review
    await review.save();
    res.json(review);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Review not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/reviews/:id
// @desc    Delete a review
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Find the review by ID
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ msg: 'Review not found' });
    }

    // Check if the user owns the review
    if (review.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized to delete this review' });
    }

    await review.deleteOne(); // Use deleteOne() instead of remove()
    res.json({ msg: 'Review removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Review not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router; 