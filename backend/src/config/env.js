const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const LOCAL_POSTGRESQL = "postgresql://postgres:@localhost:5432/event_management";

const ENV = {
  // Environment
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Server config
  port: process.env.PORT || 8080,
  
  // Database connection
  databaseUrl:
    process.env.NODE_ENV === "development"
      ? LOCAL_POSTGRESQL
      : process.env.DATABASE_URL,
  
  // Authentication config
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  
  // URLs
  backendURL:
    process.env.NODE_ENV === "development"
      ? "http://localhost:8080"
      : `https://`, 
  
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
};

module.exports = ENV;