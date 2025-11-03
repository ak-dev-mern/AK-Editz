import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "../../utils/api";

const BlogDetail = () => {
  const { id } = useParams();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // ✅ Function to get correct image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return "/default-project.jpg";

  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  if (imagePath.includes("/")) {
    return `${baseUrl}${imagePath}`;
  } else {
    return `${baseUrl}/uploads/blogs/${imagePath}`;
  }
};

  const {
    data: blog,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["blog", id],
    queryFn: () => apiService.blogs.getById(id),
  });

  // ✅ Move useEffect AFTER blog is defined
  useEffect(() => {
    if (blog) {
      setImageError(false);
      setImageLoading(true);
    }
  }, [blog]);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading blog...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error ? "Error Loading Blog" : "Blog Not Found"}
          </h2>
          <p className="text-gray-600 mb-4">
            {error?.message || "The blog you're looking for doesn't exist."}
          </p>
          <Link
            to="/blogs"
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = getImageUrl(blog.coverImage);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Cover Image with Loading State */}
          <div className="relative w-full h-64 md:h-96 bg-gray-200">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            )}
            <img
              src={imageUrl}
              alt={blog.title}
              className={`w-full h-64 md:h-96 object-cover ${
                imageLoading ? "opacity-0" : "opacity-100"
              } transition-opacity duration-300`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </div>

          {/* Blog Content */}
          <div className="p-8">
            <div className="mb-6">
              <span className="bg-primary-100 text-primary-800 text-sm px-3 py-1 rounded-full capitalize">
                {blog.category}
              </span>
              <h1 className="text-4xl font-bold text-gray-900 mt-4 mb-4">
                {blog.title}
              </h1>

              <div className="flex items-center text-gray-600 mb-6 flex-wrap gap-4">
                <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span>{blog.readTime || 5} min read</span>
                <span>•</span>
                <span>{blog.views || 0} views</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {blog.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Blog Content */}
            <div className="prose max-w-none">
              {blog.content ? (
                <div
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              ) : (
                <p className="text-gray-600 italic">No content available.</p>
              )}
            </div>

            {/* Author Info */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-primary-600 font-semibold">
                    {blog.author?.name?.charAt(0)?.toUpperCase() || "A"}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {blog.author?.name || "Admin"}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Published on {new Date(blog.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Back to Blogs */}
        <div className="mt-8 text-center">
          <Link
            to="/blogs"
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
            Back to All Blogs
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
