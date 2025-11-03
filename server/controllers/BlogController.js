import Blog from "../models/Blog.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Get all blogs
export const getAllBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    let user = null;

    // Optional token check (for admin)
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await User.findById(decoded.id);
      } catch (err) {
        // ignore invalid token, treat as public
      }
    }

    const filter = {};

    // If not admin, only show published blogs
    if (!user || user.role !== "admin") {
      filter.isPublished = true;
    }

    if (category && category !== "all") {
      filter.category = category.toLowerCase();
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const blogs = await Blog.find(filter)
      .populate("author", "name")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Blog.countDocuments(filter);

    res.json({
      success: true,
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error("Get all blogs error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching blogs",
    });
  }
};

// Get all blogs (admins see everything, users only published)
export const getAllBlogsByAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const isAdmin = req.user?.role === "admin";

    // Filter object
    const filter = {};
    if (!isAdmin) filter.isPublished = true; // only published for non-admins

    if (category && category !== "all") filter.category = category.toLowerCase();

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const blogs = await Blog.find(filter)
      .populate("author", "name")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Blog.countDocuments(filter);

    res.json({
      success: true,
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    console.error("Get all blogs error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching blogs",
    });
  }
};

// Get single blog
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate(
      "author",
      "name email"
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.json({
      success: true,
      blog,
    });
  } catch (error) {
    console.error("Get blog by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching blog",
    });
  }
};

// Create blog
export const createBlog = async (req, res) => {
  try {
    const blogData = { ...req.body, author: req.user._id };

    if (req.file) {
       blogData.coverImage = `/uploads/blogs/${req.file.filename}`;
    }

    // Convert tags to array if sent as string
    if (blogData.tags && typeof blogData.tags === "string") {
      blogData.tags = blogData.tags.split(",").map((t) => t.trim());
    }

    const blog = await Blog.create(blogData);
    await blog.populate("author", "name");

    res.status(201).json({ success: true, blog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update blog
export const updateBlog = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: Date.now(),
    };

    // Handle uploaded image
    if (req.file) {
       updateData.coverImage = `/uploads/blogs/${req.file.filename}`;
    }

    // Convert tags from JSON string if sent
    if (updateData.tags && typeof updateData.tags === "string") {
      updateData.tags = JSON.parse(updateData.tags);
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("author", "name");

    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    res.json({ success: true, blog });
  } catch (error) {
    console.error("Update blog error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error while updating blog" });
  }
};


// Delete blog
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("Delete blog error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting blog",
    });
  }
};

// Get blogs by category
export const getBlogsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const blogs = await Blog.find({
      category: category.toLowerCase(),
      isPublished: true,
    })
      .populate("author", "name")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Blog.countDocuments({
      category: category.toLowerCase(),
      isPublished: true,
    });

    res.json({
      success: true,
      blogs,
      category,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error("Get blogs by category error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching blogs by category",
    });
  }
};

// Increment blog views
export const incrementBlogViews = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.json({
      success: true,
      views: blog.views,
    });
  } catch (error) {
    console.error("Increment blog views error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating blog views",
    });
  }
};

// Get featured blogs
export const getFeaturedBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({
      isPublished: true,
      isFeatured: true,
    })
      .populate("author", "name")
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      blogs,
    });
  } catch (error) {
    console.error("Get featured blogs error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching featured blogs",
    });
  }
};

// Get blog statistics (admin only)
export const getBlogStats = async (req, res) => {
  try {
    const totalBlogs = await Blog.countDocuments();
    const publishedBlogs = await Blog.countDocuments({ isPublished: true });
    const totalViews = await Blog.aggregate([
      { $group: { _id: null, total: { $sum: "$views" } } },
    ]);

    const blogsByCategory = await Blog.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const recentBlogs = await Blog.find()
      .populate("author", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalBlogs,
        publishedBlogs,
        draftBlogs: totalBlogs - publishedBlogs,
        totalViews: totalViews[0]?.total || 0,
        blogsByCategory,
        recentBlogs,
      },
    });
  } catch (error) {
    console.error("Get blog stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching blog statistics",
    });
  }
};

// Toggle blog publish status
export const togglePublishStatus = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    blog.isPublished = !blog.isPublished;
    await blog.save();

    res.json({
      success: true,
      message: `Blog ${
        blog.isPublished ? "published" : "unpublished"
      } successfully`,
      blog,
    });
  } catch (error) {
    console.error("Toggle publish status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating blog status",
    });
  }
};
