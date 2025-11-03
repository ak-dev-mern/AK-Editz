import React, { useState, useEffect } from "react";
import { apiService, apiUtils } from "../../utils/api";
import Loader from "../../components/UI/Loader";
import SearchBar from "../../components/Common/SearchBar";
import Modal from "../../components/UI/Modal";
import { useAuth } from "../../contexts/AuthContext";

const BlogsManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [error, setError] = useState("");

  const { user } = useAuth();

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    filterBlogs();
  }, [blogs, searchQuery]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiService.blogs.getAdminAll(
        {},
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      setBlogs(response.blogs || []);
    } catch (error) {
      const errorMessage = apiUtils.handleError(error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filterBlogs = () => {
    if (!searchQuery) {
      setFilteredBlogs(blogs);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = blogs.filter(
      (blog) =>
        blog.title?.toLowerCase().includes(query) ||
        blog.excerpt?.toLowerCase().includes(query) ||
        blog.category?.toLowerCase().includes(query)
    );
    setFilteredBlogs(filtered);
  };

  const handleSearch = (query) => setSearchQuery(query);

  const handleTogglePublish = async (blogId, currentStatus) => {
    try {
      setError("");
      await apiService.blogs.togglePublish(
        blogId,
        {},
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      setBlogs(
        blogs.map((blog) =>
          blog._id === blogId ? { ...blog, isPublished: !currentStatus } : blog
        )
      );
    } catch (error) {
      const errorMessage = apiUtils.handleError(error);
      setError(errorMessage);
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog post?"))
      return;
    try {
      setError("");
      await apiService.blogs.delete(
        blogId,
        {},
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      setBlogs(blogs.filter((blog) => blog._id !== blogId));
    } catch (error) {
      const errorMessage = apiUtils.handleError(error);
      setError(errorMessage);
    }
  };

  const handleCreateBlog = async (formData) => {
    try {
      setError("");

      console.log("Creating blog with FormData:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await apiService.blogs.create(formData, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      setBlogs([response.blog, ...blogs]);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Create blog error details:", error);
      const errorMessage = error.message || "Failed to create blog";
      setError(errorMessage);
      throw error;
    }
  };

  const handleUpdateBlog = async (blogId, formData) => {
    try {
      setError("");

      console.log("Updating blog with FormData:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await apiService.blogs.update(blogId, formData, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      setBlogs(blogs.map((b) => (b._id === blogId ? response.blog : b)));
      setIsModalOpen(false);
      setSelectedBlog(null);
    } catch (error) {
      console.error("Update blog error details:", error);
      const errorMessage = error.message || "Failed to update blog";
      setError(errorMessage);
      throw error;
    }
  };

  // Helper function to get correct image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-blog.jpg";

    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

    if (imagePath.startsWith("/uploads/")) {
      return `${baseUrl}${imagePath}`;
    } else {
      return `${baseUrl}/uploads/blogs/${imagePath}`;
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
              Blogs Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage all blog posts in the system
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Blog Post
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
            placeholder="Search blogs by title, excerpt, or category..."
            className="flex-1 max-w-md"
          />
          <div className="text-sm text-gray-600">
            Showing {filteredBlogs.length} of {blogs.length} blog posts
          </div>
        </div>

        {/* Blogs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blog Post
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
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
                {filteredBlogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {blog.coverImage ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={getImageUrl(blog.coverImage)}
                              alt={blog.title}
                              onError={(e) => {
                                e.target.src = "/default-blog.jpg";
                              }}
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
                            {blog.title}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {blog.excerpt}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {blog.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          blog.isPublished
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {blog.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {blog.views || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-4">
                        <button
                          onClick={() =>
                            handleTogglePublish(blog._id, blog.isPublished)
                          }
                          className={
                            blog.isPublished
                              ? "text-yellow-600 hover:text-yellow-900"
                              : "text-green-600 hover:text-green-900"
                          }
                        >
                          {blog.isPublished ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBlog(blog);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBlog(blog._id)}
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

          {filteredBlogs.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No blog posts found
            </div>
          )}
        </div>

        {/* Edit Blog Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBlog(null);
          }}
          title="Edit Blog Post"
          size="large"
        >
          {selectedBlog && (
            <BlogForm
              blog={selectedBlog}
              onSubmit={(data) => handleUpdateBlog(selectedBlog._id, data)}
              onCancel={() => {
                setIsModalOpen(false);
                setSelectedBlog(null);
              }}
            />
          )}
        </Modal>

        {/* Create Blog Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Blog Post"
          size="large"
        >
          <BlogForm
            onSubmit={handleCreateBlog}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </Modal>
      </div>
    </div>
  );
};

// Blog Form Component
const BlogForm = ({ blog, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: blog?.title || "",
    excerpt: blog?.excerpt || "",
    content: blog?.content || "",
    category: blog?.category || "",
    tags: blog?.tags?.join(", ") || "",
    isPublished: blog?.isPublished ?? true,
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError("");

    try {
      const formDataToSend = new FormData();

      // Append all fields
      formDataToSend.append("title", formData.title);
      formDataToSend.append("excerpt", formData.excerpt);
      formDataToSend.append("content", formData.content);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("tags", formData.tags);
      formDataToSend.append("isPublished", formData.isPublished);

      // Handle image - make sure this matches your backend expectation
      if (image) {
        formDataToSend.append("coverImage", image);
      }

      console.log("FormData being sent:");
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }

      await onSubmit(formDataToSend);
    } catch (err) {
      setFormError(err.message || "Failed to save blog post");
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
    setImage(e.target.files[0]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {formError}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
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
          Excerpt
        </label>
        <textarea
          name="excerpt"
          value={formData.excerpt}
          onChange={handleChange}
          rows="3"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Content
        </label>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          rows="10"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
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
            required
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          />
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
            placeholder="web development, javascript, react"
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Separate tags with commas
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Featured Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
        />
        {blog?.coverImage && !image && (
          <p className="mt-1 text-sm text-gray-500">
            Current image: {blog.coverImage}
          </p>
        )}
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="isPublished"
          checked={formData.isPublished}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label className="ml-2 text-sm text-gray-900">
          Publish immediately
        </label>
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
            : blog
            ? "Update Blog Post"
            : "Create Blog Post"}
        </button>
      </div>
    </form>
  );
};

export default BlogsManagement;
