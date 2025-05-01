const express = require("express");
const authController = require("../controller/auth");
const useCatchErrors = require("../error/catchErrors");
const {
  validateRegistrationInput,
  validateLoginInput,
  validateForgotPasswordInput,
  validateResetPasswordInput
} = require("../utils/validators/auth");

class AuthRoute {
  constructor() {
    this.router = express.Router();
    this.path = "/auth";
    this.initializeRoutes();
  }

  initializeRoutes() {
    // Registration routes
    this.router.post(
      `${this.path}/register/landlord`, 
      validateRegistrationInput,
      useCatchErrors(authController.registerLandlord.bind(authController))
    );
    
    this.router.post(
      `${this.path}/register/seeker`, 
      validateRegistrationInput,
      useCatchErrors(authController.registerSeeker.bind(authController))
    );
    
    // Login route - handles both user types
    this.router.post(
      `${this.path}/login`, 
      validateLoginInput,
      useCatchErrors(authController.login.bind(authController))
    );
    
    // Logout route
    this.router.post(
      `${this.path}/logout`, 
      useCatchErrors(authController.logout.bind(authController))
    );
    
    // Password reset routes
    this.router.post(
      `${this.path}/forgot-password`, 
      validateForgotPasswordInput,
      useCatchErrors(authController.forgotPassword.bind(authController))
    );
    
    this.router.post(
      `${this.path}/reset-password`, 
      validateResetPasswordInput,
      useCatchErrors(authController.resetPassword.bind(authController))
    );
  }
}

module.exports = AuthRoute;