// src/pages/MovieDetailPage.jsx
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as movieService from '../services/movieService'; // Adjust path if needed
import './MovieDetailPage.css'; // Ensure this CSS file is correctly linked
import { useAuth } from '../context/AuthContext'; // Assuming you have an AuthContext for user info
import { getWatchProviders } from '../services/movieService';

function MovieDetailPage({ showNotification }) {
    // All hooks at the top, before any return
    const { movieId, showId } = useParams();
    const contentId = movieId || showId;
    const [movie, setMovie] = useState(null);
    const [trailer, setTrailer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [castScrollPosition, setCastScrollPosition] = useState(0);
    const [isTV, setIsTV] = useState(false);
    const castListRef = useRef(null);
    const castContainerRef = useRef(null);
    const [showRightArrow, setShowRightArrow] = useState(false);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [userReviews, setUserReviews] = useState([]);
    const [newReviewText, setNewReviewText] = useState('');
    const [newReviewRating, setNewReviewRating] = useState(0);
    const { user, token } = useAuth();
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [editingReviewText, setEditingReviewText] = useState('');
    const [editingReviewRating, setEditingReviewRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [reviewsToShow, setReviewsToShow] = useState(3);
    const [sortBy, setSortBy] = useState('newest');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRating, setFilterRating] = useState(0);
    const [watchProviders, setWatchProviders] = useState(null);
    const [watchProvidersLoading, setWatchProvidersLoading] = useState(false);
    const [watchProvidersError, setWatchProvidersError] = useState(null);
    const userCountry = 'IN';
    const navigate = useNavigate();
    
    // Mobile detection and arrow button logic - ALREADY IMPLEMENTED
    const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth <= 768 : false));
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    // Show arrows on mobile always, on desktop based on scroll state - ALREADY IMPLEMENTED
    const showLeft = isMobile ? true : showLeftArrow;
    const showRight = isMobile ? true : showRightArrow;

    // Review sorting functionality (moved before useMemo to fix initialization error)
    const sortReviews = useCallback((reviews, sortType) => {
        switch (sortType) {
            case 'newest':
                return [...reviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            case 'oldest':
                return [...reviews].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            case 'highest':
                return [...reviews].sort((a, b) => b.rating - a.rating);
            case 'lowest':
                return [...reviews].sort((a, b) => a.rating - b.rating);
            default:
                return reviews;
        }
    }, []);

    // Now filteredReviews can safely use sortReviews
    const filteredReviews = useMemo(() => {
        let filtered = userReviews;
        if (searchTerm) {
            filtered = filtered.filter(review =>
                review.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                review.username.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (filterRating > 0) {
            filtered = filtered.filter(review => review.rating === filterRating);
        }
        return sortReviews(filtered, sortBy);
    }, [userReviews, searchTerm, filterRating, sortBy, sortReviews]);

    // Enhanced star rating component
    const StarRating = ({ rating, onRatingChange, isEditable = true, size = "large" }) => {
        const [hoveredStar, setHoveredStar] = useState(0);
        
        const handleMouseEnter = (starValue) => {
            if (isEditable) {
                setHoveredStar(starValue);
            }
        };
        
        const handleMouseLeave = () => {
            if (isEditable) {
                setHoveredStar(0);
            }
        };
        
        const handleClick = (starValue) => {
            if (isEditable && onRatingChange) {
                onRatingChange(starValue);
            }
        };
        
        return (
            <div className={`star-container ${size}`}>
                {[1, 2, 3, 4, 5].map((starValue) => (
                    <span
                        key={starValue}
                        className={`star ${
                            starValue <= (hoveredStar || rating) ? 'filled' : ''
                        } ${isEditable ? 'interactive' : 'readonly'}`}
                        onMouseEnter={() => handleMouseEnter(starValue)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleClick(starValue)}
                        role={isEditable ? "button" : "img"}
                        tabIndex={isEditable ? 0 : -1}
                        aria-label={`${starValue} star${starValue !== 1 ? 's' : ''}`}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    // Enhanced character counter for textarea
    const CharacterCounter = ({ text, maxLength = 1000 }) => {
        const remaining = maxLength - text.length;
        const percentage = (text.length / maxLength) * 100;
        
        return (
            <div className="character-counter">
                <div className="character-progress">
                    <div 
                        className="character-progress-bar" 
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                </div>
                <span className={`character-count ${remaining < 50 ? 'warning' : ''}`}>
                    {remaining} characters remaining
                </span>
            </div>
        );
    };

    // Review statistics
    const ReviewStats = ({ reviews }) => {
        if (reviews.length === 0) return null;
        
        const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
        const ratingDistribution = [1, 2, 3, 4, 5].map(rating => 
            reviews.filter(review => review.rating === rating).length
        );
        
        return (
            <div className="review-stats">
                <div className="average-rating">
                    <span className="average-number">{averageRating.toFixed(1)}</span>
                    <StarRating rating={Math.round(averageRating)} isEditable={false} size="medium" />
                    <span className="total-reviews">Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="rating-distribution">
                    {[5, 4, 3, 2, 1].map(rating => (
                        <div key={rating} className="rating-bar">
                            <span className="rating-label">{rating}★</span>
                            <div className="rating-bar-container">
                                <div 
                                    className="rating-bar-fill" 
                                    style={{ width: `${(ratingDistribution[rating - 1] / reviews.length) * 100}%` }}
                                ></div>
                            </div>
                            <span className="rating-count">({ratingDistribution[rating - 1]})</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Load more reviews functionality
    const LoadMoreButton = () => {
        if (userReviews.length <= reviewsToShow) return null;
        
        return (
            <button 
                className="load-more-button"
                onClick={() => {
                    setReviewsToShow(prev => prev + 3);
                    if (reviewsToShow + 3 >= userReviews.length) {
                        setShowAllReviews(true);
                    }
                }}
            >
                Load More Reviews ({userReviews.length - reviewsToShow} remaining)
            </button>
        );
    };

    // Function to fetch reviews from the backend
    const fetchReviews = useCallback(async () => {
        if (!contentId || typeof isTV !== 'boolean') return; // Ensure isTV is determined
        try {
            // Determine media type for the backend call
            const mediaType = isTV ? 'tv' : 'movie';
            const reviews = await movieService.getReviewsForContent(contentId, mediaType);
            setUserReviews(reviews);
        } catch (err) {
            console.error("Error fetching reviews:", err);
            // Optionally set a review-specific error state
        }
    }, [contentId, isTV]); // Depend on contentId and isTV

    useEffect(() => {
        const fetchDetails = async () => {
            if (!contentId) {
                console.log('No contentId available');
                setError('No content ID provided');
                setLoading(false);
                return;
            }
            
            console.log('Fetching details for contentId:', contentId);
            setLoading(true);
            setError(null);
            
            try {
                let detailsData;
                let isTVShow = false;

                // First, try to determine if it's a movie or TV show based on the URL
                if (movieId) {
                    console.log('Attempting to fetch as movie...');
                    try {
                        detailsData = await movieService.getMovieDetails(contentId);
                        console.log('Movie fetch successful:', detailsData);
                    } catch (movieError) {
                        console.error('Movie fetch failed:', movieError);
                        throw new Error('Movie not found');
                    }
                } else if (showId) {
                    console.log('Attempting to fetch as TV show...');
                    try {
                        detailsData = await movieService.getTVShowDetails(contentId);
                        isTVShow = true;
                        console.log('TV show fetch successful:', detailsData);
                    } catch (tvError) {
                        console.error('TV show fetch failed:', tvError);
                        throw new Error('TV show not found');
                    }
                }

                if (!detailsData) {
                    throw new Error('No data received from the server');
                }

                setMovie(detailsData);
                setIsTV(isTVShow);

                if (detailsData.videos && detailsData.videos.results) {
                    const officialTrailer = detailsData.videos.results.find(
                        (video) => video.site === 'YouTube' && video.type === 'Trailer' && video.official
                    );
                    const anyTrailer = detailsData.videos.results.find(v => v.site === 'YouTube' && v.type === 'Trailer');
                    const firstVideo = detailsData.videos.results.length > 0 ? detailsData.videos.results[0] : null;
                    
                    setTrailer(officialTrailer || anyTrailer || (firstVideo?.site === 'YouTube' ? firstVideo : null));
                } else {
                    setTrailer(null);
                }

            } catch (err) {
                console.error("Error fetching details:", err);
                setError(err.message || 'Failed to load details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
        window.scrollTo(0, 0);

        if (castContainerRef.current) {
            castContainerRef.current.scrollLeft = 0;
        }
    }, [contentId, movieId, showId]);

    // Fetch reviews after movie details are loaded and isTV is determined
    useEffect(() => {
        if (movie && typeof isTV === 'boolean') {
            fetchReviews();
        }
    }, [movie, isTV, fetchReviews]);

    useEffect(() => {
        // This effect updates scroll arrow visibility based on content and scroll position
        if (!castListRef.current || !castContainerRef.current || !movie || !movie.credits || !movie.credits.cast || movie.credits.cast.length === 0) {
            setShowLeftArrow(false);
            setShowRightArrow(false);
            return;
        }

        const updateScrollButtonsVisibility = () => {
            const container = castContainerRef.current;
            const scrollWidth = container.scrollWidth;
            const containerWidth = container.offsetWidth;
            const scrollLeft = container.scrollLeft;

            const buffer = 5;
            setShowLeftArrow(scrollLeft > buffer);
            setShowRightArrow(scrollLeft + containerWidth < scrollWidth - buffer);
        };

        // Initial check
        updateScrollButtonsVisibility();

        // Add scroll and resize listeners
        const container = castContainerRef.current;
        container.addEventListener('scroll', updateScrollButtonsVisibility);
        window.addEventListener('resize', updateScrollButtonsVisibility);

        // Add a small delay to ensure images are loaded
        const timeoutId = setTimeout(updateScrollButtonsVisibility, 500);

        return () => {
            container.removeEventListener('scroll', updateScrollButtonsVisibility);
            window.removeEventListener('resize', updateScrollButtonsVisibility);
            clearTimeout(timeoutId);
        };
    }, [movie, loading]); // Rerun if movie data or loading state changes

    // Add a new effect to handle image loading
    useEffect(() => {
        if (!castListRef.current || !castContainerRef.current) return;

        const handleImagesLoaded = () => {
            const scrollWidth = castListRef.current.scrollWidth;
            const containerWidth = castContainerRef.current.offsetWidth;
            setShowRightArrow(scrollWidth > containerWidth);
        };

        // Create an array of all image elements in the cast list
        const images = castListRef.current.getElementsByTagName('img');
        let loadedImages = 0;
        const totalImages = images.length;

        // Add load event listener to each image
        Array.from(images).forEach(img => {
            if (img.complete) {
                loadedImages++;
                if (loadedImages === totalImages) {
                    handleImagesLoaded();
                }
            } else {
                img.addEventListener('load', () => {
                    loadedImages++;
                    if (loadedImages === totalImages) {
                        handleImagesLoaded();
                    }
                });
            }
        });

        // If no images, still check for overflow
        if (totalImages === 0) {
            handleImagesLoaded();
        }
    }, [movie?.credits?.cast]); // Run when cast data changes

    // Cast scrolling function - ALREADY IMPLEMENTED
    const scrollCast = (direction) => {
        if (!castContainerRef.current) return;

        const container = castContainerRef.current;
        const visibleWidth = container.offsetWidth;
        const scrollAmount = visibleWidth * 0.75; // Scroll by 75% of visible width

        if (direction === 'left') {
            container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    // Enhanced review submission handler
    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user || !token) {
            showNotification('Please log in to submit a review.', 'error');
            return;
        }
        if (newReviewText.trim() === '' || newReviewRating === 0) {
            showNotification('Please provide a rating and a review.', 'error');
            return;
        }

        setIsSubmitting(true);
        
        try {
            const mediaType = isTV ? 'tv' : 'movie';
            const reviewData = {
                contentId,
                mediaType,
                rating: newReviewRating,
                text: newReviewText.trim(),
            };

            const existingReview = userReviews.find(review => review.user && user && review.user._id === user._id);

            if (existingReview) {
                // Update existing review
                await movieService.updateReview(existingReview._id, reviewData, token);
                showNotification('Review updated successfully!', 'success');
            } else {
                // Submit new review
                await movieService.submitReview(reviewData, token);
                showNotification('Review submitted successfully!', 'success');
            }

            // After submission/update, refetch all reviews to ensure UI is up-to-date
            await fetchReviews();

            setNewReviewText('');
            setNewReviewRating(0);

        } catch (err) {
            console.error("Error submitting/updating review:", err);
            showNotification(err.message || 'Failed to process review.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        // Removed window.confirm. Review will be deleted directly on click.
        // If a custom confirmation dialog is desired, it would be implemented here.
        try {
            await movieService.deleteReview(reviewId, token);
            fetchReviews();
            showNotification('Review deleted successfully!', 'success');
        } catch (err) {
            console.error("Error deleting review:", err);
            showNotification(err.message || 'Failed to delete review.', 'error');
        }
    };

    const handleEditClick = (review) => {
        setEditingReviewId(review._id);
        setEditingReviewText(review.text);
        setEditingReviewRating(review.rating);
    };

    const handleCancelEdit = () => {
        setEditingReviewId(null);
        setEditingReviewText('');
        setEditingReviewRating(0);
    };

    const handleUpdateReview = async (e) => {
        e.preventDefault();
        if (!editingReviewId || !user || !token) {
            showNotification('Error: Cannot update review without proper authentication or ID.', 'error');
            return;
        }
        if (editingReviewText.trim() === '' || editingReviewRating === 0) {
            showNotification('Please provide a rating and a review.', 'error');
            return;
        }

        try {
            const updatedData = {
                rating: editingReviewRating,
                text: editingReviewText.trim(),
            };
            await movieService.updateReview(editingReviewId, updatedData, token);
            fetchReviews();
            handleCancelEdit();
            showNotification('Review updated successfully!', 'success');
        } catch (err) {
            console.error("Error updating review:", err);
            showNotification(err.message || 'Failed to update review.', 'error');
        }
    };

    // Fetch watch providers when movie/show is loaded
    useEffect(() => {
        if (!movie) return;
        const fetchProviders = async () => {
            setWatchProvidersLoading(true);
            setWatchProvidersError(null);
            try {
                const providers = await getWatchProviders(movie.id, isTV ? 'tv' : 'movie');
                setWatchProviders(providers);
            } catch (err) {
                setWatchProvidersError('Failed to load streaming providers.');
            } finally {
                setWatchProvidersLoading(false);
            }
        };
        fetchProviders();
    }, [movie, isTV]);

    // Helper to generate OTT search URLs
    const getProviderSearchUrl = (providerName, title) => {
        const encodedTitle = encodeURIComponent(title);
        switch (providerName.toLowerCase()) {
            case 'prime video':
                return `https://www.primevideo.com/search?phrase=${encodedTitle}`;
            case 'netflix':
                return `https://www.netflix.com/search?q=${encodedTitle}`;
            case 'disney+ hotstar':
            case 'hotstar':
                return `https://www.hotstar.com/in/search?q=${encodedTitle}`;
            case 'zee5':
                return `https://www.zee5.com/search?q=${encodedTitle}`;
            case 'sonyliv':
            case 'sony liv':
                return `https://www.sonyliv.com/search/${encodedTitle}`;
            case 'jio cinema':
            case 'jiocinema':
                return `https://www.jiocinema.com/search/${encodedTitle}`;
            default:
                return null;
        }
    };

    if (loading) {
        return <div className="loading-container"><p className="loading-text-detail">Loading details...</p></div>;
    }

    if (error) {
        return <div className="error-container-detail"><p className="app-error">Error: {error}</p></div>;
    }

    if (!movie) {
        return <div className="error-container-detail"><p>Content not found.</p></div>;
    }

    const formatRuntime = (minutes) => {
        if (!minutes || minutes === 0) return 'N/A';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours > 0 ? hours + 'h ' : ''}${mins}min`;
    };

    const backdropPath = movie.backdrop_path
        ? `${movieService.TMDB_IMAGE_BASE_URL}original${movie.backdrop_path}`
        : '';

    const posterPath = movie.poster_path
        ? `${movieService.TMDB_IMAGE_BASE_URL}w500${movie.poster_path}`
        : 'https://placehold.co/500x750/282c34/FFF?text=No+Poster';

    const hasCast = movie.credits && movie.credits.cast && movie.credits.cast.length > 0;

    const title = movie.title || movie.name;
    const releaseDate = movie.release_date || movie.first_air_date;
    const runtimeOrEpisodeLength = isTV ? (movie.episode_run_time && movie.episode_run_time.length > 0 ? movie.episode_run_time[0] : null) : movie.runtime;

    const directors = movie.credits?.crew?.filter(c => c.job === 'Director') || [];
    const writers = movie.credits?.crew?.filter(c => c.department === 'Writing' && (c.job === 'Screenplay' || c.job === 'Writer' || c.job === 'Story')) || [];
    const creators = isTV && movie.created_by && movie.created_by.length > 0 ? movie.created_by : [];

    return (
        <div className="movie-detail-page">
            {backdropPath && (
                <div
                    className="backdrop-image"
                    style={{ backgroundImage: `url(${backdropPath})` }}
                >
                    <div className="backdrop-overlay"></div>
                </div>
            )}
            <div className="detail-content-wrapper">
                <div className="detail-main-content">
                    <div className="detail-poster">
                        <img src={posterPath} alt={`${title} Poster`} />
                    </div>
                    <div className="detail-info">
                        <h1>
                            {title} {releaseDate ? `(${releaseDate.substring(0, 4)})` : ''}
                            {isTV && <span className="content-type-badge">TV Series</span>}
                        </h1>
                        {movie.tagline && <p className="tagline"><em>"{movie.tagline}"</em></p>}

                        <div className="info-chips">
                            {releaseDate && <span>{new Date(releaseDate).toLocaleDateString()}</span>}
                            {movie.genres && movie.genres.length > 0 && (
                                <span>{movie.genres.map(g => g.name).join(', ')}</span>
                            )}
                            {runtimeOrEpisodeLength > 0 && (
                                <span>
                                    {formatRuntime(runtimeOrEpisodeLength)}
                                    {isTV ? ' / ep' : ''}
                                </span>
                            )}
                            {isTV && movie.number_of_seasons && (
                                <span>{movie.number_of_seasons} Season{movie.number_of_seasons !== 1 ? 's' : ''}</span>
                            )}
                        </div>

                        {movie.vote_average > 0 && (
                            <p className="rating">
                                <strong>{movie.vote_average.toFixed(1)}/10</strong>
                                <span className="vote-count">({movie.vote_count.toLocaleString()} votes)</span>
                            </p>
                        )}

                        <h3>Overview</h3>
                        <p className="overview">{movie.overview || 'No overview available.'}</p>

                        <div className="crew-info">
                            {creators.length > 0 && (
                                <p><strong>Created by:</strong> {creators.map((c, idx) => (
                                    <span
                                        key={c.id}
                                        style={{ color: '#e50914', cursor: 'pointer' }}
                                        onClick={() => navigate(`/person/${c.id}`)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigate(`/person/${c.id}`); }}
                                    >
                                        {c.name}{idx < creators.length - 1 ? ', ' : ''}
                                    </span>
                                ))}</p>
                            )}
                            {directors.length > 0 && !isTV && (
                                <p><strong>Director{directors.length > 1 ? 's' : ''}:</strong> {directors.map((d, idx) => (
                                    <span
                                        key={d.id}
                                        style={{ color: '#e50914', cursor: 'pointer' }}
                                        onClick={() => navigate(`/person/${d.id}`)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigate(`/person/${d.id}`); }}
                                    >
                                        {d.name}{idx < directors.length - 1 ? ', ' : ''}
                                    </span>
                                ))}</p>
                            )}
                            {directors.length > 0 && isTV && creators.length === 0 && (
                                <p><strong>Director{directors.length > 1 ? 's' : ''}:</strong> {directors.map((d, idx) => (
                                    <span
                                        key={d.id}
                                        style={{ color: '#e50914', cursor: 'pointer' }}
                                        onClick={() => navigate(`/person/${d.id}`)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigate(`/person/${d.id}`); }}
                                    >
                                        {d.name}{idx < directors.length - 1 ? ', ' : ''}
                                    </span>
                                ))}</p>
                            )}
                            {writers.length > 0 && (
                                <p><strong>Writer{writers.length > 1 ? 's' : ''}:</strong> {writers.slice(0, 3).map((w, idx) => (
                                    <span
                                        key={w.id}
                                        style={{ color: '#e50914', cursor: 'pointer' }}
                                        onClick={() => navigate(`/person/${w.id}`)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigate(`/person/${w.id}`); }}
                                    >
                                        {w.name}{idx < Math.min(writers.length, 3) - 1 ? ', ' : ''}
                                    </span>
                                ))}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* CAST SECTION WITH MOBILE ARROW BUTTONS - ALREADY IMPLEMENTED */}
                {hasCast && (
                    <div className="cast-section">
                        <h3>Top Billed Cast</h3>
                        <div className="cast-scroll-wrapper">
                            {/* LEFT ARROW BUTTON - Shows on mobile always, desktop when needed */}
                            {showLeft && (
                                <button
                                    className="cast-scroll-button left"
                                    onClick={() => scrollCast('left')}
                                    aria-label="Scroll cast left"
                                >
                                    ❮
                                </button>
                            )}
                            <div className="cast-list-container" ref={castContainerRef}>
                                <div
                                    className="cast-list"
                                    ref={castListRef}
                                >
                                    {movie.credits.cast.slice(0, 20).map(actor => (
                                        <div
                                            key={actor.cast_id || actor.id || actor.credit_id}
                                            className="cast-member"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => navigate(`/person/${actor.id}`)}
                                        >
                                            <img
                                                src={actor.profile_path
                                                    ? `${movieService.TMDB_IMAGE_BASE_URL}w185${actor.profile_path}`
                                                    : 'https://placehold.co/185x278/282c34/FFF?text=No+Image'
                                                }
                                                alt={actor.name}
                                                loading="lazy"
                                            />
                                            <p className="actor-name">{actor.name}</p>
                                            <p className="character-name">{actor.character}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* RIGHT ARROW BUTTON - Shows on mobile always, desktop when needed */}
                            {showRight && (
                                <button
                                    className="cast-scroll-button right"
                                    onClick={() => scrollCast('right')}
                                    aria-label="Scroll cast right"
                                >
                                    ❯
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {trailer && trailer.key && (
                    <div className="trailer-section">
                        <div className="trailer-info">
                            <h3>Trailer</h3>
                            {/* Optionally add more trailer info here, e.g., trailer.name or description */}
                        </div>
                        <div className="video-responsive">
                            <iframe
                                src={`https://www.youtube.com/embed/${trailer.key}?rel=0`}
                                title={`${title} Trailer`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                )}

                {/* Watch Now Section */}
                <div className="watch-now-section">
                    <h3>Watch Now</h3>
                    {watchProvidersLoading && <p>Loading streaming providers...</p>}
                    {watchProvidersError && <p className="error">{watchProvidersError}</p>}
                    {watchProviders && watchProviders[userCountry] ? (
                        <div className="providers-list">
                            {['flatrate', 'rent', 'free'].map(type =>
                                watchProviders[userCountry][type] && watchProviders[userCountry][type].length > 0 ? (
                                    <div key={type} className="provider-type-group">
                                        <h4 style={{ marginBottom: '0.5em' }}>
                                            {type === 'flatrate' ? 'Subscription' : type.charAt(0).toUpperCase() + type.slice(1)}
                                        </h4>
                                        {watchProviders[userCountry][type].map(provider => (
                                            <div key={provider.provider_id} className="provider-item">
                                                <img src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`} alt={provider.provider_name} className="provider-logo" />
                                                <span className="provider-name">{provider.provider_name}</span>
                                                {/* Price info is not always available from TMDB, so we skip it */}
                                                <a
                                                    href={
                                                        getProviderSearchUrl(provider.provider_name, movie.title || movie.name) ||
                                                        watchProviders[userCountry].link
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <button className="watch-now-btn">
                                                        {type === 'flatrate' ? 'Watch Now' : type === 'rent' ? 'Rent' : 'Stream Free'}
                                                    </button>
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                ) : null
                            )}
                        </div>
                    ) : watchProviders && !watchProviders[userCountry] ? (
                        <p>No streaming providers found for your country.</p>
                    ) : null}
                </div>

                {/* User Reviews Section */}
                <div className="user-reviews-section">
                    <div className="reviews-header">
                        <h2>User Reviews</h2>
                        {/* <ReviewStats reviews={userReviews} /> */}
                    </div>
                    
                    {user ? (
                        <form onSubmit={handleReviewSubmit} className="review-form">
                            <h3>Write a Review</h3>
                            <div className="rating-input">
                                <label>Your Rating:</label>
                                <StarRating 
                                    rating={newReviewRating} 
                                    onRatingChange={setNewReviewRating}
                                    isEditable={true}
                                />
                            </div>
                            <textarea
                                value={newReviewText}
                                onChange={(e) => setNewReviewText(e.target.value)}
                                placeholder="Share your thoughts about this movie..."
                                maxLength={1000}
                                required
                            />
                            <CharacterCounter text={newReviewText} />
                            <button 
                                type="submit" 
                                className="submit-review-button"
                                disabled={isSubmitting || !newReviewRating || !newReviewText.trim()}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    ) : (
                        <div className="login-prompt">
                            <p>Please <Link to="/login">log in</Link> to write a review.</p>
                        </div>
                    )}

                    {/* Review Controls */}
                    <div className="review-controls">
                        <input
                            type="text"
                            placeholder="Search reviews..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="review-search-input"
                        />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="review-sort-select"
                        >
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                            <option value="highest">Highest Rated</option>
                            <option value="lowest">Lowest Rated</option>
                        </select>
                        <select
                            value={filterRating}
                            onChange={(e) => setFilterRating(parseInt(e.target.value))}
                            className="review-filter-select"
                        >
                            <option value={0}>All Ratings</option>
                            {[5, 4, 3, 2, 1].map(r => (
                                <option key={r} value={r}>{r} Stars</option>
                            ))}
                        </select>
                    </div>

                    {/* Reviews List */}
                    {filteredReviews.length === 0 ? (
                        <div className="no-reviews-placeholder">
                            <p>No reviews found. Be the first to share your thoughts!</p>
                        </div>
                    ) : (
                        <div className="reviews-list">
                            {filteredReviews.slice(0, reviewsToShow).map((review) => {
                                console.log("Logged in user:", user);
                                console.log("Current review being rendered:", review);
                                return (
                                    <div key={review._id} className={`review-item ${review.isNew ? 'new-review' : ''}`}>
                                        {editingReviewId === review._id ? (
                                            // Edit mode for the current user's review
                                            <form onSubmit={handleUpdateReview} className="edit-review-form">
                                                <div className="rating-input">
                                                    <label>Your Rating:</label>
                                                    <StarRating 
                                                        rating={editingReviewRating} 
                                                        onRatingChange={setEditingReviewRating}
                                                        isEditable={true}
                                                    />
                                                </div>
                                                <textarea
                                                    value={editingReviewText}
                                                    onChange={(e) => setEditingReviewText(e.target.value)}
                                                    placeholder="Edit your review..."
                                                    maxLength={1000}
                                                    required
                                                ></textarea>
                                                <CharacterCounter text={editingReviewText} maxLength={1000} />
                                                <div className="edit-review-actions">
                                                    <button type="submit" className="save-review-button">Save</button>
                                                    <button type="button" onClick={handleCancelEdit} className="cancel-edit-button">Cancel</button>
                                                </div>
                                            </form>
                                        ) : (
                                            // Display mode
                                            <>
                                                <div className="review-header">
                                                    <div className="review-author">
                                                        <strong>{review.username}</strong>
                                                    </div>
                                                    <div className="review-rating">
                                                        <StarRating rating={review.rating} isEditable={false} size="small" />
                                                    </div>
                                                    <div className="review-date">
                                                        {new Date(review.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <p className="review-text">{review.text}</p>

                                                {user && user.id === review.userId._id && (
                                                    <div className="review-buttons">
                                                     <button className="edit-review-button" onClick={() => handleEditClick(review)}>✏️ Edit</button>
                                                     <button className="delete-review-button" onClick={() => handleDeleteReview(review._id)}>🗑️ Delete</button>
                                                    </div>
                                                )}

                                            </>
                                        )}
                                    </div>
                                );
                            })}
                            <LoadMoreButton />
                        </div>
                    )}
                </div>

                <Link to="/" className="back-to-home-button">Back to Home</Link>
            </div>
        </div>
    );
}

export default MovieDetailPage;