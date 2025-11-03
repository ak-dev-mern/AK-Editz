// components/Newsletter/UnsubscribeSuccess.jsx
import React from "react";
import { Link } from "react-router-dom";

const UnsubscribeSuccessPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-green-600"
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

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Unsubscribed Successfully
        </h1>

        <p className="text-gray-600 mb-2">
          You have been successfully unsubscribed from our newsletter.
        </p>

        <p className="text-gray-500 text-sm mb-8">
          We're sorry to see you go. You will no longer receive newsletter
          emails from us.
        </p>

        <div className="space-y-3">
          <Link
            to="/"
            className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Return to Homepage
          </Link>

          <Link
            to="/contact"
            className="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Contact Us
          </Link>
        </div>

        <p className="text-gray-400 text-xs mt-6">
          If you change your mind, you can always resubscribe from our homepage.
        </p>
      </div>
    </div>
  );
};

export default UnsubscribeSuccessPage;
