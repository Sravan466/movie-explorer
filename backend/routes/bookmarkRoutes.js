const express = require('express');
const router = express.Router();
const Bookmark = require('../models/Bookmark');
const auth = require('../middleware/auth');

// Add a bookmark
router.post('/', auth, async (req, res) => {
  try {
    const { mediaId, mediaType, title, poster_path, release_date, first_air_date, vote_average } = req.body;

    const newBookmark = new Bookmark({
      userId: req.user.id,
      mediaId,
      mediaType,
      title,
      poster_path,
      release_date,
      first_air_date,
      vote_average,
    });

    await newBookmark.save();
    res.status(201).json({ message: 'Bookmark added successfully!', bookmark: newBookmark });
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({ message: 'Item already bookmarked.' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all bookmarks for a user
router.get('/', auth, async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user.id });
    res.json(bookmarks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove a bookmark
router.delete('/:mediaId/:mediaType', auth, async (req, res) => {
  try {
    const { mediaId, mediaType } = req.params;
    const deletedBookmark = await Bookmark.findOneAndDelete({ userId: req.user.id, mediaId, mediaType });

    if (!deletedBookmark) {
      return res.status(404).json({ message: 'Bookmark not found.' });
    }
    res.json({ message: 'Bookmark removed successfully!', bookmark: deletedBookmark });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 