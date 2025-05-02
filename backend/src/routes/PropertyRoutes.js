const express = require('express');
const propertyController = require('../controller/PropertyController');
const { isAuthenticated } = require('../middlewares/auth');
const upload = require('../config/multerConfig');

class PropertyRoutes {
  constructor() {
    this.router = express.Router();
    this.path = "/properties";
    this.initializeRoutes();
  }

  initializeRoutes() {
    // Public endpoints - fixed path routes first
    this.router.get(`${this.path}/`, propertyController.getAllProperties.bind(propertyController));
    this.router.get(`${this.path}/featured`, propertyController.getFeaturedProperties.bind(propertyController));
    
    // Authenticated specific endpoints - these MUST come before parameterized routes
    this.router.get(`${this.path}/landlord`, isAuthenticated, propertyController.getLandlordProperties.bind(propertyController));
    this.router.get(`${this.path}/saved`, isAuthenticated, propertyController.getSavedProperties.bind(propertyController));
    
    // Parameterized routes - these should come after specific routes
    this.router.get(`${this.path}/:id`, propertyController.getPropertyById.bind(propertyController));
    this.router.get(`${this.path}/:id/reviews`, propertyController.getPropertyReviews.bind(propertyController));

    // Other authenticated endpoints
    this.router.post(`${this.path}/`, isAuthenticated, upload.array('images', 10), propertyController.createProperty.bind(propertyController));
    this.router.put(`${this.path}/:id`, isAuthenticated, upload.array('images', 10), propertyController.updateProperty.bind(propertyController));
    this.router.delete(`${this.path}/:id`, isAuthenticated, propertyController.deleteProperty.bind(propertyController));
    this.router.delete(`${this.path}/:id/images/:imageId`, isAuthenticated, propertyController.deletePropertyImage.bind(propertyController));

    // Saved properties
    this.router.post(`${this.path}/:id/save`, isAuthenticated, propertyController.saveProperty.bind(propertyController));
    this.router.delete(`${this.path}/:id/save`, isAuthenticated, propertyController.removeSavedProperty.bind(propertyController));

    // Appointments and reviews
    this.router.post(`${this.path}/:id/appointments`, isAuthenticated, propertyController.bookAppointment.bind(propertyController));
    this.router.post(`${this.path}/:id/reviews`, isAuthenticated, propertyController.submitReview.bind(propertyController));
  }
}

module.exports = PropertyRoutes;