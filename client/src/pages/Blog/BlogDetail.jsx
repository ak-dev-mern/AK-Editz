import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { apiService } from "../../utils/api";
import { CalendarDays, Clock, Eye, ArrowLeft, Tag } from "lucide-react";

const BlogDetail = () => {
  const { id } = useParams();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-blog.jpg";
    if (imagePath.startsWith("http")) return imagePath;

    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    if (imagePath.startsWith("/uploads/")) return `${baseUrl}${imagePath}`;
    if (imagePath.startsWith("uploads/")) return `${baseUrl}/${imagePath}`;
    return `${baseUrl}/uploads/blogs/${imagePath}`;
  };

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["blog", id],
    queryFn: () => apiService.blogs.getById(id),
  });

  const blog = response?.blog || response;
  const imageUrl = getImageUrl(blog?.coverImage);

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

  const handleImageError = (e) => {
    console.log("Image failed to load:", e.target.src);
    setImageLoading(false);
    setImageError(true);
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  // Error or not found
  if (error || !blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
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
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pb-16">
      {/* Hero Image Section */}
      <div className="relative h-[50vh] w-full overflow-hidden rounded-b-3xl shadow-xl">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <img
          src={imageUrl}
          alt={blog.title}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`w-full h-full object-cover transition-all duration-700 ${
            imageLoading ? "opacity-0 scale-105" : "opacity-100 scale-100"
          }`}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-center text-white px-4">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold mb-4 leading-tight drop-shadow-lg"
          >
            {blog.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center flex-wrap gap-4 text-sm text-gray-200"
          >
            <span className="flex items-center gap-2">
              <CalendarDays size={16} />{" "}
              {new Date(blog.createdAt).toLocaleDateString()}
            </span>
            <span>•</span>
            <span className="flex items-center gap-2">
              <Clock size={16} /> {blog.readTime || 5} min read
            </span>
            <span>•</span>
            <span className="flex items-center gap-2">
              <Eye size={16} /> {blog.views || 0} views
            </span>
          </motion.div>
        </div>
      </div>

      {/* Article Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="max-w-4xl mx-auto mt-12 px-6 md:px-10"
      >
        <div className="bg-white/80 backdrop-blur-md shadow-2xl rounded-3xl p-8 md:p-12 border border-gray-100">
          {/* Category & Tags */}
          <div className="mb-6">
            <span className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-sm">
              {blog.category}
            </span>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
            {blog.content ? (
              <div dangerouslySetInnerHTML={{ __html: blog.content }} />
            ) : (
              <p className="text-gray-500 italic">No content available.</p>
            )}
          </div>

          {/* Tags */}
          {blog.tags?.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {blog.tags.map((tag, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium"
                >
                  <Tag size={14} /> {tag}
                </span>
              ))}
            </div>
          )}

          {/* Author Info */}
          <div className="mt-12 pt-8 border-t border-gray-200 flex items-center">
            <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center mr-4">
              <span className="text-primary-600 font-bold text-lg">
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

        {/* Back Button */}
        <div className="mt-12 text-center">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold shadow-lg hover:shadow-xl transition-transform hover:-translate-y-1"
          >
            <ArrowLeft size={18} /> Back to All Blogs
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default BlogDetail;
