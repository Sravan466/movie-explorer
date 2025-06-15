// frontend/src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as authService from '../services/authService'; // Adjust path if needed
import './AuthPage.css'; // Shared CSS for auth pages
import { useAuth } from '../context/AuthContext';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  // No need for 'success' state here anymore if we redirect immediately
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register, login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      const userDataToRegister = { username, email, password };
      const response = await authService.registerUser(userDataToRegister);
      
      login(response.user, response.token);
      navigate('/', { 
        state: { 
          message: `Welcome to Movie Explorer, ${response.user.username}!`,
          type: 'success'
        } 
      });

    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      if (err.errors) {
        const fieldErrors = Object.values(err.errors).join(' ');
        setError(`Registration failed: ${fieldErrors}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-form-wrapper">
        <h2>Create Your Account</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <p className="auth-error-message">{error}</p>}
          {/* Success message is now handled by HomePage via flash message */}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="6"
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="auth-switch-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
