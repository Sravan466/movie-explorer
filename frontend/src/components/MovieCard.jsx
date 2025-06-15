// frontend/src/components/MovieCard.jsx
import React, { useState, useEffect } from 'react';
import { TMDB_IMAGE_BASE_URL } from '../services/movieService'; // Import base URL
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark as faRegularBookmark } from '@fortawesome/free-regular-svg-icons';
import { faBookmark as faSolidBookmark } from '@fortawesome/free-solid-svg-icons';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons'; // NEW IMPORT
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { faImdb } from '@fortawesome/free-brands-svg-icons';
import { useBookmark } from '../context/BookmarkContext'; // Import useBookmark hook
import './MovieCard.css';

function MovieCard({ movie, onItemClick, rank, isBookmarkPageCard = false }) {
  const { addBookmark, removeBookmark, isBookmarked: checkIsBookmarked } = useBookmark();
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (movie && movie.id) {
      setIsBookmarked(checkIsBookmarked(movie.id));
    }
  }, [movie, checkIsBookmarked]);

  const handleBookmarkClick = (event) => {
    event.stopPropagation();
    if (isBookmarked) {
      removeBookmark(movie.id, movie.media_type); // Pass media_type for removal
    } else {
      addBookmark(movie);
    }
    setIsBookmarked(!isBookmarked);
  };

  const handleRemoveFromBookmarkPage = (event) => {
    event.stopPropagation();
    removeBookmark(movie.mediaId, movie.mediaType); // Use mediaId and mediaType from bookmarked item
  };

  if (!movie) {
    return null;
  }

  const posterUrl = movie.poster_path
        ? `${TMDB_IMAGE_BASE_URL}w500${movie.poster_path}`
        : 'https://via.placeholder.com/500x750.png?text=No+Image';

  return (
    <div className="movie-card" role="button" tabIndex={0} onClick={() => onItemClick({
      id: movie.mediaId || movie.id, // Use mediaId from bookmark, fallback to id
      media_type: movie.mediaType || movie.media_type, // Use mediaType from bookmark, fallback to media_type
      ...movie // Include all other movie properties
    })}>
      {rank && (
        <div className="movie-rank" data-rank={rank}>
          {rank}
        </div>
      )}
      <img
        src={posterUrl}
        alt={`${movie.name || movie.title} Poster`}
        className="movie-poster"
      />
      {isBookmarkPageCard ? (
        <div
          className="remove-bookmark-icon"
          onClick={handleRemoveFromBookmarkPage}
        >
          <FontAwesomeIcon icon={faCircleXmark} />
        </div>
      ) : (
        <div
          className={`bookmark-icon ${isBookmarked ? 'bookmarked' : ''}`}
          onClick={handleBookmarkClick}
        >
          <FontAwesomeIcon icon={isBookmarked ? faSolidBookmark : faRegularBookmark} />
        </div>
      )}
      <div className="movie-content">
        <h3 className="movie-title">{movie.name || movie.title || 'Untitled'}</h3>
        {(movie.release_date || movie.first_air_date) && (
          <p className="movie-release-date">
            Released: {new Date(movie.release_date || movie.first_air_date).toLocaleDateString()}
          </p>
        )}
        {movie.vote_average > 0 && (
          <p className="movie-rating">
            <FontAwesomeIcon icon={faImdb} className="imdb-icon" />
            {movie.vote_average.toFixed(1)}
            <FontAwesomeIcon icon={faStar} className="star-icon" />
          </p>
        )}
      </div>
    </div>
  );
}

export default MovieCard;