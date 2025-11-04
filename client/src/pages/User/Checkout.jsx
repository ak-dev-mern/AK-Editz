import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";
import { motion } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  Shield,
  Lock,
  Download,
  CheckCircle2,
  CreditCard,
  ArrowLeft,
  Sparkles,
  BadgeCheck,
  FileText,
  Code2,
  ExternalLink,
  AlertCircle,
  Building,
  Wallet,
  Clock,
  Globe,
  QrCode,
  Smartphone,
  RefreshCw,
} from "lucide-react";

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// QR Payment Component
const QRPayment = ({ project, projectId, onBack, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [qrCodeData, setQrCodeData] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("created");
  const [paymentId, setPaymentId] = useState("");
  const [error, setError] = useState("");
  const [pollingInterval, setPollingInterval] = useState(null);

  // Initialize QR payment
  const initializeQRPayment = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiService.payments.createQRPayment({
        projectId,
        amount: project.price,
        currency: "usd",
      });

      if (response.success) {
        setQrCodeData(response.qrCodeData);
        setPaymentId(response.paymentId);
        setPaymentStatus("created");

        // Start polling for payment status
        startPolling(response.paymentId);
      } else {
        setError(response.message || "Failed to create QR payment");
      }
    } catch (err) {
      console.error("QR payment initialization error:", err);
      setError("Failed to initialize QR payment");
    } finally {
      setLoading(false);
    }
  };

  // Poll for payment status
  const startPolling = (paymentId) => {
    // Clear existing interval
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    const interval = setInterval(async () => {
      try {
        const statusResponse = await apiService.payments.checkQRPaymentStatus(
          paymentId
        );

        if (statusResponse.success) {
          setPaymentStatus(statusResponse.status);

          if (statusResponse.status === "succeeded") {
            clearInterval(interval);
            onSuccess();
          } else if (statusResponse.status === "failed") {
            clearInterval(interval);
            setError("Payment failed. Please try again.");
          }
        }
      } catch (err) {
        console.error("Status check error:", err);
      }
    }, 3000); // Check every 3 seconds

    setPollingInterval(interval);
  };

  // Stop polling
  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  // Generate QR code image URL
  const getQRCodeImageUrl = () => {
    if (!qrCodeData) return "";

    // Use a QR code generation service
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      qrCodeData
    )}`;
  };

  // Initialize on component mount
  useEffect(() => {
    initializeQRPayment();

    // Cleanup polling on unmount
    return () => {
      stopPolling();
    };
  }, []);

  const handleRetry = () => {
    setError("");
    initializeQRPayment();
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case "succeeded":
        return <CheckCircle2 className="w-8 h-8 text-green-500" />;
      case "failed":
        return <AlertCircle className="w-8 h-8 text-red-500" />;
      case "processing":
        return <Clock className="w-8 h-8 text-blue-500 animate-pulse" />;
      default:
        return <Clock className="w-8 h-8 text-yellow-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case "created":
        return "Scan the QR code to complete payment";
      case "processing":
        return "Payment processing...";
      case "succeeded":
        return "Payment completed successfully!";
      case "failed":
        return "Payment failed";
      default:
        return "Waiting for payment...";
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          QR Code Payment
        </h2>
        <p className="text-gray-600">Scan the QR code with your payment app</p>
      </div>

      {/* Payment Details */}
      <div className="bg-gray-50 rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Project:</span>
          <span className="font-semibold">{project.title}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Amount:</span>
          <span className="text-xl font-bold text-primary-600">
            ${project.price}
          </span>
        </div>
      </div>

      {/* QR Code Display */}
      <div className="bg-white rounded-2xl p-8 border-2 border-dashed border-gray-300 text-center mb-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Generating QR code...</p>
          </div>
        ) : qrCodeData ? (
          <div>
            <img
              src={getQRCodeImageUrl()}
              alt="Payment QR Code"
              className="w-64 h-64 mx-auto mb-4 border border-gray-200 rounded-lg"
            />
            <p className="text-sm text-gray-600">
              Scan this QR code with your payment app
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">QR code will appear here</p>
          </div>
        )}
      </div>

      {/* Status Display */}
      <div className="bg-blue-50 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-center space-x-3 mb-3">
          {getStatusIcon()}
          <span className="font-semibold text-blue-900">
            {getStatusMessage()}
          </span>
        </div>

        {paymentStatus === "created" && (
          <div className="text-sm text-blue-800 text-center space-y-1">
            <p>• Open your payment app (Google Pay, PhonePe, PayPal, etc.)</p>
            <p>• Tap on 'Scan QR Code'</p>
            <p>• Point your camera at the QR code</p>
            <p>• Confirm the payment amount</p>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
          <button
            onClick={handleRetry}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={onBack}
          className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition duration-200"
        >
          Back to Payment Methods
        </button>

        {paymentStatus !== "succeeded" && (
          <button
            onClick={handleRetry}
            disabled={loading}
            className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition duration-200 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh QR"}
          </button>
        )}
      </div>

      {/* Help Text */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>
          Having trouble? Ensure your payment app supports QR code scanning.
        </p>
        <p>Payment will expire in 15 minutes.</p>
      </div>
    </div>
  );
};

// Stripe Elements wrapper
const CheckoutForm = ({ project, projectId, clientSecret, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [name, setName] = useState(user?.name || "");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");
  const [showQRPayment, setShowQRPayment] = useState(false);

  // If QR payment is selected, show the QR payment component
  if (showQRPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10">
        <div className="max-w-2xl mx-auto px-4">
          <QRPayment
            project={project}
            projectId={projectId}
            onBack={() => setShowQRPayment(false)}
            onSuccess={() => {
              onSuccess();
              setTimeout(() => {
                navigate("/dashboard", {
                  state: {
                    message: "QR payment completed successfully!",
                    project: project.title,
                  },
                });
              }, 2000);
            }}
          />
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError("Payment system is not ready. Please try again.");
      return;
    }

    if (!acceptedTerms) {
      setError("Please accept terms & conditions to proceed with payment.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Standard card payment with mounted Payment Element
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?projectId=${projectId}&paymentMethod=card`,
          payment_method_data: {
            billing_details: {
              name: name,
              email: email,
            },
          },
        },
        redirect: "if_required",
      });

      if (result?.error) {
        console.error("Stripe payment error:", result.error);

        // Handle specific error cases
        if (result.error.type === "validation_error") {
          setError("Please check your payment details and try again.");
        } else if (result.error.type === "card_error") {
          setError(
            result.error.message ||
              "Card payment failed. Please try another card."
          );
        } else {
          setError(result.error.message || "Payment failed. Please try again.");
        }

        setLoading(false);
        return;
      }

      // Handle successful card payments
      if (result.paymentIntent?.status === "succeeded") {
        const paymentIntentId = clientSecret.split("_secret")[0];
        const response = await apiService.payments.confirmPayment({
          paymentIntentId: paymentIntentId,
          paymentMethodType: "card",
        });

        if (response.success) {
          onSuccess();
          setTimeout(() => {
            navigate("/dashboard", {
              state: {
                message: "Payment completed successfully!",
                project: project.title,
              },
            });
          }, 2000);
        } else {
          throw new Error(response.message || "Payment backend update failed");
        }
      }
    } catch (err) {
      console.error("Payment processing error:", err);
      setError(err.message || "Payment processing failed");
      setLoading(false);
    }
  };

  const handlePaymentMethodChange = (method) => {
    setSelectedPaymentMethod(method);
    setError("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Method Selection */}
      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-4">Payment Method</h4>

        <div className="grid grid-cols-2 gap-4">
          {/* Credit Card Option */}
          <button
            type="button"
            onClick={() => handlePaymentMethodChange("card")}
            className={`p-4 border-2 rounded-xl text-left transition-all duration-200 ${
              selectedPaymentMethod === "card"
                ? "border-primary-500 bg-primary-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedPaymentMethod === "card"
                    ? "border-primary-500 bg-primary-500"
                    : "border-gray-400"
                }`}
              >
                {selectedPaymentMethod === "card" && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <CreditCard size={20} className="text-gray-700" />
              <div>
                <p className="font-semibold text-gray-900">Credit Card</p>
                <p className="text-sm text-gray-600">Pay with card</p>
              </div>
            </div>
          </button>

          {/* QR Payment Option */}
          <button
            type="button"
            onClick={() => setShowQRPayment(true)}
            className={`p-4 border-2 rounded-xl text-left transition-all duration-200 ${
              selectedPaymentMethod === "qr"
                ? "border-primary-500 bg-primary-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedPaymentMethod === "qr"
                    ? "border-primary-500 bg-primary-500"
                    : "border-gray-400"
                }`}
              >
                {selectedPaymentMethod === "qr" && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <QrCode size={20} className="text-gray-700" />
              <div>
                <p className="font-semibold text-gray-900">QR Code</p>
                <p className="text-sm text-gray-600">Scan to pay</p>
              </div>
            </div>
          </button>
        </div>

        {/* QR Payment Instructions */}
        {selectedPaymentMethod === "qr" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
          >
            <div className="flex items-start space-x-3">
              <Smartphone className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold">Fast & Secure QR Payments</p>
                <ul className="mt-1 space-y-1">
                  <li>• Scan QR code with any payment app</li>
                  <li>• Instant payment confirmation</li>
                  <li>• No card details required</li>
                  <li>• Bank-level security</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Personal Information */}
      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-4">
          Billing Information
        </h4>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition duration-200"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition duration-200"
              required
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Stripe Payment Element - Only show for card payments */}
      {selectedPaymentMethod === "card" && (
        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">Card Details</h4>
          <div className="space-y-4">
            {clientSecret && (
              <PaymentElement
                options={{
                  layout: "tabs",
                  fields: {
                    billingDetails: {
                      name: "never",
                      email: "never",
                    },
                  },
                }}
                className="min-h-[200px]"
              />
            )}
          </div>
        </div>
      )}

      {/* QR Payment Preview */}
      {selectedPaymentMethod === "qr" && (
        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">QR Payment</h4>
          <div className="text-center space-y-4">
            <div className="bg-white p-8 rounded-xl border-2 border-dashed border-gray-300">
              <div className="text-center">
                <QrCode size={64} className="text-primary-600 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">
                  Fast & Secure QR Payments
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Click the QR Code payment button to generate your payment QR
                  code
                </p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 text-green-800">
                <CheckCircle2 size={16} />
                <p className="text-sm font-medium">
                  Supported by all major payment apps
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-2xl p-5">
        <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Name:</span>
            <span className="font-medium text-gray-900">{name}</span>
          </div>
          <div className="flex justify-between">
            <span>Email:</span>
            <span className="font-medium text-gray-900">{email}</span>
          </div>
          <div className="flex justify-between">
            <span>Product:</span>
            <span className="font-medium text-gray-900">{project.title}</span>
          </div>
          <div className="flex justify-between">
            <span>Payment Method:</span>
            <span className="font-medium text-gray-900 capitalize">
              {selectedPaymentMethod === "qr" ? "QR Code" : "Credit Card"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Amount:</span>
            <span className="font-medium text-primary-600">
              ${project.price}
            </span>
          </div>
        </div>
      </div>

      {/* Security Features */}
      <div className="bg-green-50 rounded-2xl p-5">
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
            <p className="font-semibold text-sm">PCI Compliant</p>
            <p className="text-xs">Stripe certified security</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 text-green-800">
          <Globe size={20} />
          <div>
            <p className="font-semibold text-sm">Global Payments</p>
            <p className="text-xs">Accepted worldwide</p>
          </div>
        </div>
        {selectedPaymentMethod === "qr" && (
          <div className="flex items-center space-x-3 text-green-800">
            <QrCode size={20} />
            <div>
              <p className="font-semibold text-sm">QR Payments</p>
              <p className="text-xs">Instant bank transfers</p>
            </div>
          </div>
        )}
      </div>

      {/* Terms and Conditions */}
      <div>
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="terms"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="h-5 w-5 text-primary-600 focus:ring-primary-500 mt-0.5 rounded"
            disabled={loading}
          />
          <label
            htmlFor="terms"
            className="text-sm text-gray-600 leading-relaxed"
          >
            I agree to the{" "}
            <a
              href="/terms"
              className="text-primary-600 hover:text-primary-700 font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              className="text-primary-600 hover:text-primary-700 font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>
            . I understand that I'm purchasing a digital product and refunds are
            only available under specific circumstances.
          </label>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Payment Button */}
      {selectedPaymentMethod === "card" && (
        <motion.button
          whileHover={{ scale: acceptedTerms && !loading ? 1.02 : 1 }}
          whileTap={{ scale: acceptedTerms && !loading ? 0.98 : 1 }}
          type="submit"
          disabled={!stripe || !elements || loading || !acceptedTerms}
          className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
              Processing Payment...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <CreditCard size={20} className="mr-2" />
              Pay ${project.price}
            </div>
          )}
        </motion.button>
      )}

      {/* QR Payment CTA */}
      {selectedPaymentMethod === "qr" && (
        <motion.button
          type="button"
          onClick={() => setShowQRPayment(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <div className="flex items-center justify-center">
            <QrCode size={20} className="mr-2" />
            Pay with QR Code - ${project.price}
          </div>
        </motion.button>
      )}

      <p className="text-xs text-gray-500 text-center flex items-center justify-center">
        <Lock size={12} className="mr-1" />
        {selectedPaymentMethod === "card"
          ? "Powered by Stripe - Your payment is secure and encrypted"
          : "Bank-level security - Your payment is protected"}
      </p>
    </form>
  );
};

// Main Checkout Component
const Checkout = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [clientSecret, setClientSecret] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("idle");
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  // Fetch project data
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
        console.log("Fetching project data for ID:", projectId);
        const response = await apiService.projects.getById(projectId);
        console.log("Project data response:", response);
        return response;
      } catch (error) {
        console.error("Project fetch error:", error);
        throw error;
      }
    },
    enabled: !!projectId && projectId !== "undefined",
    retry: 1,
  });

  // Extract project from response
  const project =
    projectData?.data?.project || projectData?.project || projectData;

  // Create payment intent when project is loaded
  useEffect(() => {
    if (project && project.price && user) {
      createPaymentIntent();
    }
  }, [project, user]);

  const createPaymentIntent = async () => {
    try {
      setError("");
      setPaymentStatus("idle");

      if (!project || !project.price) {
        throw new Error("Project price not available");
      }

      console.log("Creating payment intent for:", {
        projectId: project._id,
        amount: project.price,
        currency: "usd",
        userId: user?._id,
        projectTitle: project.title,
      });

      // Validate price
      const price = parseFloat(project.price);
      if (isNaN(price) || price <= 0) {
        throw new Error("Invalid project price");
      }

      const response = await apiService.payments.createPaymentIntent({
        projectId: project._id,
        amount: price,
        currency: "usd",
      });

      console.log("Full payment intent response:", response);

      if (response?.clientSecret) {
        setClientSecret(response.clientSecret);
        console.log("Payment intent created successfully");
      } else if (response?.data?.clientSecret) {
        setClientSecret(response.data.clientSecret);
        console.log("Payment intent created successfully (nested)");
      } else {
        console.error("Invalid response structure:", response);
        throw new Error("Invalid response from server - no client secret");
      }
    } catch (err) {
      console.error("Payment intent creation error details:", err);
      console.error("Error stack:", err.stack);

      let errorMessage = "Failed to initialize payment";

      if (err.response) {
        // Axios error response
        console.error("Axios error response:", err.response);
        errorMessage =
          err.response.data?.message || `Server error: ${err.response.status}`;
      } else if (err.request) {
        // Network error
        console.error("Network error - no response received:", err.request);
        errorMessage = "Network error: Unable to connect to payment service";
      } else {
        // Other errors
        errorMessage = err.message || "Payment initialization failed";
      }

      setError(errorMessage);
      setPaymentStatus("failed");

      // Auto-retry logic (max 3 retries)
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
          createPaymentIntent();
        }, 2000);
      }
    }
  };

  const getImageUrl = (path) => {
    if (!path) return "/default-project.jpg";
    if (path.startsWith("http")) return path;

    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    return path.startsWith("/uploads/")
      ? `${baseUrl}${path}`
      : `${baseUrl}/uploads/${path}`;
  };

  const retryPaymentIntent = () => {
    setError("");
    setPaymentStatus("idle");
    setRetryCount(0);
    createPaymentIntent();
  };

  const handlePaymentSuccess = () => {
    setPaymentStatus("success");
  };

  // Success message component
  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-2xl p-10 max-w-md">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase! You now have access to{" "}
            <strong>{project?.title}</strong>.
          </p>
          <div className="space-y-3">
            <Link
              to="/dashboard"
              className="w-full bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition duration-200 inline-block"
            >
              Go to Dashboard
            </Link>
            <Link
              to={`/projects/${projectId}`}
              className="w-full border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition duration-200 inline-block"
            >
              View Project
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Error handling for invalid projectId
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
          <p className="text-gray-600 text-lg">Loading project details...</p>
          <p className="text-sm text-gray-500">
            Please wait while we prepare your checkout
          </p>
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
              ? "The project ID is invalid or the project may have been removed."
              : "The project you're looking for doesn't exist or failed to load."}
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

  if (!project.price || isNaN(project.price)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-2xl p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Pricing Error
          </h2>
          <p className="text-gray-600 mb-4">
            This project has invalid pricing information. Please contact
            support.
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
        {/* Error Message with retry option */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <div>
                  <p className="text-red-700 font-medium">{error}</p>
                  <p className="text-red-600 text-sm mt-1">
                    {retryCount > 0
                      ? `Retry attempt ${retryCount}/3`
                      : "Please check your payment details and try again."}
                  </p>
                </div>
              </div>
              <button
                onClick={retryPaymentIntent}
                disabled={retryCount >= 3}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <RefreshCw size={16} className="mr-2" />
                {retryCount >= 3 ? "Max Retries" : "Retry"}
              </button>
            </div>
          </motion.div>
        )}

        {/* Payment Intent Status */}
        {!clientSecret && !error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-yellow-500 mr-2" />
              <p className="text-yellow-700">Initializing payment system...</p>
            </div>
          </div>
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
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                      {project.shortDescription ||
                        project.description ||
                        "No description available"}
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

                {/* External Links */}
                <div className="space-y-2 mt-4">
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
                    <span className="font-medium">${project.price}</span>
                  </div>
                  {project.originalPrice &&
                    project.originalPrice > project.price && (
                      <div className="flex justify-between items-center text-green-600">
                        <span>Discount</span>
                        <span className="font-medium">
                          -${(project.originalPrice - project.price).toFixed(2)}
                        </span>
                      </div>
                    )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Platform Fee</span>
                    <span className="font-medium text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">Included</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between items-center text-xl font-bold">
                    <span>Total Amount</span>
                    <span className="text-primary-600">${project.price}</span>
                  </div>
                </div>
              </div>

              {/* Features & Technologies */}
              <div className="grid grid-cols-1 gap-4">
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
                      {project.features.slice(0, 3).map((feature, index) => (
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

                {project.technologies?.length > 0 && (
                  <div className="bg-indigo-50 rounded-2xl p-5">
                    <h4 className="font-semibold text-indigo-900 mb-3">
                      Technologies Used
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.slice(0, 6).map((tech, index) => (
                        <span
                          key={index}
                          className="bg-white text-indigo-700 px-3 py-1 rounded-full text-sm font-medium border border-indigo-200"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 6 && (
                        <span className="bg-white text-indigo-700 px-3 py-1 rounded-full text-sm font-medium border border-indigo-200">
                          +{project.technologies.length - 6} more
                        </span>
                      )}
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

              {clientSecret ? (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "stripe",
                      variables: {
                        colorPrimary: "#4f46e5",
                        colorBackground: "#f9fafb",
                        colorText: "#1f2937",
                        colorDanger: "#ef4444",
                        fontFamily: "Inter, system-ui, sans-serif",
                        spacingUnit: "4px",
                        borderRadius: "12px",
                      },
                    },
                  }}
                >
                  <CheckoutForm
                    project={project}
                    projectId={projectId}
                    clientSecret={clientSecret}
                    onSuccess={handlePaymentSuccess}
                  />
                </Elements>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading payment form...</p>
                  {error && (
                    <p className="text-sm text-red-500 mt-2">
                      If this persists, please try refreshing the page
                    </p>
                  )}
                </div>
              )}
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
