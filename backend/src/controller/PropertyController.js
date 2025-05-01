const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../config/logger');
const fs = require('fs');
const path = require('path');
const SendResponse = require('../helper/sendResponse');

class PropertyController {
  constructor() {
    this.response = new SendResponse();
    this.prisma = prisma;
  }

  // Get all properties with optional filters
  async getAllProperties(req, res) {
    try {
      const {
        minPrice,
        maxPrice,
        bedrooms,
        bathrooms,
        propertyType,
        listingType,
        city,
        status,
        furnished,
        limit,
        offset
      } = req.query;

      // Build the where clause based on filters
      const where = {};

      // Add filters if they exist
      if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice) };
      if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) };
      if (bedrooms) where.bedrooms = { gte: parseInt(bedrooms) };
      if (bathrooms) where.bathrooms = { gte: parseInt(bathrooms) };
      if (propertyType) where.propertyType = propertyType;
      if (listingType) where.listingType = listingType;
      if (city) where.city = { contains: city, mode: 'insensitive' };
      if (status) where.status = status;
      if (furnished === 'true') where.furnished = true;

      // Get total count for pagination
      const totalCount = await this.prisma.property.count({ where });

      // Get properties with filters, pagination and related data
      const properties = await this.prisma.property.findMany({
        where,
        include: {
          images: true,
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profileImage: true,
              landlordProfile: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset ? parseInt(offset) : 0,
        take: limit ? parseInt(limit) : 100
      });

      return this.response.success(res, 'Properties fetched successfully', 200, {
        properties,
        totalCount,
        pageInfo: {
          offset: offset ? parseInt(offset) : 0,
          limit: limit ? parseInt(limit) : 100,
          hasMore: offset + properties.length < totalCount
        }
      });
    } catch (error) {
      logger.error(`Error fetching properties: ${error.message}`);
      return this.response.error(res, error.message, 500);
    }
  }

  // Get featured properties
  async getFeaturedProperties(req, res) {
    try {
      const properties = await this.prisma.property.findMany({
        where: {
          featuredProperty: true,
          status: 'available'
        },
        include: {
          images: true,
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true
            }
          }
        },
        take: 6
      });

      return this.response.success(res, 'Featured properties fetched successfully', 200, properties);
    } catch (error) {
      logger.error(`Error fetching featured properties: ${error.message}`);
      return this.response.error(res, error.message, 500);
    }
  }

  // Get property by ID
  async getPropertyById(req, res) {
    try {
      const { id } = req.params;
      
      // Validate property ID
      if (!id || isNaN(parseInt(id))) {
        return this.response.error(res, 'Invalid property ID', 400);
      }

      const property = await this.prisma.property.findUnique({
        where: { id: parseInt(id) },
        include: {
          images: true,
          amenities: true,
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profileImage: true,
              landlordProfile: true
            }
          },
          reviews: {
            where: { isApproved: true },
            include: {
              reviewer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  profileImage: true
                }
              }
            }
          }
        }
      });

      if (!property) {
        return this.response.error(res, 'Property not found', 404);
      }

      return this.response.success(res, 'Property fetched successfully', 200, property);
    } catch (error) {
      logger.error(`Error fetching property: ${error.message}`);
      return this.response.error(res, error.message, 500);
    }
  }

  // Get landlord properties
  async getLandlordProperties(req, res) {
    try {
      const userId = req.user.id;

      const properties = await this.prisma.property.findMany({
        where: { ownerId: userId },
        include: {
          images: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return this.response.success(res, 'Landlord properties fetched successfully', 200, properties);
    } catch (error) {
      logger.error(`Error fetching landlord properties: ${error.message}`);
      return this.response.error(res, error.message, 500);
    }
  }

  // Create property
  async createProperty(req, res) {
    try {
      const userId = req.user.id;
      const files = req.files;
      
      // Check if user is a landlord
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { landlordProfile: true }
      });

      if (!user || user.userType !== 'landlord') {
        return this.response.error(res, 'Only landlords can create properties', 403);
      }

      // Parse amenities from JSON string if provided
      let amenities = [];
      if (req.body.amenities) {
        try {
          amenities = JSON.parse(req.body.amenities);
        } catch (e) {
          return this.response.error(res, 'Invalid amenities format', 400);
        }
      }

      // Create property
      const propertyData = {
        ownerId: userId,
        title: req.body.title,
        description: req.body.description,
        price: parseFloat(req.body.price),
        address: req.body.address,
        city: req.body.city,
        state: req.body.state || null,
        zipCode: req.body.zipCode || null,
        country: req.body.country || 'Mauritius',
        propertyType: req.body.propertyType,
        listingType: req.body.listingType,
        bedrooms: parseInt(req.body.bedrooms),
        bathrooms: parseInt(req.body.bathrooms),
        toilets: parseInt(req.body.toilets),
        squareFeet: req.body.squareFeet ? parseInt(req.body.squareFeet) : null,
        yearBuilt: req.body.yearBuilt ? parseInt(req.body.yearBuilt) : null,
        parkingSpaces: req.body.parkingSpaces ? parseInt(req.body.parkingSpaces) : 0,
        furnished: req.body.furnished === 'true',
        petFriendly: req.body.petFriendly === 'true',
        hasAirConditioning: req.body.hasAirConditioning === 'true',
        hasHeating: req.body.hasHeating === 'true',
        hasInternet: req.body.hasInternet === 'true',
        availableFrom: req.body.availableFrom ? new Date(req.body.availableFrom) : null,
        status: 'available',
      };

      // Create property in transaction with amenities
      const property = await this.prisma.$transaction(async (tx) => {
        // Create the property
        const newProperty = await tx.property.create({ data: propertyData });
        
        // Create amenities
        if (amenities.length > 0) {
          for (const amenity of amenities) {
            await tx.propertyAmenity.create({
              data: {
                propertyId: newProperty.id,
                name: amenity,
              }
            });
          }
        }
        
        return newProperty;
      });

      // Handle image uploads
      if (files && files.length > 0) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const isPrimary = i === 0; // First image is primary
          
          // Create relative path to the image
          const relativePath = `/uploads/properties/${file.filename}`;
          const imageUrl = `${baseUrl}${relativePath}`;
          
          // Save image reference to database
          await this.prisma.propertyImage.create({
            data: {
              propertyId: property.id,
              imageUrl: imageUrl,
              isPrimary: isPrimary,
              caption: `Image for property ${property.id}`
            }
          });
        }
      }
      
      // Fetch the property with images to return
      const propertyWithImages = await this.prisma.property.findUnique({
        where: { id: property.id },
        include: {
          images: true,
          amenities: true
        }
      });

      return this.response.success(res, 'Property created successfully', 201, propertyWithImages);
    } catch (error) {
      logger.error(`Error creating property: ${error.message}`);
      return this.response.error(res, error.message, 500);
    }
  }

  // Update property
  async updateProperty(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const files = req.files;
      
      // Validate property ID
      if (!id || isNaN(parseInt(id))) {
        return this.response.error(res, 'Invalid property ID', 400);
      }

      // Check if property exists and belongs to user
      const property = await this.prisma.property.findUnique({
        where: { id: parseInt(id) },
        include: { images: true, amenities: true }
      });

      if (!property) {
        return this.response.error(res, 'Property not found', 404);
      }

      if (property.ownerId !== userId) {
        return this.response.error(res, 'Unauthorized to update this property', 403);
      }

      // Parse amenities from JSON string if provided
      let amenities = [];
      if (req.body.amenities) {
        try {
          amenities = JSON.parse(req.body.amenities);
        } catch (e) {
          return this.response.error(res, 'Invalid amenities format', 400);
        }
      }

      // Update property data
      const propertyData = {
        title: req.body.title,
        description: req.body.description,
        price: parseFloat(req.body.price),
        address: req.body.address,
        city: req.body.city,
        state: req.body.state || null,
        zipCode: req.body.zipCode || null,
        country: req.body.country || 'Mauritius',
        propertyType: req.body.propertyType,
        listingType: req.body.listingType,
        bedrooms: parseInt(req.body.bedrooms),
        bathrooms: parseInt(req.body.bathrooms),
        toilets: parseInt(req.body.toilets),
        squareFeet: req.body.squareFeet ? parseInt(req.body.squareFeet) : property.squareFeet,
        yearBuilt: req.body.yearBuilt ? parseInt(req.body.yearBuilt) : property.yearBuilt,
        parkingSpaces: req.body.parkingSpaces ? parseInt(req.body.parkingSpaces) : property.parkingSpaces,
        furnished: req.body.furnished === 'true',
        petFriendly: req.body.petFriendly === 'true',
        hasAirConditioning: req.body.hasAirConditioning === 'true',
        hasHeating: req.body.hasHeating === 'true',
        hasInternet: req.body.hasInternet === 'true',
        availableFrom: req.body.availableFrom ? new Date(req.body.availableFrom) : property.availableFrom,
      };

      // Update property in transaction with amenities
      await this.prisma.$transaction(async (tx) => {
        // Update the property
        await tx.property.update({
          where: { id: parseInt(id) },
          data: propertyData
        });
        
        // Delete existing amenities
        await tx.propertyAmenity.deleteMany({
          where: { propertyId: parseInt(id) }
        });
        
        // Create new amenities
        if (amenities.length > 0) {
          for (const amenity of amenities) {
            await tx.propertyAmenity.create({
              data: {
                propertyId: parseInt(id),
                name: amenity,
              }
            });
          }
        }
      });

      // Handle image uploads
      if (files && files.length > 0) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const hasPrimaryImage = property.images.some(img => img.isPrimary);
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          // If no primary image exists, set the first uploaded image as primary
          const shouldBePrimary = !hasPrimaryImage && i === 0;
          
          // Create relative path to the image
          const relativePath = `/uploads/properties/${file.filename}`;
          const imageUrl = `${baseUrl}${relativePath}`;
          
          // Save image reference to database
          await this.prisma.propertyImage.create({
            data: {
              propertyId: parseInt(id),
              imageUrl: imageUrl,
              isPrimary: shouldBePrimary,
              caption: `Image for property ${id}`
            }
          });
        }
      }
      
      // Fetch the updated property with images to return
      const updatedProperty = await this.prisma.property.findUnique({
        where: { id: parseInt(id) },
        include: {
          images: true,
          amenities: true
        }
      });

      return this.response.success(res, 'Property updated successfully', 200, updatedProperty);
    } catch (error) {
      logger.error(`Error updating property: ${error.message}`);
      return this.response.error(res, error.message, 500);
    }
  }

  // Delete property
  async deleteProperty(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // Validate property ID
      if (!id || isNaN(parseInt(id))) {
        return this.response.error(res, 'Invalid property ID', 400);
      }

      // Check if property exists and belongs to user
      const property = await this.prisma.property.findUnique({
        where: { id: parseInt(id) },
        include: { images: true }
      });

      if (!property) {
        return this.response.error(res, 'Property not found', 404);
      }

      if (property.ownerId !== userId) {
        return this.response.error(res, 'Unauthorized to delete this property', 403);
      }

      // Delete physical image files
      for (const image of property.images) {
        const imagePath = this.extractImagePathFromUrl(image.imageUrl);
        this.deleteImageFile(imagePath);
      }

      // Delete property and all related data (cascade delete configured in Prisma schema)
      await this.prisma.property.delete({
        where: { id: parseInt(id) }
      });

      return this.response.success(res, 'Property deleted successfully', 200);
    } catch (error) {
      logger.error(`Error deleting property: ${error.message}`);
      return this.response.error(res, error.message, 500);
    }
  }

  // Delete property image
  async deletePropertyImage(req, res) {
    try {
      const { id, imageId } = req.params;
      const userId = req.user.id;
      
      // Validate IDs
      if (!id || isNaN(parseInt(id)) || !imageId || isNaN(parseInt(imageId))) {
        return this.response.error(res, 'Invalid property or image ID', 400);
      }

      // Check if property exists and belongs to user
      const property = await this.prisma.property.findUnique({
        where: { id: parseInt(id) }
      });

      if (!property) {
        return this.response.error(res, 'Property not found', 404);
      }

      if (property.ownerId !== userId) {
        return this.response.error(res, 'Unauthorized to modify this property', 403);
      }

      // Get the image
      const image = await this.prisma.propertyImage.findUnique({
        where: { id: parseInt(imageId) }
      });

      if (!image) {
        return this.response.error(res, 'Image not found', 404);
      }

      // If deleting primary image, set another image as primary if available
      if (image.isPrimary) {
        const otherImage = await this.prisma.propertyImage.findFirst({
          where: {
            propertyId: parseInt(id),
            id: { not: parseInt(imageId) }
          }
        });

        if (otherImage) {
          await this.prisma.propertyImage.update({
            where: { id: otherImage.id },
            data: { isPrimary: true }
          });
        }
      }

      // Delete the physical image file
      const imagePath = this.extractImagePathFromUrl(image.imageUrl);
      this.deleteImageFile(imagePath);

      // Delete image from database
      await this.prisma.propertyImage.delete({
        where: { id: parseInt(imageId) }
      });

      return this.response.success(res, 'Property image deleted successfully', 200);
    } catch (error) {
      logger.error(`Error deleting property image: ${error.message}`);
      return this.response.error(res, error.message, 500);
    }
  }

  // Helper method to extract the file path from URL
  extractImagePathFromUrl(imageUrl) {
    try {
      const url = new URL(imageUrl);
      // Get the path part from URL (e.g., /uploads/properties/filename.jpg)
      return url.pathname;
    } catch (error) {
      // If imageUrl is not a valid URL, assume it's already a path
      return imageUrl;
    }
  }

  // Helper method to delete a file from the file system
  deleteImageFile(imagePath) {
    try {
      // Convert relative path to absolute path
      const absolutePath = path.join(__dirname, '../public', imagePath);
      
      // Check if file exists
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
        logger.info(`Deleted image file: ${absolutePath}`);
      } else {
        logger.warn(`Image file not found: ${absolutePath}`);
      }
    } catch (error) {
      logger.error(`Error deleting image file: ${error.message}`);
    }
  }

  // Save property (add to favorites)
  async saveProperty(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { notes } = req.body;
      
      // Validate property ID
      if (!id || isNaN(parseInt(id))) {
        return this.response.error(res, 'Invalid property ID', 400);
      }

      // Check if user is a property seeker
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user || user.userType !== 'seeker') {
        return this.response.error(res, 'Only property seekers can save properties', 403);
      }

      // Check if property exists
      const property = await this.prisma.property.findUnique({
        where: { id: parseInt(id) }
      });

      if (!property) {
        return this.response.error(res, 'Property not found', 404);
      }

      // Check if already saved
      const existingSave = await this.prisma.savedProperty.findUnique({
        where: {
          userId_propertyId: {
            userId,
            propertyId: parseInt(id)
          }
        }
      });

      if (existingSave) {
        return this.response.error(res, 'Property already saved', 400);
      }

      // Save property
      const savedProperty = await this.prisma.savedProperty.create({
        data: {
          userId,
          propertyId: parseInt(id),
          notes: notes || null
        }
      });

      return this.response.success(res, 'Property saved successfully', 201, savedProperty);
    } catch (error) {
      logger.error(`Error saving property: ${error.message}`);
      return this.response.error(res, error.message, 500);
    }
  }

  // Get saved properties
  async getSavedProperties(req, res) {
    try {
      const userId = req.user.id;

      // Check if user is a property seeker
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user || user.userType !== 'seeker') {
        return this.response.error(res, 'Only property seekers can view saved properties', 403);
      }

      const savedProperties = await this.prisma.savedProperty.findMany({
        where: { userId },
        include: {
          property: {
            include: {
              images: true,
              owner: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  profileImage: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return this.response.success(res, 'Saved properties fetched successfully', 200, savedProperties);
    } catch (error) {
      logger.error(`Error fetching saved properties: ${error.message}`);
      return this.response.error(res, error.message, 500);
    }
  }

  // Remove saved property
  async removeSavedProperty(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // Validate property ID
      if (!id || isNaN(parseInt(id))) {
        return this.response.error(res, 'Invalid property ID', 400);
      }

      // Check if saved property exists
      const savedProperty = await this.prisma.savedProperty.findUnique({
        where: {
          userId_propertyId: {
            userId,
            propertyId: parseInt(id)
          }
        }
      });

      if (!savedProperty) {
        return this.response.error(res, 'Saved property not found', 404);
      }

      // Delete saved property
      await this.prisma.savedProperty.delete({
        where: {
          userId_propertyId: {
            userId,
            propertyId: parseInt(id)
          }
        }
      });

      return this.response.success(res, 'Property removed from saved list', 200);
    } catch (error) {
      logger.error(`Error removing saved property: ${error.message}`);
      return this.response.error(res, error.message, 500);
    }
  }

  // Book property appointment
  async bookAppointment(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { date, timeSlot, message } = req.body;
      
      // Validate property ID
      if (!id || isNaN(parseInt(id))) {
        return this.response.error(res, 'Invalid property ID', 400);
      }

      // Validate required fields
      if (!date || !timeSlot) {
        return this.response.error(res, 'Date and time slot are required', 400);
      }

      // Check if user is a property seeker
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user || user.userType !== 'seeker') {
        return this.response.error(res, 'Only property seekers can book appointments', 403);
      }

      // Check if property exists
      const property = await this.prisma.property.findUnique({
        where: { id: parseInt(id) }
      });

      if (!property) {
        return this.response.error(res, 'Property not found', 404);
      }

      // Check if property is available
      if (property.status !== 'available') {
        return this.response.error(res, 'Property is not available for appointments', 400);
      }

      // Create appointment
      const appointment = await this.prisma.appointment.create({
        data: {
          propertyId: parseInt(id),
          seekerId: userId,
          date: new Date(date),
          timeSlot,
          message: message || null,
          status: 'pending'
        }
      });

      // TODO: Send notification to landlord

      return this.response.success(res, 'Appointment booked successfully', 201, appointment);
    } catch (error) {
      logger.error(`Error booking appointment: ${error.message}`);
      return this.response.error(res, error.message, 500);
    }
  }

  // Submit property review
  async submitReview(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { rating, comment, title, pros, cons } = req.body;
      
      // Validate property ID
      if (!id || isNaN(parseInt(id))) {
        return this.response.error(res, 'Invalid property ID', 400);
      }

      // Validate required fields
      if (!rating || rating < 1 || rating > 5) {
        return this.response.error(res, 'Rating is required and must be between 1 and 5', 400);
      }

      // Check if property exists
      const property = await this.prisma.property.findUnique({
        where: { id: parseInt(id) }
      });

      if (!property) {
        return this.response.error(res, 'Property not found', 404);
      }

      // Check if user has already reviewed this property
      const existingReview = await this.prisma.review.findFirst({
        where: {
          propertyId: parseInt(id),
          reviewerId: userId
        }
      });

      if (existingReview) {
        return this.response.error(res, 'You have already reviewed this property', 400);
      }

      // Create review
      const review = await this.prisma.review.create({
        data: {
          propertyId: parseInt(id),
          reviewerId: userId,
          rating: parseInt(rating),
          comment: comment || null,
          title: title || null,
          pros: pros || null,
          cons: cons || null,
          isApproved: false // Reviews need approval before being displayed
        }
      });

      // TODO: Send notification to landlord

      return this.response.success(res, 'Review submitted successfully and pending approval', 201, review);
    } catch (error) {
      logger.error(`Error submitting review: ${error.message}`);
      return this.response.error(res, error.message, 500);
    }
  }

  // Get property reviews
  async getPropertyReviews(req, res) {
    try {
      const { id } = req.params;
      
      // Validate property ID
      if (!id || isNaN(parseInt(id))) {
        return this.response.error(res, 'Invalid property ID', 400);
      }

      // Check if property exists
      const property = await this.prisma.property.findUnique({
        where: { id: parseInt(id) }
      });

      if (!property) {
        return this.response.error(res, 'Property not found', 404);
      }

      // Get approved reviews
      const reviews = await this.prisma.review.findMany({
        where: {
          propertyId: parseInt(id),
          isApproved: true
        },
        include: {
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return this.response.success(res, 'Property reviews fetched successfully', 200, reviews);
    } catch (error) {
      logger.error(`Error fetching property reviews: ${error.message}`);
      return this.response.error(res, error.message, 500);
    }
  }
}

module.exports = new PropertyController();