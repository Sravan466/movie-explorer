import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios'; // Add axios import for background image fetch
import { searchMovies, TMDB_IMAGE_BASE_URL } from '../services/movieService'; // Add TMDB_IMAGE_BASE_URL import
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import '../styles/SearchBar.css';

const TMDB_API_KEY = '4300117430ce27a077cd7dc1bab67637'; // Using the key found in backend/routes/movieRoutes.js

const SearchBar = ({ onSearchResults, showNotification, initialQuery = '' }) => {
    const [query, setQuery] = useState(initialQuery); // Renamed from searchQuery to query
    const [debouncedQuery, setDebouncedQuery] = useState(initialQuery); // New state for debounced query
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

    // Debounce the search query: updates debouncedQuery after a delay
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query); // Update debouncedQuery with the latest query
        }, 300); // 300ms delay

        return () => {
            clearTimeout(handler);
        };
    }, [query]); // Dependency is 'query' (the immediate input value)

    // Trigger search when debouncedQuery changes
    useEffect(() => {
        if (debouncedQuery.trim() !== '') {
            handleSearch(debouncedQuery); // Call handleSearch with the debounced query
        } else if (isSearchPage) {
            // Clear results if navigating away from search page and debouncedQuery is empty
            onSearchResults([], '');
        }
    }, [debouncedQuery, isSearchPage]); // Dependency is 'debouncedQuery'

    const handleSearch = async (searchQueryValue) => { // Renamed param to avoid conflict
        if (searchQueryValue.trim() === '') {
            // If query is empty, navigate to home and clear search results
            if (isSearchPage) {
                navigate('/');
            }
            onSearchResults([], ''); // Clear search results
            return;
        }

        setIsLoading(true);

        try {
            const results = await searchMovies(searchQueryValue); // Use searchQueryValue
            
            console.log('Search response:', results); // Debug log (was response.data, now results)
            
            if (Array.isArray(results)) { 
                onSearchResults(results, searchQueryValue); // Pass searchQueryValue along with results
            } else {
                console.error('Response data is not an array:', results); 
                onSearchResults([], searchQueryValue); // Pass searchQueryValue even on error
            }
        } catch (error) {
            console.error('Error searching movies:', error.response?.data || error.message);
            // Show user-friendly error
            if (showNotification) {
                showNotification('Failed to search movies. Please check your connection and try again.', 'error');
            }
            onSearchResults([], searchQueryValue); // Pass searchQueryValue even on error
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSearch(query); // Use the immediate 'query' for submission
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
                            value={query} // Bind to 'query'
                            onChange={(e) => setQuery(e.target.value)}
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