import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import Project from "../models/Project.js";

// ES6 equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/projects/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Get all projects
export const getAllProjects = async (req, res) => {
  try {
    const {
      category,
      search,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (category && category !== "all") {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const projects = await Project.find(filter)
      .populate("createdBy", "name")
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Project.countDocuments(filter);

    res.json({
      success: true,
      projects,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      filters: {
        category,
        search,
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching projects",
    });
  }
};

// Get single project
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Increment views
    project.views = (project.views || 0) + 1;
    await project.save();

    res.json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching project",
    });
  }
};

// Get featured projects
export const getFeaturedProjects = async (req, res) => {
  try {
    const featuredProjects = await Project.find({
      isActive: true,
      isFeatured: true,
    })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      projects: featuredProjects,
    });
  } catch (error) {
    console.error("Get featured projects error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching featured projects",
    });
  }
};

// Get projects by category
export const getProjectsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const projects = await Project.find({
      category: category.toLowerCase(),
      isActive: true,
    })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Project.countDocuments({
      category: category.toLowerCase(),
      isActive: true,
    });

    res.json({
      success: true,
      projects,
      category,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error("Get projects by category error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching projects by category",
    });
  }
};

// Create project
export const createProject = async (req, res) => {
  try {
    const projectData = {
      ...req.body,
      createdBy: req.user._id,
      price: parseFloat(req.body.price),
      technologies: JSON.parse(req.body.technologies || "[]"),
      features: JSON.parse(req.body.features || "[]"),
      tags: JSON.parse(req.body.tags || "[]"),
    };

    if (req.files && req.files.length > 0) {
      projectData.images = req.files.map(
        (file) => `/uploads/projects/${file.filename}`
      );
    }

    const project = new Project(projectData);
    await project.save();

    // Populate createdBy field in response
    await project.populate("createdBy", "name");

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error("Create project error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating project",
    });
  }
};

// Update project
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date(),
    };

    // Parse JSON fields if they exist
    if (req.body.technologies) {
      updateData.technologies = JSON.parse(req.body.technologies);
    }
    if (req.body.features) {
      updateData.features = JSON.parse(req.body.features);
    }
    if (req.body.tags) {
      updateData.tags = JSON.parse(req.body.tags);
    }
    if (req.body.price) {
      updateData.price = parseFloat(req.body.price);
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(
        (file) => `/uploads/projects/${file.filename}`
      );
      updateData.images = [...project.images, ...newImages].slice(0, 5); // Keep max 5 images
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("createdBy", "name");

    res.json({
      success: true,
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Update project error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating project",
    });
  }
};

// Delete project
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting project",
    });
  }
};

// Toggle project active status
export const toggleProjectActive = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    project.isActive = !project.isActive;
    await project.save();

    res.json({
      success: true,
      message: `Project ${
        project.isActive ? "activated" : "deactivated"
      } successfully`,
      project,
    });
  } catch (error) {
    console.error("Toggle project active error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating project status",
    });
  }
};

// Toggle project featured status
export const toggleProjectFeatured = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    project.isFeatured = !project.isFeatured;
    await project.save();

    res.json({
      success: true,
      message: `Project ${
        project.isFeatured ? "added to featured" : "removed from featured"
      } successfully`,
      project,
    });
  } catch (error) {
    console.error("Toggle project featured error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating project featured status",
    });
  }
};

// Get project statistics
export const getProjectStats = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ isActive: true });
    const featuredProjects = await Project.countDocuments({ isFeatured: true });

    const totalRevenue = await Project.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);

    const projectsByCategory = await Project.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const totalViews = await Project.aggregate([
      { $group: { _id: null, total: { $sum: "$views" } } },
    ]);

    const recentProjects = await Project.find()
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalProjects,
        activeProjects,
        featuredProjects,
        inactiveProjects: totalProjects - activeProjects,
        potentialRevenue: totalRevenue[0]?.total || 0,
        totalViews: totalViews[0]?.total || 0,
        projectsByCategory,
        recentProjects,
      },
    });
  } catch (error) {
    console.error("Get project stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching project statistics",
    });
  }
};

// Get similar projects
export const getSimilarProjects = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const similarProjects = await Project.find({
      _id: { $ne: project._id },
      category: project.category,
      isActive: true,
    })
      .populate("createdBy", "name")
      .sort({ views: -1, createdAt: -1 })
      .limit(4);

    res.json({
      success: true,
      projects: similarProjects,
    });
  } catch (error) {
    console.error("Get similar projects error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching similar projects",
    });
  }
};

// Multer error handling middleware
export const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB.",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files. Maximum 5 images allowed.",
      });
    }
  }

  if (error.message === "Only image files are allowed") {
    return res.status(400).json({
      success: false,
      message: "Only image files (JPEG, JPG, PNG, GIF, WEBP) are allowed",
    });
  }

  res.status(500).json({
    success: false,
    message: "File upload error",
  });
};
