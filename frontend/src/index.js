import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext'; // Import the provider
import { BrowserRouter as Router } from 'react-router-dom'; // Assuming you use React Router

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider> {/* Wrap your App with the provider */}
        <App />
      </AuthProvider>
    </Router>
  </React.StrictMode>
);
