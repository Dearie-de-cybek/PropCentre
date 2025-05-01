import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  BuildingIcon, 
  CalendarIcon, 
  MessageCircleIcon, 
  UserCircleIcon, 
  HeartIcon, 
  SettingsIcon,
  PlusCircleIcon,
  ClipboardListIcon,
  UsersIcon,
  BarChartIcon
} from 'lucide-react';

const DashboardSidebar = ({ userType, isOpen }) => {
  const isLandlord = userType === 'landlord';
  
  // Common navigation links for both user types
  const commonLinks = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <HomeIcon size={20} />
    },
    {
      name: 'Messages',
      path: '/dashboard/messages',
      icon: <MessageCircleIcon size={20} />
    },
    {
      name: 'Appointments',
      path: '/dashboard/appointments',
      icon: <CalendarIcon size={20} />
    },
    {
      name: 'Profile',
      path: '/dashboard/profile',
      icon: <UserCircleIcon size={20} />
    },
    {
      name: 'Settings',
      path: '/dashboard/settings',
      icon: <SettingsIcon size={20} />
    }
  ];
  
  // Landlord-specific links
  const landlordLinks = [
    {
      name: 'My Properties',
      path: '/dashboard/properties',
      icon: <BuildingIcon size={20} />
    },
    {
      name: 'Add Property',
      path: '/dashboard/properties/add',
      icon: <PlusCircleIcon size={20} />
    },
    {
      name: 'Applications',
      path: '/dashboard/applications',
      icon: <ClipboardListIcon size={20} />
    },
    {
      name: 'Tenants',
      path: '/dashboard/tenants',
      icon: <UsersIcon size={20} />
    },
    {
      name: 'Analytics',
      path: '/dashboard/analytics',
      icon: <BarChartIcon size={20} />
    }
  ];
  
  // Seeker-specific links
  const seekerLinks = [
    {
      name: 'Browse Properties',
      path: '/properties',
      icon: <BuildingIcon size={20} />
    },
    {
      name: 'Saved Properties',
      path: '/dashboard/saved',
      icon: <HeartIcon size={20} />
    }
  ];
  
  // Determine which links to show based on user type
  const navigationLinks = isLandlord 
    ? [...commonLinks.slice(0, 1), ...landlordLinks, ...commonLinks.slice(1)]
    : [...commonLinks.slice(0, 1), ...seekerLinks, ...commonLinks.slice(1)];

  return (
    <aside 
      className={`fixed top-0 left-0 h-screen bg-[#1E1E1E] transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-16'
      } z-10`}
    >
      {/* Logo */}
      <div className={`flex items-center justify-center h-16 border-b border-[#404040] ${isOpen ? 'px-6' : 'px-0'}`}>
        {isOpen ? (
          <span className="font-montserrat font-bold text-2xl text-white">PropCentre</span>
        ) : (
          <span className="font-montserrat font-bold text-xl text-white">PC</span>
        )}
      </div>
      
      {/* Navigation Links */}
      <nav className="mt-6 px-3">
        <ul className="space-y-2">
          {navigationLinks.map((link) => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                className={({ isActive }) => `
                  flex items-center px-3 py-3 rounded-lg transition-colors
                  ${isOpen ? 'justify-start' : 'justify-center'}
                  ${isActive 
                    ? 'bg-[#f10000] text-white' 
                    : 'text-gray-400 hover:bg-[#404040] hover:text-white'}
                `}
              >
                <span className="flex-shrink-0">{link.icon}</span>
                {isOpen && <span className="ml-3">{link.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* User Type Badge */}
      {isOpen && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <div className="bg-[#404040] text-white px-4 py-2 rounded-lg text-sm">
            {isLandlord ? 'Landlord Account' : 'Property Seeker Account'}
          </div>
        </div>
      )}
    </aside>
  );
};

export default DashboardSidebar;