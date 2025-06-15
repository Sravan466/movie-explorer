// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // Import useLocation
import MovieRow from '../components/MovieRow';
import * as movieService from '../services/movieService';
// App.css is global

const GENRE_IDS_TO_DISPLAY = [
  { id: 28, name: 'Action Thrills' },
  { id: 35, name: 'Comedy Central' },
  { id: 27, name: 'Spine-Chilling Horror' },
  { id: 10751, name: 'Family Fun' },
  { id: 878, name: 'Sci-Fi Worlds' },
];

function HomePage({ onItemClick }) {
  const [popularMovies, setPopularMovies] = useState({ movies: [], isLoading: true, error: false });
  const [topRatedMovies, setTopRatedMovies] = useState({ movies: [], isLoading: true, error: false });
  const [upcomingMovies, setUpcomingMovies] = useState({ movies: [], isLoading: true, error: false });
  const [trendingTVShows, setTrendingTVShows] = useState({ movies: [], isLoading: true, error: false }); // State for trending TV shows
  const [trendingMovies, setTrendingMovies] = useState({ movies: [], isLoading: true, error: false }); // New state for trending movies
  const [genreMovies, setGenreMovies] = useState(
    GENRE_IDS_TO_DISPLAY.map(genre => ({ ...genre, movies: [], isLoading: true, error: false }))
  );
  const [pageError, setPageError] = useState(null);
  const [flashMessage, setFlashMessage] = useState(null); // State for flash message

  const location = useLocation(); // Hook to access route state

  useEffect(() => {
    // Check for flash message from navigation state
    if (location.state && location.state.message) {
      setFlashMessage({ text: location.state.message, type: location.state.type || 'success' });
      // Clear the location state to prevent message from re-appearing on refresh/navigation
      window.history.replaceState({}, document.title); 

      // Automatically hide the message after some time
      const timer = setTimeout(() => {
        setFlashMessage(null);
      }, 5000); // Display for 5 seconds

      return () => clearTimeout(timer); // Cleanup timer
    }
  }, [location.state]); // Run effect when location.state changes

  useEffect(() => {
    const fetchAllMovieData = async () => {
      try {
        setPageError(null);
        setPopularMovies(prev => ({ ...prev, isLoading: true, error: false }));
        setTopRatedMovies(prev => ({ ...prev, isLoading: true, error: false }));
        setUpcomingMovies(prev => ({ ...prev, isLoading: true, error: false }));
        setTrendingTVShows(prev => ({ ...prev, isLoading: true, error: false })); // Set loading for trending TV shows
        setTrendingMovies(prev => ({ ...prev, isLoading: true, error: false })); // Set loading for trending movies
        setGenreMovies(
          GENRE_IDS_TO_DISPLAY.map(genre => ({ ...genre, movies: [], isLoading: true, error: false }))
        );

        const popularPromise = movieService.getPopularMovies()
            .then(data => {
                // Check if data is an array before slicing
                if (!Array.isArray(data)) {
                    console.error("Invalid data format for popular movies: Expected an array.", data);
                    return { movies: [], isLoading: false, error: true };
                }
                return { movies: data.slice(0, 20), isLoading: false, error: false };
            })
            .catch(err => {
                console.error("Error fetching popular movies:", err.message);
                return { movies: [], isLoading: false, error: true };
            });
        const topRatedPromise = movieService.getTopRatedMovies()
            .then(data => {
                 // Check if data is an array before slicing
                if (!Array.isArray(data)) {
                    console.error("Invalid data format for top rated movies: Expected an array.", data);
                    return { movies: [], isLoading: false, error: true };
                }
                return { movies: data.slice(0, 20), isLoading: false, error: false };
            })
            .catch(err => {
                console.error("Error fetching top rated movies:", err.message);
                return { movies: [], isLoading: false, error: true };
            });
        const upcomingPromise = movieService.getUpcomingMovies()
            .then(data => {
                 // Check if data is an array before slicing
                 if (!Array.isArray(data)) {
                    console.error("Invalid data format for upcoming movies: Expected an array.", data);
                    return { movies: [], isLoading: false, error: true };
                }
                return { movies: data.slice(0, 20), isLoading: false, error: false };
            })
            .catch(err => {
                console.error("Error fetching upcoming movies:", err.message);
                return { movies: [], isLoading: false, error: true };
            });

        const trendingTVShowsPromise = movieService.getTrendingTVShows() // Fetch trending TV shows
            .then(data => {
                if (!Array.isArray(data)) {
                    console.error("Invalid data format for trending TV shows: Expected an array.", data);
                    return { movies: [], isLoading: false, error: true };
                }
                 // TMDB trending TV shows API might return slightly different structure,
                 // ensure relevant fields like 'name' and 'first_air_date' are handled in MovieCard if needed.
                return { movies: data.slice(0, 20), isLoading: false, error: false };
            })
            .catch(err => {
                console.error("Error fetching trending TV shows:", err.message);
                return { movies: [], isLoading: false, error: true };
            });

        const trendingMoviesPromise = movieService.getTrendingMovies() // New: Fetch trending movies
            .then(data => {
                if (!Array.isArray(data)) {
                    console.error("Invalid data format for trending movies: Expected an array.", data);
                    return { movies: [], isLoading: false, error: true };
                }
                return { movies: data.slice(0, 20), isLoading: false, error: false };
            })
            .catch(err => {
                console.error("Error fetching trending movies:", err.message);
                return { movies: [], isLoading: false, error: true };
            });

        const genrePromises = GENRE_IDS_TO_DISPLAY.map(async (genre) => {
          try {
            const data = await movieService.getMoviesByGenre(genre.id);
             // Check if data is an array before slicing
             if (!Array.isArray(data)) {
                    console.error(`Invalid data format for genre ${genre.name}: Expected an array.`, data);
                    return { ...genre, movies: [], isLoading: false, error: true };
                }
            return { ...genre, movies: data.slice(0, 20), isLoading: false, error: false };
          } catch (genreError) {
            console.error(`Error fetching movies for genre ${genre.name}:`, genreError.message);
            return { ...genre, movies: [], isLoading: false, error: true };
          }
        });
        
        const [popular, topRated, upcoming, trendingTVShowsData, trendingMoviesData, ...resolvedGenreMovies] = await Promise.all([
          popularPromise,
          topRatedPromise,
          upcomingPromise,
          trendingTVShowsPromise,
          trendingMoviesPromise, // Include trending movies promise
          ...genrePromises
        ]);

        setPopularMovies(popular);
        setTopRatedMovies(topRated);
        setUpcomingMovies(upcoming);
        setTrendingTVShows(trendingTVShowsData);
        setTrendingMovies(trendingMoviesData); // Set trending movies data
        setGenreMovies(resolvedGenreMovies);

      } catch (error) { 
        console.error("Failed to fetch movie data for HomePage (overall error):", error.message);
        setPageError(error.message || "An error occurred while fetching data.");
        setPopularMovies(prev => ({ ...prev, isLoading: false, error: true }));
        setTopRatedMovies(prev => ({ ...prev, isLoading: false, error: true }));
        setUpcomingMovies(prev => ({ ...prev, isLoading: false, error: true }));
        setTrendingTVShows(prev => ({ ...prev, isLoading: false, error: true }));
        setTrendingMovies(prev => ({ ...prev, isLoading: false, error: true })); // Set error for trending movies
        setGenreMovies(prev => prev.map(g => ({ ...g, isLoading: false, error: true })));
      }
    };
    fetchAllMovieData();
  }, []);

  return (
    <>
                {flashMessage && (
        <div className={`flash-message ${flashMessage.type}`}>
          {flashMessage.text}
        </div>
      )}
      {pageError && <p className="app-error">Error: {pageError}</p>}

      <div className="content-container">
        <MovieRow
          title="Popular Movies"
          items={popularMovies.movies}
          isLoading={popularMovies.isLoading}
          hasError={popularMovies.error}
          onItemClick={onItemClick}
        />

        {/* New Trending Now Section */}
        <MovieRow
          title="Trending Now"
          items={trendingMovies.movies}
          isLoading={trendingMovies.isLoading}
          hasError={trendingMovies.error}
          onItemClick={onItemClick}
          numberedCards={true} // New prop to indicate numbered cards
        />

        <MovieRow
          title="Top Rated Movies"
          items={topRatedMovies.movies}
          isLoading={topRatedMovies.isLoading}
          hasError={topRatedMovies.error}
          onItemClick={onItemClick}
        />

        <MovieRow
          title="Upcoming Movies"
          items={upcomingMovies.movies}
          isLoading={upcomingMovies.isLoading}
          hasError={upcomingMovies.error}
          onItemClick={onItemClick}
        />

        {/* Trending TV Shows Section */}
        <MovieRow
          title="Trending TV Shows"
          items={trendingTVShows.movies}
          isLoading={trendingTVShows.isLoading}
          hasError={trendingTVShows.error}
          onItemClick={onItemClick}
        />

        {genreMovies.map(genre => (
          <MovieRow
            key={genre.id}
            title={genre.name}
            items={genre.movies}
            isLoading={genre.isLoading}
            hasError={genre.error}
            onItemClick={onItemClick}
          />
        ))}
      </div>
    </>
  );
}

export default HomePage;