// Update your src/middlewares/error.js file

const HandleErrors = (err, req, res, next) => {
    // Skip error handling for OPTIONS requests
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    
    // Log the error for debugging
    console.error('Global error:', err);
    
    // Handle Prisma client errors
    if (err.name === 'PrismaClientValidationError' || 
        err.name === 'PrismaClientKnownRequestError') {
      return res.status(400).json({
        message: 'Invalid data provided',
        error: err.message
      });
    }
    
    // Handle other types of errors
    const statusCode = err.statusCode || 500;
    const message = err.message || 'An unexpected error occurred';
    
    return res.status(statusCode).json({
      message,
      // Only include stack trace in development
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  };
  
  module.exports = HandleErrors;