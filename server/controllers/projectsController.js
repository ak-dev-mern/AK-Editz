import Project from "../models/Project.js";

// Public route - only active projects
export const getAllProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;

    // Filter object - only active projects for public
    const filter = { isActive: true };

    if (category && category !== "all") {
      filter.category = category.toLowerCase();
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { shortDescription: { $regex: search, $options: "i" } },
        { technologies: { $in: [new RegExp(search, "i")] } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const projects = await Project.find(filter)
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Project.countDocuments(filter);

    res.json({
      success: true,
      projects,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching projects",
    });
  }
};

// Admin route - all projects (active and inactive)
export const getAllProjectsByAdmin = async (req, res) => {
  const isAdmin = req.user?.role === "admin";
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      showInactive = "false",
    } = req.query;

    // Filter object - admin sees everything by default
    const filter = {};

    // If showInactive is false, only show active projects
    if (!isAdmin) {
      filter.isActive = true;
    }

    if (category && category !== "all") {
      filter.category = category.toLowerCase();
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { shortDescription: { $regex: search, $options: "i" } },
        { technologies: { $in: [new RegExp(search, "i")] } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const projects = await Project.find(filter)
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Project.countDocuments(filter);

    res.json({
      success: true,
      projects,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
      showInactive: showInactive === "true",
    });
  } catch (error) {
    console.error("Get admin projects error:", error);
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
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    // Only increment views for active projects
    if (project.isActive) {
      project.views = (project.views || 0) + 1;
      await project.save();
    }

    res.json({ success: true, project });
  } catch (error) {
    console.error("Get project error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error while fetching project" });
  }
};

// Get featured projects (public route)
export const getFeaturedProjects = async (req, res) => {
  try {
    const featuredProjects = await Project.find({
      isActive: true,
      isFeatured: true,
    })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({ success: true, projects: featuredProjects });
  } catch (error) {
    console.error("Get featured projects error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching featured projects",
    });
  }
};

// Get projects by category (public route)
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

// Create project (admin only)
export const createProject = async (req, res) => {
  try {
    const projectData = {
      ...req.body,
      createdBy: req.user._id,
    };

    // Parse numeric and array fields
    if (req.body.price) projectData.price = parseFloat(req.body.price);
    if (req.body.technologies)
      projectData.technologies = JSON.parse(req.body.technologies);
    if (req.body.features) projectData.features = JSON.parse(req.body.features);
    if (req.body.tags) projectData.tags = JSON.parse(req.body.tags);
    if (req.body.isActive !== undefined)
      projectData.isActive = req.body.isActive === "true";
    if (req.body.isFeatured !== undefined)
      projectData.isFeatured = req.body.isFeatured === "true";

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      projectData.images = req.files.map(
        (file) => `/uploads/projects/${file.filename}`
      );
    }

    const project = new Project(projectData);
    await project.save();
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
      return res
        .status(400)
        .json({ success: false, message: "Validation error", errors });
    }
    res
      .status(500)
      .json({ success: false, message: "Server error while creating project" });
  }
};

// Update project (admin only)
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });

    const updateData = { ...req.body, updatedAt: new Date() };

    // Parse fields that come as strings
    if (req.body.technologies)
      updateData.technologies = JSON.parse(req.body.technologies);
    if (req.body.features) updateData.features = JSON.parse(req.body.features);
    if (req.body.tags) updateData.tags = JSON.parse(req.body.tags);
    if (req.body.price) updateData.price = parseFloat(req.body.price);
    if (req.body.isActive !== undefined)
      updateData.isActive = req.body.isActive === "true";
    if (req.body.isFeatured !== undefined)
      updateData.isFeatured = req.body.isFeatured === "true";

    // Handle file uploads - add to existing images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(
        (file) => `/uploads/projects/${file.filename}`
      );
      updateData.images = [...(project.images || []), ...newImages].slice(
        0,
        10
      );
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
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
      return res
        .status(400)
        .json({ success: false, message: "Validation error", errors });
    }
    res
      .status(500)
      .json({ success: false, message: "Server error while updating project" });
  }
};

// Delete project (admin only)
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });

    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete project error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error while deleting project" });
  }
};

// Toggle project active status (admin only)
export const toggleProjectActive = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });

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

// Toggle project featured status (admin only)
export const toggleProjectFeatured = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });

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

// Get project statistics (admin only)
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

// Get similar projects (public route)
export const getSimilarProjects = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });

    const similarProjects = await Project.find({
      _id: { $ne: project._id },
      category: project.category,
      isActive: true,
    })
      .populate("createdBy", "name")
      .sort({ views: -1, createdAt: -1 })
      .limit(4);

    res.json({ success: true, projects: similarProjects });
  } catch (error) {
    console.error("Get similar projects error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching similar projects",
    });
  }
};
