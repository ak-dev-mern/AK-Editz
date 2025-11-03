import React from "react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-black mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Your privacy is important to us. This policy explains how we
              collect, use, and protect your personal information.
            </p>
            <div className="flex items-center justify-center space-x-4 text-blue-100">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Last updated: {new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Transparent & Secure</span>
              </div>
            </div>
          </div>
        </div>

        {/* Background elements */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-1000"></div>
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
                  "information",
                  "usage",
                  "cookies",
                  "rights",
                  "security",
                  "contact",
                ].map((section) => (
                  <a
                    key={section}
                    href={`#${section}`}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors text-sm font-medium"
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </a>
                ))}
              </div>
            </div>

            {/* Policy Content */}
            <div className="space-y-12">
              {/* Introduction */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Introduction
                    </h2>
                    <p className="text-gray-600">
                      Welcome to our Privacy Policy. We are committed to
                      protecting your personal information and your right to
                      privacy. If you have any questions or concerns about this
                      privacy notice or our practices with regard to your
                      personal information, please contact us.
                    </p>
                  </div>
                </div>
              </div>

              {/* Information We Collect */}
              <div
                id="information"
                className="bg-white rounded-2xl shadow-lg p-8"
              >
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Information We Collect
                    </h2>
                    <p className="text-gray-600 mb-4">
                      We collect personal information that you voluntarily
                      provide to us when you register on the website, express an
                      interest in obtaining information about us or our products
                      and services, or otherwise contact us.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Personal Information
                        </h4>
                        <ul className="text-gray-600 space-y-1 text-sm">
                          <li>• Name and contact details</li>
                          <li>• Email address</li>
                          <li>• Phone number</li>
                          <li>• Payment information</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Automated Collection
                        </h4>
                        <ul className="text-gray-600 space-y-1 text-sm">
                          <li>• IP address and browser type</li>
                          <li>• Usage patterns and preferences</li>
                          <li>• Device information</li>
                          <li>• Cookies and tracking data</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* How We Use Your Information */}
              <div id="usage" className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      How We Use Your Information
                    </h2>
                    <p className="text-gray-600 mb-6">
                      We use personal information collected via our website for
                      a variety of business purposes described below.
                    </p>

                    <div className="space-y-4">
                      {[
                        {
                          icon: "🚀",
                          title: "Service Delivery",
                          description:
                            "To provide and maintain our services, including monitoring usage.",
                        },
                        {
                          icon: "💬",
                          title: "Customer Support",
                          description:
                            "To respond to your inquiries and solve any potential issues.",
                        },
                        {
                          icon: "📈",
                          title: "Business Analytics",
                          description:
                            "To analyze usage trends and improve user experience.",
                        },
                        {
                          icon: "🔔",
                          title: "Marketing Communication",
                          description:
                            "To send administrative information and marketing promotions.",
                        },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl"
                        >
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {item.title}
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

              {/* Cookies & Tracking */}
              <div id="cookies" className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🍪</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Cookies & Tracking
                    </h2>
                    <p className="text-gray-600 mb-4">
                      We use cookies and similar tracking technologies to access
                      or store information. You can instruct your browser to
                      refuse all cookies or to indicate when a cookie is being
                      sent.
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                      <h4 className="font-semibold text-blue-900 mb-3">
                        Cookie Preferences
                      </h4>
                      <p className="text-blue-800 text-sm mb-4">
                        You have control over your cookie preferences. Most web
                        browsers are set to accept cookies by default, but you
                        can usually modify your browser setting to decline
                        cookies.
                      </p>
                      <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                        Manage Cookie Preferences
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Your Rights */}
              <div id="rights" className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🛡️</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Your Privacy Rights
                    </h2>
                    <p className="text-gray-600 mb-6">
                      You have certain rights regarding your personal
                      information. You may review, change, or terminate your
                      account at any time.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                      {[
                        {
                          right: "Access",
                          description: "Request copies of your personal data",
                        },
                        {
                          right: "Rectification",
                          description: "Request correction of inaccurate data",
                        },
                        {
                          right: "Erasure",
                          description: "Request deletion of your personal data",
                        },
                        {
                          right: "Processing",
                          description: "Object to our processing of your data",
                        },
                        {
                          right: "Data Portability",
                          description:
                            "Request transfer of data to another organization",
                        },
                        {
                          right: "Withdraw Consent",
                          description: "Withdraw consent at any time",
                        },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 rounded-xl p-4 border-l-4 border-blue-500"
                        >
                          <h4 className="font-semibold text-gray-900 mb-2">
                            {item.right}
                          </h4>
                          <p className="text-gray-600 text-sm">
                            {item.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Security */}
              <div id="security" className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🔐</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Data Security
                    </h2>
                    <p className="text-gray-600 mb-4">
                      We have implemented appropriate technical and
                      organizational security measures designed to protect the
                      security of any personal information we process.
                    </p>

                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-lg">✓</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            Enterprise-grade Security
                          </h4>
                          <p className="text-gray-600 text-sm">
                            Your data is protected with industry-standard
                            encryption
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        {[
                          "SSL Encryption",
                          "Secure Servers",
                          "Regular Audits",
                          "Access Controls",
                        ].map((feature, index) => (
                          <div
                            key={index}
                            className="bg-white rounded-lg p-3 shadow-sm"
                          >
                            <div className="text-green-600 text-sm font-medium">
                              {feature}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div id="contact" className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📧</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Contact Us
                    </h2>
                    <p className="text-gray-600 mb-6">
                      If you have questions or comments about this policy, you
                      may contact our Data Protection Officer (DPO) by email at
                      privacy@yourbrand.com.
                    </p>

                    <div className="bg-blue-50 rounded-xl p-6">
                      <h4 className="font-semibold text-blue-900 mb-4">
                        Get in Touch
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-blue-600">📧</span>
                          <span className="text-gray-700">
                            privacy@yourbrand.com
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-blue-600">🌐</span>
                          <span className="text-gray-700">
                            www.yourbrand.com/contact
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-blue-600">⏰</span>
                          <span className="text-gray-700">
                            Response within 24-48 hours
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Last Updated */}
            <div className="mt-12 text-center text-gray-500 text-sm">
              <p>
                This Privacy Policy was last updated on{" "}
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
