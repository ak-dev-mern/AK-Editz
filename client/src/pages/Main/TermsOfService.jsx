import React from "react";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-purple-600 to-pink-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-black mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-purple-100 mb-8 leading-relaxed">
              Please read these terms carefully before using our services. By
              accessing or using our service, you agree to be bound by these
              terms.
            </p>
            <div className="flex items-center justify-center space-x-4 text-purple-100">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Last updated: {new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>Legal Agreement</span>
              </div>
            </div>
          </div>
        </div>

        {/* Background elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-1000"></div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Quick Navigation */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-12 sticky top-4 z-10">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Navigation
              </h3>
              <div className="flex flex-wrap gap-3">
                {[
                  "agreement",
                  "accounts",
                  "services",
                  "payments",
                  "intellectual",
                  "liability",
                  "termination",
                ].map((section) => (
                  <a
                    key={section}
                    href={`#${section}`}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-purple-100 hover:text-purple-700 transition-colors text-sm font-medium"
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </a>
                ))}
              </div>
            </div>

            {/* Terms Content */}
            <div className="space-y-12">
              {/* Agreement */}
              <div
                id="agreement"
                className="bg-white rounded-2xl shadow-lg p-8"
              >
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📝</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Agreement to Terms
                    </h2>
                    <p className="text-gray-600 mb-4">
                      By accessing and using our services, you accept and agree
                      to be bound by the terms and provision of this agreement.
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                      <div className="flex items-start space-x-3">
                        <span className="text-yellow-600 text-xl">⚠️</span>
                        <div>
                          <h4 className="font-semibold text-yellow-800 mb-2">
                            Important Notice
                          </h4>
                          <p className="text-yellow-700 text-sm">
                            If you do not agree to abide by these terms, you are
                            not authorized to use or access our services.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Accounts */}
              <div id="accounts" className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      User Accounts
                    </h2>
                    <p className="text-gray-600 mb-6">
                      When you create an account with us, you must provide
                      accurate and complete information. You are responsible for
                      maintaining the security of your account.
                    </p>

                    <div className="space-y-4">
                      {[
                        {
                          requirement: "Account Security",
                          description:
                            "You are responsible for safeguarding your password and for all activities under your account.",
                        },
                        {
                          requirement: "Accurate Information",
                          description:
                            "You must provide accurate and complete registration information.",
                        },
                        {
                          requirement: "Age Requirement",
                          description:
                            "You must be at least 18 years old to use our services.",
                        },
                        {
                          requirement: "One Account",
                          description:
                            "You may not create more than one account without permission.",
                        },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl border-l-4 border-blue-500"
                        >
                          <span className="text-blue-600 font-semibold text-sm mt-1">
                            #{index + 1}
                          </span>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {item.requirement}
                            </h4>
                            <p className="text-gray-600 text-sm">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div id="services" className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🛠️</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Our Services
                    </h2>
                    <p className="text-gray-600 mb-6">
                      We provide various digital services including web
                      development, design, and consulting. We reserve the right
                      to modify or discontinue our services at any time.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6">
                        <h4 className="font-semibold text-gray-900 mb-3">
                          What We Provide
                        </h4>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-center space-x-2">
                            <span className="text-green-500">✓</span>
                            <span>Professional web development services</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="text-green-500">✓</span>
                            <span>UI/UX design and consulting</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="text-green-500">✓</span>
                            <span>Technical support and maintenance</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="text-green-500">✓</span>
                            <span>Project management and delivery</span>
                          </li>
                        </ul>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                        <h4 className="font-semibold text-gray-900 mb-3">
                          Service Limitations
                        </h4>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-center space-x-2">
                            <span className="text-purple-500">ⓘ</span>
                            <span>
                              Services may be modified or discontinued
                            </span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="text-purple-500">ⓘ</span>
                            <span>Availability may vary by region</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="text-purple-500">ⓘ</span>
                            <span>
                              Some features may require additional fees
                            </span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="text-purple-500">ⓘ</span>
                            <span>Technical requirements may apply</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payments & Refunds */}
              <div id="payments" className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">💳</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Payments & Refunds
                    </h2>
                    <p className="text-gray-600 mb-6">
                      All payments are processed securely. We offer refunds
                      under certain conditions as outlined in this section.
                    </p>

                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h4 className="font-semibold text-gray-900 mb-3">
                          Payment Terms
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">
                              Payment Methods:
                            </span>
                            <p className="text-gray-600">
                              Credit cards, PayPal, bank transfers
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Billing Cycle:
                            </span>
                            <p className="text-gray-600">
                              Monthly or project-based
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Taxes:
                            </span>
                            <p className="text-gray-600">
                              Additional taxes may apply
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Currency:
                            </span>
                            <p className="text-gray-600">
                              USD (or as specified)
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-3">
                          Refund Policy
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-700">Full refund</span>
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                              Within 14 days
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-700">
                              Partial refund
                            </span>
                            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                              Case by case
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-700">No refund</span>
                            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                              After 30 days
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Intellectual Property */}
              <div
                id="intellectual"
                className="bg-white rounded-2xl shadow-lg p-8"
              >
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">©️</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Intellectual Property
                    </h2>
                    <p className="text-gray-600 mb-6">
                      The Service and its original content, features, and
                      functionality are and will remain the exclusive property
                      of YourBrand and its licensors.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-red-50 rounded-xl p-6 border-l-4 border-red-500">
                        <h4 className="font-semibold text-gray-900 mb-3">
                          Our Rights
                        </h4>
                        <ul className="space-y-2 text-gray-600 text-sm">
                          <li>• All code, designs, and content</li>
                          <li>• Brand names and logos</li>
                          <li>• Proprietary technology</li>
                          <li>• Service documentation</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 rounded-xl p-6 border-l-4 border-green-500">
                        <h4 className="font-semibold text-gray-900 mb-3">
                          Your Rights
                        </h4>
                        <ul className="space-y-2 text-gray-600 text-sm">
                          <li>• Personal use license</li>
                          <li>• Content you create</li>
                          <li>• Your personal data</li>
                          <li>• Fair use provisions</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Termination */}
              <div
                id="termination"
                className="bg-white rounded-2xl shadow-lg p-8"
              >
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">⏹️</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Termination
                    </h2>
                    <p className="text-gray-600 mb-6">
                      We may terminate or suspend your account and bar access to
                      the Service immediately, without prior notice or
                      liability, under our sole discretion.
                    </p>

                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">
                        Termination Scenarios
                      </h4>
                      <div className="space-y-3">
                        {[
                          "Violation of Terms of Service",
                          "Request by law enforcement",
                          "Unexpected technical issues",
                          "Extended periods of inactivity",
                          "Fraudulent or illegal activity",
                        ].map((scenario, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-3"
                          >
                            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                            <span className="text-gray-700">{scenario}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Acceptance Section */}
            <div className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-4">Accept Our Terms</h3>
              <p className="text-purple-100 mb-6">
                By using our services, you acknowledge that you have read,
                understood, and agree to be bound by these Terms of Service.
              </p>
              <div className="flex justify-center space-x-4">
                <button className="bg-white text-purple-600 px-8 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-colors">
                  I Accept
                </button>
                <button className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors">
                  Learn More
                </button>
              </div>
            </div>

            {/* Last Updated */}
            <div className="mt-12 text-center text-gray-500 text-sm">
              <p>
                These Terms of Service were last updated on{" "}
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsOfService;
