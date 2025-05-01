import React from 'react'
import "tailwindcss";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import './global.css';
import PropertyNavbar from './components/PropertyNavbar';
import PropertyHome from './pages/PropertyHome';
import PropertyDetail from './pages/PropertyDetail';
import { AuthProvider } from './context/AuthContext';

import RegistrationChoice from './components/RegistrationChoice';
import LandlordRegistration from './pages/LandlordRegistration';
import PropertySeekerRegistration from './pages/PropertySeekerRegistration';
import Login from './pages/Login';

import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <AuthProvider>
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
          
          {/* Dashboard routes - Protected */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            
            {/* Landlord-specific routes */}

            {/* <Route path="properties" element={
              <ProtectedRoute requiredAccountType="landlord">
                <div>My Properties Page (Coming Soon)</div>
              </ProtectedRoute>
            } />
            <Route path="properties/add" element={
              <ProtectedRoute requiredAccountType="landlord">
                <div>Add Property Form (Coming Soon)</div>
              </ProtectedRoute>
            } />
            <Route path="applications" element={
              <ProtectedRoute requiredAccountType="landlord">
                <div>Applications Page (Coming Soon)</div>
              </ProtectedRoute>
            } />
            <Route path="tenants" element={
              <ProtectedRoute requiredAccountType="landlord">
                <div>Tenants Page (Coming Soon)</div>
              </ProtectedRoute>
            } />
            <Route path="analytics" element={
              <ProtectedRoute requiredAccountType="landlord">
                <div>Analytics Page (Coming Soon)</div>
              </ProtectedRoute>
            } /> */}
            
            {/* Seeker-specific routes */}
            {/* <Route path="saved" element={
              <ProtectedRoute requiredAccountType="seeker">
                <div>Saved Properties Page (Coming Soon)</div>
              </ProtectedRoute>
            } />
            <Route path="my-applications" element={
              <ProtectedRoute requiredAccountType="seeker">
                <div>My Applications Page (Coming Soon)</div>
              </ProtectedRoute>
            } /> */}
            
            {/* Common routes */}
            <Route path="appointments" element={<div>Appointments Page (Coming Soon)</div>} />
            <Route path="messages" element={<div>Messages Page (Coming Soon)</div>} />
            <Route path="profile" element={<div>Profile Page (Coming Soon)</div>} />
            <Route path="settings" element={<div>Settings Page (Coming Soon)</div>} />
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App