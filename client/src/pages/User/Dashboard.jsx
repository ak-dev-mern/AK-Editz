import React, { useState, useEffect, useRef } from "react";
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
  Clock,
  AlertCircle,
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("purchased");
  const tabsRef = useRef([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Update tab indicator on tab change
  useEffect(() => {
    if (tabsRef.current[activeTab]) {
      const tab = tabsRef.current[activeTab];
      setIndicatorStyle({ left: tab.offsetLeft, width: tab.offsetWidth });
    }
  }, [activeTab]);

  // Fetch purchased projects
  const {
    data: purchasedProjectsData,
    isLoading: projectsLoading,
    error: projectsError,
    refetch: refetchProjects,
  } = useQuery({
    queryKey: ["purchased-projects", user?._id],
    queryFn: async () => {
      try {
        const response = await apiService.payments.getPurchasedProjects();
        return response;
      } catch (error) {
        console.error("📦 Purchased Projects API Error:", error);
        throw error;
      }
    },
    enabled: !!user,
    retry: 2,
  });

  // Fetch user payments
  const {
    data: userPayments,
    isLoading: paymentsLoading,
    error: paymentsError,
    refetch: refetchPayments,
  } = useQuery({
    queryKey: ["user-payments", user?._id],
    queryFn: async () => {
      try {
        const response = await apiService.payments.getUserPayments();
        return response;
      } catch (error) {
        console.error("💳 User Payments API Error:", error);
        throw error;
      }
    },
    enabled: !!user,
    retry: 2,
  });

  // Extract purchased projects
  const getPurchasedProjects = () => {
    if (!purchasedProjectsData) return [];
    if (Array.isArray(purchasedProjectsData)) return purchasedProjectsData;
    if (Array.isArray(purchasedProjectsData?.projects))
      return purchasedProjectsData.projects;
    if (Array.isArray(purchasedProjectsData?.data))
      return purchasedProjectsData.data;
    if (
      purchasedProjectsData?.success &&
      Array.isArray(purchasedProjectsData.data)
    )
      return purchasedProjectsData.data;
    if (
      purchasedProjectsData?.success &&
      Array.isArray(purchasedProjectsData.projects)
    )
      return purchasedProjectsData.projects;
    return [];
  };

  const getPaymentsData = () => {
    if (!userPayments) return [];
    if (Array.isArray(userPayments)) return userPayments;
    if (Array.isArray(userPayments?.payments)) return userPayments.payments;
    if (Array.isArray(userPayments?.data)) return userPayments.data;
    if (userPayments?.success && Array.isArray(userPayments.data))
      return userPayments.data;
    if (userPayments?.success && Array.isArray(userPayments.payments))
      return userPayments.payments;
    return [];
  };

  const purchasedProjects = getPurchasedProjects();
  const paymentsData = getPaymentsData();

  const downloadProject = async (projectId, projectTitle) => {
    try {
      const response = await apiService.projects.download(projectId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${projectTitle}-source-code.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("❌ Download error:", error);
      alert("Error downloading project. Please try again.");
    }
  };

  const handleRefresh = () => {
    refetchProjects();
    refetchPayments();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
      case "succeeded":
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
      case "canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid":
      case "succeeded":
      case "completed":
        return <CheckCircle2 size={14} />;
      case "pending":
      case "processing":
        return <Clock size={14} />;
      case "failed":
      case "canceled":
        return <AlertCircle size={14} />;
      default:
        return <AlertCircle size={14} />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Please log in to view your dashboard
          </h2>
          <Link
            to="/login"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 sm:p-8 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
                Welcome back, {user.name}!
              </h1>
              <p className="text-gray-600 text-sm sm:text-lg">
                Manage your projects and view your learning journey
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4">
              <div className="text-right">
                <p className="text-xs sm:text-sm text-gray-500 mb-1">
                  Account Type
                </p>
                <span className="inline-flex items-center px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium bg-primary-100 text-primary-800 capitalize">
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {(projectsError || paymentsError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle size={20} />
              <span className="font-medium">Error loading data</span>
            </div>
            <p className="text-red-700 text-sm mt-1">
              {projectsError?.message || paymentsError?.message}
            </p>
            <button
              onClick={handleRefresh}
              className="mt-2 text-red-800 underline text-sm hover:text-red-900"
            >
              Try again
            </button>
          </div>
        )}

        {/* Tabs with swipe indicator */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl mb-8 border border-gray-100">
          <div className="border-b border-gray-200 overflow-x-auto relative">
            <nav className="flex min-w-max relative">
              <button
                ref={(el) => (tabsRef.current["purchased"] = el)}
                onClick={() => setActiveTab("purchased")}
                className={`whitespace-nowrap py-3 px-6 font-medium text-sm transition-colors ${
                  activeTab === "purchased"
                    ? "text-primary-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                📦 Purchased Projects ({purchasedProjects.length})
              </button>

              <button
                ref={(el) => (tabsRef.current["payments"] = el)}
                onClick={() => setActiveTab("payments")}
                className={`whitespace-nowrap py-3 px-6 font-medium text-sm transition-colors ${
                  activeTab === "payments"
                    ? "text-primary-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                💳 Payment History ({paymentsData.length})
              </button>

              <button
                ref={(el) => (tabsRef.current["profile"] = el)}
                onClick={() => setActiveTab("profile")}
                className={`whitespace-nowrap py-3 px-6 font-medium text-sm transition-colors ${
                  activeTab === "profile"
                    ? "text-primary-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                👤 Profile Settings
              </button>

              {/* Animated Indicator */}
              <span
                className="absolute bottom-0 h-1 bg-primary-600 rounded-full transition-all duration-300"
                style={{
                  left: indicatorStyle.left,
                  width: indicatorStyle.width,
                }}
              />
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6 sm:p-8">
            {/* Purchased Projects Tab */}
            {activeTab === "purchased" && (
              <div>
                {projectsLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">
                      Loading your projects...
                    </p>
                  </div>
                ) : purchasedProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {purchasedProjects.map((project) => (
                      <div
                        key={project._id}
                        className="border border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all bg-white"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                          <h4 className="text-lg sm:text-xl font-semibold text-gray-900">
                            {project.title}
                          </h4>
                          <span className="flex items-center gap-1 bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full">
                            <CheckCircle2 size={14} /> Purchased
                          </span>
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {project.shortDescription || project.description}
                        </p>

                        {project.technologies?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {project.technologies.slice(0, 4).map((tech) => (
                              <span
                                key={tech}
                                className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full"
                              >
                                {tech}
                              </span>
                            ))}
                            {project.technologies.length > 4 && (
                              <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                                +{project.technologies.length - 4} more
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:gap-3 mb-4">
                          <button
                            onClick={() =>
                              downloadProject(project._id, project.title)
                            }
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors mb-2 sm:mb-0"
                          >
                            <Download size={16} /> Download
                          </button>
                          {project.documentation && (
                            <a
                              href={project.documentation}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors mb-2 sm:mb-0"
                            >
                              <Eye size={16} /> View Docs
                            </a>
                          )}
                          {project.demoUrl && (
                            <a
                              href={project.demoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors"
                            >
                              <ExternalLink size={16} /> Live Demo
                            </a>
                          )}
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
                {paymentsLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">
                      Loading payment history...
                    </p>
                  </div>
                ) : paymentsData.length > 0 ? (
                  <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Project
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paymentsData.map((payment) => (
                          <tr key={payment._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              {payment.project?.title || "Unknown Project"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                              ₹{payment.amount}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {new Date(payment.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  payment.status
                                )}`}
                              >
                                {getStatusIcon(payment.status)}
                                {payment.status === "paid" ||
                                payment.status === "succeeded"
                                  ? "Completed"
                                  : payment.status.charAt(0).toUpperCase() +
                                    payment.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">💳</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No payment history yet
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      All your payments will appear here. Once you purchase a
                      project, it will be tracked automatically.
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

            {/* Profile Settings Tab */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Profile Settings
                </h3>
                <div className="space-y-4 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>Name:</span>
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Role:</span>
                    <span className="font-medium capitalize">{user.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Joined:</span>
                    <span className="font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
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
