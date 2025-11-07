import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: "https://ak-editz.onrender.com/api,
  timeout: 30000,
  withCredentials: true, // Important for cookies
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // DON'T set Content-Type for FormData - let browser handle it
    // Only set JSON content type if it's not FormData and not already set
    if (!config.headers["Content-Type"] && !(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    // If it's FormData, let the browser set the Content-Type with boundary
    if (config.data instanceof FormData) {
      // Remove any existing Content-Type to let browser set it automatically
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let errorMessage = "An unexpected error occurred";

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          errorMessage = data.message || "Bad request";
          break;
        case 401:
          errorMessage = data.message || "Unauthorized access";
          localStorage.removeItem("token");
          window.dispatchEvent(new Event("unauthorized"));
          break;
        case 403:
          errorMessage = data.message || "Access forbidden";
          break;
        case 404:
          errorMessage = data.message || "Resource not found";
          break;
        case 409:
          errorMessage = data.message || "Conflict occurred";
          break;
        case 422:
          errorMessage = data.message || "Validation failed";
          break;
        case 429:
          errorMessage = data.message || "Too many requests";
          break;
        case 500:
          errorMessage = data.message || "Internal server error";
          break;
        case 502:
          errorMessage = "Bad gateway";
          break;
        case 503:
          errorMessage = "Service unavailable";
          break;
        default:
          errorMessage = data.message || `Error ${status}`;
      }

      if (data.errors) {
        errorMessage += `: ${data.errors.join(", ")}`;
      }
    } else if (error.request) {
      errorMessage = "Network error: Unable to connect to server";
    } else {
      errorMessage = error.message;
    }

    const enhancedError = new Error(errorMessage);
    enhancedError.status = error.response?.status;
    enhancedError.data = error.response?.data;
    enhancedError.originalError = error;

    return Promise.reject(enhancedError);
  }
);

// API service functions
export const apiService = {
  // Auth API
  auth: {
    register: (userData) => api.post("/auth/register", userData),
    login: (credentials) => api.post("/auth/login", credentials),
    getCurrentUser: () => api.get("/auth/me"),
    updateProfile: (userData) => api.put("/auth/profile", userData),
    changePassword: (passwordData) =>
      api.put("/auth/change-password", passwordData),
    logout: () => api.post("/auth/logout"),
    forgotPassword: (data) => api.post("/auth/forgot-password", data),
    resetPassword: (token, data) =>
      api.post(`/auth/reset-password/${token}`, data),
    validateResetToken: (token) =>
      api.get(`/auth/validate-reset-token/${token}`),
  },

  // Projects API
  projects: {
    getAll: (params = {}) => api.get("/projects", { params }),
    getById: (id) => api.get(`/projects/${id}`),
    getAdminAll: (params = {}, config = {}) =>
      api.get("/projects/admin/all", { params, ...config }),
    getFeatured: () => api.get("/projects/featured"),
    getByCategory: (category) => api.get(`/projects/category/${category}`),
    getSimilar: (id) => api.get(`/projects/similar/${id}`),

    // Now sends JSON only (no FormData)
    create: (projectData) => api.post("/projects", projectData),
    update: (id, projectData) => api.put(`/projects/${id}`, projectData),

    delete: (id) => api.delete(`/projects/${id}`),
    toggleActive: (id) => api.patch(`/projects/${id}/toggle-active`),
    toggleFeatured: (id) => api.patch(`/projects/${id}/toggle-featured`),
    getStats: () => api.get("/projects/admin/stats"),
  },

  // Users API (Admin only)
  users: {
    getAll: () => api.get("/users"),
    getById: (id) => api.get(`/users/${id}`),
    update: (id, userData) => api.put(`/users/${id}`, userData),
    delete: (id) => api.delete(`/users/${id}`),
    getStats: () => api.get("/users/stats"),
    getUserCount: () => api.get("/users/count"),
  },

  // Payment API (Stripe)
  payments: {
    createPaymentIntent: (paymentData) =>
      api.post("/payments/create-payment-intent", paymentData),

    confirmPayment: (confirmationData) =>
      api.post("/payments/confirm", confirmationData),

    getPurchasedProjects: () => api.get("/payments/purchased-projects"),

    getUserPayments: (params = {}) =>
      api.get("/payments/user/history", { params }),

    getById: (id) => api.get(`/payments/${id}`),

    downloadInvoice: (id) => api.get(`/payments/${id}/invoice`),

    // ADD THESE QR PAYMENT METHODS HERE (NOT UNDER ADMIN):
    createQRPayment: (data) => api.post("/payments/qr/create", data),

    checkQRPaymentStatus: (paymentId) =>
      api.get(`/payments/qr/status/${paymentId}`),

    admin: {
      getAll: (params = {}) => api.get("/payments/admin/all", { params }),

      getStats: (params = {}) => api.get("/payments/admin/stats", { params }),

      refund: (id) => api.post(`/payments/admin/${id}/refund`),
    },
  },

  // Blog API
  blogs: {
    getAll: (params = {}) => api.get("/blogs", { params }),
    getAdminAll: (params = {}, config = {}) =>
      api.get("/blogs/admin/all", { params, ...config }),
    getById: (id) => api.get(`/blogs/${id}`),
    getFeatured: () => api.get("/blogs/featured"),
    getByCategory: (category) => api.get(`/blogs/category/${category}`),
    incrementViews: (id) => api.patch(`/blogs/${id}/views`),
    create: (blogData) => api.post("/blogs", blogData),
    update: (id, blogData) => api.put(`/blogs/${id}`, blogData),
    delete: (id) => api.delete(`/blogs/${id}`),
    getStats: () => api.get("/blogs/admin/stats"),
    togglePublish: (id) => api.patch(`/blogs/${id}/toggle-publish`),
  },

  // Newsletter API
  newsletter: {
    subscribe: (email, name, source = "website") =>
      api.post("/newsletter/subscribe", { email, name, source }),

    unsubscribe: (email) => api.post("/newsletter/unsubscribe/", { email }),

    getSubscribers: (params = {}) =>
      api.get("/newsletter/subscribers", { params }),

    getStats: () => api.get("/newsletter/stats"),
  },
};

// Utility functions
export const apiUtils = {
  handleError: (error, customHandler) => {
    console.error("API Error:", error);
    if (customHandler) {
      customHandler(error);
      return;
    }
    const message = error.message || "Something went wrong";
    if (typeof window !== "undefined" && window.toast) {
      window.toast.error(message);
    } else {
      alert(message);
    }
  },
  isUnauthorized: (error) => error.status === 401,
  isNotFound: (error) => error.status === 404,
  isServerError: (error) => error.status >= 500,
  getValidationErrors: (error) => error.data?.errors || [],
};

export { api as axiosInstance };
export default apiService;
