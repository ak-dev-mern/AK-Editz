import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";
import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Download,
  CheckCircle2,
  CreditCard,
  QrCode,
  ArrowLeft,
  Sparkles,
  BadgeCheck,
  FileText,
  Code2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

const Checkout = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");

  // Debug: Check what parameters we're getting
  useEffect(() => {
    console.log("Project ID from params:", projectId);
    console.log("Project ID type:", typeof projectId);

    if (!projectId || projectId === "undefined") {
      console.error("Invalid projectId detected");
      setError("Invalid project ID");
    }
  }, [projectId]);

  // ✅ Get proper image URL (same as project details page)
  const getImageUrl = (path) => {
    if (!path) return "/default-project.jpg";
    if (path.startsWith("http")) return path;

    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    return path.startsWith("/uploads/")
      ? `${baseUrl}${path}`
      : `${baseUrl}/uploads/${path}`;
  };

  // ✅ Fetch project data with proper error handling
  const {
    data: projectData,
    isLoading,
    isError,
    error: queryError,
  } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      if (!projectId || projectId === "undefined") {
        throw new Error("Invalid project ID");
      }

      try {
        const response = await apiService.projects.getById(projectId);
        console.log("Project API response:", response);
        return response;
      } catch (error) {
        console.error("Project fetch error:", error);
        throw error;
      }
    },
    enabled: !!projectId && projectId !== "undefined",
    retry: 1,
  });

  // ✅ Extract project from response - FIXED LOGIC
  const project =
    projectData?.data?.project || projectData?.project || projectData;

  console.log("Extracted project:", project);

  const handlePayment = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!project || !project.isActive) {
      alert("This project is not available for purchase.");
      return;
    }

    if (!acceptedTerms) {
      alert("Please accept the terms and conditions to proceed.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // ✅ Use apiService instead of axios directly
      const orderResponse = await apiService.payments.createOrder({
        projectId,
        amount: project.price * 100, // Convert to paise for Razorpay
        currency: "INR",
      });

      console.log("Order response:", orderResponse);

      // For Razorpay integration
      if (paymentMethod === "razorpay") {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: orderResponse.data.amount,
          currency: orderResponse.data.currency,
          name: "Akeditz",
          description: `Purchase: ${project.title}`,
          order_id: orderResponse.data.orderId,
          handler: async function (response) {
            try {
              // ✅ Use apiService for payment verification
              await apiService.payments.verifyPayment({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                projectId: projectId,
              });

              alert(
                "🎉 Payment successful! You can now download the project from your dashboard."
              );
              navigate("/dashboard");
            } catch (verifyError) {
              console.error("Payment verification error:", verifyError);
              alert("Payment verification failed. Please contact support.");
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
          },
          theme: {
            color: "#0ea5e9",
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else if (paymentMethod === "googlepay") {
        // Handle Google Pay QR code display
        alert(
          "Please use the Google Pay QR code displayed below to complete your payment."
        );
        setLoading(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      setError(
        error.response?.data?.message || "Payment failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Show error if projectId is invalid
  if (!projectId || projectId === "undefined") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-2xl p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Invalid Project
          </h2>
          <p className="text-gray-600 mb-4">
            The project ID is missing or invalid.
          </p>
          <Link
            to="/projects"
            className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition duration-200 inline-block"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 text-lg">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-2xl p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {queryError?.message || "Project Not Found"}
          </h2>
          <p className="text-gray-600 mb-4">
            {queryError?.message
              ? "The project ID is invalid."
              : "The project you're looking for doesn't exist."}
          </p>
          <Link
            to="/projects"
            className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition duration-200 inline-block"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  if (!project.isActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-2xl p-8 max-w-md">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Project Unavailable
          </h2>
          <p className="text-gray-600 mb-4">
            This project is currently not available for purchase.
          </p>
          <Link
            to="/projects"
            className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition duration-200 inline-block"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Back to Project */}
        <div className="mb-6">
          <Link
            to={`/projects/${projectId}`}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold"
          >
            <ArrowLeft size={18} className="mr-2" /> Back to Project
          </Link>
        </div>

        {/* Checkout Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl overflow-hidden border border-gray-100"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-10">
            {/* Left Column - Order Summary */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              {/* Project Card */}
              <div className="border border-gray-200 rounded-2xl p-6 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={getImageUrl(project.images?.[0])}
                    alt={project.title}
                    className="w-20 h-20 object-cover rounded-xl shadow-md"
                    onError={(e) => (e.target.src = "/default-project.jpg")}
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">
                      {project.title}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {project.shortDescription || project.description}
                    </p>
                    <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <BadgeCheck size={16} className="mr-1 text-green-500" />
                        Verified Project
                      </span>
                      <span className="flex items-center">
                        <Download size={16} className="mr-1" />
                        Source Code
                      </span>
                    </div>
                  </div>
                </div>

                {/* External Links - Only show demo URL, hide source code and documentation */}
                <div className="space-y-2 mt-4">
                  {/* Demo URL - Always visible */}
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      <ExternalLink size={16} /> Live Demo
                    </a>
                  )}

                  {/* Source Code - Hidden until purchase */}
                  {project.sourceCode && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Code2 size={16} />
                        <span className="text-sm font-medium">Source Code</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Lock size={14} />
                        <span>Available after purchase</span>
                      </div>
                    </div>
                  )}

                  {/* Documentation - Hidden until purchase */}
                  {project.documentation && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FileText size={16} />
                        <span className="text-sm font-medium">
                          Documentation
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Lock size={14} />
                        <span>Available after purchase</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-4 text-lg">
                  Pricing Breakdown
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Project Price</span>
                    <span className="font-medium">₹{project.price}</span>
                  </div>
                  {project.originalPrice && (
                    <div className="flex justify-between items-center text-green-600">
                      <span>Discount</span>
                      <span className="font-medium">
                        -₹{project.originalPrice - project.price}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Platform Fee</span>
                    <span className="font-medium text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">GST</span>
                    <span className="font-medium">Included</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between items-center text-xl font-bold">
                    <span>Total Amount</span>
                    <span className="text-primary-600">₹{project.price}</span>
                  </div>
                </div>
              </div>

              {/* Features & Technologies */}
              <div className="grid grid-cols-1 gap-4">
                {/* Features */}
                {project.features?.length > 0 && (
                  <div className="bg-blue-50 rounded-2xl p-5">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                      <Sparkles size={18} className="mr-2" />
                      What You'll Get After Purchase
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-2">
                      <li className="flex items-center">
                        <CheckCircle2
                          size={16}
                          className="mr-2 text-green-500"
                        />
                        Complete Source Code
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2
                          size={16}
                          className="mr-2 text-green-500"
                        />
                        Detailed Documentation
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2
                          size={16}
                          className="mr-2 text-green-500"
                        />
                        Lifetime Updates
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2
                          size={16}
                          className="mr-2 text-green-500"
                        />
                        Technical Support
                      </li>
                      {project.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle2
                            size={16}
                            className="mr-2 text-green-500"
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Technologies */}
                {project.technologies?.length > 0 && (
                  <div className="bg-indigo-50 rounded-2xl p-5">
                    <h4 className="font-semibold text-indigo-900 mb-3">
                      Technologies Used
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="bg-white text-indigo-700 px-3 py-1 rounded-full text-sm font-medium border border-indigo-200"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Payment Section */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Payment Details
              </h2>

              {/* Payment Methods */}
              <div className="space-y-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                  Select Payment Method
                </h4>

                {/* Razorpay Option */}
                <div
                  className={`border-2 rounded-2xl p-4 cursor-pointer transition-all duration-200 ${
                    paymentMethod === "razorpay"
                      ? "border-primary-600 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setPaymentMethod("razorpay")}
                >
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-primary-600 mr-3">
                      {paymentMethod === "razorpay" && (
                        <div className="w-3 h-3 rounded-full bg-primary-600"></div>
                      )}
                    </div>
                    <CreditCard size={20} className="text-gray-700 mr-3" />
                    <div>
                      <span className="font-semibold text-gray-900">
                        Credit/Debit Card, UPI, Net Banking
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        Secure payment via Razorpay
                      </p>
                    </div>
                  </div>
                </div>

                {/* Google Pay Option */}
                <div
                  className={`border-2 rounded-2xl p-4 cursor-pointer transition-all duration-200 ${
                    paymentMethod === "googlepay"
                      ? "border-primary-600 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setPaymentMethod("googlepay")}
                >
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-primary-600 mr-3">
                      {paymentMethod === "googlepay" && (
                        <div className="w-3 h-3 rounded-full bg-primary-600"></div>
                      )}
                    </div>
                    <QrCode size={20} className="text-gray-700 mr-3" />
                    <div>
                      <span className="font-semibold text-gray-900">
                        Google Pay
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        Scan QR code to pay
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Google Pay QR Code */}
              {paymentMethod === "googlepay" && (
                <div className="mb-6 p-6 border-2 border-dashed border-primary-200 rounded-2xl text-center bg-primary-50">
                  <h4 className="font-semibold mb-3 text-primary-900">
                    Scan with Google Pay
                  </h4>
                  <div className="bg-white p-6 inline-block rounded-2xl shadow-lg mb-3">
                    <div className="w-48 h-48 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
                      <div className="text-center text-primary-700">
                        <QrCode size={48} className="mx-auto mb-2" />
                        <p className="text-xs font-medium">QR Code</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-primary-700">
                    Scan this QR code with your Google Pay app
                  </p>
                </div>
              )}

              {/* User Info */}
              <div className="bg-gray-50 rounded-2xl p-5 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Billing Information
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Name:</span>
                    <span className="font-medium text-gray-900">
                      {user?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="font-medium text-gray-900">
                      {user?.email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Product:</span>
                    <span className="font-medium text-gray-900">
                      {project.title}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Features */}
              <div className="bg-green-50 rounded-2xl p-5 mb-6">
                <div className="flex items-center space-x-3 text-green-800 mb-3">
                  <Shield size={20} />
                  <div>
                    <p className="font-semibold text-sm">Secure Payment</p>
                    <p className="text-xs">256-bit SSL encryption</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-green-800">
                  <Lock size={20} />
                  <div>
                    <p className="font-semibold text-sm">Privacy Protected</p>
                    <p className="text-xs">Your data is safe with us</p>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="mb-6">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="h-5 w-5 text-primary-600 focus:ring-primary-500 mt-0.5 rounded"
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-gray-600 leading-relaxed"
                  >
                    I agree to the{" "}
                    <a
                      href="/terms"
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="/privacy"
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Privacy Policy
                    </a>
                    . I understand that I'm purchasing a digital product and
                    refunds are only available under specific circumstances.
                  </label>
                </div>
              </div>

              {/* Payment Button */}
              <motion.button
                whileHover={{ scale: acceptedTerms ? 1.02 : 1 }}
                whileTap={{ scale: acceptedTerms ? 0.98 : 1 }}
                onClick={handlePayment}
                disabled={loading || !acceptedTerms}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Processing Payment...
                  </div>
                ) : (
                  `Pay ₹${project.price}`
                )}
              </motion.button>

              <p className="text-xs text-gray-500 text-center mt-4 flex items-center justify-center">
                <Lock size={12} className="mr-1" />
                Your payment is secure and encrypted
              </p>
            </div>
          </div>
        </motion.div>

        {/* Support Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Need help with your purchase?{" "}
            <a
              href="mailto:support@akeditz.com"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              Contact our support team
            </a>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Typically responds within 30 minutes
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
