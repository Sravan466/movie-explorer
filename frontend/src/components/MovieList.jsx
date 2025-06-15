// frontend/src/components/MovieList.jsx
import React from 'react';
import MovieCard from './MovieCard';

const movieListStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: '20px',
  padding: '20px'
};

// MovieList now becomes a presentational component
function MovieList({ movies, loading, error }) {
  if (loading) {
    return <p style={{ textAlign: 'center', fontSize: '1.2em' }}>Loading movies...</p>;
  }

  if (error) {
    return <p style={{ textAlign: 'center', color: 'red', fontSize: '1.2em' }}>Error: {error}</p>;
  }

  if (!movies || movies.length === 0) {
    return <p style={{ textAlign: 'center', fontSize: '1.2em' }}>No movies found. Try adding some!</p>;
  }

  return (
    <div style={movieListStyle} className="movie-list-container">
      {movies.map((movie) => (
        <MovieCard key={movie._id} movie={movie} />
      ))}
    </div>
  );
}

export default MovieList;