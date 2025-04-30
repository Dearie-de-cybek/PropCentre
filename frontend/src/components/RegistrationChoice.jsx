import React from 'react';
import { Link } from 'react-router-dom';
import PropertyNavbar from "../components/PropertyNavbar";

const RegistrationChoice = () => {
  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <PropertyNavbar />
      
      <div className="flex items-center justify-center px-6 py-12">
        <div className="bg-[#1E1E1E] p-8 rounded-lg max-w-md w-full">
          <h1 className="text-white font-montserrat font-bold text-2xl text-center mb-8">
            Choose Registration Type
          </h1>
          
          <div className="space-y-6">
            <Link 
              to="/register/landlord" 
              className="flex items-center justify-between bg-[#404040] p-5 rounded-lg transition-all duration-300 hover:bg-[#505050] block"
            >
              <div>
                <h2 className="text-white font-medium text-lg">Register as a Landlord</h2>
                <p className="text-gray-400 text-sm mt-1">List and manage your properties</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            
            <Link 
              to="/register/seeker" 
              className="flex items-center justify-between bg-[#404040] p-5 rounded-lg transition-all duration-300 hover:bg-[#505050] block"
            >
              <div>
                <h2 className="text-white font-medium text-lg">Register as a Property Seeker</h2>
                <p className="text-gray-400 text-sm mt-1">Find your perfect home</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            
            <div className="text-center mt-8">
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-500 font-semibold">
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationChoice;