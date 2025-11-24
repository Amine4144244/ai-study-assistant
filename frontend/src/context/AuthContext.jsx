import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [lastAttempt, setLastAttempt] = useState(0);

  useEffect(() => {
    // Only check auth if we haven't exceeded retry count or enough time has passed
    const now = Date.now();
    const timeSinceLastAttempt = now - lastAttempt;
    
    if (retryCount < 3 || timeSinceLastAttempt > 60000) { // 60 seconds cooldown
      checkAuth();
    } else {
      // Skip auth check if we've had too many failures
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    setLastAttempt(Date.now());
    try {
      const response = await API.get('/auth/me', {
        withCredentials: true
      });
      setUser(response.data.user);
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      if (error.response && error.response.status !== 401) {
        // Log errors other than 401 Unauthorized
        console.error('Authentication check failed:', error);
      }
      setUser(null);
      setRetryCount(prev => prev + 1); // Increment retry counter on failure
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await API.post('/auth/login', {
        email,
        password
      }, {
        withCredentials: true
      });
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  };

  const register = async (email, password, name) => {
    try {
      const response = await API.post('/auth/register', {
        email,
        password,
        name
      }, {
        withCredentials: true
      });
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  };

  const logout = async () => {
    try {
      await API.post('/auth/logout', {}, {
        withCredentials: true
      });
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};