// frontend/src/components/MovieRow.jsx
import React, { useRef, useState, useEffect } from 'react';
import MovieCard from './MovieCard';
import './MovieRow.css';

const LeftArrowIcon = () => <>&larr;</>;
const RightArrowIcon = () => <>&rarr;</>;

function MovieRow({ 
  title, 
  items, 
  isLoading, 
  hasError, 
  onItemClick, 
  numberedCards = false
}) {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  // Default to true only if items are present and not loading/erroring initially
  const [showRightArrow, setShowRightArrow] = useState(!isLoading && !hasError && items && items.length > 0);


  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const isScrollable = scrollWidth > clientWidth;
      // Add a small buffer (e.g., 5px) to avoid issues with subpixel rendering
      setShowLeftArrow(isScrollable && scrollLeft > 5);
      setShowRightArrow(isScrollable && scrollLeft < scrollWidth - clientWidth - 5);
    } else {
      setShowLeftArrow(false);
      // Only show right arrow if content might be scrollable
      setShowRightArrow(!!(items && items.length && scrollContainerRef.current && scrollContainerRef.current.scrollWidth > scrollContainerRef.current.clientWidth));
    }
  };

  const debouncedHandleScroll = debounce(handleScroll, 150);

  useEffect(() => {
    const scrollElement = scrollContainerRef.current;
    // Only proceed if not loading, no error, and items are present
    if (!isLoading && !hasError && items && items.length > 0 && scrollElement) {
      handleScroll(); // Initial check
      scrollElement.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', debouncedHandleScroll);
      const observer = new MutationObserver(debouncedHandleScroll); // Use debounced for observer too
      observer.observe(scrollElement, { childList: true, subtree: true, characterData: true });
      return () => {
        scrollElement.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', debouncedHandleScroll);
        observer.disconnect();
      };
    } else {
      // Ensure arrows are hidden if conditions aren't met
      setShowLeftArrow(false);
      setShowRightArrow(false);
    }
  }, [items, isLoading, hasError]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(handleScroll, 400); // Slightly longer timeout for smooth scroll to finish
    }
  };

  if (isLoading) {
    return (
      <div className="movie-row">
        <p className="loading-text">Loading movies...</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="movie-row">
        <p className="error-text">Could not load {title.toLowerCase()}. Please try again later.</p>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="movie-row">
      <div className="movie-row-title">
        {title}
      </div>
      <div className="movie-row-content">
        <button
          className={`scroll-arrow left-arrow ${!showLeftArrow ? 'inactive' : ''}`}
          onClick={() => scroll('left')}
          aria-label="Scroll left"
        >
          <LeftArrowIcon />
        </button>
        <div className="movie-row-scrollable" ref={scrollContainerRef}>
          {items.map((item, index) => (
            <div
              key={item.id}
              className="movie-card-wrapper"
              onClick={() => {
                if (onItemClick && item && item.id && item.media_type) {
                  onItemClick(item);
                }
              }}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && onItemClick && item && item.id && item.media_type) {
                  onItemClick(item);
                }
              }}
            >
              <MovieCard movie={item} rank={numberedCards ? index + 1 : null} />
            </div>
          ))}
        </div>
        <button
          className={`scroll-arrow right-arrow ${!showRightArrow ? 'inactive' : ''}`}
          onClick={() => scroll('right')}
          aria-label="Scroll right"
        >
          <RightArrowIcon />
        </button>
      </div>
    </div>
  );
}

export default MovieRow;