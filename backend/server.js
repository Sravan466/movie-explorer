// backend/server.js
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // We'll set up the connection later
const movieRoutes = require('./routes/movieRoutes');
const authRoutes = require('./routes/authRoutes');
const reviewRoutes = require('./routes/reviewRoutes'); // Import review routes
const bookmarkRoutes = require('./routes/bookmarkRoutes'); // Import bookmark routes

const app = express();
const PORT = process.env.PORT || 5001; // Use port from .env or default to 5001

// --- Middleware ---
app.use(cors({
  origin: [
    'http://localhost:5173', // Local development
    'https://movie-explorer-frontend.onrender.com' // 
  ],
  credentials: true
}));
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// --- Database Connection 
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        // Exit process with failure
        process.exit(1);
    }
};

connectDB();

// --- Basic Route ---
app.get('/', (req, res) => {
    res.send('Welcome to the Movie Explorer API!');
});

// --- API Routes  ---

app.use('/api/movies',movieRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes); // Use review routes
app.use('/api/bookmarks', bookmarkRoutes); // Use bookmark routes

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});