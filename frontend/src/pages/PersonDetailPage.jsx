import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PersonDetailPage.css';

const TMDB_API_KEY = '4300117430ce27a077cd7dc1bab67637';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

function PersonDetailPage() {
  const { personId } = useParams();
  const [person, setPerson] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const moviesRowRef = useRef(null);
  const navigate = useNavigate();
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoModalActive, setPhotoModalActive] = useState(false);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const bioRef = useRef(null);

  useEffect(() => {
    const fetchPersonDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const [personRes, photosRes, creditsRes] = await Promise.all([
          axios.get(`${TMDB_BASE_URL}/person/${personId}?api_key=${TMDB_API_KEY}`),
          axios.get(`${TMDB_BASE_URL}/person/${personId}/images?api_key=${TMDB_API_KEY}`),
          axios.get(`${TMDB_BASE_URL}/person/${personId}/combined_credits?api_key=${TMDB_API_KEY}`),
        ]);
        setPerson(personRes.data);
        setPhotos(photosRes.data.profiles || []);
        setCredits(creditsRes.data);
      } catch (err) {
        setError('Failed to load person details.');
      } finally {
        setLoading(false);
      }
    };
    fetchPersonDetails();
  }, [personId]);

  useEffect(() => {
    if (selectedPhoto) {
      setTimeout(() => setPhotoModalActive(true), 10);
    } else {
      setPhotoModalActive(false);
    }
  }, [selectedPhoto]);

  useEffect(() => {
    // Detect mobile screen
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scrollLeft = () => {
    if (moviesRowRef.current) {
      moviesRowRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (moviesRowRef.current) {
      moviesRowRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (loading) return <div className="loading-state">Loading person details...</div>;
  if (error) return <div className="error-state">{error}</div>;
  if (!person) return <div className="error-state">No person data found.</div>;

  // Known for: top 4 most popular movie cast credits
  const knownFor = credits && credits.cast
    ? [...credits.cast]
        .filter(item => item.media_type === 'movie')
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 4)
    : [];

  // Previous movies: all cast credits, sorted by release date desc
  const previousMovies = credits && credits.cast
    ? [...credits.cast].filter(c => c.media_type === 'movie' && c.release_date).sort((a, b) => (b.release_date || '').localeCompare(a.release_date || ''))
    : [];

  return (
    <div className="person-detail-container">
      <div className="person-main-content">
        {/* Profile Section */}
        <div className="person-profile-section">
          <img
            src={person.profile_path ? `${TMDB_IMAGE_BASE_URL}w500${person.profile_path}` : 'https://placehold.co/280x400/282c34/FFF?text=No+Image'}
            alt={person.name}
            className="person-profile-img lazy-img"
            loading="lazy"
          />
          <div className="person-profile-info">
            <h2>{person.name}</h2>
            <p><b>Known For:</b> {person.known_for_department}</p>
            <p><b>Birthday:</b> {person.birthday || 'N/A'}</p>
            {person.place_of_birth && <p><b>Place of Birth:</b> {person.place_of_birth}</p>}
            {person.biography && (
              <div
                className={`person-biography${isMobile && !isBioExpanded ? ' person-biography--clamp' : ''}${isMobile ? ' person-biography--mobile' : ''}`}
                ref={bioRef}
                style={isMobile ? {
                  maxHeight: isBioExpanded ? (bioRef.current ? bioRef.current.scrollHeight : '1000px') : '8.5em',
                  transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1)',
                  overflow: 'hidden',
                  WebkitBoxOrient: 'vertical',
                  display: '-webkit-box',
                  WebkitLineClamp: isBioExpanded ? 'unset' : 5,
                } : {}}
                aria-expanded={isBioExpanded}
              >
                {person.biography}
              </div>
            )}
            {/* See More/Less button for mobile only */}
            {isMobile && person.biography && (
              <button
                className="person-biography-toggle"
                onClick={() => setIsBioExpanded(v => !v)}
                aria-expanded={isBioExpanded}
                aria-controls="person-biography"
                tabIndex={0}
                style={{
                  marginTop: '0.5rem',
                  background: 'none',
                  border: 'none',
                  color: '#e50914',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  outline: 'none',
                  padding: 0,
                  transition: 'color 0.2s',
                }}
              >
                {isBioExpanded ? 'See Less' : 'See More'}
              </button>
            )}
          </div>
        </div>

        {/* Photos Section */}
        {photos.length > 0 && (
          <div className="person-photos-section">
            <div className="person-photos-header">Photos</div>
            <div className="person-photos-list">
              {photos.slice(0, 9).map((photo, idx) => (
                <img
                  key={idx}
                  src={`${TMDB_IMAGE_BASE_URL}w300${photo.file_path}`}
                  alt={`${person.name} photo ${idx + 1}`}
                  className="lazy-img"
                  loading="lazy"
                  onClick={() => setSelectedPhoto(photo.file_path)}
                />
              ))}
            </div>
          </div>
        )}

        <hr className="person-section-divider" />

        {/* Previous Movies Section */}
        {previousMovies.length > 0 && (
          <section>
            <div className="person-section-header">Previous Movies</div>
            <div className="previous-movies-row-wrapper">
              <button className="scroll-arrow left" onClick={scrollLeft} aria-label="Scroll left">
                ‹
              </button>
              <div className="person-previous-movies-list" ref={moviesRowRef}>
                {previousMovies.slice(0, 15).map(movie => (
                  <div
                    key={movie.credit_id}
                    className="person-previous-movie-item"
                    onClick={() => navigate(`/movie/${movie.id}`)}
                  >
                    <img
                      src={movie.poster_path ? `${TMDB_IMAGE_BASE_URL}w300${movie.poster_path}` : 'https://placehold.co/120x180/282c34/FFF?text=No+Image'}
                      alt={movie.title}
                      className="person-previous-movie-poster lazy-img"
                      loading="lazy"
                    />
                    <div className="person-previous-movie-info">
                      <div className="person-previous-movie-title">{movie.title}</div>
                      <div className="person-previous-movie-date">{movie.release_date}</div>
                      {movie.character && <div className="person-previous-movie-role">as {movie.character}</div>}
                    </div>
                  </div>
                ))}
              </div>
              <button className="scroll-arrow right" onClick={scrollRight} aria-label="Scroll right">
                ›
              </button>
            </div>
          </section>
        )}

        <hr className="person-section-divider" />

        {/* Known For Section */}
        {knownFor.length > 0 && (
          <section>
            <div className="person-section-header">Known For</div>
            <div className="person-knownfor-list">
              {knownFor.map(item => (
                <div
                  key={item.id}
                  className="person-knownfor-card"
                  onClick={() => navigate(`/movie/${item.id}`)}
                >
                  <img
                    src={item.poster_path ? `${TMDB_IMAGE_BASE_URL}w300${item.poster_path}` : 'https://placehold.co/180x270/282c34/FFF?text=No+Image'}
                    alt={item.title || item.name}
                    className="lazy-img"
                    loading="lazy"
                  />
                  <div className="person-knownfor-title">{item.title || item.name}</div>
                  <div className="person-knownfor-type">{item.media_type === 'movie' ? 'Movie' : 'TV'}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className={`photo-modal-overlay${photoModalActive ? ' photo-modal-overlay--active' : ''}`}
          onClick={() => { setPhotoModalActive(false); setTimeout(() => setSelectedPhoto(null), 300); }}
        >
          <div
            className={`photo-modal-content${photoModalActive ? ' photo-modal-content--active' : ''}`}
            onClick={e => e.stopPropagation()}
          >
            <button 
              className="photo-modal-close" 
              onClick={() => { setPhotoModalActive(false); setTimeout(() => setSelectedPhoto(null), 300); }}
              aria-label="Close photo"
            >
              ×
            </button>
            <img
              src={`${TMDB_IMAGE_BASE_URL}original${selectedPhoto}`}
              alt="Full size photo"
              className="photo-modal-img"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default PersonDetailPage;