import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "../../utils/api";
import { Link } from "react-router-dom";
import {
  Download,
  ExternalLink,
  FileText,
  Code2,
  CheckCircle2,
  Eye,
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("purchased");

  const { data: purchasedProjectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ["purchased-projects"],
    queryFn: () => apiService.payments.getPurchasedProjects(),
    enabled: !!user,
  });

  const getPurchasedProjects = () => {
    if (!purchasedProjectsData) return [];

    if (Array.isArray(purchasedProjectsData)) {
      return purchasedProjectsData;
    } else if (purchasedProjectsData?.projects) {
      return purchasedProjectsData.projects;
    } else if (purchasedProjectsData?.data?.projects) {
      return purchasedProjectsData.data.projects;
    } else if (
      purchasedProjectsData?.data &&
      Array.isArray(purchasedProjectsData.data)
    ) {
      return purchasedProjectsData.data;
    }

    return [];
  };

  const purchasedProjects = getPurchasedProjects();

  const { data: userPayments, isLoading: paymentsLoading } = useQuery({
    queryKey: ["user-payments"],
    queryFn: () => apiService.payments.getUserPayments(),
    enabled: !!user,
  });

  const downloadProject = async (projectId, projectTitle) => {
    try {
      const response = await apiService.projects.download(projectId);

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${projectTitle}-source-code.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("Error downloading project. Please try again.");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Please log in to view your dashboard
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Welcome back, {user.name}!
              </h1>
              <p className="text-gray-600 text-lg">
                Manage your projects and view your learning journey
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Account Type</p>
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary-100 text-primary-800 capitalize">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl mb-8 border border-gray-100">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab("purchased")}
                className={`whitespace-nowrap py-5 px-8 border-b-2 font-medium text-sm transition-all ${
                  activeTab === "purchased"
                    ? "border-primary-500 text-primary-600 bg-primary-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                📦 Purchased Projects
              </button>
              <button
                onClick={() => setActiveTab("payments")}
                className={`whitespace-nowrap py-5 px-8 border-b-2 font-medium text-sm transition-all ${
                  activeTab === "payments"
                    ? "border-primary-500 text-primary-600 bg-primary-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                💳 Payment History
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`whitespace-nowrap py-5 px-8 border-b-2 font-medium text-sm transition-all ${
                  activeTab === "profile"
                    ? "border-primary-500 text-primary-600 bg-primary-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                👤 Profile Settings
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Purchased Projects Tab */}
            {activeTab === "purchased" && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Your Purchased Projects
                </h3>
                <p className="text-gray-600 mb-8">
                  Access all your purchased projects with full source code and
                  documentation
                </p>

                {projectsLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">
                      Loading your projects...
                    </p>
                  </div>
                ) : purchasedProjects?.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {purchasedProjects.map((project) => (
                      <div
                        key={project._id}
                        className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all bg-white"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-xl font-semibold text-gray-900">
                            {project.title}
                          </h4>
                          <span className="flex items-center gap-1 bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full">
                            <CheckCircle2 size={14} />
                            Purchased
                          </span>
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {project.shortDescription || project.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-6">
                          {project.technologies?.slice(0, 4).map((tech) => (
                            <span
                              key={tech}
                              className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.technologies?.length > 4 && (
                            <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                              +{project.technologies.length - 4} more
                            </span>
                          )}
                        </div>

                        {/* Project Resources */}
                        <div className="space-y-3 mb-6">
                          {/* Download Source Code */}
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Code2 size={20} className="text-blue-600" />
                              <span className="font-medium text-gray-900">
                                Source Code
                              </span>
                            </div>
                            <button
                              onClick={() =>
                                downloadProject(project._id, project.title)
                              }
                              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                            >
                              <Download size={16} />
                              Download
                            </button>
                          </div>

                          {/* Documentation */}
                          {project.documentation && (
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <FileText
                                  size={20}
                                  className="text-green-600"
                                />
                                <span className="font-medium text-gray-900">
                                  Documentation
                                </span>
                              </div>
                              <a
                                href={project.documentation}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                              >
                                <Eye size={16} />
                                View Docs
                              </a>
                            </div>
                          )}

                          {/* Live Demo */}
                          {project.demoUrl && (
                            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <ExternalLink
                                  size={20}
                                  className="text-purple-600"
                                />
                                <span className="font-medium text-gray-900">
                                  Live Demo
                                </span>
                              </div>
                              <a
                                href={project.demoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors"
                              >
                                <ExternalLink size={16} />
                                View Demo
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                          <Link
                            to={`/projects/${project._id}`}
                            className="flex-1 text-center border border-primary-600 text-primary-600 px-4 py-2 rounded-lg text-sm hover:bg-primary-50 transition-colors"
                          >
                            View Project Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">📦</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No projects purchased yet
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Start your learning journey by purchasing your first
                      project. Get full access to source code, documentation,
                      and lifetime updates.
                    </p>
                    <Link
                      to="/projects"
                      className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
                    >
                      Browse Projects
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Payment History Tab */}
            {activeTab === "payments" && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Payment History
                </h3>
                <p className="text-gray-600 mb-8">
                  View your complete payment history and transaction details
                </p>

                {paymentsLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">
                      Loading payment history...
                    </p>
                  </div>
                ) : userPayments?.length > 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Project
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {userPayments.map((payment) => (
                          <tr key={payment._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {payment.project?.title || "Project"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900">
                                ₹{payment.amount}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(payment.createdAt).toLocaleDateString(
                                  "en-IN",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle2 size={12} />
                                Completed
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <p className="text-gray-600">No payment history found.</p>
                  </div>
                )}
              </div>
            )}

            {/* Profile Settings Tab */}
            {activeTab === "profile" && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Profile Settings
                </h3>
                <p className="text-gray-600 mb-8">
                  Manage your account information and preferences
                </p>

                <div className="max-w-2xl bg-white rounded-2xl p-8 border border-gray-200">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={user.name}
                          disabled
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 text-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Type
                      </label>
                      <input
                        type="text"
                        value={user.role}
                        disabled
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 text-gray-500 capitalize"
                      />
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-700">
                      To update your profile information, please contact our
                      support team.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
