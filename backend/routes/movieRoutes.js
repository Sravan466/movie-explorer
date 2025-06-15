// backend/routes/movieRoutes.js
const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie'); // Adjust path if your model is named differently or located elsewhere
const axios = require('axios');

// TMDB API Key - **IMPORTANT: Store this in an environment variable (.env file) in production!**
// Example: const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_KEY = '4300117430ce27a077cd7dc1bab67637'; // Replace with process.env.TMDB_API_KEY

// Search movies and TV shows using TMDB
// Specific routes like '/search' must come before dynamic routes like '/:id'
router.get('/search', async (req, res) => {
    console.log('Backend /api/movies/search route hit');

    if (!TMDB_API_KEY) {
        console.error('TMDB API key not set or configured properly.');
        return res.status(500).json({ message: 'Server configuration error: TMDB API key missing.' });
    }

    try {
        const { query } = req.query;
        console.log('Search query received:', query);

        if (!query || query.trim() === "") {
            console.log('Empty or invalid query received.');
            return res.status(400).json({ message: 'Query is required and cannot be empty.' });
        }

        const tmdbUrl = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1&include_adult=false`;
        console.log('TMDB API URL:', tmdbUrl);

        const response = await axios.get(tmdbUrl);

        // Filter for only movies and TV shows and ensure essential data exists (e.g., a poster image)
        const filteredResults = response.data.results.filter(item =>
            (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path
        );

        console.log('Received response from TMDB API. Raw results:', response.data.results.length, "Filtered results:", filteredResults.length);

        res.json(filteredResults);
        console.log('Sent filtered results to frontend.');

    } catch (error) {
        console.error('TMDB search error:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Server error while searching TMDB. Check server logs for details.' });
    }
});

// --- CRUD Operations for your local database (if you have one) ---

// CREATE a new movie (local DB)
router.post('/', async (req, res) => {
    try {
        const { title, description, year, genre, director, posterUrl, rating } = req.body;
        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }
        const newMovie = new Movie({ title, description, year, genre, director, posterUrl, rating });
        const savedMovie = await newMovie.save();
        res.status(201).json(savedMovie);
    } catch (error) {
        console.error('Error creating movie:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error while creating movie' });
    }
});

// READ all movies (local DB)
router.get('/', async (req, res) => {
    try {
        const movies = await Movie.find().sort({ createdAt: -1 });
        res.status(200).json(movies);
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).json({ message: 'Server error while fetching movies' });
    }
});

// READ a single movie by ID (local DB)
// This dynamic route now correctly comes AFTER '/search'
router.get('/:id', async (req, res) => {
    try {
        // This route is for your local DB movies.
        // If you intend to fetch TMDB movie details by ID, you'll need a different endpoint or logic.
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found in local database' });
        }
        res.status(200).json(movie);
    } catch (error) {
        console.error('Error fetching movie by ID:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Movie not found (invalid ID format)' });
        }
        res.status(500).json({ message: 'Server error while fetching movie' });
    }
});

// UPDATE an existing movie by ID (local DB)
router.put('/:id', async (req, res) => {
    try {
        const { title, description, year, genre, director, posterUrl, rating } = req.body;
        const updatedMovie = await Movie.findByIdAndUpdate(
            req.params.id,
            { title, description, year, genre, director, posterUrl, rating },
            { new: true, runValidators: true }
        );
        if (!updatedMovie) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        res.status(200).json(updatedMovie);
    } catch (error) {
        console.error('Error updating movie:', error);
        res.status(500).json({ message: 'Server error while updating movie' });
    }
});

// DELETE a movie by ID (local DB)
router.delete('/:id', async (req, res) => {
    try {
        const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
        if (!deletedMovie) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        res.status(200).json({ message: 'Movie deleted successfully', deletedMovie });
    } catch (error) {
        console.error('Error deleting movie:', error);
        res.status(500).json({ message: 'Server error while deleting movie' });
    }
});

module.exports = router;
