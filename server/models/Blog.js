import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  content: {
    type: String,
    required: true,
    minlength: 100,
  },
  excerpt: {
    type: String,
    required: true,
    maxlength: 300,
  },
  coverImage: {
    type: String,
    default: "",
  },
  tags: [
    {
      type: String,
      trim: true,
    },
  ],
  category: {
    type: String,
    required: true,
    enum: [
      "web development",
      "mobile development",
      "programming",
      "tutorial",
      "technology",
      "other",
    ],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  readTime: {
    type: Number,
    default: 5,
    min: 1,
  },
  views: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
  metaTitle: {
    type: String,
    maxlength: 200,
  },
  metaDescription: {
    type: String,
    maxlength: 300,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  publishedAt: {
    type: Date,
  },
});

// Generate slug from title before saving
blogSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 100);
  }

  // Set publishedAt when blog is published
  if (this.isModified("isPublished") && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  this.updatedAt = Date.now();
  next();
});

// Calculate read time based on content length
blogSchema.pre("save", function (next) {
  if (this.isModified("content")) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / wordsPerMinute) || 1;
  }
  next();
});

// Index for better performance
blogSchema.index({ category: 1, isPublished: 1, createdAt: -1 });
blogSchema.index({ slug: 1 });
blogSchema.index({ author: 1, createdAt: -1 });
blogSchema.index({ tags: 1 });

// Virtual for formatted published date
blogSchema.virtual("formattedPublishedAt").get(function () {
  return this.publishedAt ? this.publishedAt.toLocaleDateString() : null;
});

// Method to increment likes
blogSchema.methods.incrementLikes = function () {
  this.likes += 1;
  return this.save();
};

// Method to get related blogs
blogSchema.statics.getRelatedBlogs = async function (blogId, limit = 3) {
  const blog = await this.findById(blogId);
  if (!blog) return [];

  return this.find({
    _id: { $ne: blogId },
    category: blog.category,
    isPublished: true,
  })
    .select("title slug excerpt coverImage readTime createdAt")
    .populate("author", "name")
    .limit(limit)
    .sort({ views: -1, createdAt: -1 });
};

export default mongoose.model("Blog", blogSchema);
