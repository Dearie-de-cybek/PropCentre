import React, { useState, useEffect } from 'react';
import { BarChart, TrendingUp, Droplets, Wind, Thermometer, MapPin, DollarSign, Building, PieChart } from 'lucide-react';
import { LineChart, Line, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import recommendationService from '../services/recommendationService';

const PropertyDetailsAnalytics = ({ propertyId, propertyData }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [activeTab, setActiveTab] = useState('price');
  
  useEffect(() => {
    if (propertyId) {
      fetchPropertyAnalytics();
    }
  }, [propertyId]);

  const fetchPropertyAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch all analytics data in parallel
      const [priceAnalytics, locationAnalysis, similarProps, environmentalData] = await Promise.all([
        recommendationService.getPriceTrendForecast(propertyData.location, propertyData.propertyType, 24),
        recommendationService.getLocationAnalysis(propertyData.location),
        recommendationService.getSimilarProperties(propertyId),
        recommendationService.getEnvironmentalData(propertyData.location)
      ]);
      
      // Account for the API response structure which includes data, message, statusCode
      setAnalytics({
        priceAnalytics: priceAnalytics.data || priceAnalytics,
        locationAnalysis: locationAnalysis.data || locationAnalysis,
        environmentalData: environmentalData.data || environmentalData
      });
      
      // Similarly account for nested data
      setSimilarProperties((similarProps.data?.similar_properties || similarProps.similar_properties || []));
      setLoading(false);
    } catch (err) {
      console.error('Error fetching property analytics:', err);
      setError('Failed to load analytics data. Please try again.');
      setLoading(false);
    }
  }
  
  // Simulate fetching environmental data (would connect to real service in production)
  const fetchEnvironmentalData = async (location) => {
    // This would be a real API call in production
    return {
      weather: {
        yearlyRainfall: 1250, // mm
        averageTemperature: 25, // Celsius
        windSpeed: 12, // kmh
        sunnyDays: 280, // days per year
      },
      terrain: {
        elevation: 25, // meters
        distanceToBeach: 0.8, // km
        soilType: 'Sandy loam',
        vegetation: 'Tropical'
      },
      risks: {
        floodRisk: 'Low',
        hurricaneRisk: 'Medium',
        erosionRisk: 'Low'
      }
    };
  };
  
  // Format price history data for charts
  const formatPriceData = (data) => {
    if (!data || !data.trends) return [];
    
    return data.trends.map(point => ({
      date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      price: point.average_price,
      volume: point.sales_volume || 10,
    }));
  };
  
  // Format seasonal price data
  const formatSeasonalData = () => {
    // This would normally come from API, using sample data for now
    return [
      { name: 'Jan', value: 98 },
      { name: 'Feb', value: 96 },
      { name: 'Mar', value: 95 },
      { name: 'Apr', value: 97 },
      { name: 'May', value: 100 },
      { name: 'Jun', value: 103 },
      { name: 'Jul', value: 105 },
      { name: 'Aug', value: 107 },
      { name: 'Sep', value: 104 },
      { name: 'Oct', value: 102 },
      { name: 'Nov', value: 100 },
      { name: 'Dec', value: 101 }
    ];
  };
  
  // Format property price comparison data
  const formatComparisonData = () => {
    // This would normally come from API, using sample data for now
    const avgLocationPrice = analytics?.locationAnalysis?.average_price || 0;
    const propertyPrice = propertyData.price || 0;
    const districtAvgPrice = avgLocationPrice * 0.95; // Sample data
    const islandAvgPrice = avgLocationPrice * 0.8; // Sample data
    
    return [
      { name: 'This Property', price: propertyPrice },
      { name: propertyData.location, price: avgLocationPrice },
      { name: 'District Avg', price: districtAvgPrice },
      { name: 'Island Avg', price: islandAvgPrice }
    ];
  };
  
  // Format sales volume data
  const formatSalesVolumeData = () => {
    if (!analytics?.priceAnalytics?.trends) return [];
    
    return analytics.priceAnalytics.trends.map(point => ({
      date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      sales: point.sales_volume || Math.floor(Math.random() * 20) + 5
    }));
  };

  // Render tabs navigation
  const renderTabs = () => {
    const tabs = [
      { id: 'price', label: 'Price Analysis', icon: <DollarSign size={16} /> },
      { id: 'location', label: 'Location Insights', icon: <MapPin size={16} /> },
      { id: 'environmental', label: 'Environmental', icon: <Droplets size={16} /> },
      { id: 'similar', label: 'Similar Properties', icon: <Building size={16} /> }
    ];
    
    return (
      <div className="flex border-b border-[#404040] overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-3 border-b-2 whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-[#f10000] text-white' 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {tab.icon}
            <span className="ml-2">{tab.label}</span>
          </button>
        ))}
      </div>
    );
  };
  
  // Render price analysis tab
  const renderPriceTab = () => {
    const priceData = formatPriceData(analytics?.priceAnalytics);
    const comparisonData = formatComparisonData();
    const seasonalData = formatSeasonalData();
    
    return (
      <div className="space-y-6">
        <div className="bg-[#0D0D0D] p-4 rounded-lg">
          <h3 className="text-white text-base font-semibold mb-4 flex items-center">
            <TrendingUp size={18} className="mr-2 text-blue-500" />
            Historical Price Trends
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={priceData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="date" stroke="#999" />
                <YAxis 
                  stroke="#999"
                  tickFormatter={(value) => `$${(value / 1000)}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E1E1E', borderColor: '#404040' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  name="Avg. Price" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0D0D0D] p-4 rounded-lg">
            <h3 className="text-white text-base font-semibold mb-4">
              Price Comparison
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={comparisonData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="name" stroke="#999" />
                  <YAxis 
                    stroke="#999"
                    tickFormatter={(value) => `$${(value / 1000)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1E1E1E', borderColor: '#404040' }}
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Price']}
                  />
                  <Bar dataKey="price" name="Price" fill="#f10000" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-[#0D0D0D] p-4 rounded-lg">
            <h3 className="text-white text-base font-semibold mb-4">
              Seasonal Price Index
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={seasonalData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="name" stroke="#999" />
                  <YAxis 
                    stroke="#999"
                    domain={[90, 110]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1E1E1E', borderColor: '#404040' }}
                    formatter={(value) => [`${value}%`, 'Price Index']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    name="Price Index" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="bg-[#0D0D0D] p-4 rounded-lg">
          <h3 className="text-white text-base font-semibold mb-2">
            Price Analysis Insights
          </h3>
          <table className="w-full text-sm text-left text-white">
            <thead className="text-xs uppercase bg-[#1E1E1E]">
              <tr>
                <th className="px-4 py-3">Metric</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Comparison</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#404040]">
                <td className="px-4 py-3">Current Value</td>
                <td className="px-4 py-3">${propertyData.price.toLocaleString()}</td>
                <td className="px-4 py-3">
                  {propertyData.price > (analytics?.locationAnalysis?.average_price || 0) ? (
                    <span className="text-red-400">+{Math.round((propertyData.price / (analytics?.locationAnalysis?.average_price || 1) - 1) * 100)}% above area avg</span>
                  ) : (
                    <span className="text-green-400">{Math.round((propertyData.price / (analytics?.locationAnalysis?.average_price || 1) - 1) * 100)}% below area avg</span>
                  )}
                </td>
              </tr>
              <tr className="border-b border-[#404040]">
                <td className="px-4 py-3">Price per m²</td>
                <td className="px-4 py-3">
                  ${Math.round(propertyData.price / (propertyData.squareFeet || 100)).toLocaleString()}
                </td>
                <td className="px-4 py-3">Average for property type</td>
              </tr>
              <tr className="border-b border-[#404040]">
                <td className="px-4 py-3">Annual Appreciation</td>
                <td className="px-4 py-3">+4.2%</td>
                <td className="px-4 py-3">Above island average of 3.8%</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Investment Rating</td>
                <td className="px-4 py-3">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <svg
                        key={star}
                        className={`w-4 h-4 ${star <= 4 ? 'text-yellow-500' : 'text-gray-500'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">Good investment opportunity</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  // Render location tab
  const renderLocationTab = () => {
    const salesVolumeData = formatSalesVolumeData();
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0D0D0D] p-4 rounded-lg">
            <h3 className="text-white text-base font-semibold mb-2">
              Location Score
            </h3>
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="transparent"
                    stroke="#404040"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="transparent"
                    stroke="#f10000"
                    strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 45 * (analytics?.locationAnalysis?.location_score || 0) / 100} ${2 * Math.PI * 45}`}
                  />
                </svg>
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {analytics?.locationAnalysis?.location_score || 0}/100
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-3 text-center">
                Based on amenities, tourism, and market demand
              </p>
            </div>
          </div>
          
          <div className="bg-[#0D0D0D] p-4 rounded-lg">
            <h3 className="text-white text-base font-semibold mb-2">
              Proximity Ratings
            </h3>
            <ul className="space-y-2 mt-4">
              <li className="flex justify-between items-center">
                <span className="text-gray-300">Beach</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(star => (
                    <svg
                      key={star}
                      className={`w-4 h-4 ${star <= 5 ? 'text-blue-500' : 'text-gray-500'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-300">City Center</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(star => (
                    <svg
                      key={star}
                      className={`w-4 h-4 ${star <= 3 ? 'text-blue-500' : 'text-gray-500'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-300">Shopping</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(star => (
                    <svg
                      key={star}
                      className={`w-4 h-4 ${star <= 4 ? 'text-blue-500' : 'text-gray-500'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-300">Restaurants</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(star => (
                    <svg
                      key={star}
                      className={`w-4 h-4 ${star <= 4 ? 'text-blue-500' : 'text-gray-500'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </li>
            </ul>
          </div>
          
          <div className="bg-[#0D0D0D] p-4 rounded-lg">
            <h3 className="text-white text-base font-semibold mb-2">
              Area Info
            </h3>
            <table className="w-full text-sm mt-4">
              <tbody>
                <tr className="border-b border-[#404040]">
                  <td className="py-2 text-gray-300">District</td>
                  <td className="py-2 text-white text-right">{analytics?.locationAnalysis?.district || "N/A"}</td>
                </tr>
                <tr className="border-b border-[#404040]">
                  <td className="py-2 text-gray-300">Population</td>
                  <td className="py-2 text-white text-right">{analytics?.locationAnalysis?.population?.toLocaleString() || "N/A"}</td>
                </tr>
                <tr className="border-b border-[#404040]">
                  <td className="py-2 text-gray-300">Tourism Rating</td>
                  <td className="py-2 text-white text-right">{analytics?.locationAnalysis?.tourism_rating || "N/A"}/10</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-300">Development Growth</td>
                  <td className="py-2 text-white text-right">{analytics?.locationAnalysis?.development_growth || "N/A"}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-[#0D0D0D] p-4 rounded-lg">
          <h3 className="text-white text-base font-semibold mb-4">
            Area Sales Volume
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={salesVolumeData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="date" stroke="#999" />
                <YAxis 
                  stroke="#999"
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E1E1E', borderColor: '#404040' }}
                />
                <Bar dataKey="sales" name="Sales Volume" fill="#82ca9d" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-[#0D0D0D] p-4 rounded-lg">
          <h3 className="text-white text-base font-semibold mb-2 flex items-center">
            <MapPin size={16} className="mr-2 text-[#f10000]" />
            Location Insights
          </h3>
          
          <div className="mt-3">
            <ul className="space-y-3">
              {analytics?.locationAnalysis?.insights ? (
                analytics.locationAnalysis.insights.map((insight, index) => (
                  <li key={index} className="flex">
                    <span className="inline-block w-2 h-2 bg-[#f10000] rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    <span className="text-gray-300">{insight}</span>
                  </li>
                ))
              ) : (
                [
                  "This area has seen 12% price growth in the last two years.",
                  "Properties in this location typically sell within 45 days.",
                  "The area is popular among international buyers, especially from Europe.",
                  "Recent infrastructure improvements have increased property values."
                ].map((insight, index) => (
                  <li key={index} className="flex">
                    <span className="inline-block w-2 h-2 bg-[#f10000] rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    <span className="text-gray-300">{insight}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  };
  
  // Render environmental tab
  const renderEnvironmentalTab = () => {
    const environmentalData = analytics?.environmentalData || {
      weather: {
        yearlyRainfall: 1250,
        averageTemperature: 25,
        windSpeed: 12,
        sunnyDays: 280,
      },
      terrain: {
        elevation: 25,
        distanceToBeach: 0.8,
        soilType: 'Sandy loam',
        vegetation: 'Tropical'
      },
      risks: {
        floodRisk: 'Low',
        hurricaneRisk: 'Medium',
        erosionRisk: 'Low'
      }
    };
    
    // Sample climate data (would come from API)
    const climateData = [
      { month: 'Jan', temp: 27, rainfall: 250 },
      { month: 'Feb', temp: 28, rainfall: 220 },
      { month: 'Mar', temp: 28, rainfall: 180 },
      { month: 'Apr', temp: 27, rainfall: 120 },
      { month: 'May', temp: 26, rainfall: 80 },
      { month: 'Jun', temp: 24, rainfall: 60 },
      { month: 'Jul', temp: 23, rainfall: 50 },
      { month: 'Aug', temp: 23, rainfall: 60 },
      { month: 'Sep', temp: 24, rainfall: 90 },
      { month: 'Oct', temp: 25, rainfall: 120 },
      { month: 'Nov', temp: 26, rainfall: 160 },
      { month: 'Dec', temp: 27, rainfall: 210 }
    ];
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0D0D0D] p-4 rounded-lg">
            <h3 className="text-white text-base font-semibold mb-4 flex items-center">
              <Thermometer size={18} className="mr-2 text-red-500" />
              Climate
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Avg. Temperature</span>
                <span className="text-white font-medium">{environmentalData.weather.averageTemperature}°C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Yearly Rainfall</span>
                <span className="text-white font-medium">{environmentalData.weather.yearlyRainfall} mm</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Wind Speed</span>
                <span className="text-white font-medium">{environmentalData.weather.windSpeed} km/h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Sunny Days/Year</span>
                <span className="text-white font-medium">{environmentalData.weather.sunnyDays} days</span>
              </div>
            </div>
          </div>
          
          <div className="bg-[#0D0D0D] p-4 rounded-lg">
            <h3 className="text-white text-base font-semibold mb-4 flex items-center">
              <MapPin size={18} className="mr-2 text-green-500" />
              Terrain
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Elevation</span>
                <span className="text-white font-medium">{environmentalData.terrain.elevation} m</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Beach Distance</span>
                <span className="text-white font-medium">{environmentalData.terrain.distanceToBeach} km</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Soil Type</span>
                <span className="text-white font-medium">{environmentalData.terrain.soilType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Vegetation</span>
                <span className="text-white font-medium">{environmentalData.terrain.vegetation}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-[#0D0D0D] p-4 rounded-lg">
            <h3 className="text-white text-base font-semibold mb-4 flex items-center">
              <Wind size={18} className="mr-2 text-blue-500" />
              Environmental Risks
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Flood Risk</span>
                <span className={`font-medium ${environmentalData.risks.floodRisk === 'Low' ? 'text-green-500' : environmentalData.risks.floodRisk === 'Medium' ? 'text-yellow-500' : 'text-red-500'}`}>
                  {environmentalData.risks.floodRisk}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Hurricane Risk</span>
                <span className={`font-medium ${environmentalData.risks.hurricaneRisk === 'Low' ? 'text-green-500' : environmentalData.risks.hurricaneRisk === 'Medium' ? 'text-yellow-500' : 'text-red-500'}`}>
                  {environmentalData.risks.hurricaneRisk}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Erosion Risk</span>
                <span className={`font-medium ${environmentalData.risks.erosionRisk === 'Low' ? 'text-green-500' : environmentalData.risks.erosionRisk === 'Medium' ? 'text-yellow-500' : 'text-red-500'}`}>
                  {environmentalData.risks.erosionRisk}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-[#0D0D0D] p-4 rounded-lg">
          <h3 className="text-white text-base font-semibold mb-4">
            Temperature & Rainfall by Month
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={climateData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="month" stroke="#999" />
                <YAxis 
                  yAxisId="temp"
                  orientation="left"
                  stroke="#f10000"
                  tickFormatter={(value) => `${value}°C`}
                />
                <YAxis 
                  yAxisId="rainfall"
                  orientation="right"
                  stroke="#3b82f6"
                  tickFormatter={(value) => `${value}mm`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E1E1E', borderColor: '#404040' }}
                  formatter={(value, name) => {
                    if (name === 'Temperature') return [`${value}°C`, name];
                    return [`${value} mm`, name];
                  }}
                />
                <Legend />
                <Line 
                  yAxisId="temp"
                  type="monotone" 
                  dataKey="temp" 
                  name="Temperature" 
                  stroke="#f10000" 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  yAxisId="rainfall"
                  type="monotone" 
                  dataKey="rainfall" 
                  name="Rainfall" 
                  stroke="#3b82f6" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-[#0D0D0D] p-4 rounded-lg">
          <h3 className="text-white text-base font-semibold mb-2">
            Environmental Profile
          </h3>
          <p className="text-gray-300 mb-4">
            This property is located in a region with a tropical maritime climate, characterized by warm temperatures year-round and a distinct 
            wet season from November to April. The proximity to the beach (0.8 km) provides cooling sea breezes and easy access to coastal recreation.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-white font-medium mb-1">Climate Benefits</h4>
              <ul className="space-y-1">
                <li className="flex text-sm">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-300">Warm temperatures year-round</span>
                </li>
                <li className="flex text-sm">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-300">Sea breezes reduce need for air conditioning</span>
                </li>
                <li className="flex text-sm">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-300">High number of sunny days</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-1">Climate Considerations</h4>
              <ul className="space-y-1">
                <li className="flex text-sm">
                  <span className="text-red-500 mr-2">•</span>
                  <span className="text-gray-300">Heavy rainfall during wet season</span>
                </li>
                <li className="flex text-sm">
                  <span className="text-red-500 mr-2">•</span>
                  <span className="text-gray-300">Medium hurricane risk during cyclone season</span>
                </li>
                <li className="flex text-sm">
                  <span className="text-red-500 mr-2">•</span>
                  <span className="text-gray-300">High humidity during summer months</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render similar properties tab
  const renderSimilarTab = () => {
    return (
      <div className="space-y-6">
        <div className="bg-[#0D0D0D] p-4 rounded-lg">
          <h3 className="text-white text-base font-semibold mb-4">
            Properties Similar to This One
          </h3>
          
          {similarProperties.length === 0 ? (
            <p className="text-gray-300">No similar properties found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {similarProperties.slice(0, 3).map((property) => (
                <div key={property.property_id} className="bg-[#1E1E1E] rounded-lg overflow-hidden">
                  <img
                    src={property.image_url || "../public/images/property-placeholder.jpg"}
                    alt={property.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-3">
                    <div className="mb-2 flex justify-between items-start">
                      <p className="text-white font-medium truncate">{property.title}</p>
                      <div className="bg-amber-600 text-white text-xs px-2 py-1 rounded-full">
                        {Math.round(property.similarity_score * 100)}% Similar
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{property.location}</p>
                    <div className="flex justify-between items-center">
                      <p className="text-white font-bold">${property.price.toLocaleString()}</p>
                      <div className="flex space-x-2 text-sm text-gray-400">
                        <span>{property.bedrooms || 0} bd</span>
                        <span>•</span>
                        <span>{property.bathrooms || 0} ba</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-[#0D0D0D] p-4 rounded-lg">
          <h3 className="text-white text-base font-semibold mb-2">
            Similarity Factors
          </h3>
          <div className="mt-3">
            <table className="w-full text-sm text-left text-white">
              <thead className="text-xs uppercase bg-[#1E1E1E]">
                <tr>
                  <th className="px-4 py-3">Factor</th>
                  <th className="px-4 py-3">Weight</th>
                  <th className="px-4 py-3">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#404040]">
                  <td className="px-4 py-3 font-medium">Location</td>
                  <td className="px-4 py-3">25%</td>
                  <td className="px-4 py-3 text-gray-300">Properties in the same area or district</td>
                </tr>
                <tr className="border-b border-[#404040]">
                  <td className="px-4 py-3 font-medium">Property Type</td>
                  <td className="px-4 py-3">15%</td>
                  <td className="px-4 py-3 text-gray-300">Same type of property (house, apartment, etc.)</td>
                </tr>
                <tr className="border-b border-[#404040]">
                  <td className="px-4 py-3 font-medium">Price Range</td>
                  <td className="px-4 py-3">20%</td>
                  <td className="px-4 py-3 text-gray-300">Properties within a similar price bracket</td>
                </tr>
                <tr className="border-b border-[#404040]">
                  <td className="px-4 py-3 font-medium">Size & Rooms</td>
                  <td className="px-4 py-3">20%</td>
                  <td className="px-4 py-3 text-gray-300">Similar area size and number of bedrooms/bathrooms</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">Amenities</td>
                  <td className="px-4 py-3">20%</td>
                  <td className="px-4 py-3 text-gray-300">Shared features like pool, garden, security, etc.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-[#1E1E1E] rounded-lg overflow-hidden">
      <div className="border-b border-[#404040] p-4">
        <h2 className="text-white font-bold text-lg flex items-center">
          <BarChart size={20} className="mr-2 text-[#f10000]" />
          AI-Powered Property Analytics
        </h2>
      </div>
      
      {renderTabs()}
      
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f10000]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-400 mb-2">{error}</p>
            <button
              onClick={fetchPropertyAnalytics}
              className="bg-[#404040] text-white px-4 py-2 rounded hover:bg-[#505050]"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'price' && renderPriceTab()}
            {activeTab === 'location' && renderLocationTab()}
            {activeTab === 'environmental' && renderEnvironmentalTab()}
            {activeTab === 'similar' && renderSimilarTab()}
          </>
        )}
      </div>
    </div>
  );
};

export default PropertyDetailsAnalytics;