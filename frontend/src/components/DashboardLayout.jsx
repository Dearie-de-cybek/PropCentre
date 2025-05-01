import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  const { currentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Early return if no user
  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex h-screen bg-[#0D0D0D]">
      {/* Sidebar */}
      <DashboardSidebar 
        userType={currentUser.accountType} 
        isOpen={sidebarOpen} 
      />
      
      {/* Main Content */}
      <div className={`flex flex-col flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Header */}
        <DashboardHeader 
          user={currentUser} 
          toggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
        />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;