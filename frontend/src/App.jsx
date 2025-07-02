// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MovieDetailPage from './pages/MovieDetailPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import SearchBar from './components/SearchBar';
import MovieRow from './components/MovieRow'; // Assuming you have this component
import './App.css';
import { useAuth } from './context/AuthContext';
import BookmarkPage from './pages/BookmarkPage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesomeIcon
import { faBookmark as faSolidBookmark, faEnvelope } from '@fortawesome/free-solid-svg-icons'; // Import solid bookmark icon and envelope icon
import PersonDetailPage from './pages/PersonDetailPage';

function App() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [searchResults, setSearchResults] = useState([]);
  const [searchQueryFromBar, setSearchQueryFromBar] = useState(''); // To store query from SearchBar
  const [notifications, setNotifications] = useState([]); // State to manage notifications
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // New state for mobile menu

  // Function to toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false); // Close menu on route change
  }, [location.pathname]);

  // Notification system
  const showNotification = (message, type = 'info') => {
    const id = Date.now(); // Unique ID for each notification
    let title = '';
    let icon = '';

    switch (type) {
      case 'success':
        title = 'Success!';
        icon = '✅';
        break;
      case 'error':
        title = 'Error!';
        icon = '❌';
        break;
      case 'info':
        title = 'Info:';
        icon = 'ℹ️';
        break;
      default:
        title = 'Notification';
        icon = '🔔';
    }

    const newNotification = { id, title, message, type, icon };

    setNotifications((prevNotifications) => [...prevNotifications, newNotification]);

    // Automatically remove notification after 5 seconds
    setTimeout(() => {
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== id)
      );
    }, 5000); // Notification visible for 5 seconds
  };

  useEffect(() => {
    // This effect handles displaying search results when navigating to /search
    if (location.pathname === '/search' && location.state?.results) {
      setSearchResults(location.state.results);
      // If query is also passed in state, use it, otherwise keep the one from SearchBar
      setSearchQueryFromBar(location.state.query || searchQueryFromBar);
    } else if (location.pathname !== '/search') {
      // Clear results and query when navigating away from search page, unless it's a detail page
      if (!location.pathname.startsWith('/movie/') && !location.pathname.startsWith('/tv/')) {
        setSearchResults([]);
        setSearchQueryFromBar('');
      }
    }
  }, [location, searchQueryFromBar]);

  const handleItemClick = (item) => {
    console.log("App.jsx: Card clicked. Item:", item);
    if (item && item.id && item.media_type) {
      console.log("App.jsx: Navigating to detail page for ID:", item.id, "Type:", item.media_type);
      const url = `/${item.media_type}/${item.id}`; // Simplified URL construction
      console.log("App.jsx: Navigating to URL:", url);
      navigate(url);
    } else {
      console.error("App.jsx: Cannot navigate, missing item.id or item.media_type:", item);
    }
  };

  const handleViewAllClick = (categoryTitle, categoryId) => {
    console.log("App.jsx: Navigating to 'View All' page for:", categoryTitle, "ID:", categoryId);
    if (categoryId) {
      navigate(`/genre/${categoryId}`); // Make sure you have a route for /genre/:genreId
    } else {
      const categoryPath = categoryTitle.toLowerCase().replace(/\s+/g, '-');
      navigate(`/category/${categoryPath}`); // Make sure you have a route for /category/:categoryName
    }
  };

  const handleSearchResults = (results, query) => {
    const resultsArray = Array.isArray(results) ? results : [];
    setSearchResults(resultsArray);
    setSearchQueryFromBar(query); // Store the query from the search bar
    navigate('/search', {
      state: {
        results: resultsArray,
        query: query // Pass the query along with results
      }
    });
  };

  // Component to render search results, using MovieRow
  const SearchResultsComponent = () => {
    // Use searchQueryFromBar for displaying the title, or location.state.query as fallback
    const currentQuery = searchQueryFromBar || location.state?.query || "";

    // Group search results by type
    const groupedResults = {
      movies: searchResults.filter(item => item.media_type === 'movie'),
      tvShows: searchResults.filter(item => item.media_type === 'tv')
    };

    return (
      <div className="search-results-page">
        <div className="search-results-header">
          <h2>Search Results {currentQuery && `for "${currentQuery}"`}</h2>
          {searchResults.length > 0 && <p>{searchResults.length} results found</p>}
        </div>

        {groupedResults.movies.length > 0 && (
          <MovieRow
            title="Movies"
            items={groupedResults.movies} // Changed prop name to 'items' for consistency
            isLoading={false} // Assuming loading is handled before this component renders
            hasError={false}  // Assuming error is handled before this component renders
            onItemClick={handleItemClick} // Changed prop name
            // No onViewAllClick for search results typically
          />
        )}

        {groupedResults.tvShows.length > 0 && (
          <MovieRow
            title="TV Shows"
            items={groupedResults.tvShows} // Changed prop name to 'items'
            isLoading={false}
            hasError={false}
            onItemClick={handleItemClick} // Changed prop name
          />
        )}

        {searchResults.length === 0 && !currentQuery && (
             <div className="no-results">
                <p>Please enter a search term to find movies or TV shows.</p>
            </div>
        )}
        {searchResults.length === 0 && currentQuery && (
          <div className="no-results">
            <p>No results found for "{currentQuery}". Try a different search term.</p>
          </div>
        )}
      </div>
    );
  };

  const isHomePage = location.pathname === '/';
  const showBackButton = !isHomePage;
  const hideSearchBar = 
    location.pathname === '/login' || 
    location.pathname === '/register' ||
    location.pathname === '/bookmarks' ||
    location.pathname.startsWith('/movie/') ||
    location.pathname.startsWith('/tv/') ||
    location.pathname.startsWith('/person/');

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-left">
          {showBackButton && (
            <div className="back-button-wrapper">
              <button onClick={() => navigate(-1)} className="professional-back-button">
                <svg className="back-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Back</span>
              </button>
            </div>
          )}
        </div>
        <div className="header-center">
          <Link to="/" className="app-title-link">
            <span className="app-title-part">Movie</span>
            <span className="app-title-part">Explorer</span>
          </Link>
        </div>
        <nav className="header-right auth-nav">
          {user ? (
            <>
              <Link to="/bookmarks" className="bookmark-button">
                <span className="bookmark-text">Bookmarks</span>
                <svg className="bookmark-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 21L12 16L5 21V5C5 4.47 5.21 3.96 5.59 3.59C5.96 3.21 6.47 3 7 3H17C17.53 3 18.04 3.21 18.41 3.59C18.79 3.96 19 4.47 19 5V21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <span style={{ marginRight: 12 }}>Hello, {user.username}</span>
              <button className="auth-nav-link" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="auth-nav-link">Login</Link>
              <Link to="/register" className="auth-nav-link">Register</Link>
            </>
          )}
        </nav>

        {/* Mobile menu button and dropdown */}
        <div className="mobile-menu-container">
          <button className="mobile-menu-button" onClick={toggleMobileMenu} aria-label="Toggle navigation menu">
            <svg className="menu-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              {isMobileMenuOpen ? (
                // Close icon (X)
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              ) : (
                // Hamburger icon
                <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              )}
            </svg>
          </button>
          {isMobileMenuOpen && (
            <div className="mobile-menu-dropdown">
              {user ? (
                <>
                  <Link to="/bookmarks" className="mobile-menu-link" onClick={toggleMobileMenu}>
                    <span className="bookmark-text">Bookmarks</span>
                    <svg className="bookmark-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 21L12 16L5 21V5C5 4.47 5.21 3.96 5.59 3.59C5.96 3.21 6.47 3 7 3H17C17.53 3 18.04 3.21 18.41 3.59C18.79 3.96 19 4.47 19 5V21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                  <span className="mobile-menu-greeting">Hello, {user.username}</span>
                  <button className="mobile-menu-link" onClick={() => { logout(); toggleMobileMenu(); }}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="mobile-menu-link" onClick={toggleMobileMenu}>Login</Link>
                  <Link to="/register" className="mobile-menu-link" onClick={toggleMobileMenu}>Register</Link>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Flash Messages Container */}
      <div className="notifications-container">
        {notifications.map((notification) => (
          <div key={notification.id} className={`flash-message ${notification.type}`}>
            {notification.icon && <span className="flash-icon">{notification.icon}</span>}
            <div className="flash-content">
              {notification.title && <p className="flash-title">{notification.title}</p>}
              <p className="flash-message-text">{notification.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Conditional SearchBar rendering */}
      {!hideSearchBar && <SearchBar onSearchResults={handleSearchResults} showNotification={showNotification} />} 

      <main className="app-main">

        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                onItemClick={handleItemClick} // Changed prop name
                onViewAllClick={handleViewAllClick}
              />
            }
          />

          {/* MovieDetailPage routes now correctly use :movieId and :showId from URL */}
          <Route path="/movie/:movieId" element={<MovieDetailPage showNotification={showNotification} />} />
          <Route path="/tv/:showId" element={<MovieDetailPage showNotification={showNotification} />} />

          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route 
            path="/bookmarks" 
            element={<BookmarkPage onItemClick={handleItemClick} />} 
          />

          <Route
            path="/search"
            element={<SearchResultsComponent />}
          />

          {/* Add PersonDetailPage route here */}
          <Route path="/person/:personId" element={<PersonDetailPage />} />

          {/* Example for Genre/Category pages (implement these pages later) */}
          {/* <Route path="/genre/:genreId" element={<GenrePage onItemClick={handleItemClick} />} /> */}
          {/* <Route path="/category/:categoryName" element={<CategoryPage onItemClick={handleItemClick} />} /> */}

          <Route path="*" element={
            <div style={{ textAlign: 'center', marginTop: '50px', padding: '20px', color: '#fff' }}>
              <h2>404 - Page Not Found</h2>
              <p>Oops! The page you are looking for does not exist or may have been moved.</p>
              <Link to="/" style={{ color: '#e50914', textDecoration: 'underline' }}>Go to Home Page</Link>
            </div>
          } />
        </Routes>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-section copyright-section">
            <p className="copyright">© {new Date().getFullYear()} Movie Explorer. All rights reserved.</p>
          </div>
          <div className="footer-section credits">
            <p className="developer-credit">Developed by <span className="developer-name">Sravan Kumar</span></p>
            <a href="mailto:sravankumarreddy466z@gmail.com" className="developer-email">
              <FontAwesomeIcon icon={faEnvelope} className="email-icon" />
              sravankumarreddy466z@gmail.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;