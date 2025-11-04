import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";
import { motion } from "framer-motion";
import {
  Code2,
  ExternalLink,
  FileText,
  ArrowLeft,
  Star,
  ShoppingCart,
  Eye,
  CheckCircle2,
  Lock,
} from "lucide-react";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeImage, setActiveImage] = useState(0);

  // ✅ Get proper image URL
  const getImageUrl = (path) => {
    if (!path) return "/default-project.jpg";
    if (path.startsWith("http")) return path;

    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    return path.startsWith("/uploads/")
      ? `${baseUrl}${path}`
      : `${baseUrl}/uploads/${path}`;
  };

  // ✅ Fetch project data
  const {
    data: projectData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["project", id],
    queryFn: () => apiService.projects.getById(id),
  });

  // ✅ Check if user has purchased this project
  const { data: purchasedProjectsData } = useQuery({
    queryKey: ["purchased-projects", user?._id],
    queryFn: () => apiService.payments.getPurchasedProjects(),
    enabled: !!user,
  });

  const project = projectData?.project || projectData;

  // ✅ Fix: Handle different response structures for purchased projects
  const getPurchasedProjects = () => {
    if (!purchasedProjectsData) return [];

    // Handle different response structures
    if (Array.isArray(purchasedProjectsData)) {
      return purchasedProjectsData;
    } else if (purchasedProjectsData?.projects) {
      return purchasedProjectsData.projects;
    } else if (purchasedProjectsData?.data?.projects) {
      return purchasedProjectsData.data.projects;
    } else if (
      purchasedProjectsData?.data &&
      Array.isArray(purchasedProjectsData.data)
    ) {
      return purchasedProjectsData.data;
    }

    return [];
  };

  const purchasedProjects = getPurchasedProjects();

  // ✅ Check if current project is purchased by user
  const isPurchased = purchasedProjects.some(
    (p) => p._id === id || p.projectId === id || p.project?._id === id
  );

  const handlePurchase = () => {
    if (!user) {
      navigate("/login", { state: { from: `/projects/${id}` } });
      return;
    }
    navigate(`/checkout/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 text-lg">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {error ? "Error Loading Project" : "Project Not Found"}
        </h2>
        <p className="text-gray-600 mb-4">
          {error?.message || "The project you're looking for doesn't exist."}
        </p>
        <Link
          to="/projects"
          className="text-primary-600 hover:text-primary-700 font-semibold"
        >
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Project Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl overflow-hidden border border-gray-100"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-10">
            {/* Left Image Gallery */}
            <div>
              <motion.div
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl overflow-hidden shadow-lg"
              >
                <img
                  src={getImageUrl(project.images?.[activeImage])}
                  alt={project.title}
                  className="w-full h-[450px] object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => (e.target.src = "/default-project.jpg")}
                />
              </motion.div>

              {project.images?.length > 1 && (
                <div className="grid grid-cols-5 gap-2 mt-4">
                  {project.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`rounded-xl overflow-hidden border-2 transition-all ${
                        activeImage === i
                          ? "border-primary-600"
                          : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={getImageUrl(img)}
                        className="w-full h-20 object-cover"
                        alt={`Preview ${i + 1}`}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Project Details */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-primary-100 text-primary-800 text-xs px-3 py-1 rounded-full uppercase font-semibold tracking-wide">
                  {project.category}
                </span>
                {isPurchased && (
                  <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-semibold">
                    Purchased ✓
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">
                {project.title}
              </h1>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                {project.shortDescription || project.description}
              </p>

              {/* Stats */}
              <div className="flex gap-6 text-gray-500 text-sm mb-6">
                <span className="flex items-center gap-1">
                  <Eye size={18} /> {project.views || 0} views
                </span>
                <span className="flex items-center gap-1">
                  <ShoppingCart size={18} /> {project.purchaseCount || 0} sold
                </span>
                <span className="flex items-center gap-1">
                  <Star size={18} /> {project.rating || "No rating"}
                </span>
              </div>

              {/* Features */}
              {project.features?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">Features</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {project.features.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-center text-gray-700 text-sm"
                      >
                        <CheckCircle2
                          size={18}
                          className="text-green-500 mr-2"
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Technologies */}
              {project.technologies?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">
                    Technologies Used
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((t, i) => (
                      <span
                        key={i}
                        className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* External Links */}
              <div className="space-y-3 mb-8">
                {/* Demo URL - Always visible */}
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <ExternalLink size={20} /> Live Demo
                  </a>
                )}

                {/* Source Code - Only for purchased projects */}
                {project.sourceCode && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-600 font-medium">
                      <Code2 size={20} /> Source Code
                    </span>
                    {isPurchased ? (
                      <a
                        href={project.sourceCode}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 font-medium text-sm bg-green-50 px-3 py-1 rounded-lg"
                      >
                        Access Source
                      </a>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Lock size={16} />
                        Purchase to unlock
                      </div>
                    )}
                  </div>
                )}

                {/* Documentation - Only for purchased projects */}
                {project.documentation && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-600 font-medium">
                      <FileText size={20} /> Documentation
                    </span>
                    {isPurchased ? (
                      <a
                        href={project.documentation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 font-medium text-sm bg-green-50 px-3 py-1 rounded-lg"
                      >
                        View Docs
                      </a>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Lock size={16} />
                        Purchase to unlock
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Author */}
              {project.createdBy && (
                <div className="bg-gray-50 rounded-xl p-4 mb-8 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-700 font-bold text-lg">
                      {project.createdBy.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {project.createdBy.name}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Member since{" "}
                      {new Date(project.createdAt).getFullYear() || "Unknown"}
                    </p>
                  </div>
                </div>
              )}

              {/* Purchase Section */}
              <div className="border-t pt-6">
                {isPurchased ? (
                  <div className="text-center">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-4">
                      <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <h3 className="text-xl font-semibold text-green-800 mb-2">
                        Project Purchased!
                      </h3>
                      <p className="text-green-600 mb-4">
                        You now have full access to this project including
                        source code and documentation.
                      </p>
                      <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                      >
                        Go to Dashboard
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <span className="text-4xl font-bold text-primary-600">
                          ₹{project.price}
                        </span>
                        {project.originalPrice && (
                          <span className="ml-3 text-lg text-gray-500 line-through">
                            ₹{project.originalPrice}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={handlePurchase}
                        disabled={!project.isActive}
                        className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold hover:shadow-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {project.isActive ? "Purchase Now" : "Unavailable"}
                      </button>
                    </div>
                    <p className="text-center text-sm text-gray-500">
                      {project.isActive
                        ? "Instant download • Lifetime updates • Technical support"
                        : "Currently unavailable for purchase"}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Back to All Projects */}
        <div className="mt-10 text-center">
          <Link
            to="/projects"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold"
          >
            <ArrowLeft size={18} className="mr-2" /> Back to All Projects
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
