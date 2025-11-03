import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeImage, setActiveImage] = useState(0);

  // ✅ Function to get correct image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-project.jpg";

    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

    // Handle different upload folders
    if (imagePath.startsWith("/uploads/")) {
      return `${baseUrl}${imagePath}`;
    } else {
      // Fallback to general uploads
      return `${baseUrl}/uploads/${imagePath}`;
    }
  };

  // ✅ Use apiService instead of direct axios
  const {
    data: projectData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["project", id],
    queryFn: () => apiService.projects.getById(id),
  });

  // ✅ Extract project from response
  const project = projectData?.project || projectData;

  const handlePurchase = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate(`/checkout/${id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Image Gallery */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            <div>
              <div className="rounded-lg overflow-hidden mb-4">
                <img
                  src={getImageUrl(project.images?.[activeImage])}
                  alt={project.title}
                  className="w-full h-96 object-cover"
                  onError={(e) => {
                    e.target.src = "/default-project.jpg";
                  }}
                />
              </div>
              {project.images && project.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {project.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`rounded overflow-hidden ${
                        activeImage === index ? "ring-2 ring-primary-600" : ""
                      }`}
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`${project.title} ${index + 1}`}
                        className="w-full h-20 object-cover"
                        onError={(e) => {
                          e.target.src = "/default-project.jpg";
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Project Details */}
            <div>
              <div className="mb-6">
                <span className="bg-primary-100 text-primary-800 text-sm px-3 py-1 rounded-full capitalize">
                  {project.category}
                </span>
                <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-4">
                  {project.title}
                </h1>
                <p className="text-gray-600 mb-4">{project.shortDescription}</p>
                <p className="text-gray-600 text-lg">{project.description}</p>
              </div>

              {/* Project Stats */}
              <div className="flex items-center gap-6 mb-6 text-sm text-gray-600">
                <span>👁️ {project.views || 0} views</span>
                <span>🛒 {project.purchaseCount || 0} purchases</span>
                <span>⭐ {project.rating || "No ratings"}</span>
              </div>

              {project.features && project.features.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">Features</h3>
                  <ul className="grid grid-cols-1 gap-2">
                    {project.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {project.technologies && project.technologies.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">
                    Technologies Used
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {project.tags && project.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Links Section */}
              <div className="mb-6 space-y-3">
                {project.sourceCode && (
                  <div>
                    <a
                      href={project.sourceCode}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Source Code
                    </a>
                  </div>
                )}

                {project.demoUrl && (
                  <div>
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Live Demo
                    </a>
                  </div>
                )}

                {project.documentation && (
                  <div>
                    <a
                      href={project.documentation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Documentation
                    </a>
                  </div>
                )}
              </div>

              {/* Author Info */}
              {project.createdBy && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Created By</h3>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-primary-600 font-semibold text-sm">
                        {project.createdBy.name?.charAt(0)?.toUpperCase() ||
                          "U"}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {project.createdBy.name || "Unknown User"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Member since{" "}
                        {project.createdAt
                          ? new Date(project.createdAt).getFullYear()
                          : "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Purchase Section */}
              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-3xl font-bold text-primary-600">
                      ₹{project.price}
                    </span>
                    {project.originalPrice && (
                      <span className="ml-2 text-lg text-gray-500 line-through">
                        ₹{project.originalPrice}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handlePurchase}
                    disabled={!project.isActive}
                    className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {project.isActive
                      ? "Purchase Now"
                      : "Currently Unavailable"}
                  </button>
                </div>
                <p className="text-sm text-gray-600 text-center">
                  {project.isActive ? (
                    <>
                      Instant download after purchase • Lifetime updates •
                      Technical support
                    </>
                  ) : (
                    "This project is currently not available for purchase"
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Projects */}
        <div className="mt-8 text-center">
          <Link
            to="/projects"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to All Projects
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
