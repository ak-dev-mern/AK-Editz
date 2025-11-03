import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "../../utils/api";

const Blogs = () => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: blogsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["blogs", filter, searchTerm],
    queryFn: () =>
      apiService.blogs.getAll({
        page: 1,
        limit: 12,
        category: filter !== "all" ? filter : undefined,
        search: searchTerm || undefined,
      }),
  });

  const blogs = blogsData?.blogs || blogsData || [];

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-blog.jpg";
    if (imagePath.startsWith("http")) return imagePath;

    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    if (imagePath.startsWith("/uploads/")) return `${baseUrl}${imagePath}`;
    return `${baseUrl}/uploads/${imagePath}`;
  };

  const filteredBlogs = blogs.filter((blog) => {
    const matchesCategory = filter === "all" || blog.category === filter;
    const matchesSearch =
      blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.content?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    "all",
    "web development",
    "mobile development",
    "programming",
    "tutorial",
    "other",
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full"></div>
        <p className="mt-4 text-gray-600 text-lg font-medium">
          Loading amazing blogs...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Oops! Something went wrong.
        </h2>
        <p className="text-gray-600">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Explore Our <span className="text-primary-600">Insights</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay ahead with the latest articles on coding, web development, and
            tech innovations.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
          <input
            type="text"
            placeholder="🔍 Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
          />
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-4 py-2 text-sm rounded-full font-medium capitalize transition-all duration-200 ${
                  filter === category
                    ? "bg-primary-600 text-white shadow-md scale-105"
                    : "bg-white text-gray-700 border hover:bg-gray-100"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Blogs Grid */}
        {filteredBlogs.length === 0 ? (
          <div className="text-center py-20">
            <img
              src="/empty-state.svg"
              alt="No blogs"
              className="w-48 mx-auto mb-6 opacity-80"
            />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No blogs found
            </h3>
            <p className="text-gray-500">
              Try adjusting your filters or search keywords.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredBlogs.map((blog) => (
              <Link
                key={blog._id || blog.id}
                to={`/blogs/${blog._id || blog.id}`}
                className="group relative bg-white shadow-md rounded-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative w-full h-56 overflow-hidden">
                  <img
                    src={getImageUrl(blog.coverImage)}
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => (e.target.src = "/default-blog.jpg")}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>
                  <span className="absolute bottom-3 left-3 bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {blog.category}
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-200 mb-2">
                    {blog.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {blog.excerpt || blog.content?.slice(0, 130)?.concat("...")}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {blog.tags?.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-gray-500 text-sm">
                    <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                    <span className="text-primary-600 font-medium">
                      Read More →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blogs;
