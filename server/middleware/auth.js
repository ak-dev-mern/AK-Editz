import jwt from "jsonwebtoken";
import User from "../models/User.js";

const auth = async (req, res, next) => {
  try {
    let token;

    // Check for token in multiple locations:
    // 1. First check cookies (for web clients)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Then check Authorization header (for mobile apps, API clients)
    else if (req.header("Authorization")?.startsWith("Bearer ")) {
      token = req.header("Authorization").replace("Bearer ", "");
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No authentication token provided. Access denied.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token is not valid. User not found.",
      });
    }

    // Check if user is active
    if (user.status && user.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Account is not active. Please contact support.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Authentication token has expired.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Authentication failed. Please try again.",
    });
  }
};

export default auth;
