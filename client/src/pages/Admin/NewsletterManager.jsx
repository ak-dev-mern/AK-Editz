// components/Admin/NewsletterManager.jsx
import React, { useState, useEffect } from "react";
import { apiService, apiUtils } from "../../utils/api";
import Loader from "../../components/UI/Loader";

const NewsletterManager = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchSubscribers();
    fetchStats();
  }, [currentPage]);

  const fetchSubscribers = async () => {
    try {
      const response = await apiService.newsletter.getSubscribers({
        page: currentPage,
        limit: 20,
      });
      setSubscribers(response.data.subscribers);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      apiUtils.handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.newsletter.getStats();
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const exportSubscribers = () => {
    const headers = ["Email", "Subscribed At", "Source"];
    const csvData = subscribers.map((subscriber) => [
      subscriber.email,
      new Date(subscriber.subscribedAt).toLocaleDateString(),
      subscriber.source,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "newsletter_subscribers.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center mt-6 space-x-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition-colors"
        >
          Previous
        </button>
        <span className="px-4 py-2 flex items-center">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition-colors"
        >
          Next
        </button>
      </div>
    );
  };

  if (loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Newsletter Subscribers
          </h1>
          <button
            onClick={exportSubscribers}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            Export CSV
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Total Subscribers
            </h3>
            <p className="text-4xl font-bold text-blue-600">
              {stats.totalSubscribers || 0}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Today's Subscribers
            </h3>
            <p className="text-4xl font-bold text-green-600">
              {stats.todaySubscribers || 0}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Unsubscribed
            </h3>
            <p className="text-4xl font-bold text-red-600">
              {stats.totalUnsubscribed || 0}
            </p>
          </div>
        </div>

        {/* Subscribers Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscribed At
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscribers.map((subscriber) => (
                  <tr
                    key={subscriber._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {subscriber.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(subscriber.subscribedAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {subscriber.source}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          subscriber.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {subscriber.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {renderPagination()}

        {/* Empty State */}
        {subscribers.length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-lg shadow border">
            <div className="text-6xl mb-4">📧</div>
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">
              No Subscribers Yet
            </h3>
            <p className="text-gray-500">
              Subscribers will appear here once they sign up for your
              newsletter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsletterManager;
