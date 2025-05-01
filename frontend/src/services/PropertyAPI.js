import axios from "axios";

const API_URL = "http://localhost:8080/api";

// Helper to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

class PropertyAPI {
  // Get all properties (public endpoint)
  static async getAllProperties(params = {}) {
    try {
      const response = await axios.get(`${API_URL}/properties`, {
        params,
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get featured properties for homepage
  static async getFeaturedProperties() {
    try {
      const response = await axios.get(`${API_URL}/properties/featured`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get property details by ID
  static async getPropertyById(propertyId) {
    try {
      const response = await axios.get(`${API_URL}/properties/${propertyId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get properties for a specific landlord (authenticated)
  static async getLandlordProperties() {
    try {
      const response = await axios.get(`${API_URL}/properties/landlord`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create a new property
  static async createProperty(propertyData) {
    try {
      const response = await axios.post(`${API_URL}/properties`, propertyData, {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "multipart/form-data", // For file uploads
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update an existing property
  static async updateProperty(propertyId, propertyData) {
    try {
      const response = await axios.put(
        `${API_URL}/properties/${propertyId}`,
        propertyData,
        {
          headers: {
            ...getAuthHeader(),
            "Content-Type": "multipart/form-data", // For file uploads
          },
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete a property
  static async deleteProperty(propertyId) {
    try {
      const response = await axios.delete(
        `${API_URL}/properties/${propertyId}`,
        {
          headers: getAuthHeader(),
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Search properties with filters
  static async searchProperties(filters = {}) {
    try {
      const response = await axios.get(`${API_URL}/properties/search`, {
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Save a property as favorite (for property seekers)
  static async saveProperty(propertyId, notes = "") {
    try {
      const response = await axios.post(
        `${API_URL}/properties/${propertyId}/save`,
        { notes },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get saved properties (for property seekers)
  static async getSavedProperties() {
    try {
      const response = await axios.get(`${API_URL}/properties/saved`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Remove a property from saved list
  static async removeSavedProperty(propertyId) {
    try {
      const response = await axios.delete(
        `${API_URL}/properties/${propertyId}/save`,
        {
          headers: getAuthHeader(),
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Book a property viewing appointment
  static async bookAppointment(propertyId, appointmentData) {
    try {
      const response = await axios.post(
        `${API_URL}/properties/${propertyId}/appointments`,
        appointmentData,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Submit a property review
  static async submitReview(propertyId, reviewData) {
    try {
      const response = await axios.post(
        `${API_URL}/properties/${propertyId}/reviews`,
        reviewData,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get reviews for a property
  static async getPropertyReviews(propertyId) {
    try {
      const response = await axios.get(
        `${API_URL}/properties/${propertyId}/reviews`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Helper method to handle errors
  static handleError(error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return {
        status: error.response.status,
        message: error.response.data.message || "An error occurred",
        error: error.response.data,
      };
    } else if (error.request) {
      // The request was made but no response was received
      return {
        status: 503,
        message: "Network error. Please check your connection.",
        error: error.request,
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      return {
        status: 500,
        message: error.message || "An unexpected error occurred",
        error: error,
      };
    }
  }

  // Delete a property image
  static async deletePropertyImage(propertyId, imageId) {
    try {
      const response = await axios.delete(
        `${API_URL}/properties/${propertyId}/images/${imageId}`,
        {
          headers: getAuthHeader(),
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

export default PropertyAPI;
