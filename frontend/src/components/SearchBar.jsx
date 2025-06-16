import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { searchMovies } from '../services/movieService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import '../styles/SearchBar.css';

const TMDB_API_KEY = '4300117430ce27a077cd7dc1bab67637'; // Using the key found in backend/routes/movieRoutes.js

const SearchBar = ({ onSearchResults, showNotification }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [backgroundImage, setBackgroundImage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const isSearchPage = location.pathname === '/search';

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

    // Debounce the search query
    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchQuery(searchQuery);
        }, 300); // 300ms delay

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    useEffect(() => {
        if (searchQuery.trim() !== '') {
            handleSearch(searchQuery);
        } else if (isSearchPage) {
            // Clear results if navigating away from search page and query is empty
            onSearchResults([], '');
        }
    }, [searchQuery, isSearchPage]);

    const handleSearch = async (searchQuery) => {
        if (searchQuery.trim() === '') {
            // If query is empty, navigate to home and clear search results
            if (isSearchPage) {
                navigate('/');
            }
            onSearchResults([], ''); // Clear search results
            return;
        }

        setIsLoading(true);

        try {
            const results = await searchMovies(searchQuery); // Directly use searchMovies from movieService
            
            console.log('Search response:', results); // Debug log (was response.data, now results)
            
            if (Array.isArray(results)) { // Changed from response.data to results
                onSearchResults(results, searchQuery); // Pass searchQuery along with results
            } else {
                console.error('Response data is not an array:', results); // Changed from response.data to results
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

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSearch(searchQuery);
    };

    return (
        <div className="search-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
            <div className="overlay"></div> {/* Add overlay for text readability */}
            <div className="search-content">
                <h2 className="search-title">Welcome.</h2>
                <p className="search-subtitle">Millions of movies, TV shows and people to discover. Explore now.</p>
                <form onSubmit={handleSubmit} className="search-form">
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