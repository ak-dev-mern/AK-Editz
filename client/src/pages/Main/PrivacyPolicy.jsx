import React from "react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-5xl font-black mb-4 sm:mb-6">
              Privacy Policy
            </h1>
            <p className="text-base sm:text-xl text-blue-100 mb-6 sm:mb-8 leading-relaxed px-2">
              Your privacy is important to us. This policy explains how we
              collect, use, and protect your personal information.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:space-x-4 text-blue-100 text-sm sm:text-base">
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
        {/* Background effects */}
        <div className="absolute top-10 right-10 w-12 sm:w-20 h-12 sm:h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-10 sm:w-16 h-10 sm:h-16 bg-white/10 rounded-full animate-pulse delay-1000"></div>
      </section>

      {/* Main Content */}
      <section className="py-10 sm:py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Quick Navigation */}
          <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-10 sticky top-2 sm:top-4 z-10">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Quick Navigation
            </h3>
            <div className="flex flex-wrap gap-2 sm:gap-3">
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
                  className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors text-xs sm:text-sm font-medium"
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </a>
              ))}
            </div>
          </div>

          {/* Policy Sections */}
          <div className="space-y-8 sm:space-y-12">
            {/* Section Template */}
            <Section
              icon="🔒"
              color="blue"
              title="Introduction"
              content="Welcome to our Privacy Policy. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice or our practices, please contact us."
            />

            <Section
              id="information"
              icon="📊"
              color="green"
              title="Information We Collect"
              content="We collect personal information that you voluntarily provide to us when you register, express interest in our services, or contact us."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4">
                <Box
                  title="Personal Information"
                  list={["Name", "Email", "Phone", "Payment Info"]}
                />
                <Box
                  title="Automated Collection"
                  list={["IP Address", "Browser Type", "Usage Data", "Cookies"]}
                />
              </div>
            </Section>

            <Section
              id="usage"
              icon="🎯"
              color="purple"
              title="How We Use Your Information"
            >
              <div className="space-y-4">
                {[
                  {
                    icon: "🚀",
                    title: "Service Delivery",
                    text: "Provide and maintain our services.",
                  },
                  {
                    icon: "💬",
                    title: "Customer Support",
                    text: "Respond to your inquiries and issues.",
                  },
                  {
                    icon: "📈",
                    title: "Business Analytics",
                    text: "Analyze trends to improve experience.",
                  },
                  {
                    icon: "🔔",
                    title: "Marketing Communication",
                    text: "Send updates and offers.",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-xl"
                  >
                    <span className="text-lg sm:text-2xl">{item.icon}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                        {item.title}
                      </h4>
                      <p className="text-gray-600 text-xs sm:text-sm">
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section
              id="cookies"
              icon="🍪"
              color="yellow"
              title="Cookies & Tracking"
            >
              <p className="text-gray-600 mb-4">
                We use cookies to store information and enhance user experience.
                You can manage or disable cookies in your browser settings.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
                <h4 className="font-semibold text-blue-900 mb-2 sm:mb-3">
                  Cookie Preferences
                </h4>
                <p className="text-blue-800 text-xs sm:text-sm mb-3 sm:mb-4">
                  You can modify your cookie settings anytime in your browser
                  preferences.
                </p>
                <button className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  Manage Cookie Preferences
                </button>
              </div>
            </Section>

            <Section
              id="rights"
              icon="🛡️"
              color="red"
              title="Your Privacy Rights"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {[
                  ["Access", "Request your personal data copies"],
                  ["Rectification", "Correct inaccurate data"],
                  ["Erasure", "Request deletion of your data"],
                  ["Processing", "Object to data processing"],
                  ["Data Portability", "Transfer your data elsewhere"],
                  ["Withdraw Consent", "Revoke consent anytime"],
                ].map(([title, desc], i) => (
                  <div
                    key={i}
                    className="bg-gray-50 rounded-xl p-3 sm:p-4 border-l-4 border-blue-500"
                  >
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">
                      {title}
                    </h4>
                    <p className="text-gray-600 text-xs sm:text-sm">{desc}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section
              id="security"
              icon="🔐"
              color="green"
              title="Data Security"
            >
              <p className="text-gray-600 mb-4">
                We use industry-standard measures to protect your personal data.
              </p>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 sm:p-6 border border-green-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 sm:w-10 h-8 sm:h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm sm:text-lg">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                      Enterprise-grade Security
                    </h4>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      Encryption and audits safeguard your data.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  {[
                    "SSL Encryption",
                    "Secure Servers",
                    "Regular Audits",
                    "Access Controls",
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg p-2 sm:p-3 shadow-sm"
                    >
                      <div className="text-green-600 text-xs sm:text-sm font-medium break-words">
                        {feature}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            <Section id="contact" icon="📧" color="blue" title="Contact Us">
              <p className="text-gray-600 mb-4 sm:mb-6">
                If you have questions about this policy, reach us at:
              </p>
              <div className="bg-blue-50 rounded-xl p-4 sm:p-6 space-y-2 sm:space-y-3">
                <InfoRow icon="📧" text="privacy@yourbrand.com" />
                <InfoRow icon="🌐" text="www.yourbrand.com/contact" />
                <InfoRow icon="⏰" text="Response within 24–48 hours" />
              </div>
            </Section>
          </div>

          {/* Footer Note */}
          <div className="mt-10 sm:mt-12 text-center text-gray-500 text-xs sm:text-sm">
            <p>
              This Privacy Policy was last updated on{" "}
              {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ✅ Reusable Components */

const Section = ({ id, icon, color, title, content, children }) => (
  <div
    id={id}
    className="bg-white rounded-2xl shadow-lg p-5 sm:p-8 overflow-hidden"
  >
    <div className="flex flex-col sm:flex-row items-start sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
      <div
        className={`w-10 h-10 sm:w-12 sm:h-12 bg-${color}-100 rounded-xl flex items-center justify-center flex-shrink-0`}
      >
        <span className="text-xl sm:text-2xl">{icon}</span>
      </div>
      <div className="flex-1">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          {title}
        </h2>
        {content && (
          <p className="text-gray-600 text-sm sm:text-base mb-4">{content}</p>
        )}
        {children}
      </div>
    </div>
  </div>
);

const Box = ({ title, list }) => (
  <div className="bg-gray-50 rounded-xl p-4">
    <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
      {title}
    </h4>
    <ul className="text-gray-600 space-y-1 text-xs sm:text-sm">
      {list.map((item, i) => (
        <li key={i}>• {item}</li>
      ))}
    </ul>
  </div>
);

const InfoRow = ({ icon, text }) => (
  <div className="flex items-center space-x-2 sm:space-x-3 text-gray-700 text-xs sm:text-sm">
    <span className="text-blue-600">{icon}</span>
    <span className="break-all">{text}</span>
  </div>
);

export default PrivacyPolicy;
