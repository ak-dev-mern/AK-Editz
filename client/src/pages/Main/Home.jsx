import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiService, apiUtils } from "../../utils/api";
import Loader from "../../components/UI/Loader";
import NewsletterSubscription from "../../components/Newsletter/NewsletterSubscription";

const Home = () => {
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [stats, setStats] = useState({ projects: 0, blogs: 0, users: 0 });
  const [testimonials, setTestimonials] = useState([]);
  const [technologies, setTechnologies] = useState([]);
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
        projects:
          projectStatsRes.stats?.totalProjects ||
          projectStatsRes.totalProjects ||
          0,
        blogs: blogStatsRes.stats?.totalBlogs || blogStatsRes.totalBlogs || 0,
        users: userStatsRes.stats?.totalUsers || userStatsRes.totalUsers || 0,
      });

      // set featured projects & latest blogs
      setFeaturedProjects(
        projectStatsRes.stats?.recentProjects ||
          projectStatsRes.recentProjects ||
          []
      );
      setFeaturedBlogs(
        blogStatsRes.stats?.recentBlogs || blogStatsRes.recentBlogs || []
      );

      // Mock testimonials and technologies (you can replace with API calls)
      setTestimonials([
        {
          id: 1,
          name: "Sarah Johnson",
          role: "Product Manager",
          company: "TechCorp",
          content:
            "The projects and insights here have transformed our development process. Highly recommended!",
          avatar: "/avatars/1.jpg",
          rating: 5,
        },
        {
          id: 2,
          name: "Mike Chen",
          role: "Full Stack Developer",
          company: "StartUpXYZ",
          content:
            "Found exactly what I needed to accelerate my learning curve. The community is amazing!",
          avatar: "/avatars/2.jpg",
          rating: 5,
        },
        {
          id: 3,
          name: "Emily Davis",
          role: "UI/UX Designer",
          company: "DesignStudio",
          content:
            "The quality of work and depth of articles here is exceptional. My go-to resource!",
          avatar: "/avatars/3.jpg",
          rating: 4,
        },
      ]);

      setTechnologies([
        { name: "React", icon: "⚛️", category: "Frontend" },
        { name: "Node.js", icon: "🟢", category: "Backend" },
        { name: "Python", icon: "🐍", category: "Backend" },
        { name: "TypeScript", icon: "📘", category: "Frontend" },
        { name: "MongoDB", icon: "🍃", category: "Database" },
        { name: "AWS", icon: "☁️", category: "Cloud" },
        { name: "Docker", icon: "🐳", category: "DevOps" },
        { name: "GraphQL", icon: "📊", category: "API" },
      ]);
    } catch (error) {
      apiUtils.handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={i < rating ? "text-yellow-400" : "text-gray-300"}
      >
        ★
      </span>
    ));
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

      {/* Why Choose Us Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-3">
              Why Choose Our Platform?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide everything you need to succeed in the digital world
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "🚀",
                title: "Premium Quality",
                description:
                  "Hand-picked projects and content curated by experts",
              },
              {
                icon: "💡",
                title: "Latest Trends",
                description:
                  "Stay updated with cutting-edge technologies and methodologies",
              },
              {
                icon: "👥",
                title: "Active Community",
                description: "Connect with like-minded developers and creators",
              },
              {
                icon: "🛠️",
                title: "Practical Learning",
                description: "Real-world projects and actionable insights",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 group hover:transform hover:-translate-y-2 transition-all duration-300"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
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
            {featuredProjects.length > 0 ? (
              featuredProjects.map((project) => (
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
                    <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      ${project.price}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                      {project.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 capitalize">
                        {project.category}
                      </span>
                      <Link
                        to={`/projects/${project._id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <div className="text-6xl mb-4">🚀</div>
                <h3 className="text-2xl font-semibold text-gray-600 mb-2">
                  No Projects Yet
                </h3>
                <p className="text-gray-500">
                  Be the first to showcase your amazing work!
                </p>
              </div>
            )}
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

      {/* Technologies We Work With */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-3">
              Technologies We Love
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore projects built with modern technologies and frameworks
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {technologies.map((tech, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-6 text-center hover:bg-blue-50 hover:border-blue-200 border-2 border-transparent transition-all duration-300 group"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {tech.icon}
                </div>
                <h3 className="font-semibold text-gray-900">{tech.name}</h3>
                <span className="text-xs text-gray-500">{tech.category}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gradient-to-r from-purple-50 to-blue-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-3">
              What Our Community Says
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied developers and creators
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  <div className="flex items-center space-x-2">
                    {renderStars(testimonial.rating)}
                  </div>
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.avatar ? (
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      testimonial.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
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
            {featuredBlogs.length > 0 ? (
              featuredBlogs.map((blog) => (
                <div
                  key={blog._id}
                  className="bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                >
                  <div className="h-48 bg-gray-200">
                    <img
                      src={getImageUrl(blog.coverImage)}
                      alt={blog.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <span>
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </span>
                      <span className="mx-2">•</span>
                      <span className="capitalize">{blog.category}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {blog.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {blog.excerpt || blog.content?.substring(0, 150) + "..."}
                    </p>
                    <Link
                      to={`/blogs/${blog._id}`}
                      className="text-blue-600 hover:text-blue-800 font-semibold flex items-center"
                    >
                      Read More
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-2xl font-semibold text-gray-600 mb-2">
                  No Articles Yet
                </h3>
                <p className="text-gray-500">
                  Stay tuned for amazing content coming soon!
                </p>
              </div>
            )}
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

      {/* Newsletter Section */}
      <NewsletterSubscription />
      {/* CTA Section */}
      <section className="bg-gradient-to-r from-gray-900 to-blue-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-extrabold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg mb-10 text-gray-300 max-w-2xl mx-auto">
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
            <Link
              to="/about"
              className="border-2 border-gray-400 px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
