const logger = require("../config/logger");
const { passwordManager, JwtTokenManager } = require("../helper/index");
const SendResponse = require("../helper/sendResponse");
const prisma = require("../config/prisma");
const crypto = require('crypto');

class AuthController {
  constructor() {
    this.response = new SendResponse();
    this.prisma = prisma;
  }

  async registerLandlord(req, res) {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      companyName, 
      phoneNumber 
    } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return this.response.error(
        res,
        "Missing required fields",
        400
      );
    }

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return this.response.error(
        res,
        "Email already registered",
        400
      );
    }

    // Hash password
    const hashedPassword = passwordManager.hash(password);

    // Create user and landlord profile in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          account_type: 'landlord',
        }
      });

      // Create landlord profile
      const landlordProfile = await tx.landlordProfile.create({
        data: {
          user_id: user.id,
          company_name: companyName || null,
          verification_status: 'pending'
        }
      });

      return { user };
    });

    logger.info(`Landlord registered: ${email}`);

    return this.response.success(
      res,
      "Landlord registered successfully",
      201,
      {
        userId: result.user.id,
        email: result.user.email,
        accountType: 'landlord'
      }
    );
  }

  async registerSeeker(req, res) {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      phoneNumber, 
      preferredLocation, 
      budget,
      propertyType
    } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return this.response.error(
        res,
        "Missing required fields",
        400
      );
    }

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return this.response.error(
        res,
        "Email already registered",
        400
      );
    }

    // Hash password
    const hashedPassword = passwordManager.hash(password);

    // Create user and seeker profile in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          account_type: 'seeker',
        }
      });

      // Create seeker profile
      const seekerProfile = await tx.seekerProfile.create({
        data: {
          user_id: user.id,
          preferred_location: preferredLocation || null,
          budget: budget || null,
          preferred_property_types: propertyType || []
        }
      });

      return { user };
    });

    logger.info(`Property seeker registered: ${email}`);

    return this.response.success(
      res,
      "Property seeker registered successfully",
      201,
      {
        userId: result.user.id,
        email: result.user.email,
        accountType: 'seeker'
      }
    );
  }

  async login(req, res) {
    const { email, password, accountType } = req.body;

    // Validate input
    if (!email || !password) {
      return this.response.error(
        res,
        "Email and password are required",
        400
      );
    }

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    // Check if user exists
    if (!user) {
      return this.response.error(
        res,
        "Invalid email or password",
        401
      );
    }

    // If account type is specified, verify it matches
    if (accountType && user.account_type !== accountType) {
      return this.response.error(
        res,
        `Account not found as ${accountType === 'landlord' ? 'a landlord' : 'a property seeker'}`,
        401
      );
    }

    // Verify password
    const isPasswordValid = passwordManager.comparePwd(password, user.password);
    if (!isPasswordValid) {
      return this.response.error(
        res,
        "Invalid email or password",
        401
      );
    }

    // Get additional profile data based on user type
    let profileData = {};
    
    if (user.account_type === 'landlord') {
      const landlordProfile = await this.prisma.landlordProfile.findUnique({
        where: { user_id: user.id }
      });
      
      if (landlordProfile) {
        profileData = {
          companyName: landlordProfile.company_name,
          verificationStatus: landlordProfile.verification_status
        };
      }
    } else {
      const seekerProfile = await this.prisma.seekerProfile.findUnique({
        where: { user_id: user.id }
      });
      
      if (seekerProfile) {
        profileData = {
          preferredLocation: seekerProfile.preferred_location,
          budget: seekerProfile.budget,
          preferredPropertyTypes: seekerProfile.preferred_property_types
        };
      }
    }

    // Generate JWT token
    const tokenData = {
      userId: user.id,
      email: user.email,
      accountType: user.account_type
    };
    
    const token = JwtTokenManager.genAccessToken(tokenData);
    const refreshToken = JwtTokenManager.genRefreshToken(tokenData);

    // Create a session record
    await this.prisma.session.create({
      data: {
        user_id: user.id,
        token,
        refresh_token: refreshToken,
        is_active: true,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    });

    logger.info(`User logged in: ${email}`);

    return this.response.success(
      res,
      "Login successful",
      200,
      {
        token,
        refreshToken,
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          accountType: user.account_type,
          ...profileData
        }
      }
    );
  }

  async logout(req, res) {
    const { token } = req.body;

    if (!token) {
      return this.response.error(
        res,
        "Token is required",
        400
      );
    }

    // Invalidate the session
    await this.prisma.session.updateMany({
      where: { token },
      data: { is_active: false }
    });

    logger.info("User logged out");

    return this.response.success(
      res,
      "Logout successful",
      200
    );
  }

  async forgotPassword(req, res) {
    const { email } = req.body;

    if (!email) {
      return this.response.error(
        res,
        "Email is required",
        400
      );
    }

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    // Don't reveal whether the email exists for security
    if (!user) {
      return this.response.success(
        res,
        "If your email is registered, you will receive a password reset link",
        200
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Store token in database
    await this.prisma.passwordReset.create({
      data: {
        email,
        token: resetToken,
        expires_at: resetTokenExpiry
      }
    });

   

    logger.info(`Password reset requested for: ${email}`);

    return this.response.success(
      res,
      "If your email is registered, you will receive a password reset link",
      200
    );
  }

  async resetPassword(req, res) {
    const { token, password } = req.body;

    if (!token || !password) {
      return this.response.error(
        res,
        "Token and new password are required",
        400
      );
    }

    // Find valid reset token
    const resetRequest = await this.prisma.passwordReset.findFirst({
      where: {
        token,
        expires_at: {
          gt: new Date()
        },
        is_used: false
      }
    });

    if (!resetRequest) {
      return this.response.error(
        res,
        "Invalid or expired reset token",
        400
      );
    }

    // Hash new password
    const hashedPassword = passwordManager.hash(password);

    // Update user password
    await this.prisma.user.update({
      where: { email: resetRequest.email },
      data: { password: hashedPassword }
    });

    // Mark token as used
    await this.prisma.passwordReset.update({
      where: { id: resetRequest.id },
      data: { is_used: true }
    });

    logger.info(`Password reset completed for: ${resetRequest.email}`);

    return this.response.success(
      res,
      "Password has been reset successfully",
      200
    );
  }
}

module.exports = new AuthController();