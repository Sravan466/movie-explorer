import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TMDB_IMAGE_BASE_URL } from '../services/movieService'; // Import base URL
import '../styles/SearchBar.css';

const TMDB_API_KEY = '4300117430ce27a077cd7dc1bab67637'; // Using the key found in backend/routes/movieRoutes.js

const SearchBar = ({ onSearchResults, showNotification }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [backgroundImage, setBackgroundImage] = useState('');

    useEffect(() => {
        const fetchRandomBackground = async () => {
            try {
                // Fetch a list of popular movies or TV shows
                const response = await axios.get(`https://api.themoviedb.org/3/trending/all/day?api_key=${TMDB_API_KEY}`);
                const itemsWithBackdrops = response.data.results.filter(item => item.backdrop_path);
                
                if (itemsWithBackdrops.length > 0) {
                    const randomIndex = Math.floor(Math.random() * itemsWithBackdrops.length);
                    const selectedItem = itemsWithBackdrops[randomIndex];
                    setBackgroundImage(`${TMDB_IMAGE_BASE_URL}original${selectedItem.backdrop_path}`);
                }
            } catch (error) {
                console.error('Error fetching random background image:', error);
                // Optionally set a fallback image or no image
                setBackgroundImage(''); 
            }
        };

        fetchRandomBackground();
    }, []); // Run only once on mount

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        
        setIsLoading(true);

        try {
            // Use import.meta.env for Vite environment variables
            const backendUrl = (import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:5001/api').replace(/\/$/, '');

            const response = await axios.get(`${backendUrl}/movies/search?query=${encodeURIComponent(searchQuery)}`);
            
            console.log('Search response:', response.data); // Debug log
            
            if (Array.isArray(response.data)) {
                onSearchResults(response.data, searchQuery); // Pass searchQuery along with results
            } else {
                console.error('Response data is not an array:', response.data);
                onSearchResults([], searchQuery); // Pass searchQuery even on error
            }
        } catch (error) {
            console.error('Error searching movies:', error.response?.data || error.message);
            // Show user-friendly error
            if (showNotification) {
                showNotification('Failed to search movies. Please check your connection and try again.', 'error');
            }
            onSearchResults([], searchQuery); // Pass searchQuery even on error
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="search-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
            <div className="overlay"></div> {/* Add overlay for text readability */}
            <div className="search-content">
                <h2 className="search-title">Welcome.</h2>
                <p className="search-subtitle">Millions of movies, TV shows and people to discover. Explore now.</p>
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-input-group">
                        <input
                            type="text"
                            placeholder="Search for a movie, tv show, person......"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        <button type="submit" className="search-button" disabled={isLoading}>
                            {isLoading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SearchBar;