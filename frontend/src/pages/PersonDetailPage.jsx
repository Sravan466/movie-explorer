import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PersonDetailPage.css'; // Import the CSS file

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!person) return <div>No data found.</div>;

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
        {/* Left column: (empty or reserved for future use) */}
        <div className="person-left-col"></div>
        {/* Right column: profile image + info row, then photos, previous movies, known for */}
        <div className="person-right-col">
          {/* Profile image and info row */}
          <div style={{display: 'flex', alignItems: 'flex-start', gap: '2em', marginBottom: '2em'}}>
            <img
              src={person.profile_path ? `${TMDB_IMAGE_BASE_URL}w300${person.profile_path}` : 'https://placehold.co/220x330/282c34/FFF?text=No+Image'}
              alt={person.name}
              className="person-profile-img lazy-img"
              loading="lazy"
              style={{marginBottom: 0}}
            />
            <div className="person-profile-info" style={{alignItems: 'flex-start', marginTop: 0}}>
              <h2 style={{textAlign: 'left', width: '100%'}}>{person.name}</h2>
              <p><b>Known For:</b> {person.known_for_department}</p>
              <p><b>Birthday:</b> {person.birthday || 'N/A'}</p>
              {person.place_of_birth && <p><b>Place of Birth:</b> {person.place_of_birth}</p>}
              {person.biography && <div className="person-biography">{person.biography}</div>}
            </div>
          </div>
          {/* Photos section below profile info row */}
          <div className="person-photos-section">
            <div className="person-photos-header">Photos</div>
            <div className="person-photos-list">
              {photos.length > 0 ? photos.slice(0, 9).map((photo, idx) => (
                <img
                  key={idx}
                  src={`${TMDB_IMAGE_BASE_URL}w185${photo.file_path}`}
                  alt={person.name + ' photo'}
                  className="lazy-img"
                  loading="lazy"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedPhoto(photo.file_path)}
                />
              )) : <span>No photos available.</span>}
            </div>
          </div>
          <hr className="person-section-divider" />
          <section>
            <div className="person-section-header">Previous Movies</div>
            <div className="previous-movies-row-wrapper">
              <button className="scroll-arrow left" onClick={scrollLeft}>&lt;</button>
              <div className="person-previous-movies-list" ref={moviesRowRef}>
                {previousMovies.length > 0 ? previousMovies.slice(0, 10).map(movie => (
                  <div
                    key={movie.credit_id}
                    className="person-previous-movie-item"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/movie/${movie.id}`)}
                  >
                    <img
                      src={movie.poster_path ? `${TMDB_IMAGE_BASE_URL}w185${movie.poster_path}` : 'https://placehold.co/110x165/282c34/FFF?text=No+Image'}
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
                )) : <span>No previous movies found.</span>}
              </div>
              <button className="scroll-arrow right" onClick={scrollRight}>&gt;</button>
            </div>
          </section>
          <hr className="person-section-divider" />
          <section>
            <div className="person-section-header">Known For</div>
            <div className="person-knownfor-list">
              {knownFor.length > 0 ? knownFor.map(item => (
                <div
                  key={item.id}
                  className="person-knownfor-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/movie/${item.id}`)}
                >
                  <img
                    src={item.poster_path ? `${TMDB_IMAGE_BASE_URL}w185${item.poster_path}` : 'https://placehold.co/120x180/282c34/FFF?text=No+Image'}
                    alt={item.title || item.name}
                    className="lazy-img"
                    loading="lazy"
                  />
                  <div className="person-knownfor-title">{item.title || item.name}</div>
                  <div className="person-knownfor-type">{item.media_type === 'movie' ? 'Movie' : 'TV'}</div>
                </div>
              )) : <span>No highlights available.</span>}
            </div>
          </section>
        </div>
      </div>
      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className={`photo-modal-overlay${photoModalActive ? ' photo-modal-overlay--active' : ''}`}
          onClick={() => { setPhotoModalActive(false); setTimeout(() => setSelectedPhoto(null), 250); }}
        >
          <div
            className={`photo-modal-content${photoModalActive ? ' photo-modal-content--active' : ''}`}
            onClick={e => e.stopPropagation()}
          >
            <button className="photo-modal-close" onClick={() => { setPhotoModalActive(false); setTimeout(() => setSelectedPhoto(null), 250); }}>×</button>
            <img
              src={`${TMDB_IMAGE_BASE_URL}original${selectedPhoto}`}
              alt="Full size"
              className="photo-modal-img"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default PersonDetailPage; 