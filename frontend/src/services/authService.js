// frontend/src/services/authService.js
import axios from 'axios';

// Use the VITE_API_BASE_URL from your .env file, or default to your backend URL
// This assumes your backend API (including /api/auth routes) is running on localhost:5001
// Adjust if your backend is hosted elsewhere or on a different port.
const BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001').replace(/\/$/, '');
const API_URL = `${BASE}/api/auth`;

/**
 * Registers a new user.
 * @param {object} userData - The user data (username, email, password).
 * @param {string} userData.username
 * @param {string} userData.email
 * @param {string} userData.password
 * @returns {Promise<object>} The response data from the server.
 */
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data; // Should include { message, user (excluding password) }
  } catch (error) {
    // Axios wraps the error response in error.response
    console.error('Registration service error:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Registration failed due to a network or server issue.');
  }
};

/**
 * Logs in an existing user.
 * @param {object} userData - The user login credentials (email, password).
 * @param {string} userData.email
 * @param {string} userData.password
 * @returns {Promise<object>} The response data from the server.
 */
export const loginUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/login`, userData);
    // Successful login should return { message, token, user }
    if (response.data && response.data.token) {
      // You might want to store the token here or in the component that calls this
      // For now, just return the full response data
      return response.data;
    } else {
      // Handle cases where token might be missing in response unexpectedly
      throw new Error('Login successful, but no token received.');
    }
  } catch (error) {
    console.error('Login service error:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Login failed due to a network or server issue.');
  }
};

// You can add other auth-related service functions here later, like:
// - logoutUser (if it involves a backend call, though often it's frontend only)
// - getCurrentUser (to fetch user details using a token)
