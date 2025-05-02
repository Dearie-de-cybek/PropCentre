import React, { useState, useEffect } from 'react';
import { Map, TrendingUp, Navigation, DollarSign } from 'lucide-react';
import recommendationService from '../services/recommendationService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LocationAnalysisComponent = ({ initialLocation = null }) => {
  const [location, setLocation] = useState(initialLocation || '');
  const [analysis, setAnalysis] = useState(null);
  const [priceHistory, setPriceHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Popular locations in Mauritius
  const popularLocations = [
    'Port Louis',
    'Grand Baie',
    'Flic en Flac',
    'Tamarin',
    'Beau Bassin',
    'Curepipe',
    'Black River',
    'Trou aux Biches'
  ];
  
  const fetchLocationAnalysis = () => {
    if (!location) return;
    
    setLoading(true);
    setError(null);
    
    // Fetch location analysis data
    recommendationService.getLocationAnalysis(location)
      .then(response => {
        setAnalysis(response.data);
        
        // Also fetch price forecast for the location
        return recommendationService.getPriceTrendForecast(location, 'all');
      })
      .then(forecastResponse => {
        setPriceHistory(forecastResponse.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching location analysis:', err);
        setError('Failed to load location data. Please try again.');
        setLoading(false);
      });
  };
  
  // Fetch data when initialLocation changes or is provided
  useEffect(() => {
    if (initialLocation) {
      setLocation(initialLocation);
      fetchLocationAnalysis();
    }
  }, [initialLocation]);
  
  const handleLocationChange = (e) => {
    setLocation(e.target.value);
  };
  
  const formatPriceData = (data) => {
    if (!data || !data.trends) return [];
    
    return data.trends.map(point => ({
      date: point.date,
      price: point.average_price
    }));
  };
  
  return (
    <div className="bg-[#1E1E1E] rounded-lg overflow-hidden">
      <div className="border-b border-[#404040] p-4">
        <h2 className="text-white font-bold text-lg flex items-center">
          <Map size={20} className="mr-2 text-purple-500" />
          Mauritius Location Analysis
        </h2>
      </div>
      
      <div className="p-4">
        <p className="text-gray-300 mb-4">
          Explore property trends and market analysis for different locations in Mauritius.
        </p>
        
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <label className="block text-white text-sm mb-1">Select Location</label>
              <select
                value={location}
                onChange={handleLocationChange}
                className="w-full bg-[#404040] text-white p-2 rounded"
              >
                <option value="">Select a location</option>
                {popularLocations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            
            <div className="md:self-end">
              <button
                onClick={fetchLocationAnalysis}
                disabled={!location || loading}
                className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors w-full md:w-auto"
              >
                {loading ? (
                  <span className="flex items-center">
                    <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                    Loading...
                  </span>
                ) : 'Analyze Location'}
              </button>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-100 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        )}
        
        {analysis && !loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Location Score */}
              <div className="bg-[#0D0D0D] p-4 rounded-lg">
                <h3 className="text-white text-base font-semibold mb-2 flex items-center">
                  <TrendingUp size={16} className="mr-2 text-blue-500" />
                  Location Score
                </h3>
                <div className="flex items-center">
                  <div className="relative w-full h-4 bg-gray-700 rounded-full">
                    <div 
                      className="absolute top-0 left-0 h-4 bg-blue-500 rounded-full"
                      style={{ width: `${analysis.location_score}%` }}
                    ></div>
                  </div>
                  <span className="text-white font-bold ml-3">{analysis.location_score}/100</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  Composite score based on amenities, tourism, and market demand
                </p>
              </div>
              
              {/* Average Price */}
              <div className="bg-[#0D0D0D] p-4 rounded-lg">
                <h3 className="text-white text-base font-semibold mb-2 flex items-center">
                  <DollarSign size={16} className="mr-2 text-green-500" />
                  Average Property Price
                </h3>
                <p className="text-white text-xl font-bold">
                  ${analysis.average_price ? analysis.average_price.toLocaleString() : 'N/A'}
                </p>
                <div className="flex items-center mt-1">
                  {analysis.price_trend > 0 ? (
                    <TrendingUp size={16} className="text-green-500 mr-1" />
                  ) : (
                    <TrendingUp size={16} className="text-red-500 mr-1 transform rotate-180" />
                  )}
                  <span className={`text-sm ${analysis.price_trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {analysis.price_trend > 0 ? '+' : ''}{analysis.price_trend}% in last year
                  </span>
                </div>
              </div>
              
              {/* Investment Rating */}
              <div className="bg-[#0D0D0D] p-4 rounded-lg">
                <h3 className="text-white text-base font-semibold mb-2 flex items-center">
                  <Navigation size={16} className="mr-2 text-amber-500" />
                  Investment Rating
                </h3>
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${star <= analysis.investment_rating ? 'text-amber-500' : 'text-gray-500'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-400 text-sm">
                  {analysis.investment_recommendation}
                </p>
              </div>
            </div>
            
            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0D0D0D] p-3 rounded-lg flex flex-col">
                <span className="text-gray-400 text-sm">Tourism Rating</span>
                <span className="text-white font-bold">{analysis.tourism_rating}/10</span>
              </div>
              
              <div className="bg-[#0D0D0D] p-3 rounded-lg flex flex-col">
                <span className="text-gray-400 text-sm">Beach Proximity</span>
                <span className="text-white font-bold">{analysis.beach_proximity ? `${analysis.beach_proximity}km` : 'N/A'}</span>
              </div>
              
              <div className="bg-[#0D0D0D] p-3 rounded-lg flex flex-col">
                <span className="text-gray-400 text-sm">Development Growth</span>
                <span className="text-white font-bold">{analysis.development_growth ? `${analysis.development_growth}%` : 'N/A'}</span>
              </div>
              
              <div className="bg-[#0D0D0D] p-3 rounded-lg flex flex-col">
                <span className="text-gray-400 text-sm">Avg. Rental Yield</span>
                <span className="text-white font-bold">{analysis.rental_yield ? `${analysis.rental_yield}%` : 'N/A'}</span>
              </div>
            </div>
            
            {/* Price History Chart */}
            {priceHistory && (
              <div className="bg-[#0D0D0D] p-4 rounded-lg">
                <h3 className="text-white text-base font-semibold mb-4">
                  Price Trend (Last 24 Months)
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={formatPriceData(priceHistory)}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#999"
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                        }}
                      />
                      <YAxis 
                        stroke="#999"
                        tickFormatter={(value) => `$${(value / 1000)}k`}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1E1E1E', borderColor: '#404040' }}
                        formatter={(value) => [`$${value.toLocaleString()}`, 'Avg. Price']}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        name="Average Price" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            
            {/* Location Insights */}
            {analysis.insights && (
              <div className="bg-[#0D0D0D] p-4 rounded-lg">
                <h3 className="text-white text-base font-semibold mb-2">
                  Market Insights
                </h3>
                <ul className="space-y-2">
                  {analysis.insights.map((insight, index) => (
                    <li key={index} className="text-gray-300 flex items-start">
                      <span className="inline-block w-2 h-2 bg-purple-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {!analysis && !loading && !error && (
          <div className="text-center py-8">
            <p className="text-gray-400">Select a location to view detailed analysis.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationAnalysisComponent;