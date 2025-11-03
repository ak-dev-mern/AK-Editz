import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiService } from "../../utils/api";

// Helper function for images
const getImageUrl = (imagePath) => {
  if (!imagePath) return "/default-project.jpg";

  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  if (imagePath.startsWith("/uploads/")) {
    return `${baseUrl}${imagePath}`;
  } else {
    return `${baseUrl}/uploads/projects/${imagePath}`;
  }
};

const categories = [
  { name: "All", icon: "📁", count: 0 },
  { name: "Web", icon: "🌐", count: 0 },
  { name: "Mobile", icon: "📱", count: 0 },
  { name: "Desktop", icon: "💻", count: 0 },
  { name: "Game", icon: "🎮", count: 0 },
  { name: "Other", icon: "🔧", count: 0 },
];

const Portfolio = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalProjects: 0, featuredCount: 0 });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await apiService.projects.getAll();
      const projectsData = response.projects || response || [];
      setProjects(projectsData);
      setFilteredProjects(projectsData);

      // Calculate category counts
      const categoryCounts = {
        ...categories.reduce((acc, cat) => ({ ...acc, [cat.name]: 0 }), {}),
      };
      projectsData.forEach((project) => {
        const category =
          project.category?.charAt(0).toUpperCase() +
            project.category?.slice(1) || "Other";
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        categoryCounts["All"]++;
      });

      // Update categories with counts
      categories.forEach((cat) => {
        cat.count = categoryCounts[cat.name] || 0;
      });

      setStats({
        totalProjects: projectsData.length,
        featuredCount: projectsData.filter((p) => p.isFeatured).length,
      });
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = (category) => {
    setSelectedCategory(category);
    if (category === "All") {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(
        projects.filter(
          (p) => p.category?.toLowerCase() === category.toLowerCase()
        )
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading amazing projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Personal Introduction Section */}
      <section className="relative bg-white py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Text Content */}
            <div className="lg:w-1/2 text-center lg:text-left">
              <div className="inline-block bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                👋 Hello, I'm
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">
                Ajith <span className="text-blue-600">Kumar</span>
              </h1>
              <h2 className="text-2xl md:text-3xl text-gray-600 mb-6 font-medium">
                Full Stack Developer & UI/UX Designer
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                I create digital experiences that blend beautiful design with
                powerful functionality. With over 5 years of expertise in modern
                web technologies, I help businesses transform their ideas into
                scalable, user-friendly applications.
              </p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                  <span className="text-blue-600">📍</span>
                  <span className="text-gray-700">Pudukkottai, India</span>
                </div>
                <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
                  <span className="text-green-600">💼</span>
                  <span className="text-gray-700">Available for Freelance</span>
                </div>
                <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-lg">
                  <span className="text-purple-600">⭐</span>
                  <span className="text-gray-700">3+ Years Experience</span>
                </div>
              </div>
            </div>

            {/* Photo Section */}
            <div className="lg:w-1/2 flex justify-center">
              <div className="relative">
                {/* Main Photo */}
                <div className="w-80 h-80 md:w-96 md:h-96 relative">
                  <img
                    src="/Hero-Image.png"
                    alt="Ajithkumar - Full Stack Developer"
                    className="w-full h-full object-cover rounded-3xl shadow-2xl border-8 border-white"
                    onError={(e) => {
                      e.target.src ="/Logo.png"
                      
                    }}
                  />

                  {/* Floating Elements */}
                  <div className="absolute -top-4 -left-4 w-20 h-20 bg-blue-500 rounded-2xl rotate-12 opacity-20 animate-pulse"></div>
                  <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-purple-500 rounded-2xl -rotate-12 opacity-20 animate-pulse delay-1000"></div>

                  {/* Tech Stack Badges */}
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-6 py-3 rounded-2xl shadow-xl border">
                    <div className="flex gap-3 text-2xl">
                      <span title="React">⚛️</span>
                      <span title="Node.js">🟢</span>
                      <span title="JavaScript">🟨</span>
                      <span title="Python">🐍</span>
                      <span title="Database">🗄️</span>
                    </div>
                  </div>
                </div>

                {/* Experience Badge */}
                <div className="absolute top-8 -right-8 bg-yellow-400 text-gray-900 px-4 py-2 rounded-full font-bold text-sm rotate-12 shadow-lg">
                  🏆 Top Rated
                </div>

                {/* Availability Badge */}
                <div className="absolute bottom-24 -left-8 bg-green-500 text-white px-4 py-2 rounded-full font-bold text-sm -rotate-12 shadow-lg">
                  ✅ Available
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Creative Portfolio
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              Transforming ideas into exceptional digital experiences. Explore
              my collection of innovative projects and creative solutions.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-blue-100">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {stats.totalProjects}+
                </div>
                <div className="text-sm">Projects Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {stats.featuredCount}+
                </div>
                <div className="text-sm">Featured Works</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">50+</div>
                <div className="text-sm">Happy Clients</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">100%</div>
                <div className="text-sm">Client Satisfaction</div>
              </div>
            </div>
          </div>
        </div>

        {/* Animated background elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-pulse delay-500"></div>
      </section>

      {/* Portfolio Introduction */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Crafting Digital Excellence
            </h2>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              Each project represents a unique challenge and an opportunity to
              push the boundaries of what's possible. From sleek web
              applications to powerful mobile solutions, discover how technical
              expertise meets creative vision.
            </p>

            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💡</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Innovation First</h3>
                <p className="text-gray-600">
                  Cutting-edge solutions using latest technologies and modern
                  design patterns
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Performance Driven
                </h3>
                <p className="text-gray-600">
                  Optimized applications that deliver exceptional speed and user
                  experience
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">User Centric</h3>
                <p className="text-gray-600">
                  Intuitive interfaces designed with the end-user's needs and
                  expectations in mind
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Browse by Category
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Filter through my diverse range of projects across different
              platforms and technologies
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => filterProjects(cat.name)}
                className={`group flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                  selectedCategory === cat.name
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl transform scale-105"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:shadow-lg"
                }`}
              >
                <span className="text-xl">{cat.icon}</span>
                <span>{cat.name}</span>
                <span
                  className={`text-sm px-2 py-1 rounded-full ${
                    selectedCategory === cat.name
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Projects
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {selectedCategory === "All"
                ? "A curated selection of my best work across all categories"
                : `Showcasing my ${selectedCategory.toLowerCase()} development projects`}
            </p>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                No projects found
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {selectedCategory === "All"
                  ? "It looks like there are no projects available at the moment."
                  : `No ${selectedCategory.toLowerCase()} projects found. Try another category!`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project) => (
                <div
                  key={project._id}
                  className="group bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transform hover:-translate-y-4 transition-all duration-500"
                >
                  <div className="h-64 relative overflow-hidden">
                    <img
                      src={getImageUrl(project.images?.[0])}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.target.src = "/default-project.jpg";
                      }}
                    />

                    {/* Project badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      {project.isFeatured && (
                        <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          ⭐ Featured
                        </span>
                      )}
                      <span className="bg-black/70 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
                        {project.category?.toUpperCase() || "PROJECT"}
                      </span>
                    </div>

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {project.technologies
                            ?.slice(0, 3)
                            .map((tech, index) => (
                              <span
                                key={index}
                                className="bg-white/20 text-xs px-2 py-1 rounded backdrop-blur-sm"
                              >
                                {tech}
                              </span>
                            ))}
                          {project.technologies?.length > 3 && (
                            <span className="bg-white/20 text-xs px-2 py-1 rounded backdrop-blur-sm">
                              +{project.technologies.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                      {project.shortDescription || project.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-blue-600">
                          ${project.price}
                        </span>
                        {project.views > 0 && (
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            👁️ {project.views}
                          </span>
                        )}
                      </div>

                      <Link
                        to={`/projects/${project._id}`}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative bg-gradient-to-r from-gray-900 to-blue-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Ready to Start Your Project?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Let's collaborate to bring your vision to life. Whether you need a
            stunning website, a powerful application, or a complete digital
            transformation, I'm here to help.
          </p>

          <div className="flex flex-wrap justify-center gap-6">
            <Link
              to="/contact"
              className="inline-flex items-center gap-3 bg-white text-blue-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 transform hover:scale-105 transition-all shadow-2xl"
            >
              <span>🚀</span>
              Start a Project
            </Link>

            <a
              href="#portfolio"
              className="inline-flex items-center gap-3 border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-blue-700 transform hover:scale-105 transition-all"
            >
              <span>📞</span>
              Schedule a Call
            </a>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-blue-100 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-2xl mb-2">⚡</div>
              <div className="font-semibold">Fast Delivery</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">💎</div>
              <div className="font-semibold">Premium Quality</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🛡️</div>
              <div className="font-semibold">Full Support</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-semibold">On Time</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Portfolio;
