import React, { useState, useEffect } from "react";
import { apiService, apiUtils } from "../../utils/api";
import Loader from "../../components/UI/Loader";
import SearchBar from "../../components/Common/SearchBar";

const PaymentsManagement = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPayments: 0,
    successfulPayments: 0,
    failedPayments: 0,
    successRate: 0,
    pendingPayments: 0,
    refundedPayments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, searchQuery]);

  const fetchPayments = async (page = 1, limit = 50) => {
    try {
      setLoading(true);
      const response = await apiService.payments.admin.getAll({
        page,
        limit,
        status: "all", // Get all payments regardless of status
      });

      // Handle different response structures
      const paymentsData = response?.payments || response?.data || [];

      if (Array.isArray(paymentsData)) {
        setPayments(paymentsData);
      } else if (paymentsData && typeof paymentsData === "object") {
        // If it's an object with pagination
        const actualPayments = paymentsData.payments || paymentsData.data || [];
        setPayments(Array.isArray(actualPayments) ? actualPayments : []);

        // Update pagination if available
        if (paymentsData.totalPages || paymentsData.currentPage) {
          setPagination({
            currentPage: paymentsData.currentPage || page,
            totalPages: paymentsData.totalPages || 1,
            total: paymentsData.total || actualPayments.length,
          });
        }
      } else {
        setPayments([]);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      apiUtils.handleError(error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.payments.admin.getStats();

      if (response.success && response.stats) {
        setStats({
          totalRevenue: response.stats.totalRevenue || 0,
          totalPayments: response.stats.totalPayments || 0,
          successfulPayments: response.stats.successfulPayments || 0,
          failedPayments: response.stats.failedPayments || 0,
          successRate: response.stats.successRate || 0,
          pendingPayments: response.stats.pendingPayments || 0,
          refundedPayments: response.stats.refundedPayments || 0,
        });
      } else {
        // If stats endpoint fails, calculate from payments data
        calculateLocalStats();
      }
    } catch (error) {
      console.error("Error fetching stats, calculating locally:", error);
      calculateLocalStats();
    }
  };

  // Fallback function to calculate stats locally from payments data
  const calculateLocalStats = () => {
    if (!payments.length) return;

    const totalPayments = payments.length;

    const successfulPayments = payments.filter(
      (payment) => payment.status === "paid" || payment.status === "succeeded"
    ).length;

    const totalRevenue = payments
      .filter(
        (payment) => payment.status === "paid" || payment.status === "succeeded"
      )
      .reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);

    const pendingPayments = payments.filter(
      (payment) =>
        payment.status === "created" ||
        payment.status === "processing" ||
        payment.status === "pending" ||
        payment.status === "requires_action" ||
        payment.status === "requires_payment_method"
    ).length;

    const refundedPayments = payments.filter(
      (payment) => payment.status === "refunded"
    ).length;

    const failedPayments = payments.filter(
      (payment) =>
        payment.status === "failed" ||
        payment.status === "canceled" ||
        payment.status === "requires_payment_method"
    ).length;

    const successRate =
      totalPayments > 0
        ? parseFloat(((successfulPayments / totalPayments) * 100).toFixed(2))
        : 0;

    setStats({
      totalRevenue,
      totalPayments,
      successfulPayments,
      failedPayments,
      successRate,
      pendingPayments,
      refundedPayments,
    });
  };

  const filterPayments = () => {
    if (!searchQuery) {
      setFilteredPayments(payments);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = payments.filter(
      (payment) =>
        payment.user?.name?.toLowerCase().includes(query) ||
        payment.user?.email?.toLowerCase().includes(query) ||
        payment.project?.title?.toLowerCase().includes(query) ||
        payment.status?.toLowerCase().includes(query) ||
        payment.paymentIntentId?.toLowerCase().includes(query) ||
        payment._id?.toLowerCase().includes(query)
    );
    setFilteredPayments(filtered);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleRefund = async (paymentId, paymentIntentId) => {
    if (
      !window.confirm(
        "Are you sure you want to process a refund for this payment? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await apiService.payments.admin.refund(paymentId);

      if (response.success) {
        // Update payment status locally
        setPayments(
          payments.map((payment) =>
            payment._id === paymentId
              ? {
                  ...payment,
                  status: "refunded",
                  refundId: response.refund?.id,
                }
              : payment
          )
        );

        // Show success message
        alert("Refund processed successfully!");

        // Refresh stats to reflect changes
        fetchStats();
      } else {
        throw new Error(response.message || "Refund failed");
      }
    } catch (error) {
      console.error("Refund error:", error);
      alert(`Refund failed: ${error.message}`);
      apiUtils.handleError(error);
    }
  };

  const handleDownloadInvoice = async (paymentId) => {
    try {
      const response = await apiService.payments.downloadInvoice(paymentId);

      if (response.success) {
        // Create and download invoice as PDF
        const invoice = response.invoice;
        const invoiceText = `
          INVOICE: ${invoice.invoiceId}
          Date: ${invoice.date}
          Customer: ${invoice.customer.name} (${invoice.customer.email})
          
          Item: ${invoice.items[0].description}
          Amount: ${formatCurrency(invoice.items[0].total)}
          
          Total: ${formatCurrency(invoice.total)}
          Status: ${invoice.status}
          Payment ID: ${invoice.paymentIntentId}
        `;

        // Create blob and download
        const blob = new Blob([invoiceText], { type: "text/plain" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `invoice-${invoice.invoiceId}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Invoice download error:", error);
      alert("Failed to download invoice");
      apiUtils.handleError(error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
      case "succeeded":
      case "completed":
        return "bg-green-100 text-green-800 border border-green-200";
      case "created":
      case "processing":
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "failed":
      case "requires_payment_method":
        return "bg-red-100 text-red-800 border border-red-200";
      case "refunded":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "requires_action":
        return "bg-orange-100 text-orange-800 border border-orange-200";
      case "canceled":
        return "bg-gray-100 text-gray-800 border border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      paid: "Paid",
      succeeded: "Succeeded",
      completed: "Completed",
      created: "Created",
      processing: "Processing",
      pending: "Pending",
      failed: "Failed",
      refunded: "Refunded",
      requires_payment_method: "Requires Payment Method",
      requires_action: "Requires Action",
      canceled: "Canceled",
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const refreshData = () => {
    fetchPayments();
    fetchStats();
  };

  if (loading && payments.length === 0) {
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Payments Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage all payments and transactions
            </p>
          </div>
          <button
            onClick={refreshData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.totalPayments}
                </h3>
                <p className="text-gray-600">Total Payments</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalRevenue)}
                </h3>
                <p className="text-gray-600">Total Revenue</p>
                <p className="text-xs text-gray-500 mt-1">
                  Success Rate: {stats.successRate}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.pendingPayments}
                </h3>
                <p className="text-gray-600">Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.refundedPayments}
                </h3>
                <p className="text-gray-600">Refunded</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.successfulPayments}
                </h3>
                <p className="text-gray-600">Successful</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.failedPayments}
                </h3>
                <p className="text-gray-600">Failed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search payments by user, project, status, or transaction ID..."
              className="flex-1 max-w-md"
            />
            <div className="text-sm text-gray-600">
              Showing {filteredPayments.length} of {payments.length} payments
              {pagination.total > 0 && ` (Total: ${pagination.total})`}
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading && payments.length > 0 && (
            <div className="flex justify-center p-4">
              <Loader size="small" />
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 font-mono">
                        {payment.paymentIntentId
                          ? payment.paymentIntentId.slice(-8)
                          : payment._id.slice(-8)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {payment.paymentMethod || "Stripe"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.user?.name || "Unknown User"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.user?.email || "No email"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                        {payment.project?.title || "Unknown Project"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.project?.category || "No category"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(payment.amount)}
                      </div>
                      <div className="text-xs text-gray-500 uppercase">
                        {payment.currency || "usd"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {getStatusDisplay(payment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(payment.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {(payment.status === "paid" ||
                          payment.status === "succeeded") && (
                          <button
                            onClick={() =>
                              handleRefund(payment._id, payment.paymentIntentId)
                            }
                            className="text-purple-600 hover:text-purple-900 px-2 py-1 rounded text-xs font-medium"
                          >
                            Refund
                          </button>
                        )}
                        <button
                          onClick={() => handleDownloadInvoice(payment._id)}
                          className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded text-xs font-medium"
                        >
                          Invoice
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPayments.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                {payments.length === 0
                  ? "No payments found in the system"
                  : "No payments match your search criteria"}
              </div>
              {payments.length === 0 && (
                <button
                  onClick={refreshData}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Refresh Data
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex space-x-2">
              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => fetchPayments(page)}
                  className={`px-3 py-1 rounded ${
                    page === pagination.currentPage
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsManagement;
