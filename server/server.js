import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// Import routes
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

// ES6 __dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// =============================
// 🧩 CORS CONFIGURATION
// =============================
app.use(
  cors({
    origin: [
      "https://akeditz.com",
      "http://localhost:3000",
      "http://localhost:5173",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// ✅ Handle all preflight OPTIONS requests
app.options("*", cors());

// =============================
// 🔧 MIDDLEWARES
// =============================
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =============================
// 🚀 ROUTES
// =============================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/newsletter", newsletterRoutes);

// =============================
// 🧠 BASIC TEST ROUTE
// =============================
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
      newsletter: "/api/newsletter",
    },
  });
});

// =============================
// 💓 HEALTH CHECK
// =============================
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// =============================
// ⚠️ ERROR HANDLERS
// =============================
app.use(notFound);
app.use(errorHandler);

// =============================
// 🧩 MONGODB CONNECTION
// =============================
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/akeditz";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.log("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  console.log("❌ MongoDB error:", err);
});

// =============================
// 🚀 START SERVER
// =============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🎉 Server started successfully!`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`🌐 API: http://localhost:${PORT}/api`);
  console.log(`⚡ Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📊 Database: ${MONGODB_URI.split("@").pop() || MONGODB_URI}`);
  console.log(
    `🍪 Cookies: Enabled (httpOnly: true, secure: ${
      process.env.NODE_ENV === "production"
    })`
  );
  console.log(`\n📋 Available Routes:`);
  console.log(`   🔐 Auth: /api/auth`);
  console.log(`   👥 Users: /api/users`);
  console.log(`   💼 Projects: /api/projects`);
  console.log(`   📝 Blogs: /api/blogs`);
  console.log(`   💳 Payments: /api/payments`);
  console.log(`   📬 Newsletter: /api/newsletter`);
});
