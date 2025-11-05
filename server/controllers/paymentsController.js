import Stripe from "stripe";
import Payment from "../models/Payment.js";
import Project from "../models/Project.js";
import User from "../models/User.js";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ||
    "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"
);

export const createPaymentIntent = async (req, res) => {
  try {
    console.log("Creating payment intent with data:", req.body);
    console.log("Authenticated user:", req.user._id);

    const { projectId, amount, currency = "usd" } = req.body;

    if (!projectId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Project ID and amount required",
      });
    }

    // Validate project exists and is active
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (!project.isActive) {
      return res.status(400).json({
        success: false,
        message: "Project is not available for purchase",
      });
    }

    // Convert amount to cents (Stripe uses smallest currency unit)
    const amountInCents = Math.round(amount * 100);

    // Validate amount
    if (amountInCents < 50) {
      return res.status(400).json({
        success: false,
        message: "Amount must be at least $0.50",
      });
    }

    console.log("Creating Stripe payment intent with:", {
      amount: amountInCents,
      currency,
      projectId,
      userId: req.user._id,
    });

    // Check for existing active payment intent for this user and project
    const existingPayment = await Payment.findOne({
      user: req.user._id,
      project: projectId,
      status: { $in: ["created", "processing"] },
    });

    if (existingPayment && existingPayment.clientSecret) {
      console.log("Using existing payment session:", existingPayment._id);
      return res.json({
        success: true,
        clientSecret: existingPayment.clientSecret,
        paymentIntentId: existingPayment.paymentIntentId,
        message: "Using existing payment session",
      });
    }

    // Create Stripe payment intent - ONLY FOR CARD PAYMENTS
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      metadata: {
        projectId: projectId.toString(),
        userId: req.user._id.toString(),
        projectTitle: project.title,
      },
      automatic_payment_methods: {
        enabled: true,
      },
      // REMOVED: payment_method_types and payment_method_options for QR
      // Only card payments are handled by Stripe
      // Your separate QR system handles QR payments independently
    });

    console.log("Stripe payment intent created:", paymentIntent.id);

    const paymentData = {
      paymentIntentId: paymentIntent.id,
      amount: amount, // Store the original amount (in dollars)
      currency: currency,
      user: req.user._id,
      project: projectId,
      status: "created",
      clientSecret: paymentIntent.client_secret,
      metadata: {
        stripeAmount: amountInCents, // Store the Stripe amount in cents
        projectTitle: project.title,
      },
    };

    const payment = await Payment.create(paymentData);

    console.log("Payment record created:", payment._id);

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount, // Returns amount in cents
      currency: paymentIntent.currency,
    });
  } catch (err) {
    console.error("Payment intent creation error:", err);

    let errorMessage = "Failed to create payment intent";

    if (err.code === 11000) {
      // Handle duplicate key error
      if (err.keyPattern && err.keyPattern.orderId) {
        errorMessage = "Payment session conflict. Please try again.";

        // Try to find and return existing payment
        try {
          const existingPayment = await Payment.findOne({
            user: req.user._id,
            project: projectId,
            status: { $in: ["created", "processing"] },
          });

          if (existingPayment && existingPayment.clientSecret) {
            return res.json({
              success: true,
              clientSecret: existingPayment.clientSecret,
              paymentIntentId: existingPayment.paymentIntentId,
              message: "Using existing payment session",
            });
          }
        } catch (findError) {
          console.error("Error finding existing payment:", findError);
        }
      }
    } else if (err.type === "StripeInvalidRequestError") {
      errorMessage = "Invalid payment request";
    } else if (err.type === "StripeAuthenticationError") {
      errorMessage = "Payment service configuration error";
    } else if (err.type === "StripeConnectionError") {
      errorMessage = "Network error with payment service";
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: err.message,
    });
  }
};

// Enhanced confirmPayment function - SIMPLIFIED
export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: "Payment Intent ID required",
      });
    }

    console.log("Confirming payment:", {
      paymentIntentId,
    });

    // Retrieve payment intent from Stripe to verify status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Find and update payment record
    const payment = await Payment.findOne({ paymentIntentId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    console.log("Payment found:", {
      paymentId: payment._id,
      currentStatus: payment.status,
      stripeStatus: paymentIntent.status,
    });

    // Update payment status based on Stripe status
    if (
      paymentIntent.status === "succeeded" &&
      payment.status !== "succeeded"
    ) {
      payment.status = "succeeded";
      payment.paymentMethod = paymentIntent.payment_method;
      await payment.save();

      console.log("✅ Payment status updated to succeeded");

      // Add project to user's purchased projects
      await User.findByIdAndUpdate(payment.user, {
        $addToSet: { purchasedProjects: payment.project },
      });

      console.log("✅ Project added to user's purchased projects");
    }

    res.json({
      success: paymentIntent.status === "succeeded",
      status: payment.status,
      stripeStatus: paymentIntent.status,
      message:
        paymentIntent.status === "succeeded"
          ? "Payment successful"
          : `Payment ${payment.status}`,
    });
  } catch (err) {
    console.error("Payment confirmation error:", err);
    res.status(500).json({
      success: false,
      message: "Payment confirmation failed",
      error: err.message,
    });
  }
};

// Webhook handler - SIMPLIFIED
export const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("✅ Webhook signature verified");
  } catch (err) {
    console.error(`❌ Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    console.log("🔔 Webhook event type:", event.type);

    const paymentIntent = event.data.object;

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        console.log("🎉 PAYMENT_INTENT.SUCCEEDED event received");
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      case "payment_intent.payment_failed":
        console.log("💥 PAYMENT_INTENT.PAYMENT_FAILED event received");
        await handlePaymentIntentFailed(paymentIntent);
        break;
      default:
        console.log(`⚡ Unhandled event type: ${event.type}`);
    }

    console.log("✅ Webhook processed successfully");
    res.json({ received: true });
  } catch (error) {
    console.error("❌ Webhook handler error:", error);
    res.status(500).json({ error: "Webhook handler failed" });
  }
};

// Enhanced success handler - SIMPLIFIED
const handlePaymentIntentSucceeded = async (paymentIntent) => {
  try {
    console.log("🎉 Handling successful payment:", paymentIntent.id);

    const payment = await Payment.findOne({
      paymentIntentId: paymentIntent.id,
    });
    if (!payment) {
      console.error("❌ Payment record not found for:", paymentIntent.id);
      return;
    }

    // Update payment status
    payment.status = "succeeded";
    payment.paymentMethod = paymentIntent.payment_method;
    await payment.save();

    console.log("✅ Payment status updated to succeeded");

    // Add project to user's purchased projects
    await User.findByIdAndUpdate(payment.user, {
      $addToSet: { purchasedProjects: payment.project },
    });

    console.log("✅ Project added to user's purchased projects");
  } catch (error) {
    console.error("❌ Error handling successful payment:", error);
  }
};

// Enhanced failure handler
const handlePaymentIntentFailed = async (paymentIntent) => {
  try {
    console.log("💥 Handling failed payment:", paymentIntent.id);

    const payment = await Payment.findOne({
      paymentIntentId: paymentIntent.id,
    });
    if (payment) {
      payment.status = "failed";
      payment.error =
        paymentIntent.last_payment_error?.message || "Payment failed";
      await payment.save();
      console.log("❌ Payment status updated to failed:", paymentIntent.id);
    }
  } catch (error) {
    console.error("Error handling failed payment:", error);
  }
};

// Get user's purchased projects
export const getPurchasedProjects = async (req, res) => {
  try {
    console.log("🔍 [getPurchasedProjects] Starting for user:", req.user._id);

    // Find user with populated purchased projects
    const user = await User.findById(req.user._id).populate({
      path: "purchasedProjects",
      select:
        "title description shortDescription price category technologies images demoUrl documentation createdAt",
    });

    if (!user) {
      console.log("❌ [getPurchasedProjects] User not found:", req.user._id);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log(
      `✅ [getPurchasedProjects] Found ${
        user.purchasedProjects?.length || 0
      } projects for user ${user.email}`
    );

    // Log project details for debugging
    if (user.purchasedProjects && user.purchasedProjects.length > 0) {
      user.purchasedProjects.forEach((project) => {
        console.log(`   📁 Project: ${project.title} (${project._id})`);
      });
    } else {
      console.log("   ℹ️ No purchased projects found for user");
    }

    res.json({
      success: true,
      projects: user.purchasedProjects || [],
      count: user.purchasedProjects?.length || 0,
    });
  } catch (error) {
    console.error("❌ [getPurchasedProjects] Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching purchased projects",
      error: error.message,
    });
  }
};

// Get all payments (admin only)
export const getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;

    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const payments = await Payment.find(filter)
      .populate("user", "name email")
      .populate("project", "title category")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(filter);

    res.json({
      success: true,
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error("Get all payments error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching payments",
    });
  }
};

// Get user payments
export const getUserPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const payments = await Payment.find({ user: req.user._id })
      .populate("project", "title category images")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error("Get user payments error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user payments",
    });
  }
};

// Get payment by ID
export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("user", "name email")
      .populate("project", "title price category technologies");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Check if user owns the payment or is admin
    if (
      payment.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Get payment by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching payment",
    });
  }
};

// Get payment statistics (admin only)
export const getPaymentStats = async (req, res) => {
  try {
    const { period = "month" } = req.query;

    let dateFilter = {};
    const now = new Date();

    switch (period) {
      case "day":
        dateFilter = {
          $gte: new Date(now.setHours(0, 0, 0, 0)),
          $lte: new Date(now.setHours(23, 59, 59, 999)),
        };
        break;
      case "week":
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        dateFilter = { $gte: weekStart };
        break;
      case "month":
        dateFilter = { $gte: new Date(now.getFullYear(), now.getMonth(), 1) };
        break;
      case "year":
        dateFilter = { $gte: new Date(now.getFullYear(), 0, 1) };
        break;
    }

    const stats = await Payment.aggregate([
      {
        $match: {
          ...(Object.keys(dateFilter).length && { createdAt: dateFilter }),
        },
      },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalPayments: { $sum: 1 },
                totalRevenue: {
                  $sum: {
                    $cond: [
                      { $in: ["$status", ["paid", "succeeded", "completed"]] },
                      "$amount",
                      0,
                    ],
                  },
                },
                successfulPayments: {
                  $sum: {
                    $cond: [
                      { $in: ["$status", ["paid", "succeeded", "completed"]] },
                      1,
                      0,
                    ],
                  },
                },
                failedPayments: {
                  $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
                },
                pendingPayments: {
                  $sum: {
                    $cond: [
                      {
                        $in: [
                          "$status",
                          [
                            "created",
                            "processing",
                            "pending",
                            "requires_action",
                            "requires_payment_method",
                          ],
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                refundedPayments: {
                  $sum: { $cond: [{ $eq: ["$status", "refunded"] }, 1, 0] },
                },
              },
            },
          ],
          revenueByCategory: [
            {
              $match: {
                status: { $in: ["paid", "succeeded", "completed"] },
              },
            },
            {
              $lookup: {
                from: "projects",
                localField: "project",
                foreignField: "_id",
                as: "project",
              },
            },
            { $unwind: "$project" },
            {
              $group: {
                _id: "$project.category",
                total: { $sum: "$amount" },
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    const summary = stats[0]?.summary[0] || {
      totalPayments: 0,
      totalRevenue: 0,
      successfulPayments: 0,
      failedPayments: 0,
      pendingPayments: 0,
      refundedPayments: 0,
    };

    const successRate =
      summary.totalPayments > 0
        ? parseFloat(
            (
              (summary.successfulPayments / summary.totalPayments) *
              100
            ).toFixed(2)
          )
        : 0;

    res.json({
      success: true,
      stats: {
        totalRevenue: summary.totalRevenue,
        totalPayments: summary.totalPayments,
        successfulPayments: summary.successfulPayments,
        failedPayments: summary.failedPayments,
        pendingPayments: summary.pendingPayments,
        refundedPayments: summary.refundedPayments,
        successRate,
        revenueByCategory: stats[0]?.revenueByCategory || [],
        period,
      },
    });
  } catch (error) {
    console.error("Get payment stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching payment statistics",
    });
  }
};
// Refund payment (admin only)
export const refundPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Only paid payments can be refunded",
      });
    }

    // Create Stripe refund
    const refund = await stripe.refunds.create({
      payment_intent: payment.paymentIntentId,
    });

    // Update payment status
    payment.status = "refunded";
    payment.refundId = refund.id;
    await payment.save();

    // Remove project from user's purchased projects
    await User.findByIdAndUpdate(payment.user, {
      $pull: { purchasedProjects: payment.project },
    });

    res.json({
      success: true,
      message: "Payment refunded successfully",
      payment,
      refund,
    });
  } catch (error) {
    console.error("Refund payment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while processing refund",
    });
  }
};

// Download invoice
export const downloadInvoice = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("user", "name email")
      .populate("project", "title price");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Check if user owns the payment or is admin
    if (
      payment.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Generate simple invoice (in production, use a proper PDF library)
    const invoice = {
      invoiceId: `INV-${payment._id.toString().slice(-8).toUpperCase()}`,
      date: payment.createdAt.toLocaleDateString(),
      customer: {
        name: payment.user.name,
        email: payment.user.email,
      },
      items: [
        {
          description: payment.project.title,
          quantity: 1,
          unitPrice: payment.amount,
          total: payment.amount,
        },
      ],
      subtotal: payment.amount,
      tax: 0,
      total: payment.amount,
      paymentIntentId: payment.paymentIntentId,
      status: payment.status,
    };

    res.json({
      success: true,
      invoice,
    });
  } catch (error) {
    console.error("Download invoice error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while generating invoice",
    });
  }
};
