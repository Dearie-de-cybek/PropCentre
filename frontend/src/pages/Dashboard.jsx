/* eslint-disable no-unused-vars */
import React from 'react';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import PropertyCard from '../components/PropCard';
import ActivityFeed from '../components/ActivityFeed';
import QuickActions from '../components/QuickActions';
import { 
  BuildingIcon, 
  CalendarIcon, 
  MessageCircleIcon, 
  HeartIcon,
  EyeIcon,
  DollarSignIcon,
  UserIcon,
  HomeIcon
} from 'lucide-react';

const Dashboard = () => {
  const { currentUser, isLandlord, isPropertySeeker } = useAuth();
  
  // Sample stats based on user type
  const landlordStats = [
    { 
      title: 'Total Properties', 
      value: 12, 
      change: '+2', 
      icon: <BuildingIcon size={20} />,
      color: 'bg-blue-500' 
    },
    { 
      title: 'Active Listings', 
      value: 8, 
      change: '0', 
      icon: <HomeIcon size={20} />,
      color: 'bg-green-500' 
    },
    { 
      title: 'Total Views', 
      value: 357, 
      change: '+48', 
      icon: <EyeIcon size={20} />,
      color: 'bg-purple-500' 
    },
    { 
      title: 'Pending Requests', 
      value: 5, 
      change: '+3', 
      icon: <CalendarIcon size={20} />,
      color: 'bg-amber-500' 
    },
  ];
  
  const seekerStats = [
    { 
      title: 'Saved Properties', 
      value: 7, 
      change: '+2', 
      icon: <HeartIcon size={20} />,
      color: 'bg-red-500' 
    },
    { 
      title: 'Property Views', 
      value: 24, 
      change: '+5', 
      icon: <EyeIcon size={20} />,
      color: 'bg-blue-500' 
    },
    { 
      title: 'Appointments', 
      value: 2, 
      change: '+1', 
      icon: <CalendarIcon size={20} />,
      color: 'bg-green-500' 
    },
    { 
      title: 'Messages', 
      value: 4, 
      change: '+2', 
      icon: <MessageCircleIcon size={20} />,
      color: 'bg-purple-500' 
    },
  ];
  
  // Sample featured/recommended properties
  const properties = [
    {
      id: 1,
      imageUrl: "../public/images/room1.jpg",
      address: "123 Main St, Springfield",
      price: 480000,
      bedrooms: 3,
      bathrooms: 3,
      toilets: 4,
      imageCount: 5,
    },
    {
      id: 2,
      imageUrl: "../public/images/room2.jpg",
      address: "456 Oak Ave, Riverside",
      price: 550000,
      bedrooms: 4,
      bathrooms: 2,
      toilets: 3,
      imageCount: 8,
    },
    {
      id: 3,
      imageUrl: "../public/images/room3.jpg",
      address: "789 Pine Rd, Lakeside",
      price: 395000,
      bedrooms: 2,
      bathrooms: 2,
      toilets: 2,
      imageCount: 6,
    },
  ];
  
  // Activities data
  const activities = [
    {
      id: 1,
      type: 'message',
      content: 'You received a new message from John Doe',
      time: '10 minutes ago',
    },
    {
      id: 2,
      type: 'appointment',
      content: 'Appointment confirmed for tomorrow at 10:00 AM',
      time: '2 hours ago',
    },
    {
      id: 3,
      type: 'property',
      content: isLandlord() 
        ? 'Someone saved your property "Modern Downtown Apartment"'
        : 'New property matching your criteria was listed',
      time: '5 hours ago',
    },
    {
      id: 4,
      type: 'system',
      content: 'Your account was successfully verified',
      time: 'Yesterday',
    },
  ];

  return (
    <div className="pb-6">
      {/* Welcome Back */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {currentUser.firstName}!
        </h1>
        <p className="text-gray-400 mt-1">
          {isLandlord() 
            ? "Here's what's happening with your properties today." 
            : "Here's what's new in your property search."}
        </p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {(isLandlord() ? landlordStats : seekerStats).map((stat, index) => (
          <StatCard 
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActions userType={currentUser.accountType} />
          
          {/* Recent Activity */}
          <div className="bg-[#1E1E1E] rounded-lg mt-8">
            <div className="border-b border-[#404040] p-4">
              <h2 className="text-white font-bold">Recent Activity</h2>
            </div>
            <ActivityFeed activities={activities} />
          </div>
        </div>
        
        {/* Right: Property Listings */}
        <div className="lg:col-span-2">
          <div className="bg-[#1E1E1E] rounded-lg">
            <div className="border-b border-[#404040] p-4 flex justify-between items-center">
              <h2 className="text-white font-bold">
                {isLandlord() 
                  ? 'Your Featured Properties' 
                  : 'Recommended Properties'}
              </h2>
              <a href={isLandlord() ? '/dashboard/properties' : '/properties'} className="text-blue-500 text-sm">
                View All
              </a>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map(property => (
                <PropertyCard
                  key={property.id}
                  imageUrl={property.imageUrl}
                  address={property.address}
                  price={property.price}
                  bedrooms={property.bedrooms}
                  bathrooms={property.bathrooms}
                  toilets={property.toilets}
                  imageCount={property.imageCount}
                  compact={true}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;