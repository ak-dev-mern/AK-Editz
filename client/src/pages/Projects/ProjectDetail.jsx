import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeImage, setActiveImage] = useState(0);

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => axios.get(`/api/projects/${id}`).then((res) => res.data),
  });

  const handlePurchase = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate(`/checkout/${id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Project Not Found
          </h2>
          <Link
            to="/projects"
            className="text-primary-600 hover:text-primary-700"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Image Gallery */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            <div>
              <div className="rounded-lg overflow-hidden mb-4">
                <img
                  src={project.images?.[activeImage] || "/default-project.jpg"}
                  alt={project.title}
                  className="w-full h-96 object-cover"
                />
              </div>
              {project.images && project.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {project.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`rounded overflow-hidden ${
                        activeImage === index ? "ring-2 ring-primary-600" : ""
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${project.title} ${index + 1}`}
                        className="w-full h-20 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Project Details */}
            <div>
              <div className="mb-6">
                <span className="bg-primary-100 text-primary-800 text-sm px-3 py-1 rounded-full capitalize">
                  {project.category}
                </span>
                <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-4">
                  {project.title}
                </h1>
                <p className="text-gray-600 text-lg">{project.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">Features</h3>
                <ul className="grid grid-cols-1 gap-2">
                  {project.features?.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">
                  Technologies Used
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies?.map((tech) => (
                    <span
                      key={tech}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {project.demoUrl && (
                <div className="mb-6">
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary-600 hover:text-primary-700"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    View Live Demo
                  </a>
                </div>
              )}

              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-3xl font-bold text-primary-600">
                    ₹{project.price}
                  </span>
                  <button
                    onClick={handlePurchase}
                    className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition duration-200"
                  >
                    Purchase Now
                  </button>
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Instant download after purchase • Lifetime updates • Technical
                  support
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
