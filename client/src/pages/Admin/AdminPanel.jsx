import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiService, apiUtils } from "../../utils/api";
import Loader from "../../components/UI/Loader";

const AdminPanel = () => {
  const [stats, setStats] = useState({
    users: 0,
    projects: 0,
    blogs: 0,
    payments: 0,
    revenue: 0,
    newsletterSubscribers: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchDashboardData();

    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);

    return () => clearInterval(interval);
  }, []);

  // Helper function to safely extract array data from API responses
  const extractArrayData = (response, fallback = []) => {
    if (!response) return fallback;

    // Handle different response structures
    if (Array.isArray(response)) {
      return response;
    } else if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.users && Array.isArray(response.users)) {
      return response.users;
    } else if (response.projects && Array.isArray(response.projects)) {
      return response.projects;
    } else if (response.blogs && Array.isArray(response.blogs)) {
      return response.blogs;
    } else if (response.payments && Array.isArray(response.payments)) {
      return response.payments;
    } else if (response.subscribers && Array.isArray(response.subscribers)) {
      return response.subscribers;
    }

    return fallback;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setErrors({});

      // Fetch all stats in parallel with better error handling
      const [usersRes, projectsRes, blogsRes, paymentsRes, newsletterRes] =
        await Promise.allSettled([
          apiService.users.getAll().catch((error) => {
            console.error("Users API error:", error);
            throw error;
          }),
          apiService.projects.getAll().catch((error) => {
            console.error("Projects API error:", error);
            throw error;
          }),
          apiService.blogs.getAll().catch((error) => {
            console.error("Blogs API error:", error);
            throw error;
          }),
          apiService.payments.admin.getAll().catch((error) => {
            console.error("Payments API error:", error);
            throw error;
          }),
          apiService.newsletter.getSubscribers().catch((error) => {
            console.error("Newsletter API error:", error);
            throw error;
          }),
        ]);

      // Process users data
      let usersCount = 0;
      let usersData = [];
      if (usersRes.status === "fulfilled") {
        usersData = extractArrayData(usersRes.value);
        usersCount = usersData.length;
      } else {
        console.error("Users fetch failed:", usersRes.reason);
        setErrors((prev) => ({ ...prev, users: "Failed to load users" }));
      }

      // Process projects data
      let projectsCount = 0;
      let projectsData = [];
      if (projectsRes.status === "fulfilled") {
        projectsData = extractArrayData(projectsRes.value);
        projectsCount = projectsData.length;
      } else {
        console.error("Projects fetch failed:", projectsRes.reason);
        setErrors((prev) => ({ ...prev, projects: "Failed to load projects" }));
      }

      // Process blogs data
      let blogsCount = 0;
      let blogsData = [];
      if (blogsRes.status === "fulfilled") {
        blogsData = extractArrayData(blogsRes.value);
        blogsCount = blogsData.length;
      } else {
        console.error("Blogs fetch failed:", blogsRes.reason);
        setErrors((prev) => ({ ...prev, blogs: "Failed to load blogs" }));
      }

      // Process payments data
      let paymentsCount = 0;
      let totalRevenue = 0;
      let paymentsData = [];
      if (paymentsRes.status === "fulfilled") {
        paymentsData = extractArrayData(paymentsRes.value);

        // Calculate stats from payments
        const successfulPayments = paymentsData.filter(
          (payment) =>
            payment.status === "paid" || payment.status === "succeeded"
        );

        paymentsCount = successfulPayments.length;

        // Calculate total revenue - amount is stored in dollars
        totalRevenue = successfulPayments.reduce((sum, payment) => {
          const amount = parseFloat(payment.amount) || 0;
          return sum + amount;
        }, 0);
      } else {
        console.error("Payments fetch failed:", paymentsRes.reason);
        setErrors((prev) => ({ ...prev, payments: "Failed to load payments" }));
      }

      // Process newsletter data - FIXED FOR SINGLE OBJECT RESPONSE
      // Process newsletter data - FIXED FOR YOUR API STRUCTURE
      let newsletterCount = 0;
      let newsletterData = [];
      if (newsletterRes.status === "fulfilled") {
        const newsletterResponse = newsletterRes.value;

        // Handle your specific API response structure
        if (newsletterResponse && newsletterResponse.success) {
          // Your API returns: { success: true, data: { subscribers: [], pagination: {} } }
          if (
            newsletterResponse.data &&
            Array.isArray(newsletterResponse.data.subscribers)
          ) {
            newsletterData = newsletterResponse.data.subscribers;
            newsletterCount = newsletterResponse.data.subscribers.length;
          }
          // Alternative: if subscribers array is directly in response
          else if (Array.isArray(newsletterResponse.subscribers)) {
            newsletterData = newsletterResponse.subscribers;
            newsletterCount = newsletterResponse.subscribers.length;
          }
          // Alternative: if data is directly the array
          else if (Array.isArray(newsletterResponse.data)) {
            newsletterData = newsletterResponse.data;
            newsletterCount = newsletterResponse.data.length;
          }
        }
        // If response is just the data object directly
        else if (
          newsletterResponse &&
          Array.isArray(newsletterResponse.subscribers)
        ) {
          newsletterData = newsletterResponse.subscribers;
          newsletterCount = newsletterResponse.subscribers.length;
        }
        // Fallback to helper function
        else {
          newsletterData = extractArrayData(newsletterResponse);
          newsletterCount = newsletterData.length;
        }
      } else {
        console.error("Newsletter fetch failed:", newsletterRes.reason);
        setErrors((prev) => ({
          ...prev,
          newsletter: "Failed to load newsletter data",
        }));
      }

      setStats({
        users: usersCount,
        projects: projectsCount,
        blogs: blogsCount,
        payments: paymentsCount,
        revenue: totalRevenue,
        newsletterSubscribers: newsletterCount,
      });

      // Fetch recent activities with the data we already have
      await fetchRecentActivities(
        usersData,
        projectsData,
        blogsData,
        paymentsData,
        newsletterData
      );

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error in fetchDashboardData:", error);
      apiUtils.handleError(error);
    } finally {
      setLoading(false);
    }
  };
  const fetchRecentActivities = async (
    usersData = [],
    projectsData = [],
    blogsData = [],
    paymentsData = [],
    newsletterData = []
  ) => {
    try {
      const activities = [];

      // Helper function to safely add activities
      const addActivity = (type, message, timestamp, data = null) => {
        if (!timestamp) return;
        activities.push({
          type,
          message,
          time: formatTimeAgo(timestamp),
          timestamp: new Date(timestamp),
          data,
        });
      };

      // Add recent users (last 5) - ensure usersData is an array
      if (Array.isArray(usersData)) {
        usersData.slice(0, 5).forEach((user) => {
          addActivity(
            "user",
            `New user registered: ${user.name || user.email || "Unknown"}`,
            user.createdAt,
            user
          );
        });
      }

      // Add recent projects (last 5) - ensure projectsData is an array
      if (Array.isArray(projectsData)) {
        projectsData.slice(0, 5).forEach((project) => {
          addActivity(
            "project",
            `New project created: ${project.title || "Untitled"}`,
            project.createdAt,
            project
          );
        });
      }

      // Add recent SUCCESSFUL payments (last 5) - ensure paymentsData is an array
      if (Array.isArray(paymentsData)) {
        const successfulPayments = paymentsData.filter(
          (payment) =>
            payment.status === "paid" || payment.status === "succeeded"
        );

        successfulPayments.slice(0, 5).forEach((payment) => {
          const userName =
            payment.user?.name || payment.user?.email || "Unknown";
          const amount = payment.amount ? `$${payment.amount}` : "$0";
          addActivity(
            "payment",
            `Payment received: ${amount} from ${userName}`,
            payment.createdAt,
            payment
          );
        });
      }

      // Add recent blogs (last 5) - ensure blogsData is an array
      if (Array.isArray(blogsData)) {
        blogsData.slice(0, 5).forEach((blog) => {
          addActivity(
            "blog",
            `New blog published: ${blog.title || "Untitled"}`,
            blog.createdAt,
            blog
          );
        });
      }

      // Add recent newsletter subscribers (last 5) - ensure newsletterData is an array
      if (Array.isArray(newsletterData)) {
        newsletterData.slice(0, 5).forEach((subscriber) => {
          addActivity(
            "newsletter",
            `New newsletter subscriber: ${subscriber.email || "Unknown"}`,
            subscriber.subscribedAt || subscriber.createdAt,
            subscriber
          );
        });
      }

      // Sort by timestamp and take latest 10
      const sortedActivities = activities
        .filter((activity) => activity.timestamp) // Remove activities without valid timestamp
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);

      setRecentActivities(sortedActivities);
    } catch (error) {
      console.error("Error in fetchRecentActivities:", error);
      // Fallback to empty activities
      setRecentActivities([]);
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Recently";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Recently";

      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 60) return "Just now";
      if (diffInSeconds < 3600)
        return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400)
        return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Recently";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const getActivityIcon = (type) => {
    const icons = {
      user: (
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
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
      ),
      project: (
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      payment: (
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
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
          />
        </svg>
      ),
      blog: (
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
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9m0 0v3m0-3a2 2 0 012-2h2a2 2 0 012 2m0 0V6a2 2 0 012-2h2a2 2 0 012 2v3m-6 0v3"
          />
        </svg>
      ),
      newsletter: (
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
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      settings: (
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
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    };
    return icons[type] || null;
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Debug component to show raw data
  // const DebugInfo = () => {
  //   if (process.env.NODE_ENV !== "development") return null;

  //   return (
  //     <div className="mt-8 p-4 bg-gray-100 rounded-lg">
  //       <h3 className="text-lg font-semibold mb-2">Debug Info</h3>
  //       <pre className="text-xs bg-white p-2 rounded overflow-auto">
  //         {JSON.stringify(
  //           {
  //             stats,
  //             recentActivities,
  //             errors,
  //           },
  //           null,
  //           2
  //         )}
  //       </pre>
  //     </div>
  //   );
  // };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome to your administration panel
              {lastUpdated && (
                <span className="text-sm text-gray-500 ml-2">
                  • Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
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

        {/* Error Messages */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 font-medium">
              Some data failed to load:
            </p>
            <ul className="text-yellow-700 text-sm mt-1">
              {Object.entries(errors).map(([key, error]) => (
                <li key={key}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Users Card */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.users.toLocaleString()}
                </h3>
                <p className="text-gray-600">Total Users</p>
              </div>
            </div>
          </div>

          {/* Projects Card */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.projects.toLocaleString()}
                </h3>
                <p className="text-gray-600">Total Projects</p>
              </div>
            </div>
          </div>

          {/* Blogs Card */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9m0 0v3m0-3a2 2 0 012-2h2a2 2 0 012 2m0 0V6a2 2 0 012-2h2a2 2 0 012 2v3m-6 0v3"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.blogs.toLocaleString()}
                </h3>
                <p className="text-gray-600">Total Blogs</p>
              </div>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.revenue)}
                </h3>
                <p className="text-gray-600">Total Revenue</p>
                <p className="text-xs text-gray-500 mt-1"></p>
              </div>
            </div>
          </div>

          {/* Newsletter Card */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.newsletterSubscribers.toLocaleString()}
                </h3>
                <p className="text-gray-600">Newsletter Subscribers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Management */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Quick Management
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  to: "/admin/users",
                  label: "Users",
                  icon: "user",
                  color: "blue",
                  description: "Manage users and permissions",
                },
                {
                  to: "/admin/projects",
                  label: "Projects",
                  icon: "project",
                  color: "green",
                  description: "Manage projects and listings",
                },
                {
                  to: "/admin/blogs",
                  label: "Blogs",
                  icon: "blog",
                  color: "purple",
                  description: "Manage blog posts",
                },
                {
                  to: "/admin/payments",
                  label: "Payments",
                  icon: "payment",
                  color: "yellow",
                  description: "View payments and refunds",
                },
                {
                  to: "/admin/newsletter",
                  label: "Newsletter",
                  icon: "newsletter",
                  color: "indigo",
                  description: "Manage subscribers and campaigns",
                },
                {
                  to: "/admin/settings",
                  label: "Settings",
                  icon: "settings",
                  color: "gray",
                  description: "System configuration",
                },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center p-4 border border-gray-200 rounded-lg hover:border-${item.color}-500 hover:bg-${item.color}-50 transition-colors`}
                >
                  <div
                    className={`p-2 rounded-full bg-${item.color}-100 text-${item.color}-600`}
                  >
                    {getActivityIcon(item.icon)}
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-gray-900">{item.label}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Activities
              </h3>
              <span className="text-sm text-gray-500">
                {recentActivities.length} activities
              </span>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 group hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                      <div
                        className={`p-2 rounded-full ${
                          activity.type === "user"
                            ? "bg-blue-100 text-blue-600"
                            : activity.type === "project"
                            ? "bg-green-100 text-green-600"
                            : activity.type === "payment"
                            ? "bg-yellow-100 text-yellow-600"
                            : activity.type === "blog"
                            ? "bg-purple-100 text-purple-600"
                            : "bg-indigo-100 text-indigo-600"
                        }`}
                      >
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 font-medium truncate">
                          {activity.message}
                        </p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg
                      className="w-12 h-12 mx-auto mb-4 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p>No recent activities found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        {/* <DebugInfo /> */}
      </div>
    </div>
  );
};

export default AdminPanel;
