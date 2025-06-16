import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext'; // Import useAuth

const BookmarkContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

export const BookmarkProvider = ({ children }) => {
  const [bookmarkedItems, setBookmarkedItems] = useState({});
  const { token, isAuthenticated } = useAuth(); // Get token and isAuthenticated from AuthContext

  // Debug logging
  useEffect(() => {
    console.log('BookmarkProvider - Auth state:', { 
      isAuthenticated, 
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'null'
    });
  }, [token, isAuthenticated]);

  const fetchBookmarks = useCallback(async () => {
    if (!isAuthenticated || !token) {
      console.log('BookmarkProvider - Not authenticated, clearing bookmarks');
      setBookmarkedItems({});
      return;
    }
    
    console.log('BookmarkProvider - Fetching bookmarks with token:', token);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookmarks`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('BookmarkProvider - Fetch response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        // Transform array of bookmarks into an object keyed by mediaId for easy lookup
        const bookmarksObject = data.reduce((acc, item) => {
          acc[item.mediaId] = item;
          return acc;
        }, {});
        setBookmarkedItems(bookmarksObject);
        console.log('BookmarkProvider - Bookmarks loaded:', Object.keys(bookmarksObject).length);
      } else if (response.status === 401) {
        // Token expired or invalid, user will be logged out by AuthContext
        console.warn('BookmarkProvider - Authentication failed while fetching bookmarks.');
        setBookmarkedItems({});
      } else {
        console.error('BookmarkProvider - Failed to fetch bookmarks:', response.statusText);
        setBookmarkedItems({});
      }
    } catch (error) {
      console.error('BookmarkProvider - Error fetching bookmarks:', error);
      setBookmarkedItems({});
    }
  }, [token, isAuthenticated]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const addBookmark = useCallback(async (item) => {
    console.log('BookmarkProvider - Adding bookmark for item:', item.id);
    console.log('BookmarkProvider - Current auth state:', { isAuthenticated, hasToken: !!token });
    
    if (!isAuthenticated || !token) {
      console.warn('BookmarkProvider - Cannot add bookmark: User not authenticated.');
      return false;
    }
    
    const requestBody = {
      mediaId: item.id,
      mediaType: item.media_type,
      title: item.title || item.name,
      poster_path: item.poster_path,
      release_date: item.release_date,
      first_air_date: item.first_air_date,
      vote_average: item.vote_average,
    };
    
    console.log('BookmarkProvider - Request body:', requestBody);
    console.log('BookmarkProvider - API URL:', `${API_BASE_URL}/api/bookmarks`);
    console.log('BookmarkProvider - Authorization header:', `Bearer ${token}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookmarks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('BookmarkProvider - Add bookmark response status:', response.status);
      console.log('BookmarkProvider - Add bookmark response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('BookmarkProvider - Bookmark added successfully:', data);
        setBookmarkedItems(prev => ({ ...prev, [item.id]: data.bookmark }));
        return true;
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('BookmarkProvider - Failed to add bookmark:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        return false;
      }
    } catch (error) {
      console.error('BookmarkProvider - Error adding bookmark:', error);
      return false;
    }
  }, [token, isAuthenticated]);

  const removeBookmark = useCallback(async (itemId, mediaType) => {
    console.log('BookmarkProvider - Removing bookmark:', { itemId, mediaType });
    
    if (!isAuthenticated || !token) {
      console.warn('BookmarkProvider - Cannot remove bookmark: User not authenticated.');
      return false;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookmarks/${itemId}/${mediaType}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('BookmarkProvider - Remove bookmark response status:', response.status);
      
      if (response.ok) {
        setBookmarkedItems(prev => {
          const newBookmarks = { ...prev };
          delete newBookmarks[itemId];
          return newBookmarks;
        });
        console.log('BookmarkProvider - Bookmark removed successfully');
        return true;
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('BookmarkProvider - Failed to remove bookmark:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        return false;
      }
    } catch (error) {
      console.error('BookmarkProvider - Error removing bookmark:', error);
      return false;
    }
  }, [token, isAuthenticated]);

  const isBookmarked = (itemId) => {
    return !!bookmarkedItems[itemId];
  };

  return (
    <BookmarkContext.Provider value={{ bookmarkedItems, addBookmark, removeBookmark, isBookmarked, fetchBookmarks }}>
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmark = () => {
  return useContext(BookmarkContext);
}; 