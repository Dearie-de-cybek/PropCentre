import React, { useState } from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';
import recommendationService from '../services/recommendationService';

const PropertyPricePrediction = () => {
  const [formData, setFormData] = useState({
    bedrooms: 3,
    bathrooms: 2,
    propertyType: 'house',
    areaSize: 150,
    location: '',
    district: '',
    beachfront: false
  });
  
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // District options for Mauritius
  const districts = [
    'Port Louis',
    'Plaines Wilhems',
    'Black River',
    'Flacq',
    'Grand Port',
    'Moka',
    'Pamplemousses',
    'Rivière du Rempart',
    'Savanne'
  ];
  
  const propertyTypes = [
    'apartment',
    'house',
    'villa',
    'condo',
    'land'
  ];
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const predictPrice = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    recommendationService.getPricePrediction(formData)
      .then(response => {
        setPrediction(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error predicting price:', err);
        setError('Failed to predict price. Please try again.');
        setLoading(false);
      });
  };
  
  return (
    <div className="bg-[#1E1E1E] rounded-lg overflow-hidden">
      <div className="border-b border-[#404040] p-4">
        <h2 className="text-white font-bold text-lg flex items-center">
          <DollarSign size={20} className="mr-2 text-green-500" />
          AI Property Price Prediction
        </h2>
      </div>
      
      <div className="p-4">
        <p className="text-gray-300 mb-4">
          Our AI model analyzes property characteristics based on Mauritius market data to predict fair market values.
        </p>
        
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Property Type */}
            <div>
              <label className="block text-white text-sm mb-1">Property Type</label>
              <select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                className="w-full bg-[#404040] text-white p-2 rounded"
              >
                {propertyTypes.map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
            </div>
            
            {/* District */}
            <div>
              <label className="block text-white text-sm mb-1">District</label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full bg-[#404040] text-white p-2 rounded"
              >
                <option value="">Select District</option>
                {districts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
            
            {/* Location */}
            <div>
              <label className="block text-white text-sm mb-1">Location/City</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Grand Baie, Flic en Flac"
                className="w-full bg-[#404040] text-white p-2 rounded"
              />
            </div>
            
            {/* Area Size */}
            <div>
              <label className="block text-white text-sm mb-1">Area Size (sqm)</label>
              <input
                type="number"
                name="areaSize"
                value={formData.areaSize}
                onChange={handleChange}
                min="1"
                className="w-full bg-[#404040] text-white p-2 rounded"
              />
            </div>
            
            {/* Bedrooms */}
            <div>
              <label className="block text-white text-sm mb-1">Bedrooms</label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                min="0"
                className="w-full bg-[#404040] text-white p-2 rounded"
              />
            </div>
            
            {/* Bathrooms */}
            <div>
              <label className="block text-white text-sm mb-1">Bathrooms</label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                min="0"
                className="w-full bg-[#404040] text-white p-2 rounded"
              />
            </div>
          </div>
          
          {/* Beachfront Checkbox */}
          <div className="mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="beachfront"
                name="beachfront"
                checked={formData.beachfront}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="beachfront" className="text-white text-sm">
                Beachfront Property
              </label>
            </div>
          </div>
          
          <button
            onClick={predictPrice}
            disabled={loading}
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
          >
            {loading ? (
              <span className="flex items-center">
                <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                Predicting...
              </span>
            ) : 'Predict Price'}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-100 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {prediction && (
          <div className="bg-[#0D0D0D] p-6 rounded-lg">
            <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
              <TrendingUp size={20} className="mr-2 text-green-500" />
              Price Prediction Result
            </h3>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Predicted Price:</span>
                <span className="text-white text-2xl font-bold">${prediction.predicted_price.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Confidence Level:</span>
                <span className="text-white">{Math.round(prediction.confidence * 100)}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Region:</span>
                <span className="text-white">{prediction.region}</span>
              </div>
            </div>
            
            <div className="bg-gray-800 p-3 rounded-lg">
              <p className="text-gray-300 text-sm">
                This prediction is based on {prediction.region} regional data and current market conditions in Mauritius. 
                Actual property values may vary based on other factors like views, specific amenities, and property condition.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyPricePrediction;