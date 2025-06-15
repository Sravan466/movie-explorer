import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { BookmarkProvider } from './context/BookmarkContext';
import { BrowserRouter as Router } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <BookmarkProvider>
          <App />
        </BookmarkProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);
