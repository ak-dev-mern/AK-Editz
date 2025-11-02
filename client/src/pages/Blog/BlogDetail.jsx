import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const BlogDetail = () => {
  const { id } = useParams();

  const { data: blog, isLoading } = useQuery({
    queryKey: ["blog", id],
    queryFn: () => axios.get(`/api/blogs/${id}`).then((res) => res.data),
  });

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

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Blog Not Found
          </h2>
          <Link to="/blogs" className="text-primary-600 hover:text-primary-700">
            Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Cover Image */}
          <img
            src={blog.coverImage || "/default-blog.jpg"}
            alt={blog.title}
            className="w-full h-64 md:h-96 object-cover"
          />

          {/* Blog Content */}
          <div className="p-8">
            <div className="mb-6">
              <span className="bg-primary-100 text-primary-800 text-sm px-3 py-1 rounded-full capitalize">
                {blog.category}
              </span>
              <h1 className="text-4xl font-bold text-gray-900 mt-4 mb-4">
                {blog.title}
              </h1>

              <div className="flex items-center text-gray-600 mb-6">
                <span className="mr-4">
                  {new Date(blog.createdAt).toLocaleDateString()}
                </span>
                <span>•</span>
                <span className="mx-4">{blog.readTime} min read</span>
                <span>•</span>
                <span className="ml-4">{blog.views} views</span>
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
              <div
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
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
