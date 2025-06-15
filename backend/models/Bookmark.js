const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  mediaId: {
    type: String, // TMDB ID, can be string or number
    required: true,
  },
  mediaType: {
    type: String, // 'movie' or 'tv'
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  poster_path: {
    type: String,
    required: false, // Not all items may have a poster
  },
  release_date: {
    type: String,
    required: false,
  },
  first_air_date: {
    type: String,
    required: false,
  },
  vote_average: {
    type: Number,
    required: false,
  },
}, { timestamps: true });

bookmarkSchema.index({ userId: 1, mediaId: 1, mediaType: 1 }, { unique: true });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

module.exports = Bookmark; 