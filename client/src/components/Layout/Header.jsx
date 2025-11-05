import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-11 h-11 bg-gradient-to-r from-blue-800 to-purple-800 rounded-3xl flex items-center justify-center">
              {/* <span className="text-white font-bold text-lg">A</span> */}
              <img src="/Logo-1.png" alt="AK Editz Logo" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
              AK Editz
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/portfolio"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Portfolio
            </Link>
            <Link
              to="/projects"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Projects
            </Link>
            <Link
              to="/blogs"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Blog
            </Link>
            <Link
              to="/about"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Admin Panel
                  </Link>
                )}
                {user?.role !== "admin" && (
                  <Link
                    to="/dashboard"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Dashboard
                  </Link>
                )}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <span>{user?.name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-t-lg"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-b-lg"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="w-6 h-6 flex flex-col justify-between">
              <span
                className={`w-full h-0.5 bg-gray-600 transition-transform ${
                  isMenuOpen ? "rotate-45 translate-y-2.5" : ""
                }`}
              ></span>
              <span
                className={`w-full h-0.5 bg-gray-600 transition-opacity ${
                  isMenuOpen ? "opacity-0" : ""
                }`}
              ></span>
              <span
                className={`w-full h-0.5 bg-gray-600 transition-transform ${
                  isMenuOpen ? "-rotate-45 -translate-y-2.5" : ""
                }`}
              ></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-3 mt-3">
              <Link to="/" className="text-gray-600 hover:text-blue-600 py-2">
                Home
              </Link>
              <Link
                to="/portfolio"
                className="text-gray-600 hover:text-blue-600 py-2"
              >
                Portfolio
              </Link>
              <Link
                to="/projects"
                className="text-gray-600 hover:text-blue-600 py-2"
              >
                Projects
              </Link>
              <Link
                to="/blogs"
                className="text-gray-600 hover:text-blue-600 py-2"
              >
                Blog
              </Link>
              <Link
                to="/about"
                className="text-gray-600 hover:text-blue-600 py-2"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-gray-600 hover:text-blue-600 py-2"
              >
                Contact
              </Link>

              {isAuthenticated ? (
                <>
                  {user?.role === "admin" && (
                    <Link
                      to="/admin"
                      className="text-yellow-600 hover:text-yellow-700 py-2"
                    >
                      Admin Panel
                    </Link>
                  )}
                  {user?.role !== "admin" && (
                    <Link
                      to="/dashboard"
                      className="text-gray-600 hover:text-blue-600 py-2"
                    >
                      Dashboard
                    </Link>
                  )}

                  <Link
                    to="/profile"
                    className="text-gray-600 hover:text-blue-600 py-2"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-left text-red-600 hover:text-red-700 py-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-blue-600 py-2"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="text-blue-600 hover:text-blue-700 py-2"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
