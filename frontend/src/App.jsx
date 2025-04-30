import React from 'react'
import "tailwindcss";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import './global.css';
import PropertyNavbar from './components/PropertyNavbar';
import PropertyHome from './pages/PropertyHome';
import PropertyDetail from './pages/PropertyDetail';


import RegistrationChoice from './components/RegistrationChoice';
import LandlordRegistration from './pages/LandlordRegistration';
import PropertySeekerRegistration from './pages/PropertySeekerRegistration';
import Login from './pages/Login';





const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PropertyHome />} />
        <Route path="/properties" element={<PropertyHome />} />
        <Route path="/properties-detail" element={<PropertyDetail />} />
        
        {/* Auth routes */}
        <Route path="/register" element={<RegistrationChoice />} />
        <Route path="/register/landlord" element={<LandlordRegistration />} />
        <Route path="/register/seeker" element={<PropertySeekerRegistration />} />
        <Route path="/login" element={<Login />} />
        
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App