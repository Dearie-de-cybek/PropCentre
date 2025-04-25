// frontend/src/services/recommendationService.js
import api from './api';

const recommendationService = {
  // Get property recommendations based on user preferences
  getRecommendations: async (preferences) => {
    try {
      const response = await api.post('/recommendations/suggest', preferences);
      return response.data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  },

  // Get similar properties to a specific property
  getSimilarProperties: async (propertyId) => {
    try {
      const response = await api.get(`/recommendations/similar/${propertyId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching similar properties:', error);
      throw error;
    }
  },

  // Get price prediction for a property
  getPricePrediction: async (propertyData) => {
    try {
      const response = await api.post('/analytics/predict-price', propertyData);
      return response.data;
    } catch (error) {
      console.error('Error getting price prediction:', error);
      throw error;
    }
  },

  // Get market analysis for a location in Mauritius
  getLocationAnalysis: async (location) => {
    try {
      const response = await api.get(`/analytics/location/${encodeURIComponent(location)}`);
      return response.data;
    } catch (error) {
      console.error('Error getting location analysis:', error);
      throw error;
    }
  },

  // Get price trend forecast
  getPriceTrendForecast: async (location, propertyType, months = 24) => {
    try {
      const response = await api.get('/analytics/price-forecast', {
        params: { location, propertyType, months }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting price forecast:', error);
      throw error;
    }
  }
};

export default recommendationService;