import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

const Checkout = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () =>
      axios.get(`/api/projects/${projectId}`).then((res) => res.data),
  });

  const handlePayment = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      // Create order
      const orderResponse = await axios.post("/api/payments/create-order", {
        projectId,
      });

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
            // Verify payment
            await axios.post("/api/payments/verify", {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });

            alert(
              "Payment successful! You can now download the project from your dashboard."
            );
            navigate("/dashboard");
          },
          prefill: {
            name: user.name,
            email: user.email,
          },
          theme: {
            color: "#0ea5e9",
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else if (paymentMethod === "googlepay") {
        // Handle Google Pay QR code display
        alert(
          "Please use the Google Pay QR code displayed below to complete your payment."
        );
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Project Not Found
          </h2>
          <button
            onClick={() => navigate("/projects")}
            className="text-primary-600 hover:text-primary-700"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Order Summary */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="border border-gray-200 rounded-lg p-6 mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={project.images?.[0] || "/default-project.jpg"}
                    alt={project.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {project.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price</span>
                    <span className="font-medium">₹{project.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform fee</span>
                    <span className="font-medium">₹0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">₹0</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary-600">₹{project.price}</span>
                  </div>
                </div>
              </div>

              {/* What you get */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  What you'll get:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Complete source code</li>
                  <li>• Documentation</li>
                  <li>• Lifetime updates</li>
                  <li>• Technical support</li>
                </ul>
              </div>
            </div>

            {/* Payment Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Payment Method
              </h2>

              {/* Payment Methods */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="razorpay"
                    name="payment"
                    value="razorpay"
                    checked={paymentMethod === "razorpay"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                  />
                  <label
                    htmlFor="razorpay"
                    className="ml-3 block text-sm font-medium text-gray-700"
                  >
                    Credit/Debit Card, UPI, Net Banking
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="googlepay"
                    name="payment"
                    value="googlepay"
                    checked={paymentMethod === "googlepay"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                  />
                  <label
                    htmlFor="googlepay"
                    className="ml-3 block text-sm font-medium text-gray-700"
                  >
                    Google Pay
                  </label>
                </div>
              </div>

              {/* Google Pay QR Code */}
              {paymentMethod === "googlepay" && (
                <div className="mb-6 p-4 border border-gray-200 rounded-lg text-center">
                  <h4 className="font-semibold mb-2">
                    Scan QR Code with Google Pay
                  </h4>
                  <div className="bg-white p-4 inline-block rounded-lg border">
                    {/* Placeholder for QR code - you would generate this dynamically */}
                    <div className="w-48 h-48 bg-gray-100 flex items-center justify-center text-gray-500">
                      QR Code Placeholder
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Scan this QR code with your Google Pay app to complete
                    payment
                  </p>
                </div>
              )}

              {/* User Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Billing Information
                </h4>
                <p className="text-sm text-gray-600">
                  <strong>Name:</strong> {user?.name}
                  <br />
                  <strong>Email:</strong> {user?.email}
                </p>
              </div>

              {/* Terms and Conditions */}
              <div className="mb-6">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="terms"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 mt-1"
                    defaultChecked
                  />
                  <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                    I agree to the Terms of Service and Privacy Policy. I
                    understand that I'm purchasing a digital product and refunds
                    are not available.
                  </label>
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 transition duration-200"
              >
                {loading ? "Processing..." : `Pay ₹${project.price}`}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Your payment is secure and encrypted. We never store your card
                details.
              </p>
            </div>
          </div>
        </div>

        {/* Support Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help?{" "}
            <a
              href="mailto:support@akeditz.com"
              className="text-primary-600 hover:text-primary-700"
            >
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
