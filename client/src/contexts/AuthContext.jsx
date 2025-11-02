import React, { createContext, useState, useContext, useEffect } from "react";
import { apiService, apiUtils } from "../utils/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await apiService.auth.getCurrentUser();
        setUser(response.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await apiService.auth.login(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
      if (response.token) {
        localStorage.setItem("token", response.token);
      }
      return { success: true, data: response };
    } catch (error) {
      apiUtils.handleError(error);
      return { success: false, error };
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiService.auth.register(userData);
      setUser(response.user);
      setIsAuthenticated(true);
      if (response.token) {
        localStorage.setItem("token", response.token);
      }
      return { success: true, data: response };
    } catch (error) {
      apiUtils.handleError(error);
      return { success: false, error };
    }
  };

  const logout = async () => {
    try {
      // Try to call logout API if it exists
      await apiService.auth.logout();
    } catch (error) {
      // If logout endpoint doesn't exist, just clear local state
      console.log("Logout API not available, clearing local state only");
    } finally {
      // Always clear local state and storage
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("token");

      // Clear any cookies by setting expired cookie
      document.cookie =
        "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  };

  const updateProfile = async (userData) => {
    try {
      const response = await apiService.auth.updateProfile(userData);
      setUser(response.user);
      return { success: true, data: response };
    } catch (error) {
      apiUtils.handleError(error);
      return { success: false, error };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
  