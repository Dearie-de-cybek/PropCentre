import React from 'react';
import { Link } from 'react-router-dom';

const PropertyNavbar = () => {
  return (
    <nav className="py-4 px-6">
      <div className="container mx-auto flex justify-between items-center">
        {/* Left section - Hamburger and Logo */}
        <div className="flex items-center space-x-4">
          {/* Hamburger Menu */}
          <button className="text-white focus:outline-none">
            <img src="../public/icons/hambug.svg" alt="" className="h-6 w-6"/>
          </button>
          
          {/* Logo */}
          <span className="font-montserrat font-bold text-2xl text-white">LOGO</span>
          {/*  <img src="/logo.svg" alt="Logo" className="h-10" /> */}
        </div>
        
        {/* Middle - Search Bar */}
        <div className="relative w-[600px] mx-8  rounded-[20px]">
          <div className="bg-[#1E1E1E] flex items-center px-4 py-2">
            {/* Home Icon */}
            <img src="../public/icons/home.svg" alt="" className="h-5 w-5 text-white mr-2"/>
            
            {/* Search Input */}
            <input
              type="text"
              placeholder="Enter Address, neighbourhood, city or postal code"
              className="bg-transparent w-full text-white font-roboto focus:outline-none"
            />
            
            {/* Search Icon */}
            <img src="../public/icons/search.svg" alt="" className="h-5 w-5  ml-2"/>
          </div>
        </div>
        
        {/* Right - Register and Login */}
        <div className="flex space-x-6">
          <Link to="/register" className="text-blue-500 font-semibold font-montserrat">
            REGISTER
          </Link>
          <Link to="/login" className="text-white font-semibold font-montserrat">
            LOG IN
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default PropertyNavbar;