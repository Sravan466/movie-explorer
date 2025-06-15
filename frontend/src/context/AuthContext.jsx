import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const AuthContext = createContext();

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    console.log('AuthContext - Initial user state from localStorage:', storedUser ? JSON.parse(storedUser) : null);
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem('token');
    console.log('AuthContext - Initial token state from localStorage:', storedToken);
    return storedToken || null;
  });

  // Helper function to decode JWT token (for debugging)
  const debugToken = (currentToken) => {
    if (!currentToken) {
      console.log('AuthContext Debug - No token provided for debugging');
      return;
    }
    try {
      const parts = currentToken.split('.');
      if (parts.length !== 3) {
        console.log('AuthContext Debug - Invalid token format for debugging');
        return;
      }
      const payload = JSON.parse(atob(parts[1]));
      console.log('AuthContext Debug - Token payload:', payload);
      if (payload.exp) {
        const expiration = new Date(payload.exp * 1000);
        const now = new Date();
        console.log('AuthContext Debug - Token expires at:', expiration);
        console.log('AuthContext Debug - Current time:', now);
        console.log('AuthContext Debug - Token is expired:', now > expiration);
      }
    } catch (error) {
      console.error('AuthContext Debug - Error decoding token:', error);
    }
  };

  // Login function
  const login = (userData, userToken) => {
    console.log('AuthContext - Login called with userData:', userData);
    console.log('AuthContext - Login called with userToken:', userToken ? `${userToken.substring(0, 20)}...` : 'null');
    
    // Debug the token received during login
    debugToken(userToken);

    setUser(userData);
    setToken(userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
    console.log('AuthContext - Token and user set in state and localStorage');
  };

  // Logout function
  const logout = () => {
    console.log('AuthContext - Logout called');
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Auth state and actions provided to consumers
  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for easy access
export function useAuth() {
  return useContext(AuthContext);
}
