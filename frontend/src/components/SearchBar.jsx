import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios'; // Ensure axios is imported for background image fetch
import { searchMovies, TMDB_IMAGE_BASE_URL } from '../services/movieService'; // Ensure TMDB_IMAGE_BASE_URL is imported
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import '../styles/SearchBar.css';

const TMDB_API_KEY = '4300117430ce27a077cd7dc1bab67637'; // Using the key found in backend/routes/movieRoutes.js

const SearchBar = ({ onSearchResults, showNotification, initialQuery = '' }) => {
    const [query, setQuery] = useState(initialQuery);
    const [isLoading, setIsLoading] = useState(false);
    const [backgroundImage, setBackgroundImage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const isSearchPage = location.pathname === '/search';

    const timeoutRef = useRef(null); // For debounce

    useEffect(() => {
        const fetchRandomBackground = async () => {
            try {
                const response = await axios.get(`https://api.themoviedb.org/3/trending/all/day?api_key=${TMDB_API_KEY}`);
                const itemsWithBackdrops = response.data.results.filter(item => item.backdrop_path);
                
                if (itemsWithBackdrops.length > 0) {
                    const randomIndex = Math.floor(Math.random() * itemsWithBackdrops.length);
                    const selectedItem = itemsWithBackdrops[randomIndex];
                    setBackgroundImage(`${TMDB_IMAGE_BASE_URL}original${selectedItem.backdrop_path}`);
                }
            } catch (error) {
                console.error('Error fetching random background image:', error);
                setBackgroundImage(''); 
            }
        };

        fetchRandomBackground();
    }, []); // Run only once on mount

    // Memoize handleSearch to ensure its identity is stable for useEffect dependencies
    const handleSearch = useCallback(async (searchQueryValue) => {
        if (searchQueryValue.trim() === '') {
            if (isSearchPage) {
                navigate('/');
            }
            onSearchResults([], '');
            return;
        }

        setIsLoading(true);

        try {
            const results = await searchMovies(searchQueryValue);
            
            console.log('Search response:', results); 
            
            if (Array.isArray(results)) { 
                onSearchResults(results, searchQueryValue); 
            } else {
                console.error('Response data is not an array:', results); 
                onSearchResults([], searchQueryValue); 
            }
        } catch (error) {
            console.error('Error searching movies:', error.response?.data || error.message);
            if (showNotification) {
                showNotification('Failed to search movies. Please check your connection and try again.', 'error');
            }
            onSearchResults([], searchQueryValue); 
        } finally {
            setIsLoading(false);
        }
    }, [isSearchPage, navigate, onSearchResults, showNotification]); // Dependencies for useCallback

    // Debounce logic: Triggers handleSearch after a delay when 'query' changes
    useEffect(() => {
        // Clear any existing timeout on each 'query' change
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Only set a new timeout if the query is not empty
        if (query.trim() !== '') {
            timeoutRef.current = setTimeout(() => {
                handleSearch(query); // Call the memoized handleSearch after the delay
            }, 300); // 300ms debounce delay
        } else if (isSearchPage) {
            // If query is empty and on search page, clear results immediately
            onSearchResults([], '');
        }

        // Cleanup function: Clear timeout when component unmounts or dependencies change
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [query, isSearchPage, handleSearch, onSearchResults]); // Dependencies for useEffect

    const handleSubmit = (e) => {
        e.preventDefault();
        // On manual submit, clear any pending debounce and search immediately
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        handleSearch(query); 
    };

    return (
        <div className="search-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
            <div className="overlay"></div>
            <div className="search-content">
                <h2 className="search-title">Welcome.</h2>
                <p className="search-subtitle">Millions of movies, TV shows and people to discover. Explore now.</p>
                <form onSubmit={handleSubmit} className="search-form">
                    <div className="search-input-group">
                        <input
                            type="text"
                            placeholder="Search for a movie, tv show, person......"
                            value={query} 
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