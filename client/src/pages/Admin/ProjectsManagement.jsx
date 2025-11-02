import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiService, apiUtils } from "../../utils/api";
import Loader from "../../components/UI/Loader";
import SearchBar from "../../components/Common/SearchBar";
import Modal from "../../components/UI/Modal";

const ProjectsManagement = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchQuery]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await apiService.projects.getAll();
      setProjects(response.projects || []);
    } catch (error) {
      apiUtils.handleError(error);
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
        project.category?.toLowerCase().includes(query)
    );
    setFilteredProjects(filtered);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleToggleActive = async (projectId, currentStatus) => {
    try {
      await apiService.projects.toggleActive(projectId);
      setProjects(
        projects.map((project) =>
          project._id === projectId
            ? { ...project, isActive: !currentStatus }
            : project
        )
      );
    } catch (error) {
      apiUtils.handleError(error);
    }
  };

  const handleToggleFeatured = async (projectId, currentStatus) => {
    try {
      await apiService.projects.toggleFeatured(projectId);
      setProjects(
        projects.map((project) =>
          project._id === projectId
            ? { ...project, isFeatured: !currentStatus }
            : project
        )
      );
    } catch (error) {
      apiUtils.handleError(error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;

    try {
      await apiService.projects.delete(projectId);
      setProjects(projects.filter((project) => project._id !== projectId));
    } catch (error) {
      apiUtils.handleError(error);
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      const response = await apiService.projects.create(projectData);
      setProjects([response.project, ...projects]);
      setIsCreateModalOpen(false);
    } catch (error) {
      apiUtils.handleError(error);
    }
  };

  const handleUpdateProject = async (projectId, projectData) => {
    try {
      const response = await apiService.projects.update(projectId, projectData);
      setProjects(
        projects.map((project) =>
          project._id === projectId ? response.project : project
        )
      );
      setIsModalOpen(false);
      setSelectedProject(null);
    } catch (error) {
      apiUtils.handleError(error);
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
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
        </div>

        {/* Search and Stats */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search projects by title, description, or category..."
              className="flex-1 max-w-md"
            />
            <div className="text-sm text-gray-600">
              Showing {filteredProjects.length} of {projects.length} projects
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project._id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="h-48 bg-gray-200">
                {project.images && project.images.length > 0 ? (
                  <img
                    src={`http://localhost:5000/uploads/${project.images[0]}`}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                    {project.title}
                  </h3>
                  <span className="text-2xl font-bold text-blue-600">
                    ${project.price}
                  </span>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">
                  {project.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {project.category}
                  </span>
                  <div className="flex space-x-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        project.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {project.isActive ? "Active" : "Inactive"}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        project.isFeatured
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {project.isFeatured ? "Featured" : "Regular"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      handleToggleActive(project._id, project.isActive)
                    }
                    className={`flex-1 px-3 py-2 text-xs rounded ${
                      project.isActive
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    } transition-colors`}
                  >
                    {project.isActive ? "Deactivate" : "Activate"}
                  </button>

                  <button
                    onClick={() =>
                      handleToggleFeatured(project._id, project.isFeatured)
                    }
                    className={`flex-1 px-3 py-2 text-xs rounded ${
                      project.isFeatured
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                    } transition-colors`}
                  >
                    {project.isFeatured ? "Unfeature" : "Feature"}
                  </button>

                  <button
                    onClick={() => {
                      setSelectedProject(project);
                      setIsModalOpen(true);
                    }}
                    className="flex-1 px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteProject(project._id)}
                    className="flex-1 px-3 py-2 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>

                <Link
                  to={`/projects/${project._id}`}
                  className="block w-full mt-3 text-center bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200 transition-colors text-xs"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-gray-500 text-lg">No projects found</div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Project
            </button>
          </div>
        )}

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

// Project Form Component (Reusable for Create and Edit)
const ProjectForm = ({ project, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: project?.title || "",
    description: project?.description || "",
    price: project?.price || "",
    category: project?.category || "",
    technologies: project?.technologies?.join(", ") || "",
    features: project?.features?.join(", ") || "",
    isActive: project?.isActive ?? true,
    isFeatured: project?.isFeatured ?? false,
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
      technologies: formData.technologies
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t),
      features: formData.features
        .split(",")
        .map((f) => f.trim())
        .filter((f) => f),
      images: images,
    };

    await onSubmit(submitData);
    setLoading(false);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
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
            step="0.01"
            min="0"
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
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
            placeholder="React, Node.js, MongoDB"
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Features
        </label>
        <input
          type="text"
          name="features"
          value={formData.features}
          onChange={handleChange}
          placeholder="Responsive Design, User Authentication, Payment Integration"
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Images
        </label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          Select multiple images for the project
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Active Project
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="isFeatured"
            checked={formData.isFeatured}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Featured Project
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
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

export default ProjectsManagement;
