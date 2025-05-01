import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import PropertyCard from '../components/PropCard';
import QuickActions from '../components/QuickActions';
import PropertyAPI from '../services/PropertyAPI';

import { 
  BuildingIcon, 
  CalendarIcon, 
  MessageCircleIcon, 
  HeartIcon,
  EyeIcon,
  DollarSignIcon,
  UserIcon,
  HomeIcon,
  PlusCircleIcon
} from 'lucide-react';

const Dashboard = () => {
  const { currentUser, isLandlord, isPropertySeeker } = useAuth();
  const [properties, setProperties] = useState([]);
  const [savedProperties, setSavedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch appropriate properties based on user type
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (isLandlord()) {
          // Fetch landlord properties
          const response = await PropertyAPI.getLandlordProperties();
          setProperties(response.data || []);
        } else {
          // Fetch recommended properties for seekers
          const response = await PropertyAPI.getAllProperties({ 
            limit: 3, 
            status: 'available' 
          });
          setProperties(response.data.properties || []);
          
          // Fetch saved properties for seekers
          const savedResponse = await PropertyAPI.getSavedProperties();
          setSavedProperties(savedResponse.data || []);
        }
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to load properties. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchData();
    }
  }, [currentUser, isLandlord, isPropertySeeker]);
  
  // Sample stats based on user type
  const landlordStats = [
    { 
      title: 'Total Properties', 
      value: properties.length || 0, 
      change: '+0', 
      icon: <BuildingIcon size={20} />,
      color: 'bg-blue-500' 
    },
    { 
      title: 'Active Listings', 
      value: properties.filter(p => p.status === 'available').length || 0, 
      change: '0', 
      icon: <HomeIcon size={20} />,
      color: 'bg-green-500' 
    },
    { 
      title: 'Total Views', 
      value: 0, // This would come from analytics
      change: '+0', 
      icon: <EyeIcon size={20} />,
      color: 'bg-purple-500' 
    },
    { 
      title: 'Pending Requests', 
      value: 0, // This would come from appointments
      change: '+0', 
      icon: <CalendarIcon size={20} />,
      color: 'bg-amber-500' 
    },
  ];
  
  const seekerStats = [
    { 
      title: 'Saved Properties', 
      value: savedProperties.length || 0, 
      change: '+0', 
      icon: <HeartIcon size={20} />,
      color: 'bg-red-500' 
    },
    { 
      title: 'Property Views', 
      value: 0, // This would come from analytics
      change: '+0', 
      icon: <EyeIcon size={20} />,
      color: 'bg-blue-500' 
    },
    { 
      title: 'Appointments', 
      value: 0, // This would come from appointments
      change: '+0', 
      icon: <CalendarIcon size={20} />,
      color: 'bg-green-500' 
    },
    { 
      title: 'Messages', 
      value: 0, // This would come from messages
      change: '+0', 
      icon: <MessageCircleIcon size={20} />,
      color: 'bg-purple-500' 
    },
  ];
  
 

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

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
          
        </div>
        
        {/* Right: Property Listings */}
        <div className="lg:col-span-2">
          <div className="bg-[#1E1E1E] rounded-lg">
            <div className="border-b border-[#404040] p-4 flex justify-between items-center">
              <h2 className="text-white font-bold">
                {isLandlord() 
                  ? 'Your Properties' 
                  : 'Recommended Properties'}
              </h2>
              
              {/* Add Property or View All link based on user type */}
              {isLandlord() ? (
                <div className="flex items-center gap-2">
                  <Link to="/dashboard/properties" className="text-blue-500 text-sm">
                    View All
                  </Link>
                  <Link 
                    to="/dashboard/properties/add" 
                    className="bg-[#f10000] text-white p-2 rounded-lg flex items-center"
                  >
                    <PlusCircleIcon size={16} className="mr-1" />
                    <span className="text-sm">Add Property</span>
                  </Link>
                </div>
              ) : (
                <Link to="/properties" className="text-blue-500 text-sm">
                  View All
                </Link>
              )}
            </div>
            
            {error ? (
              <div className="p-6 text-center">
                <p className="text-red-400">{error}</p>
                <button 
                  className="mt-2 bg-[#404040] text-white px-4 py-2 rounded-lg hover:bg-[#505050]"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
              </div>
            ) : properties.length === 0 ? (
              <div className="p-6 text-center">
                {isLandlord() ? (
                  <div>
                    <p className="text-gray-400 mb-4">You haven't listed any properties yet.</p>
                    <Link
                      to="/dashboard/properties/add"
                      className="bg-[#f10000] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Add Your First Property
                    </Link>
                  </div>
                ) : (
                  <p className="text-gray-400">No recommended properties available at the moment.</p>
                )}
              </div>
            ) : (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {properties.slice(0, 6).map(property => (
                  <PropertyCard
                    key={property.id}
                    id={property.id}
                    imageUrl={property.images && property.images.length > 0 
                      ? property.images[0].imageUrl 
                      : "../public/images/property-placeholder.jpg"}
                    address={`${property.address}, ${property.city}`}
                    price={property.price}
                    bedrooms={property.bedrooms}
                    bathrooms={property.bathrooms}
                    toilets={property.toilets}
                    imageCount={property.images?.length || 0}
                    compact={true}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Saved Properties Section (Only for Property Seekers) */}
          {isPropertySeeker() && (
            <div className="bg-[#1E1E1E] rounded-lg mt-8">
              <div className="border-b border-[#404040] p-4 flex justify-between items-center">
                <h2 className="text-white font-bold">
                  Your Saved Properties
                </h2>
                <Link to="/dashboard/saved" className="text-blue-500 text-sm">
                  View All
                </Link>
              </div>
              
              {savedProperties.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-400">You haven't saved any properties yet.</p>
                  <Link to="/properties" className="text-blue-500 block mt-2">
                    Browse properties
                  </Link>
                </div>
              ) : (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedProperties.slice(0, 3).map(saved => (
                    <PropertyCard
                      key={saved.propertyId}
                      id={saved.propertyId}
                      imageUrl={saved.property.images && saved.property.images.length > 0 
                        ? saved.property.images[0].imageUrl 
                        : "../public/images/property-placeholder.jpg"}
                      address={`${saved.property.address}, ${saved.property.city}`}
                      price={saved.property.price}
                      bedrooms={saved.property.bedrooms}
                      bathrooms={saved.property.bathrooms}
                      toilets={saved.property.toilets}
                      imageCount={saved.property.images?.length || 0}
                      compact={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;