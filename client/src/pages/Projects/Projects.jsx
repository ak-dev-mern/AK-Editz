import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { apiService } from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";
import Loader from "../../components/UI/Loader";
import SearchBar from "../../components/Common/SearchBar";
import { motion } from "framer-motion";
import { Sparkles, Lock } from "lucide-react";

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    data: projectsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiService.projects.getAll(),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const projects = projectsData?.projects || [];
      return [...new Set(projects.map((p) => p.category))];
    },
    enabled: !!projectsData,
  });

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-project.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    return imagePath.startsWith("/uploads/")
      ? `${baseUrl}${imagePath}`
      : `${baseUrl}/uploads/${imagePath}`;
  };

  const handleViewDetails = (projectId) => {
    if (!user) {
      // Redirect to login with return URL
      navigate("/login", { state: { from: `/projects/${projectId}` } });
      return;
    }
    // If user is logged in, navigate to project details
    navigate(`/projects/${projectId}`);
  };

  const handlePurchaseAccess = () => {
    if (!user) {
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }
    // Show upgrade/purchase modal or navigate to pricing page
    alert("Please upgrade your account to access premium projects");
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Loader size="large" />
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <p className="text-lg text-red-600 mb-4 font-semibold">
          Failed to load projects 😢
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-all"
        >
          Try Again
        </button>
      </div>
    );

  const projects = projectsData?.projects || [];

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || project.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSearch = (q) => setSearchQuery(q);
  const handleCategoryChange = (c) => setSelectedCategory(c);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            className="text-5xl font-extrabold text-gray-900 mb-4 flex justify-center items-center gap-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Sparkles className="text-blue-600 w-8 h-8" />
            Our Projects
          </motion.h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Explore innovative projects crafted with modern technologies and
            creative excellence.
          </p>
          {!user && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-yellow-800 text-sm flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" />
                Sign in to view project details and source code
              </p>
            </div>
          )}
        </div>

        {/* Search & Filter */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 mb-10 border border-slate-200">
          <div className="flex flex-col lg:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Search by title or description..."
                className="w-full"
              />
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              <button
                onClick={() => handleCategoryChange("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === "all"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              {categoriesData?.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredProjects.map((project) => (
            <motion.div
              key={project._id}
              whileHover={{ scale: 1.03 }}
              className={`group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border transition-all ${
                !user
                  ? "border-slate-300 opacity-90"
                  : "border-slate-200 hover:shadow-2xl"
              }`}
            >
              <div className="relative h-56 overflow-hidden">
                {project.images?.[0] ? (
                  <img
                    src={getImageUrl(project.images[0])}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    No Image
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Lock overlay for non-logged in users */}
                {!user && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                      <Lock className="w-6 h-6 text-gray-700" />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900 truncate">
                    {project.title}
                  </h3>
                  <span className="text-2xl font-bold text-blue-600">
                    ${project.price}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {project.description}
                </p>

                <div className="flex justify-between items-center mb-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {project.category}
                  </span>
                  <div className="flex gap-2">
                    {project.isFeatured && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 text-xs rounded-full">
                        Featured
                      </span>
                    )}
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        project.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {project.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies?.slice(0, 3).map((tech, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies?.length > 3 && (
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      +{project.technologies.length - 3} more
                    </span>
                  )}
                </div>

                {/* Conditional Button based on authentication */}
                {user ? (
                  <Link
                    to={`/projects/${project._id}`}
                    className="block w-full text-center py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                  >
                    View Details
                  </Link>
                ) : (
                  <button
                    onClick={() => handleViewDetails(project._id)}
                    className="w-full text-center py-3 rounded-lg bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium hover:from-gray-700 hover:to-gray-800 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Sign In to View
                  </button>
                )}

                {/* Premium project indicator */}
                {project.isPremium && (
                  <div className="mt-3 text-center">
                    <button
                      onClick={handlePurchaseAccess}
                      className="w-full text-center py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                    >
                      🔒 Premium - Purchase Access
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-16">
            <img
              src="/empty-state-project.png"
              alt="No Projects"
              className="mx-auto mb-6 opacity-80"
              style={{ width: "500px" }}
            />
            <p className="text-gray-400 text-sm">
              {searchQuery || selectedCategory !== "all"
                ? "Try adjusting your filters or search terms."
                : "There are no projects available right now."}
            </p>
          </div>
        )}

        {/* Call to Action for non-logged in users */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Ready to Explore Project Details?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Sign in to access complete project details, source code,
              documentation, and technical specifications for all our amazing
              projects.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all"
              >
                Sign In Now
              </Link>
              <Link
                to="/register"
                className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-600 hover:text-white transition-all"
              >
                Create Account
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Projects;
