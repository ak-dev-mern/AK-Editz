import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true, // This automatically creates an index
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "suspended", "inactive"],
      default: "active",
    },
    avatar: {
      type: String,
      default: "",
    },
    googlePayQr: {
      type: String,
      default: "",
    },
    purchasedProjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true, // Use mongoose timestamps instead of manual createdAt/updatedAt
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Remove manual updatedAt handling since we're using timestamps
// userSchema.pre("save", function (next) {
//   this.updatedAt = Date.now();
//   next();
// });

// Update lastLogin on successful login
userSchema.methods.updateLoginStats = function () {
  this.lastLogin = new Date();
  this.loginCount += 1;
  return this.save();
};

// Compare password method
userSchema.methods.correctPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if user is admin
userSchema.methods.isAdmin = function () {
  return this.role === "admin";
};

// Check if user is active
userSchema.methods.isActive = function () {
  return this.status === "active";
};

// Virtual for user's full profile (excluding sensitive data)
userSchema.methods.toProfileJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    status: this.status,
    avatar: this.avatar,
    googlePayQr: this.googlePayQr,
    purchasedProjects: this.purchasedProjects,
    lastLogin: this.lastLogin,
    loginCount: this.loginCount,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Index for better query performance - REMOVE any explicit email index
// userSchema.index({ email: 1 }); // REMOVE THIS LINE - duplicate of unique: true
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ purchasedProjects: 1 });

// Static method to find user by email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to get users by role
userSchema.statics.findByRole = function (role) {
  return this.find({ role }).sort({ createdAt: -1 });
};

// Static method to get active users
userSchema.statics.getActiveUsers = function () {
  return this.find({ status: "active" });
};

// Static method to check if email exists
userSchema.statics.emailExists = async function (email) {
  const user = await this.findOne({ email: email.toLowerCase() });
  return !!user;
};

export default mongoose.model("User", userSchema);
