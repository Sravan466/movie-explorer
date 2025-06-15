import React from 'react';
import { useBookmark } from '../context/BookmarkContext';
import MovieCard from '../components/MovieCard';
import '../App.css'; // Assuming you have general styles in App.css or a specific page CSS

function BookmarkPage({ onItemClick }) {
  const { bookmarkedItems } = useBookmark();
  const bookmarkedMoviesArray = Object.values(bookmarkedItems);

  return (
    <div className="bookmark-page">
      <h2 className="page-title">Your Bookmarks</h2>
      {bookmarkedMoviesArray.length === 0 ? (
        <p className="no-bookmarks-message">You haven't bookmarked any movies or TV shows yet.</p>
      ) : (
        <div className="bookmark-grid">
          {bookmarkedMoviesArray.map(item => (
            <MovieCard key={item.mediaId} movie={item} onItemClick={onItemClick} isBookmarkPageCard={true} />
          ))}
        </div>
      )}
    </div>
  );
}

export default BookmarkPage; 