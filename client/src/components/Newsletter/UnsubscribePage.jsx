// components/Newsletter/UnsubscribePage.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { apiService } from "../../utils/api";

const UnsubscribePage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleUnsubscribe = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Please enter your email address");
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await apiService.newsletter.unsubscribe(email);

      setMessage(
        "You have been successfully unsubscribed from our newsletter."
      );
      setIsSuccess(true);
      setEmail("");
    } catch (error) {
      const errorMessage =
        error.message || "Failed to unsubscribe. Please try again.";
      setMessage(errorMessage);
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-8 px-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">
            Newsletter Unsubscribe
          </h1>
          <p className="text-blue-100">We're sorry to see you go</p>
        </div>

        <div className="p-8">
          {!isSuccess ? (
            <>
              <p className="text-gray-600 mb-6 text-center">
                Enter your email address to unsubscribe from our newsletter.
              </p>

              <form onSubmit={handleUnsubscribe}>
                <div className="mb-6">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Unsubscribing...
                    </div>
                  ) : (
                    "Unsubscribe"
                  )}
                </button>
              </form>

              {message && (
                <div
                  className={`mt-4 p-3 rounded-lg text-center ${
                    isSuccess
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {message}
                </div>
              )}

              <div className="mt-6 text-center">
                <p className="text-gray-500 text-sm">
                  Changed your mind?{" "}
                  <Link
                    to="/"
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Stay subscribed
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Unsubscribed Successfully
              </h2>
              <p className="text-gray-600 mb-6">
                You have been removed from our newsletter mailing list.
              </p>

              <div className="space-y-3">
                <Link
                  to="/"
                  className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Return to Homepage
                </Link>

                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setMessage("");
                  }}
                  className="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Unsubscribe Another Email
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Info */}
      <div className="max-w-md mx-auto mt-8 text-center">
        <p className="text-gray-500 text-sm">
          Having trouble? Contact us at{" "}
          <a
            href="mailto:support@akeditz.com"
            className="text-blue-600 hover:text-blue-700"
          >
            support@akeditz.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default UnsubscribePage;
