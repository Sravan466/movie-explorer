// src/services/movieService.js
import axios from 'axios';

// TMDB API configuration
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';
const TMDB_API_KEY = '4300117430ce27a077cd7dc1bab67637'; // Move to environment variable in production
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Helper function to add media_type to movie data
const addMediaType = (data, type) => {
  if (Array.isArray(data)) {
    return data.map(item => ({ ...item, media_type: type }));
  }
  return { ...data, media_type: type };
};

// Backend API configuration
const backendUrl = 'http://localhost:5001';

// Search movies and TV shows
export const searchMovies = async (query) => {
  try {
    const response = await axios.get(`${backendUrl}/api/movies/search?query=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching movies:', error);
    throw new Error('Failed to search movies');
  }
};

// Get movie details from TMDB
export const getMovieDetails = async (movieId) => {
  try {
    console.log('Fetching movie details for ID:', movieId);
    const response = await axios.get(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,similar,reviews`
    );
    console.log('Movie details response:', response.data);
    return addMediaType(response.data, 'movie');
  } catch (error) {
    console.error('Error fetching movie details:', error.response ? error.response.data : error.message);
    throw new Error(error.response?.data?.status_message || 'Failed to fetch movie details');
  }
};

// Get TV show details from TMDB
export const getTVShowDetails = async (showId) => {
  try {
    console.log('Fetching TV show details for ID:', showId);
    const response = await axios.get(
      `${TMDB_BASE_URL}/tv/${showId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,similar,reviews`
    );
    console.log('TV show details response:', response.data);
    return addMediaType(response.data, 'tv');
  } catch (error) {
    console.error('Error fetching TV show details:', error.response ? error.response.data : error.message);
    throw new Error(error.response?.data?.status_message || 'Failed to fetch TV show details');
  }
};

// Get popular movies
export const getPopularMovies = async () => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`);
    return addMediaType(response.data.results, 'movie');
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    throw new Error('Failed to fetch popular movies');
  }
};

// Get top rated movies
export const getTopRatedMovies = async () => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}`);
    return addMediaType(response.data.results, 'movie');
  } catch (error) {
    console.error('Error fetching top rated movies:', error);
    throw new Error('Failed to fetch top rated movies');
  }
};

// Get trending movies (movies only)
export const getTrendingMovies = async () => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`);
    return addMediaType(response.data.results, 'movie');
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    throw new Error('Failed to fetch trending movies');
  }
};

export const getUpcomingMovies = async () => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}`);
    return addMediaType(response.data.results, 'movie');
  } catch (error) {
    console.error('Error fetching upcoming movies:', error.response ? error.response.data : error.message);
    throw new Error(error.response?.data?.status_message || 'Failed to fetch upcoming movies');
  }
};

// Get movies by genre
export const getMoviesByGenre = async (genreId) => {
  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}`
    );
    return addMediaType(response.data.results, 'movie');
  } catch (error) {
    console.error('Error fetching movies by genre:', error);
    throw new Error('Failed to fetch movies by genre');
  }
};

// Local database movie operations (if you have them)
export const getLocalMovies = async () => {
  try {
    const response = await axios.get(`${backendUrl}/api/movies`);
    return response.data;
  } catch (error) {
    console.error('Error fetching local movies:', error);
    throw new Error('Failed to fetch local movies');
  }
};

export const createLocalMovie = async (movieData) => {
  try {
    const response = await axios.post(`${backendUrl}/api/movies`, movieData);
    return response.data;
  } catch (error) {
    console.error('Error creating local movie:', error);
    throw new Error('Failed to create movie');
  }
};

export const updateLocalMovie = async (movieId, movieData) => {
  try {
    const response = await axios.put(`${backendUrl}/api/movies/${movieId}`, movieData);
    return response.data;
  } catch (error) {
    console.error('Error updating local movie:', error);
    throw new Error('Failed to update movie');
  }
};

export const deleteLocalMovie = async (movieId) => {
  try {
    const response = await axios.delete(`${backendUrl}/api/movies/${movieId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting local movie:', error);
    throw new Error('Failed to delete movie');
  }
};

// Get trending TV shows
export const getTrendingTVShows = async () => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/trending/tv/week?api_key=${TMDB_API_KEY}`);
    return addMediaType(response.data.results, 'tv');
  } catch (error) {
    console.error('Error fetching trending TV shows:', error);
    throw new Error('Failed to fetch trending TV shows');
  }
};

// Review API Calls
export const submitReview = async (reviewData, token) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        // 'x-auth-token': token,
        'Authorization': `Bearer ${token}`,
      },
    };
    const response = await axios.post(`${backendUrl}/api/reviews`, reviewData, config);
    return response.data;
  } catch (error) {
    console.error('Error submitting review:', error.response?.data?.msg || error.message);
    throw new Error(error.response?.data?.msg || 'Failed to submit review');
  }
};

export const getReviewsForContent = async (contentId, mediaType) => {
  try {
    const response = await axios.get(`${backendUrl}/api/reviews/${contentId}/${mediaType}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reviews:', error.response?.data?.msg || error.message);
    throw new Error(error.response?.data?.msg || 'Failed to fetch reviews');
  }
};

export const deleteReview = async (reviewId, token) => {
  try {
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };
    const response = await axios.delete(`${backendUrl}/api/reviews/${reviewId}`, config);
    return response.data; // Should return { msg: 'Review removed' }
  } catch (error) {
    console.error('Error deleting review:', error.response?.data?.msg || error.message);
    throw new Error(error.response?.data?.msg || 'Failed to delete review');
  }
};

export const updateReview = async (reviewId, reviewData, token) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    };
    const response = await axios.put(`${backendUrl}/api/reviews/${reviewId}`, reviewData, config);
    return response.data; // Should return the updated review object
  } catch (error) {
    console.error('Error updating review:', error.response?.data?.msg || error.message);
    throw new Error(error.response?.data?.msg || 'Failed to update review');
  }
};