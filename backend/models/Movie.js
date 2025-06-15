// backend/models/Movie.js
const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Movie title is required'], // Add a custom error message
            trim: true, // Remove leading/trailing whitespace
            index: true, // Add index for faster searches
        },
        description: {
            type: String,
            trim: true,
            default: 'No description available.', // Provide a default value
        },
        year: {
            type: Number,
            min: [1888, 'Year must be 1888 or later'], // Add validation for minimum year
            index: true, // Add index for faster searches
        },
        genre: {
            type: [String], // Store genres as an array of strings
            trim: true,
            index: true, // Add index for faster searches
            // Example: ['Action', 'Sci-Fi']
        },
        director: {
            type: String,
            trim: true,
            index: true, // Add index for faster searches
        },
        posterUrl: {
            type: String,
            trim: true,
            default: '/placeholder.jpg', // Default placeholder image if none provided
        },
        rating: {
            type: Number,
            min: 0,
            max: 10,
            default: 0,
        },
        // We can add reviews and bookmarks later, possibly as references to other collections
        // reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
        // bookmarkedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

// Create text index for search functionality
movieSchema.index({ title: 'text', description: 'text', director: 'text' });

// Create the model from the schema
// Mongoose will automatically look for the plural, lowercased version of your model name
// So, 'Movie' model corresponds to the 'movies' collection in the database.
const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie; // Export the model