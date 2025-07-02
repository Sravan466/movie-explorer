import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext'; // Import the provider
import { BrowserRouter as Router, Route } from 'react-router-dom'; // Assuming you use React Router
import PersonDetailPage from './pages/PersonDetailPage';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider> {/* Wrap your App with the provider */}
        <Route path="/person/:personId" element={<PersonDetailPage />} />
        <App />
      </AuthProvider>
    </Router>
  </React.StrictMode>
);
