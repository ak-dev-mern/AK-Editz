import React, { useState, useEffect } from "react";
import { apiService, apiUtils } from "../../utils/api";
import Loader from "../../components/UI/Loader";
import SearchBar from "../../components/Common/SearchBar";
import Modal from "../../components/UI/Modal";
import { useAuth } from "../../contexts/AuthContext";

const ProjectsManagement = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [error, setError] = useState("");

  const { user } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchQuery]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiService.projects.getAdminAll({
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      setProjects(response.projects || response || []);
    } catch (error) {
      const errorMessage = apiUtils.handleError(error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    if (!searchQuery) {
      setFilteredProjects(projects);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = projects.filter(
      (project) =>
        project.title?.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query) ||
        project.category?.toLowerCase().includes(query) ||
        project.technologies?.some((tech) => tech.toLowerCase().includes(query))
    );
    setFilteredProjects(filtered);
  };

  const handleSearch = (query) => setSearchQuery(query);

  const handleToggleActive = async (projectId, currentStatus) => {
    try {
      setError("");
      await apiService.projects.toggleActive(
        projectId,
        {},
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      setProjects(
        projects.map((project) =>
          project._id === projectId
            ? { ...project, isActive: !currentStatus }
            : project
        )
      );
    } catch (error) {
      const errorMessage = apiUtils.handleError(error);
      setError(errorMessage);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;
    try {
      setError("");
      await apiService.projects.delete(
        projectId,
        {},
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      setProjects(projects.filter((project) => project._id !== projectId));
    } catch (error) {
      const errorMessage = apiUtils.handleError(error);
      setError(errorMessage);
    }
  };

  const handleCreateProject = async (formData) => {
    try {
      setError("");

      console.log("Creating project with data:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await apiService.projects.create(formData, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      setProjects([response.project, ...projects]);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Create project error:", error);
      const errorMessage = apiUtils.handleError(error);
      setError(errorMessage);
      throw error;
    }
  };

  const handleUpdateProject = async (projectId, formData) => {
    try {
      setError("");

      console.log("Updating project with data:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await apiService.projects.update(projectId, formData, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      setProjects(
        projects.map((p) => (p._id === projectId ? response.project : p))
      );
      setIsModalOpen(false);
      setSelectedProject(null);
    } catch (error) {
      console.error("Update project error:", error);
      const errorMessage = apiUtils.handleError(error);
      setError(errorMessage);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Projects Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage all projects in the system
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Project
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search projects by title, description, category, or technologies..."
            className="flex-1 max-w-md"
          />
          <div className="text-sm text-gray-600">
            Showing {filteredProjects.length} of {projects.length} projects
          </div>
        </div>

        {/* Projects Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Technologies
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProjects.map((project) => (
                  <tr key={project._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {project.images && project.images.length > 0 ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={getImageUrl(project.images[0])}
                              alt={project.title}
                            />
                          ) : (
                            <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-gray-400 text-sm">
                                No Image
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">
                            {project.title}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {project.shortDescription}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                        {project.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${project.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          project.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {project.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {project.technologies
                          ?.slice(0, 3)
                          .map((tech, index) => (
                            <span
                              key={index}
                              className="inline-flex px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700"
                            >
                              {tech}
                            </span>
                          ))}
                        {project.technologies?.length > 3 && (
                          <span className="inline-flex px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                            +{project.technologies.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-4">
                        <button
                          onClick={() =>
                            handleToggleActive(project._id, project.isActive)
                          }
                          className={
                            project.isActive
                              ? "text-yellow-600 hover:text-yellow-900"
                              : "text-green-600 hover:text-green-900"
                          }
                        >
                          {project.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProject(project);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No projects found
            </div>
          )}
        </div>

        {/* Edit Project Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProject(null);
          }}
          title="Edit Project"
          size="large"
        >
          {selectedProject && (
            <ProjectForm
              project={selectedProject}
              onSubmit={(data) =>
                handleUpdateProject(selectedProject._id, data)
              }
              onCancel={() => {
                setIsModalOpen(false);
                setSelectedProject(null);
              }}
            />
          )}
        </Modal>

        {/* Create Project Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Project"
          size="large"
        >
          <ProjectForm
            onSubmit={handleCreateProject}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </Modal>
      </div>
    </div>
  );
};

// Project Form Component
const ProjectForm = ({ project, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: project?.title || "",
    description: project?.description || "",
    shortDescription: project?.shortDescription || "",
    price: project?.price || "",
    category: project?.category || "web",
    technologies: project?.technologies?.join(", ") || "",
    features: project?.features?.join(", ") || "",
    tags: project?.tags?.join(", ") || "",
    sourceCode: project?.sourceCode || "",
    demoUrl: project?.demoUrl || "",
    documentation: project?.documentation || "",
    isActive: project?.isActive ?? true,
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError("");

    try {
      const formDataToSend = new FormData();

      // Append all fields
      Object.keys(formData).forEach((key) => {
        if (key === "technologies" || key === "features" || key === "tags") {
          // Convert comma-separated strings to arrays
          const arrayValue = formData[key]
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item);
          formDataToSend.append(key, JSON.stringify(arrayValue));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Handle multiple images
      images.forEach((image) => {
        formDataToSend.append("images", image);
      });

      console.log("FormData contents:");
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }

      await onSubmit(formDataToSend);
    } catch (err) {
      setFormError(err.message || "Failed to save project");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const categories = ["web", "mobile", "desktop", "game", "other"];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price ($)
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Short Description
        </label>
        <textarea
          name="shortDescription"
          value={formData.shortDescription}
          onChange={handleChange}
          rows="2"
          maxLength="150"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          placeholder="Brief description (max 150 characters)"
        />
        <p className="mt-1 text-sm text-gray-500">
          {formData.shortDescription.length}/150 characters
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Full Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Technologies
          </label>
          <input
            type="text"
            name="technologies"
            value={formData.technologies}
            onChange={handleChange}
            placeholder="React, Node.js, MongoDB, etc."
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">Separate with commas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Features
          </label>
          <input
            type="text"
            name="features"
            value={formData.features}
            onChange={handleChange}
            placeholder="User authentication, Payment processing, etc."
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">Separate with commas</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tags
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="web-app, responsive, modern, etc."
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">Separate with commas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Source Code URL
          </label>
          <input
            type="url"
            name="sourceCode"
            value={formData.sourceCode}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Demo URL
          </label>
          <input
            type="url"
            name="demoUrl"
            value={formData.demoUrl}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Documentation URL
          </label>
          <input
            type="url"
            name="documentation"
            value={formData.documentation}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Project Images
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          Select multiple images for your project
        </p>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="isActive"
          checked={formData.isActive}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label className="ml-2 text-sm text-gray-900">Active project</label>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : project
            ? "Update Project"
            : "Create Project"}
        </button>
      </div>
    </form>
  );
};

// Helper function to get image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return "/default-project.jpg";

  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  if (imagePath.includes("/")) {
    return `${baseUrl}${imagePath}`;
  } else {
    return `${baseUrl}/uploads/projects/${imagePath}`;
  }
};

export default ProjectsManagement;
