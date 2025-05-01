import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create context
const AuthContext = createContext(null);

// Default API URL
const API_URL = 'http://localhost:8080/api/auth';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setCurrentUser(JSON.parse(storedUser));
      // Set default auth header for all future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    
    setLoading(false);
  }, []);

  // Register a new landlord
  const registerLandlord = async (userData) => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/register/landlord`, userData);
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || 'An error occurred during registration';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Register a new property seeker
  const registerSeeker = async (userData) => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/register/seeker`, userData);
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || 'An error occurred during registration';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Login user (both landlord and seeker)
  const login = async (email, password, accountType) => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
        accountType
      });
      
      const { token, user } = response.data.data;
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set default auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update state
      setCurrentUser(user);
      setLoading(false);
      
      return user;
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || 'Invalid credentials';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Logout user
  const logout = async () => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post(`${API_URL}/logout`, { token });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Clear auth header
      delete axios.defaults.headers.common['Authorization'];
      
      // Update state
      setCurrentUser(null);
      setLoading(false);
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/forgot-password`, { email });
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Reset password
  const resetPassword = async (token, password) => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/reset-password`, {
        token,
        password
      });
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!currentUser;
  };

  // Check if user is a landlord
  const isLandlord = () => {
    return currentUser?.accountType === 'landlord';
  };

  // Check if user is a property seeker
  const isPropertySeeker = () => {
    return currentUser?.accountType === 'seeker';
  };

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    registerLandlord,
    registerSeeker,
    login,
    logout,
    forgotPassword,
    resetPassword,
    isAuthenticated,
    isLandlord,
    isPropertySeeker
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};