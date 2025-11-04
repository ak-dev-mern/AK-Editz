import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { apiService, apiUtils } from "../../utils/api";
import Loader from "../../components/UI/Loader";
import Modal from "../../components/UI/Modal";
import {
  Download,
  ExternalLink,
  FileText,
  Code2,
  CheckCircle2,
} from "lucide-react";

const UserProfile = () => {
  const { user: authUser, updateProfile } = useAuth();
  const [user, setUser] = useState(null);
  const [purchasedProjects, setPurchasedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const [userResponse, projectsResponse] = await Promise.all([
          apiService.auth.getCurrentUser(),
          apiService.payments.getPurchasedProjects(),
        ]);

        setUser(userResponse.user);
        setPurchasedProjects(extractPurchasedProjects(projectsResponse));
      } catch (err) {
        setError(err.message);
        apiUtils.handleError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const extractPurchasedProjects = (response) => {
    if (!response) return [];

    // Handle different response structures
    if (Array.isArray(response)) {
      return response;
    } else if (Array.isArray(response.projects)) {
      return response.projects;
    } else if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.success && Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  };

  const handleUpdateProfile = async (profileData) => {
    try {
      setUpdateLoading(true);
      const response = await apiService.auth.updateProfile(profileData);
      setUser(response.user);
      // Update auth context
      updateProfile(profileData);
      setIsEditModalOpen(false);
      // Show success message
      if (window.toast) {
        window.toast.success("Profile updated successfully!");
      }
    } catch (err) {
      apiUtils.handleError(err, (error) => {
        if (apiUtils.isUnauthorized(error)) {
          window.location.href = "/login";
        }
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleChangePassword = async (passwordData) => {
    try {
      setUpdateLoading(true);
      await apiService.auth.changePassword(passwordData);
      setIsPasswordModalOpen(false);
      if (window.toast) {
        window.toast.success("Password changed successfully!");
      }
    } catch (err) {
      apiUtils.handleError(err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const downloadProject = async (projectId, projectTitle) => {
    try {
      const response = await apiService.projects.download(projectId);

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${projectTitle}-source-code.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      if (window.toast) {
        window.toast.success("Download started!");
      }
    } catch (error) {
      console.error("Download error:", error);
      if (window.toast) {
        window.toast.error("Error downloading project. Please try again.");
      }
    }
  };

  const getImageUrl = (path) => {
    if (!path) return "/default-project.jpg";
    if (path.startsWith("http")) return path;

    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    return path.startsWith("/uploads/")
      ? `${baseUrl}${path}`
      : `${baseUrl}/uploads/${path}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">Error: {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-lg mb-4">User not found</div>
          <button
            onClick={() => (window.location.href = "/login")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
          <p className="text-gray-600 mt-2">
            Manage your account settings and purchased projects
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {user.name}
                </h2>
                <p className="text-gray-600">{user.email}</p>
                <div className="mt-2">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Change Password
                </button>
              </div>

              {/* Account Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Account Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Projects Purchased</span>
                    <span className="font-semibold text-gray-900">
                      {purchasedProjects.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Purchased Projects */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900">
                  Purchased Projects
                </h3>
                <p className="text-gray-600 mt-2">
                  Access all your purchased projects with full source code and
                  documentation
                </p>
              </div>

              <div className="p-6">
                {projectsLoading ? (
                  <div className="text-center py-12">
                    <Loader size="medium" />
                    <p className="text-gray-600 mt-4">
                      Loading your projects...
                    </p>
                  </div>
                ) : purchasedProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {purchasedProjects.map((project) => (
                      <div
                        key={project._id}
                        className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all bg-white"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <img
                              src={getImageUrl(project.images?.[0])}
                              alt={project.title}
                              className="w-16 h-16 object-cover rounded-lg"
                              onError={(e) =>
                                (e.target.src = "/default-project.jpg")
                              }
                            />
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">
                                {project.title}
                              </h4>
                              <p className="text-gray-600 text-sm line-clamp-2">
                                {project.shortDescription ||
                                  project.description}
                              </p>
                            </div>
                          </div>
                          <span className="flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            <CheckCircle2 size={12} />
                            Purchased
                          </span>
                        </div>

                        {project.technologies &&
                          project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {project.technologies.slice(0, 3).map((tech) => (
                                <span
                                  key={tech}
                                  className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                                >
                                  {tech}
                                </span>
                              ))}
                              {project.technologies.length > 3 && (
                                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                                  +{project.technologies.length - 3} more
                                </span>
                              )}
                            </div>
                          )}

                        {/* Project Resources */}
                        <div className="space-y-3">
                          {/* Download Source Code */}
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Code2 size={18} className="text-blue-600" />
                              <span className="font-medium text-gray-900 text-sm">
                                Source Code
                              </span>
                            </div>
                            <button
                              onClick={() =>
                                downloadProject(project._id, project.title)
                              }
                              className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                            >
                              <Download size={14} />
                              Download
                            </button>
                          </div>

                          {/* Documentation */}
                          {project.documentation && (
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <FileText
                                  size={18}
                                  className="text-green-600"
                                />
                                <span className="font-medium text-gray-900 text-sm">
                                  Documentation
                                </span>
                              </div>
                              <a
                                href={project.documentation}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                              >
                                <ExternalLink size={14} />
                                View Docs
                              </a>
                            </div>
                          )}

                          {/* Live Demo */}
                          {project.demoUrl && (
                            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <ExternalLink
                                  size={18}
                                  className="text-purple-600"
                                />
                                <span className="font-medium text-gray-900 text-sm">
                                  Live Demo
                                </span>
                              </div>
                              <a
                                href={project.demoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-purple-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors"
                              >
                                <ExternalLink size={14} />
                                View Demo
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-3 pt-4 mt-4 border-t border-gray-200">
                          <a
                            href={`/projects/${project._id}`}
                            className="flex-1 text-center border border-primary-600 text-primary-600 px-4 py-2 rounded-lg text-sm hover:bg-primary-50 transition-colors"
                          >
                            View Details
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">📦</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No projects purchased yet
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Start your learning journey by purchasing your first
                      project. Get full access to source code, documentation,
                      and lifetime updates.
                    </p>
                    <a
                      href="/projects"
                      className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
                    >
                      Browse Projects
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-white rounded-lg shadow mt-8">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  Account Information
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <p className="text-gray-900">{user.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Role
                    </label>
                    <p className="text-gray-900 capitalize">{user.role}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Since
                    </label>
                    <p className="text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Profile"
        >
          <EditProfileForm
            user={user}
            onSubmit={handleUpdateProfile}
            onCancel={() => setIsEditModalOpen(false)}
            loading={updateLoading}
          />
        </Modal>

        {/* Change Password Modal */}
        <Modal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          title="Change Password"
        >
          <ChangePasswordForm
            onSubmit={handleChangePassword}
            onCancel={() => setIsPasswordModalOpen(false)}
            loading={updateLoading}
          />
        </Modal>
      </div>
    </div>
  );
};

// Edit Profile Form Component (unchanged)
const EditProfileForm = ({ user, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </div>
    </form>
  );
};

// Change Password Form Component (unchanged)
const ChangePasswordForm = ({ onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSubmit({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Current Password
        </label>
        <input
          type="password"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleChange}
          className={`mt-1 block w-full border ${
            errors.currentPassword ? "border-red-300" : "border-gray-300"
          } rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          required
        />
        {errors.currentPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          New Password
        </label>
        <input
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          className={`mt-1 block w-full border ${
            errors.newPassword ? "border-red-300" : "border-gray-300"
          } rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          required
        />
        {errors.newPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Confirm New Password
        </label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={`mt-1 block w-full border ${
            errors.confirmPassword ? "border-red-300" : "border-gray-300"
          } rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          required
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Changing..." : "Change Password"}
        </button>
      </div>
    </form>
  );
};

export default UserProfile;
