import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// Import individual route files directly
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import projectRoutes from "./routes/projects.js";
import blogRoutes from "./routes/blog.js";
import paymentRoutes from "./routes/payments.js";
import contactRoutes from "./routes/contact.js";
import newsletterRoutes from "./routes/newsletter.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// Load environment variables
dotenv.config();

// ES6 equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware - Order matters!
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "https://ak-editz.onrender.com",
    credentials: true, // This is important for cookies
  })
);
app.use(express.json());
app.use(cookieParser()); // Cookie parser should come after CORS
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/newsletter", newsletterRoutes);

// Basic route for testing
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Akeditz Server is running with ES6!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    routes: {
      auth: "/api/auth",
      users: "/api/users",
      projects: "/api/projects",
      blogs: "/api/blogs",
      payments: "/api/payments",
    },
  });
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// MongoDB Connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/akeditz";

// MongoDB connection with better error handling
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.log("❌ MongoDB Connection Error:", err);
    process.exit(1); // Exit process if DB connection fails
  });

// MongoDB connection event handlers
mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  console.log("❌ MongoDB error:", err);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🎉 Server started successfully!`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`🌐 API: http://localhost:${PORT}/api`);
  console.log(`⚡ Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📊 Database: ${MONGODB_URI.split("@").pop() || MONGODB_URI}`); // Hide credentials in log
  console.log(
    `🍪 Cookies: Enabled (httpOnly: true, secure: ${
      process.env.NODE_ENV === "production"
    })`
  );
  console.log(`\n📋 Available Routes:`);
  console.log(`   🔐 Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   👥 Users: http://localhost:${PORT}/api/users`);
  console.log(`   💼 Projects: http://localhost:${PORT}/api/projects`);
  console.log(`   📝 Blogs: http://localhost:${PORT}/api/blogs`);
  console.log(`   💳 Payments: http://localhost:${PORT}/api/payments`);
});
