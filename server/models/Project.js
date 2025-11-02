import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
    required: true,
    maxlength: 150,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
    enum: ["web", "mobile", "desktop", "game", "other"],
  },
  technologies: [
    {
      type: String,
    },
  ],
  images: [
    {
      type: String,
    },
  ],
  sourceCode: {
    type: String,
    required: true,
  },
  demoUrl: {
    type: String,
  },
  documentation: {
    type: String,
  },
  features: [
    {
      type: String,
    },
  ],
  tags: [
    {
      type: String,
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
projectSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Project", projectSchema);
