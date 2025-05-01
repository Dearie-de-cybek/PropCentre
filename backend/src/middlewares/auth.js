const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const ENV = require("../config/env");

const prisma = new PrismaClient();

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        errorStatus: true,
        statusCode: 401,
        code: "--auth/no-token",
        message: "No authentication token, access denied",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, ENV.jwtSecret);
    
    if (!decoded) {
      return res.status(401).json({
        errorStatus: true,
        statusCode: 401,
        code: "--auth/invalid-token",
        message: "Invalid token, access denied",
      });
    }

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      return res.status(401).json({
        errorStatus: true,
        statusCode: 401,
        code: "--auth/expired-token",
        message: "Token expired, please login again",
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { 
        id: decoded.userId 
      },
    });

    if (!user) {
      return res.status(401).json({
        errorStatus: true,
        statusCode: 401,
        code: "--auth/user-not-found",
        message: "User not found",
      });
    }

    // Check if session exists
    const session = await prisma.session.findUnique({
      where: { 
        token: token 
      },
    });

    if (!session || !session.is_active) {
      return res.status(401).json({
        errorStatus: true,
        statusCode: 401,
        code: "--auth/invalid-session",
        message: "Invalid or expired session",
      });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      accountType: user.account_type,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({
      errorStatus: true,
      statusCode: 401,
      code: "--auth/token-verification-failed",
      message: "Token verification failed",
    });
  }
};

module.exports = {
  isAuthenticated,
};