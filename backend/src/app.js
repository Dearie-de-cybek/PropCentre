const express = require("express");
const cors = require("cors");
const path = require("path");
const env = require("./config/env.js");
const { requestLogger } = require("./middlewares/logger.js");
const bodyParser = require("body-parser");
const HandleErrors = require("./middlewares/error.js");
const { isAuthenticated } = require("./middlewares/auth.js");
const logger = require("./config/logger.js");
const multer = require("multer");

// CORS preflight request handler
const handleCorsPreflightRequests = (req, res, next) => {
  // Check if this is a preflight request
  if (req.method === 'OPTIONS') {
    // Set CORS headers
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Respond with 204 No Content
    return res.status(204).end();
  }
  
  // Continue to the next middleware for non-OPTIONS requests
  next();
};

class App {
  constructor() {
    this.app = express();
    this.env = env;
    this.port = process.env.PORT ?? 8080;
    this.initializeMiddlewares();
  }

  /**
   * Set the Socket.IO instance so it can be used by controllers
   * @param {Object} io - Socket.IO instance
   */
  setSocketIO(io) {
    this.io = io;
    this.app.set('io', io);
    logger.info("Socket.IO instance set for Express app");
  }

  initDB() {
    // * initialization of the database
    logger.info("Database connection initialized");
  }

  initializeMiddlewares() {
    // Handle OPTIONS requests first
    this.app.use(handleCorsPreflightRequests);

    // Initialize server middlewares
    this.app.use(requestLogger);
    
    // Enhanced CORS configuration
    this.app.use(
      cors({
        origin: 'http://localhost:5173',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
      })
    );
    
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    
    // Serve static files for uploads
    this.app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  }

  listen() {
    // initialize database
    this.initDB();
    // listen on server port
    this.app.listen(this.port, () => {
      logger.info("Server started at http://localhost:" + this.port);
    });
  }

  initializedRoutes(routes) {
    // initialize all routes middleware
    routes.forEach((route) => {
      this.app.use("/api", route.router);
    });

    // Handle 404 errors, but skip for OPTIONS requests
    this.app.all("*", (req, res) => {
      // Skip 404 handling for OPTIONS requests
      if (req.method === 'OPTIONS') {
        return res.status(204).end();
      }
      
      return res.status(404).json({
        errorStatus: true,
        code: "--route/route-not-found",
        message: "The requested route was not found.",
      });
    });
    
    // handle global errors
    this.app.use(HandleErrors);
  }
}

module.exports = App;