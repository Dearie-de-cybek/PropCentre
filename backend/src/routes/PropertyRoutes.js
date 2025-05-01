const express = require('express');
const router = express.Router();
const propertyController = require('../controller/PropertyController');
const { isAuthenticated } = require('../middlewares/auth');
const upload = require('../config/multerConfig');

// Public endpoints
router.get('/', propertyController.getAllProperties.bind(propertyController));
router.get('/featured', propertyController.getFeaturedProperties.bind(propertyController));
router.get('/:id', propertyController.getPropertyById.bind(propertyController));
router.get('/:id/reviews', propertyController.getPropertyReviews.bind(propertyController));

// Authenticated endpoints
router.get('/landlord', isAuthenticated, propertyController.getLandlordProperties.bind(propertyController));
router.post('/', isAuthenticated, upload.array('images', 10), propertyController.createProperty.bind(propertyController));
router.put('/:id', isAuthenticated, upload.array('images', 10), propertyController.updateProperty.bind(propertyController));
router.delete('/:id', isAuthenticated, propertyController.deleteProperty.bind(propertyController));
router.delete('/:id/images/:imageId', isAuthenticated, propertyController.deletePropertyImage.bind(propertyController));

// Saved properties
router.post('/:id/save', isAuthenticated, propertyController.saveProperty.bind(propertyController));
router.get('/saved', isAuthenticated, propertyController.getSavedProperties.bind(propertyController));
router.delete('/:id/save', isAuthenticated, propertyController.removeSavedProperty.bind(propertyController));

// Appointments and reviews
router.post('/:id/appointments', isAuthenticated, propertyController.bookAppointment.bind(propertyController));
router.post('/:id/reviews', isAuthenticated, propertyController.submitReview.bind(propertyController));

module.exports = router;