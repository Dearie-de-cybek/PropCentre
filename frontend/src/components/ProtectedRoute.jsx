import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component to handle authentication and role-based access
 * 
 * @param {Object} props
 * @param {JSX.Element} props.children 
 * @param {string} [props.requiredAccountType] 
 * @param {string} [props.redirectPath] 
 */
const ProtectedRoute = ({ 
  children, 
  requiredAccountType, 
  redirectPath = '/login' 
}) => {
  const { isAuthenticated, currentUser, loading } = useAuth();
  const location = useLocation();

  // If auth is still loading, show a loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0D0D0D]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated()) {
    // Redirect to login with a return_to parameter
    return (
      <Navigate 
        to={redirectPath} 
        state={{ from: location, message: 'You must be logged in to access this page' }}
        replace 
      />
    );
  }

  // If a specific account type is required, check that too
  if (requiredAccountType && currentUser.accountType !== requiredAccountType) {
    // Redirect to home with a message
    return (
      <Navigate 
        to="/" 
        state={{ 
          message: `This page is only accessible to ${requiredAccountType === 'landlord' ? 'landlords' : 'property seekers'}` 
        }}
        replace 
      />
    );
  }

  // If all checks pass, render the protected component
  return children;
};

export default ProtectedRoute;