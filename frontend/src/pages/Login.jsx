/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import PropertyNavbar from "../components/PropertyNavbar";
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error: authError, loading } = useAuth();
  
  const [userType, setUserType] = useState('seeker'); 
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  // Get redirect path from location state (if it exists)
  // This handles redirects from ProtectedRoute
  const from = location.state?.from?.pathname || '/dashboard';

  // Check if we have a message from the location state (e.g., from registration)
  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
    }
  }, [location]);

  // Clear message when component unmounts
  useEffect(() => {
    return () => setMessage('');
  }, []);

  // Set auth error to local state if it exists
  useEffect(() => {
    if (authError) {
      setErrors({ submit: authError });
    }
  }, [authError]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setErrors({});
    
    try {
      // Use the auth context login function
      await login(
        formData.email, 
        formData.password, 
        userType
      );
      
      // After successful login, redirect to the dashboard
      // The dashboard will adapt based on the user's account type
      navigate('/dashboard');
    } catch (error) {
      // Error is already handled by the auth context
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <PropertyNavbar />
      
      <div className="flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full bg-[#1E1E1E] p-8 rounded-lg">
          <h1 className="text-white font-montserrat font-bold text-2xl text-center mb-8">
            Log In to Your Account
          </h1>
          
          {message && (
            <div className="bg-green-500 text-white p-3 rounded-lg mb-6">
              {message}
            </div>
          )}
          
          {errors.submit && (
            <div className="bg-red-500 text-white p-3 rounded-lg mb-6">
              {errors.submit}
            </div>
          )}
          
          {/* User Type Toggle */}
          <div className="flex bg-[#404040] rounded-lg p-1 mb-6">
            <button
              type="button"
              className={`flex-1 py-2 rounded-md text-center transition-colors ${
                userType === 'seeker'
                  ? 'bg-[#0D0D0D] text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
              onClick={() => setUserType('seeker')}
            >
              Property Seeker
            </button>
            <button
              type="button"
              className={`flex-1 py-2 rounded-md text-center transition-colors ${
                userType === 'landlord'
                  ? 'bg-[#0D0D0D] text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
              onClick={() => setUserType('landlord')}
            >
              Landlord
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-white mb-2">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full bg-[#404040] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border border-red-500' : ''}`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            
            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-white mb-2">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full bg-[#404040] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border border-red-500' : ''}`}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
            
            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="rememberMe" className="text-white text-sm">Remember me</label>
              </div>
              <Link to="/forgot-password" className="text-blue-500 text-sm hover:underline">
                Forgot password?
              </Link>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
            >
              {loading ? 'Logging in...' : `Log in as ${userType === 'landlord' ? 'Landlord' : 'Property Seeker'}`}
            </button>
            
            {/* Register Link */}
            <div className="text-center mt-4">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-500 font-semibold">
                  Register
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;