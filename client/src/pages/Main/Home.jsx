import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiService, apiUtils } from "../../utils/api";
import Loader from "../../components/UI/Loader";

const Home = () => {
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [stats, setStats] = useState({ projects: 0, blogs: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  // ✅ Function to get proper image URL
  const getImageUrl = (path) => {
    if (!path) return "/default-project.jpg"; // fallback image
    if (path.startsWith("http")) return path;

    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    return path.startsWith("/uploads/")
      ? `${baseUrl}${path}`
      : `${baseUrl}/uploads/${path}`;
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);

      const [projectStatsRes, blogStatsRes, userStatsRes] = await Promise.all([
        apiService.projects.getStats(),
        apiService.blogs.getStats(),
        apiService.users.getStats(),
      ]);

      // set stats
      setStats({
        projects: projectStatsRes.stats.totalProjects || 0,
        blogs: blogStatsRes.stats.totalBlogs || 0,
        users: userStatsRes.stats.totalUsers || 0,
      });

      // set featured projects & latest blogs
      setFeaturedProjects(projectStatsRes.stats.recentProjects || []);
      setFeaturedBlogs(blogStatsRes.stats.recentBlogs || []);
    } catch (error) {
      apiUtils.handleError(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
        <Loader size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-800">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10 bg-cover"></div>
        <div className="relative container mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-lg animate-fade-in">
            Build Stunning Digital Experiences
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-2xl mx-auto">
            Discover premium projects, read expert insights, and connect with a
            global creative community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/projects"
              className="bg-white text-blue-700 px-8 py-3 rounded-xl font-semibold shadow hover:scale-105 transition-transform duration-300"
            >
              Explore Projects
            </Link>
            <Link
              to="/blog"
              className="border-2 border-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-blue-700 transition-all"
            >
              Read Blog
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-white via-gray-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            {[
              {
                label: "Projects Completed",
                value: stats.projects,
                color: "blue",
              },
              { label: "Blog Articles", value: stats.blogs, color: "purple" },
              { label: "Active Users", value: stats.users, color: "green" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-100"
              >
                <div
                  className={`text-5xl font-extrabold text-${item.color}-600 mb-3`}
                >
                  {item.value || 0}+
                </div>
                <p className="text-gray-600 font-medium tracking-wide">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-3">
              Featured Projects
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our curated collection of high-quality digital works.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {featuredProjects.map((project) => (
              <div
                key={project._id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
              >
                <div className="h-56 bg-gray-200 relative group">
                  <img
                    src={getImageUrl(project.images?.[0])}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-blue-600">
                      ${project.price}
                    </span>
                    <Link
                      to={`/projects/${project._id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/projects"
              className="inline-block bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow hover:scale-105 transition-transform"
            >
              View All Projects
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Insights */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-3">
              Latest Insights
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Stay informed with our latest guides, tips, and industry updates.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {featuredBlogs.map((blog) => (
              <div
                key={blog._id}
                className="bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="h-48 bg-gray-200">
                  <img
                    src={getImageUrl(blog.coverImage)}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                    <span className="mx-2">•</span>
                    <span>{blog.category}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {blog.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {blog.excerpt}
                  </p>
                  <Link
                    to={`/blogs/${blog._id}`}
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Read More →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/blogs"
              className="inline-block bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow hover:bg-purple-700 transition-all"
            >
              View All Articles
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-extrabold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg mb-10 text-blue-100 max-w-2xl mx-auto">
            Join thousands of creators today and start exploring world-class
            digital experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-blue-700 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all"
            >
              Sign Up Free
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-blue-700 transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
