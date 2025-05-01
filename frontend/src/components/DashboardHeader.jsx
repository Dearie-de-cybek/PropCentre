import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BellIcon, 
  MessageCircleIcon, 
  LogOutIcon, 
  MenuIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  UserIcon,
  SettingsIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DashboardHeader = ({ user, toggleSidebar, sidebarOpen }) => {
  const { logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    if (showNotifications) setShowNotifications(false);
  };
  
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showUserMenu) setShowUserMenu(false);
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      // Redirect handled by auth context
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="h-16 bg-[#1E1E1E] border-b border-[#404040] px-6 flex items-center justify-between">
      {/* Left: Toggle Button */}
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="text-white p-2 rounded-lg hover:bg-[#404040]"
        >
          {sidebarOpen ? <ChevronLeftIcon size={20} /> : <ChevronRightIcon size={20} />}
        </button>
        
        <h1 className="text-white font-semibold text-lg ml-4">Dashboard</h1>
      </div>
      
      {/* Right: User Section */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={toggleNotifications}
            className="text-white p-2 rounded-lg hover:bg-[#404040] relative"
          >
            <BellIcon size={20} />
            <span className="absolute top-0 right-0 h-4 w-4 bg-[#f10000] rounded-full text-xs flex items-center justify-center">3</span>
          </button>
          
          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#1E1E1E] border border-[#404040] rounded-lg shadow-lg z-50">
              <div className="p-3 border-b border-[#404040]">
                <h3 className="text-white font-semibold">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {/* Sample notifications */}
                {[1, 2, 3].map((item) => (
                  <div key={item} className="p-3 border-b border-[#404040] hover:bg-[#404040] cursor-pointer">
                    <p className="text-white text-sm">
                      {item === 1 
                        ? 'New property inquiry received'
                        : item === 2
                          ? 'Appointment confirmed for tomorrow'
                          : 'Your listing has 5 new views'
                      }
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {item === 1 
                        ? '10 minutes ago'
                        : item === 2
                          ? '2 hours ago'
                          : 'Yesterday'
                      }
                    </p>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-[#404040]">
                <Link to="/dashboard/notifications" className="text-blue-500 text-sm">
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>
        
        {/* Messages */}
        <Link 
          to="/dashboard/messages"
          className="text-white p-2 rounded-lg hover:bg-[#404040] relative"
        >
          <MessageCircleIcon size={20} />
          <span className="absolute top-0 right-0 h-4 w-4 bg-[#f10000] rounded-full text-xs flex items-center justify-center">2</span>
        </Link>
        
        {/* User Menu */}
        <div className="relative">
          <button
            onClick={toggleUserMenu}
            className="flex items-center space-x-2 text-white p-1 rounded-lg hover:bg-[#404040]"
          >
            <div className="h-8 w-8 rounded-full bg-[#404040] flex items-center justify-center overflow-hidden">
              {user.profileImage 
                ? <img src={user.profileImage} alt={`${user.firstName}'s profile`} className="h-full w-full object-cover" />
                : <span className="text-white">{user.firstName.charAt(0)}{user.lastName.charAt(0)}</span>
              }
            </div>
            {sidebarOpen && (
              <span className="hidden md:inline-block">{user.firstName} {user.lastName}</span>
            )}
          </button>
          
          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#1E1E1E] border border-[#404040] rounded-lg shadow-lg z-50">
              <div className="p-3 border-b border-[#404040]">
                <p className="text-white font-semibold">{user.firstName} {user.lastName}</p>
                <p className="text-gray-400 text-sm">{user.email}</p>
              </div>
              <div>
                <Link 
                  to="/dashboard/profile" 
                  className="flex items-center p-3 text-white hover:bg-[#404040] w-full text-left"
                >
                  <UserIcon size={16} className="mr-2" />
                  <span>My Profile</span>
                </Link>
                <Link 
                  to="/dashboard/settings" 
                  className="flex items-center p-3 text-white hover:bg-[#404040] w-full text-left"
                >
                  <SettingsIcon size={16} className="mr-2" />
                  <span>Settings</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center p-3 text-white hover:bg-[#404040] w-full text-left border-t border-[#404040]"
                >
                  <LogOutIcon size={16} className="mr-2" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;