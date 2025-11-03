import React, { useState } from "react";
import { Link } from "react-router-dom";

const HelpCenter = () => {
  const [activeCategory, setActiveCategory] = useState("general");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFAQ, setActiveFAQ] = useState(null);

  const categories = [
    {
      id: "general",
      name: "General",
      icon: "📋",
      description: "Basic information and account setup",
    },
    {
      id: "projects",
      name: "Projects",
      icon: "🚀",
      description: "Managing and purchasing projects",
    },
    {
      id: "payments",
      name: "Payments",
      icon: "💳",
      description: "Billing, refunds, and payment issues",
    },
    {
      id: "technical",
      name: "Technical",
      icon: "🔧",
      description: "Technical support and troubleshooting",
    },
    {
      id: "account",
      name: "Account",
      icon: "👤",
      description: "Profile settings and security",
    },
  ];

  const faqs = {
    general: [
      {
        id: 1,
        question: "How do I get started with your services?",
        answer:
          "Getting started is easy! Simply create an account, browse our portfolio, and contact us through the project inquiry form. We'll schedule a free consultation to discuss your requirements and provide a customized solution.",
        popular: true,
      },
      {
        id: 2,
        question: "What services do you offer?",
        answer:
          "We specialize in full-stack web development, mobile app development, UI/UX design, e-commerce solutions, and technical consulting. Our services range from complete project development to code reviews and technical guidance.",
        popular: false,
      },
      {
        id: 3,
        question: "How long does a typical project take?",
        answer:
          "Project timelines vary based on complexity. Simple websites take 2-4 weeks, medium projects 4-8 weeks, and complex applications 8+ weeks. We provide detailed timelines during our initial consultation.",
        popular: true,
      },
      {
        id: 4,
        question: "Do you offer ongoing support?",
        answer:
          "Yes! We offer various support packages including monthly maintenance, technical support, and feature updates. All projects include 30 days of free support after delivery.",
        popular: false,
      },
    ],
    projects: [
      {
        id: 5,
        question: "How do I purchase a project from your portfolio?",
        answer:
          "Browse our portfolio, click on any project you're interested in, and use the 'Purchase Now' button. You'll be guided through a secure checkout process. After payment, you'll receive instant access to all project files and documentation.",
        popular: true,
      },
      {
        id: 6,
        question: "Can I request custom modifications to existing projects?",
        answer:
          "Absolutely! We offer customization services for all portfolio projects. Contact us with your specific requirements, and we'll provide a quote for the modifications.",
        popular: false,
      },
      {
        id: 7,
        question: "What's included when I purchase a project?",
        answer:
          "You receive complete source code, documentation, installation guide, 30 days of support, and lifetime updates. Some projects also include design assets and database schemas.",
        popular: true,
      },
      {
        id: 8,
        question: "Can I see a demo before purchasing?",
        answer:
          "Yes, most projects have live demos available. Click the 'View Demo' button on any project page to explore the functionality before making a purchase decision.",
        popular: false,
      },
    ],
    payments: [
      {
        id: 9,
        question: "What payment methods do you accept?",
        answer:
          "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, bank transfers, and in some regions, digital wallets like Google Pay and Apple Pay.",
        popular: true,
      },
      {
        id: 10,
        question: "What is your refund policy?",
        answer:
          "We offer a 14-day money-back guarantee for all digital products. For custom development, refunds are evaluated case by case based on project progress. Contact our support team for refund requests.",
        popular: true,
      },
      {
        id: 11,
        question: "Do you offer payment plans?",
        answer:
          "Yes! For projects over $1,000, we offer flexible payment plans. Typically 50% upfront and 50% upon completion, or monthly installments for larger projects.",
        popular: false,
      },
      {
        id: 12,
        question: "Are there any hidden fees?",
        answer:
          "No hidden fees. The price you see is the price you pay. We're transparent about all costs upfront. Any additional services are only provided with your explicit approval.",
        popular: false,
      },
    ],
    technical: [
      {
        id: 13,
        question: "What technologies do you work with?",
        answer:
          "We work with modern technologies including React, Node.js, Python, MongoDB, PostgreSQL, AWS, Docker, and more. We choose the best stack for each project's specific requirements.",
        popular: true,
      },
      {
        id: 14,
        question: "Do you provide hosting services?",
        answer:
          "Yes, we offer comprehensive hosting solutions including shared hosting, VPS, cloud hosting, and dedicated servers. We can also help you set up hosting on platforms like AWS, Google Cloud, or DigitalOcean.",
        popular: false,
      },
      {
        id: 15,
        question: "What if I need technical support after project completion?",
        answer:
          "We offer various support packages. All projects include 30 days of free support. After that, you can choose from monthly support plans or pay-as-you-go technical assistance.",
        popular: true,
      },
      {
        id: 16,
        question: "Do you work with existing codebases?",
        answer:
          "Yes! We provide code review, refactoring, and enhancement services for existing projects. We can help improve performance, add features, or fix issues in your current codebase.",
        popular: false,
      },
    ],
    account: [
      {
        id: 17,
        question: "How do I reset my password?",
        answer:
          "Click 'Forgot Password' on the login page, enter your email address, and we'll send you a password reset link. The link expires in 24 hours for security.",
        popular: true,
      },
      {
        id: 18,
        question: "Can I delete my account?",
        answer:
          "Yes, you can delete your account from the settings page. Please note that this action is permanent and will remove all your data from our systems.",
        popular: false,
      },
      {
        id: 19,
        question: "How do I update my profile information?",
        answer:
          "Navigate to 'My Profile' in your account dashboard. You can update your personal information, contact details, and preferences at any time.",
        popular: false,
      },
      {
        id: 20,
        question: "Is my personal information secure?",
        answer:
          "Absolutely. We use industry-standard encryption and security measures to protect your data. We never share your personal information with third parties without your consent.",
        popular: true,
      },
    ],
  };

  const popularFAQs = Object.values(faqs)
    .flat()
    .filter((faq) => faq.popular)
    .slice(0, 6);

  const filteredFAQs = faqs[activeCategory].filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFAQ = (id) => {
    setActiveFAQ(activeFAQ === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-black mb-6">
              How can we help you?
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Find answers to common questions, get technical support, or
              contact our team directly. We're here to help you succeed.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for answers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-2xl"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <button className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-6 mt-8 text-blue-100">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>Expert Team</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Fast Response</span>
              </div>
            </div>
          </div>
        </div>

        {/* Background elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-1000"></div>
      </section>

      {/* Popular FAQs */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Questions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Quick answers to our most frequently asked questions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {popularFAQs.map((faq) => (
              <div
                key={faq.id}
                className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200"
                onClick={() => toggleFAQ(faq.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                    {faq.question}
                  </h3>
                  <span className="text-blue-600 text-sm bg-blue-100 px-2 py-1 rounded-full ml-2 flex-shrink-0">
                    Popular
                  </span>
                </div>
                {activeFAQ === faq.id && (
                  <p className="text-gray-600 text-sm mt-3 leading-relaxed">
                    {faq.answer}
                  </p>
                )}
                <div className="flex items-center justify-between mt-4">
                  <span className="text-blue-600 text-sm font-medium">
                    {activeFAQ === faq.id ? "Show less" : "Read answer"}
                  </span>
                  <svg
                    className={`w-4 h-4 text-blue-600 transform transition-transform ${
                      activeFAQ === faq.id ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories & FAQs */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Browse by Category
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Find detailed answers organized by topic
              </p>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center space-x-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                    activeCategory === category.id
                      ? "bg-blue-600 text-white shadow-xl transform scale-105"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:shadow-lg"
                  }`}
                >
                  <span className="text-xl">{category.icon}</span>
                  <div className="text-left">
                    <div className="font-semibold">{category.name}</div>
                    <div className="text-sm opacity-80">
                      {category.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* FAQs for Selected Category */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  {categories.find((cat) => cat.id === activeCategory)?.name}{" "}
                  Questions
                </h3>

                <div className="space-y-4">
                  {filteredFAQs.length > 0 ? (
                    filteredFAQs.map((faq) => (
                      <div
                        key={faq.id}
                        className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-blue-300"
                      >
                        <button
                          onClick={() => toggleFAQ(faq.id)}
                          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <h4 className="font-semibold text-gray-900 text-lg pr-4">
                            {faq.question}
                          </h4>
                          <svg
                            className={`w-5 h-5 text-blue-600 transform transition-transform flex-shrink-0 ${
                              activeFAQ === faq.id ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>

                        {activeFAQ === faq.id && (
                          <div className="px-6 pb-4">
                            <div className="border-t border-gray-100 pt-4">
                              <p className="text-gray-600 leading-relaxed">
                                {faq.answer}
                              </p>
                              {faq.popular && (
                                <span className="inline-block mt-3 text-blue-600 text-sm bg-blue-100 px-3 py-1 rounded-full">
                                  Popular Question
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No results found
                      </h3>
                      <p className="text-gray-600">
                        Try adjusting your search terms or browse different
                        categories.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Still need help?
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Our support team is here to assist you with any questions or
              issues you might have.
            </p>

            <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Live Chat</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Get instant help from our support team
                </p>
                <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors w-full">
                  Start Chat
                </button>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📧</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Email Support</h3>
                <p className="text-blue-100 text-sm mb-4">
                  We'll respond within a few hours
                </p>
                <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors w-full">
                  <a href="mailto:akeditzdj@gmail.com"> Send Email</a>
                </button>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📞</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Phone Support</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Mon-Fri, 9AM-6PM EST
                </p>
                <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors w-full">
                  <a href="tel:+919786000352">Call Now</a>
                </button>
              </div>
            </div>

            <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold mb-4">
                Emergency Technical Support
              </h3>
              <p className="text-blue-100 mb-6">
                For urgent technical issues affecting your live website or
                application, our emergency support team is available 24/7.
              </p>
              <div className="flex items-center justify-center space-x-4">
                <span className="text-yellow-300">🚨</span>
                <span className="font-semibold">
                  Emergency Number: +91 97860 00352-HELP-NOW
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Helpful Resources
            </h2>
            <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
              Additional materials to help you get the most out of our services
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: "📚",
                  title: "Documentation",
                  description: "Comprehensive guides and API references",
                },
                {
                  icon: "🎥",
                  title: "Video Tutorials",
                  description: "Step-by-step video guides and walkthroughs",
                },
                {
                  icon: "💡",
                  title: "Blog & Tips",
                  description: "Latest updates and best practices",
                },
                {
                  icon: "👥",
                  title: "Community",
                  description: "Connect with other developers and experts",
                },
              ].map((resource, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">{resource.icon}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {resource.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {resource.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HelpCenter;
