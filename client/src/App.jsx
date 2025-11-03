import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/Common/ProtectedRoute";
import AdminRoute from "./components/Common/AdminRoute";

// Import pages
import Home from "./pages/Main/Home";
import About from "./pages/Main/About";
import Contact from "./pages/Main/Contact";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Projects from "./pages/Projects/Projects";
import ProjectDetails from "./pages/Projects/ProjectDetail";
import Blog from "./pages/Blog/Blogs";
import BlogDetails from "./pages/Blog/BlogDetail";
import Dashboard from "./pages/User/Dashboard";
import Profile from "./pages/User/UserProfile";
import Checkout from "./pages/User/Checkout";

// Admin pages
import AdminPanel from "./pages/Admin/AdminPanel";
import UsersManagement from "./pages/Admin/UsersManagement";
import ProjectsManagement from "./pages/Admin/ProjectsManagement";
import BlogsManagement from "./pages/Admin/BlogsManagement";
import PaymentsManagement from "./pages/Admin/PaymentsManagement";

import "./styles/globals.css";
import Portfolio from "./pages/Main/Portfolio";
import PrivacyPolicy from "./pages/Main/PrivacyPolicy";
import TermsOfService from "./pages/Main/TermsOfService";
import HelpCenter from "./pages/Main/HelpCenter";
import { ChatBotProvider } from "./components/ChatBot/ChatBotProvider";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ChatBotProvider>
          <Router>
            <Layout>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacypolicy" element={<PrivacyPolicy />} />
                <Route path="/termsofservice" element={<TermsOfService />} />
                <Route path="/helpcenter" element={<HelpCenter />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:id" element={<ProjectDetails />} />
                <Route path="/blogs" element={<Blog />} />
                <Route path="/blogs/:id" element={<BlogDetails />} />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout/:projectId"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminPanel />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <AdminRoute>
                      <UsersManagement />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/projects"
                  element={
                    <AdminRoute>
                      <ProjectsManagement />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/blogs"
                  element={
                    <AdminRoute>
                      <BlogsManagement />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/payments"
                  element={
                    <AdminRoute>
                      <PaymentsManagement />
                    </AdminRoute>
                  }
                />
              </Routes>
            </Layout>
          </Router>
        </ChatBotProvider>
      </AuthProvider>

      {/* React Query Devtools - remove in production */}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}

export default App;
