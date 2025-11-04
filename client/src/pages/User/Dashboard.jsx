import React, { useState, useEffect } from "react";
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

  // Debug user data
  useEffect(() => {
    console.log("👤 Current User:", user);
    console.log("👤 User ID:", user?._id);
  }, [user]);

  // Fetch purchased projects with enhanced error handling
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
        console.log("📦 Purchased Projects API Raw Response:", response);
        return response;
      } catch (error) {
        console.error("📦 Purchased Projects API Error:", error);
        throw error;
      }
    },
    enabled: !!user,
    retry: 2,
  });

  // Fetch user payments with enhanced error handling
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
        console.log("💳 User Payments API Raw Response:", response);
        return response;
      } catch (error) {
        console.error("💳 User Payments API Error:", error);
        throw error;
      }
    },
    enabled: !!user,
    retry: 2,
  });

  // Enhanced data extraction with comprehensive logging
  const getPurchasedProjects = () => {
    if (!purchasedProjectsData) {
      console.log("❌ No purchasedProjectsData available");
      return [];
    }

    console.log(
      "🔄 Extracting purchased projects from:",
      purchasedProjectsData
    );

    let projects = [];

    // Handle all possible response structures
    if (Array.isArray(purchasedProjectsData)) {
      console.log("✅ Found direct array of projects");
      projects = purchasedProjectsData;
    } else if (Array.isArray(purchasedProjectsData?.projects)) {
      console.log("✅ Found projects array in .projects");
      projects = purchasedProjectsData.projects;
    } else if (Array.isArray(purchasedProjectsData?.data)) {
      console.log("✅ Found data array in .data");
      projects = purchasedProjectsData.data;
    } else if (
      purchasedProjectsData?.success &&
      Array.isArray(purchasedProjectsData.data)
    ) {
      console.log("✅ Found success response with data array");
      projects = purchasedProjectsData.data;
    } else if (
      purchasedProjectsData?.success &&
      Array.isArray(purchasedProjectsData.projects)
    ) {
      console.log("✅ Found success response with projects array");
      projects = purchasedProjectsData.projects;
    } else {
      console.log("❌ Could not extract projects from response structure");
      projects = [];
    }

    console.log(`🎯 Extracted ${projects.length} projects:`, projects);
    return projects;
  };

  const getPaymentsData = () => {
    if (!userPayments) {
      console.log("❌ No userPayments data available");
      return [];
    }

    console.log("🔄 Extracting payments from:", userPayments);

    let payments = [];

    if (Array.isArray(userPayments)) {
      payments = userPayments;
    } else if (Array.isArray(userPayments?.payments)) {
      payments = userPayments.payments;
    } else if (Array.isArray(userPayments?.data)) {
      payments = userPayments.data;
    } else if (userPayments?.success && Array.isArray(userPayments.data)) {
      payments = userPayments.data;
    } else if (userPayments?.success && Array.isArray(userPayments.payments)) {
      payments = userPayments.payments;
    } else {
      console.log("❌ Could not extract payments from response structure");
      payments = [];
    }

    console.log(`🎯 Extracted ${payments.length} payments:`, payments);
    return payments;
  };

  const purchasedProjects = getPurchasedProjects();
  const paymentsData = getPaymentsData();

  // Log final data
  useEffect(() => {
    console.log("🎯 FINAL - Purchased projects:", purchasedProjects);
    console.log("🎯 FINAL - Payments data:", paymentsData);
  }, [purchasedProjects, paymentsData]);

  const downloadProject = async (projectId, projectTitle) => {
    try {
      console.log(`⬇️ Downloading project: ${projectTitle} (${projectId})`);
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

      console.log("✅ Download initiated successfully");
    } catch (error) {
      console.error("❌ Download error:", error);
      alert("Error downloading project. Please try again.");
    }
  };

  const handleRefresh = () => {
    console.log("🔄 Refreshing data...");
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Account Type</p>
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary-100 text-primary-800 capitalize">
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
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
                📦 Purchased Projects ({purchasedProjects.length})
              </button>
              <button
                onClick={() => setActiveTab("payments")}
                className={`whitespace-nowrap py-5 px-8 border-b-2 font-medium text-sm transition-all ${
                  activeTab === "payments"
                    ? "border-primary-500 text-primary-600 bg-primary-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                💳 Payment History ({paymentsData.length})
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
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Your Purchased Projects
                    </h3>
                    <p className="text-gray-600">
                      Access all your purchased projects with full source code
                      and documentation
                    </p>
                  </div>
                  {purchasedProjects.length > 0 && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {purchasedProjects.length} project
                      {purchasedProjects.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {projectsLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">
                      Loading your projects...
                    </p>
                  </div>
                ) : purchasedProjects.length > 0 ? (
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

                        {project.technologies &&
                          project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
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
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Payment History
                    </h3>
                    <p className="text-gray-600">
                      View your complete payment history and transaction details
                    </p>
                  </div>
                  {paymentsData.length > 0 && (
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {paymentsData.length} payment
                      {paymentsData.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {paymentsLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">
                      Loading payment history...
                    </p>
                  </div>
                ) : paymentsData.length > 0 ? (
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
                        {paymentsData.map((payment) => (
                          <tr key={payment._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {payment.project?.title || "Unknown Project"}
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
                              <span
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  payment.status
                                )}`}
                              >
                                {getStatusIcon(payment.status)}
                                {payment.status === "paid" ||
                                payment.status === "succeeded"
                                  ? "Completed"
                                  : payment.status === "pending"
                                  ? "Pending"
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
                      No payment history found
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Your payment history will appear here after you make your
                      first purchase.
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Member Since
                      </label>
                      <input
                        type="text"
                        value={new Date(user.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                        disabled
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 text-gray-500"
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

        {/* Debug Info - Remove in production
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-bold mb-2 text-yellow-800">Debug Info:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p>
                  <strong>User ID:</strong> {user?._id}
                </p>
                <p>
                  <strong>Purchased Projects:</strong>{" "}
                  {purchasedProjects.length}
                </p>
                <p>
                  <strong>Payments:</strong> {paymentsData.length}
                </p>
              </div>
              <div>
                <p>
                  <strong>Projects Loading:</strong>{" "}
                  {projectsLoading ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Payments Loading:</strong>{" "}
                  {paymentsLoading ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Projects Error:</strong>{" "}
                  {projectsError ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Payments Error:</strong>{" "}
                  {paymentsError ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default Dashboard;
