import React, { useState, useEffect } from 'react';
import { BarChart } from 'lucide-react';
import recommendationService from '../services/recommendationService';
import PropertyCard from './PropCard';

const PropertyRecommendationComponent = ({ userPreferences = null }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [preferences, setPreferences] = useState(userPreferences || {
    minBedrooms: 2,
    minBathrooms: 1,
    maxPrice: 500000,
    propertyType: 'house',
    beachfront: false,
    premiumLocation: false
  });

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await recommendationService.getRecommendations(preferences);
      setRecommendations(response.data.recommendations || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to load recommendations. Please try again.');
      setLoading(false);
    }
  };

  const handlePreferenceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreferences({
      ...preferences,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handlePriceChange = (value) => {
    setPreferences({
      ...preferences,
      maxPrice: value
    });
  };

  const handleApplyFilters = () => {
    fetchRecommendations();
  };

  return (
    <div className="bg-[#1E1E1E] rounded-lg overflow-hidden">
      <div className="border-b border-[#404040] p-4">
        <h2 className="text-white font-bold text-lg flex items-center">
          <BarChart size={20} className="mr-2 text-blue-500" />
          AI-Powered Property Recommendations
        </h2>
      </div>

      {/* Preference Controls */}
      <div className="p-4 bg-[#0D0D0D] border-b border-[#404040]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-white text-sm mb-1">Min. Bedrooms</label>
            <select
              name="minBedrooms"
              value={preferences.minBedrooms}
              onChange={handlePreferenceChange}
              className="w-full bg-[#404040] text-white p-2 rounded"
            >
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>{num}+ Bedrooms</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white text-sm mb-1">Min. Bathrooms</label>
            <select
              name="minBathrooms"
              value={preferences.minBathrooms}
              onChange={handlePreferenceChange}
              className="w-full bg-[#404040] text-white p-2 rounded"
            >
              {[1, 2, 3, 4].map(num => (
                <option key={num} value={num}>{num}+ Bathrooms</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white text-sm mb-1">Property Type</label>
            <select
              name="propertyType"
              value={preferences.propertyType}
              onChange={handlePreferenceChange}
              className="w-full bg-[#404040] text-white p-2 rounded"
            >
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="villa">Villa</option>
              <option value="land">Land</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-white text-sm mb-1">
            Max Price: ${preferences.maxPrice.toLocaleString()}
          </label>
          <div className="px-2">
            <input
              type="range"
              min="100000"
              max="2000000"
              step="50000"
              value={preferences.maxPrice}
              onChange={(e) => handlePriceChange(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>$100k</span>
              <span>$2M</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="beachfront"
              name="beachfront"
              checked={preferences.beachfront}
              onChange={handlePreferenceChange}
              className="mr-2"
            />
            <label htmlFor="beachfront" className="text-white text-sm">
              Beachfront Property
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="premiumLocation"
              name="premiumLocation"
              checked={preferences.premiumLocation}
              onChange={handlePreferenceChange}
              className="mr-2"
            />
            <label htmlFor="premiumLocation" className="text-white text-sm">
              Premium Location
            </label>
          </div>
        </div>

        <button
          onClick={handleApplyFilters}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          Update Recommendations
        </button>
      </div>

      {/* Recommendations Display */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-400 mb-2">{error}</p>
            <button
              onClick={fetchRecommendations}
              className="bg-[#404040] text-white px-4 py-2 rounded hover:bg-[#505050]"
            >
              Try Again
            </button>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No recommendations found with your preferences.</p>
            <p className="text-gray-400 mt-2">Try adjusting your filters for more results.</p>
          </div>
        ) : (
          <>
            <p className="text-white mb-4">
              Our AI analyzed your preferences and found {recommendations.length} properties that match your needs:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((property) => (
                <div key={property.property_id} className="relative">
                  <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full z-10">
                    {property.match_percentage}% Match
                  </div>
                  <PropertyCard
                    id={property.property_id}
                    imageUrl={property.image_url || "../public/images/property-placeholder.jpg"}
                    address={property.location}
                    price={property.price}
                    bedrooms={property.bedrooms || 0}
                    bathrooms={property.bathrooms || 0}
                    toilets={property.toilets || 0}
                    compact={true}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PropertyRecommendationComponent;