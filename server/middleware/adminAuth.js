import auth from "./auth.js";

const adminAuth = [
  auth,
  (req, res, next) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }
    next();
  },
];

export default adminAuth;
