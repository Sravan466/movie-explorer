// frontend/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import * as authService from '../services/authService';
import './AuthPage.css'; // Shared CSS
import { useAuth } from '../context/AuthContext';

// TODO: Later, import and use AuthContext
// import { useAuth } from '../context/AuthContext'; 

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // To get potential redirect path after login
  const { login } = useAuth();

  // TODO: Later, get login function from AuthContext
  // const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const loginData = { email, password };
      const response = await authService.loginUser(loginData);

      if (response.user && response.token) {
        login(response.user, response.token);
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true, state: { message: `Welcome back, ${response.user.username}!`, type: 'success' } });
      } else {
        setError('Login failed. Please check your credentials or no token received.');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-form-wrapper">
        <h2>Login to Your Account</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <p className="auth-error-message">{error}</p>}
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
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="auth-switch-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
