// components/Newsletter/NewsletterSubscription.jsx
import React, { useState } from "react";
import { apiService } from "../../utils/api";

const NewsletterSubscription = ({ source = "website", className = "" }) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [showNameField, setShowNameField] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Please enter your email address");
      setIsSuccess(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("Please enter a valid email address");
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await apiService.newsletter.subscribe(
        email,
        name,
        source
      );

      setMessage(
        "🎉 Thank you for subscribing! Please check your email for a welcome message."
      );
      setIsSuccess(true);
      setEmail("");
      setName("");
      setShowNameField(false);

      // Clear success message after 8 seconds
      setTimeout(() => {
        setMessage("");
        setIsSuccess(false);
      }, 8000);
    } catch (error) {
      const errorMessage =
        error.message || "Failed to subscribe. Please try again.";
      setMessage(errorMessage);
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className={`bg-gradient-to-r from-blue-600 to-purple-700 py-16 ${className}`}
    >
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
          Stay Updated
        </h2>
        <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg">
          Get the latest projects, articles, and industry insights delivered to
          your inbox. Join our community of developers and creators!
        </p>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="space-y-4">
            {showNameField && (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                disabled={loading}
              />
            )}

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-blue-700 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-blue-700 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Subscribing...
                </div>
              ) : (
                "Subscribe Now 🚀"
              )}
            </button>
          </div>

          {!showNameField && (
            <button
              type="button"
              onClick={() => setShowNameField(true)}
              className="mt-3 text-blue-200 hover:text-white text-sm transition-colors"
            >
              + Add your name (optional)
            </button>
          )}

          {message && (
            <div
              className={`mt-4 p-4 rounded-xl ${
                isSuccess ? "bg-green-500 text-white" : "bg-red-500 text-white"
              }`}
            >
              <div className="flex items-center justify-center">
                {isSuccess ? (
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {message}
              </div>
            </div>
          )}

          <p className="text-blue-200 text-sm mt-4">
            ✨ No spam ever • Unsubscribe anytime • Exclusive content
          </p>
        </form>
      </div>
    </section>
  );
};

export default NewsletterSubscription;
