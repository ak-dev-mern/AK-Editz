import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 30000,
  withCredentials: true, // Important for cookies
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (if using token instead of cookies)
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add common headers
    config.headers["Content-Type"] = "application/json";

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle different error types
    let errorMessage = "An unexpected error occurred";

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 400:
          errorMessage = data.message || "Bad request";
          break;
        case 401:
          errorMessage = data.message || "Unauthorized access";
          // Clear token and redirect to login if unauthorized
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

      // Include validation errors if available
      if (data.errors) {
        errorMessage += `: ${data.errors.join(", ")}`;
      }
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = "Network error: Unable to connect to server";
    } else {
      // Something else happened
      errorMessage = error.message;
    }

    // Create enhanced error object
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
  },

  // Users API (Admin only)
  users: {
    getAll: () => api.get("/users"),
    getById: (id) => api.get(`/users/${id}`),
    update: (id, userData) => api.put(`/users/${id}`, userData),
    delete: (id) => api.delete(`/users/${id}`),
    getStats: () => api.get("/users/stats"),
  },

  // Projects API
  projects: {
    getAll: (params = {}) => api.get("/projects", { params }),
    getById: (id) => api.get(`/projects/${id}`),
    getFeatured: () => api.get("/projects/featured"),
    getByCategory: (category) => api.get(`/projects/category/${category}`),
    getSimilar: (id) => api.get(`/projects/similar/${id}`),
    create: (projectData) => {
      const formData = new FormData();

      // Append all fields to formData
      Object.keys(projectData).forEach((key) => {
        if (key === "images" && projectData.images) {
          projectData.images.forEach((image) => {
            formData.append("images", image);
          });
        } else {
          formData.append(key, projectData[key]);
        }
      });

      return api.post("/projects", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    update: (id, projectData) => {
      const formData = new FormData();

      Object.keys(projectData).forEach((key) => {
        if (key === "images" && projectData.images) {
          projectData.images.forEach((image) => {
            formData.append("images", image);
          });
        } else {
          formData.append(key, projectData[key]);
        }
      });

      return api.put(`/projects/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    delete: (id) => api.delete(`/projects/${id}`),
    toggleActive: (id) => api.patch(`/projects/${id}/toggle-active`),
    toggleFeatured: (id) => api.patch(`/projects/${id}/toggle-featured`),
    getStats: () => api.get("/projects/admin/stats"),
  },

  // Blog API
  blogs: {
    getAll: (params = {}) => api.get("/blogs", { params }),
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

  // Payments API
  payments: {
    createOrder: (orderData) => api.post("/payments/create-order", orderData),
    verifyPayment: (paymentData) => api.post("/payments/verify", paymentData),
    getPurchasedProjects: () => api.get("/payments/my-projects"),
    getUserPayments: () => api.get("/payments/user-payments"),
    getPaymentById: (id) => api.get(`/payments/${id}`),
    downloadInvoice: (id) =>
      api.get(`/payments/invoice/${id}`, {
        responseType: "blob",
      }),
    // Admin only
    getAll: () => api.get("/payments/admin/all"),
    getStats: () => api.get("/payments/admin/stats/overview"),
    refundPayment: (id) => api.post(`/payments/admin/refund/${id}`),
  },
};

// Utility functions
export const apiUtils = {
  // Handle API errors in components
  handleError: (error, customHandler) => {
    console.error("API Error:", error);

    if (customHandler) {
      customHandler(error);
      return;
    }

    // Default error handling (you can integrate with your notification system)
    const message = error.message || "Something went wrong";

    // Example: Show toast notification
    if (typeof window !== "undefined" && window.toast) {
      window.toast.error(message);
    } else {
      alert(message); // Fallback
    }
  },

  // Check if error is a specific type
  isUnauthorized: (error) => error.status === 401,
  isNotFound: (error) => error.status === 404,
  isServerError: (error) => error.status >= 500,

  // Extract validation errors
  getValidationErrors: (error) => {
    return error.data?.errors || [];
  },
};

// Export the raw axios instance for custom requests
export { api as axiosInstance };

export default apiService;
