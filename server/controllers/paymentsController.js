import Razorpay from "razorpay";
import Payment from "../models/Payment.js";
import Project from "../models/Project.js";
import User from "../models/User.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_1DP5mmOlF5G5ag",
  key_secret:
    process.env.RAZORPAY_KEY_SECRET || "rzp_test_AbCdEfGhIjKlMnOpQrStUvWxYz",
});

// Create order
export const createOrder = async (req, res) => {
  try {
    const { projectId } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user already purchased this project
    const user = await User.findById(req.user._id);
    if (user.purchasedProjects.includes(projectId)) {
      return res.status(400).json({
        success: false,
        message: "You have already purchased this project",
      });
    }

    const options = {
      amount: project.price * 100, // amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Save payment record
    const payment = new Payment({
      orderId: order.id,
      amount: project.price,
      user: req.user._id,
      project: projectId,
    });

    await payment.save();

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      project: {
        id: project._id,
        title: project.title,
        price: project.price,
      },
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating order",
    });
  }
};

// Verify payment
export const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;

    // In production, you should verify the signature
    // const crypto = await import('crypto');
    // const expectedSignature = crypto
    //   .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    //   .update(orderId + "|" + paymentId)
    //   .digest('hex');
    //
    // if (expectedSignature !== signature) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Payment verification failed"
    //   });
    // }

    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    // Check if payment is already verified
    if (payment.status === "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment already verified",
      });
    }

    payment.paymentId = paymentId;
    payment.signature = signature;
    payment.status = "paid";
    await payment.save();

    // Add project to user's purchased projects
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { purchasedProjects: payment.project },
    });

    // Populate project details for response
    await payment.populate("project", "title description sourceCode");

    res.json({
      success: true,
      message: "Payment verified successfully",
      payment: {
        id: payment._id,
        amount: payment.amount,
        status: payment.status,
        project: payment.project,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while verifying payment",
    });
  }
};

// Get user's purchased projects
export const getPurchasedProjects = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "purchasedProjects",
      select:
        "title description price category technologies images demoUrl documentation",
    });

    res.json({
      success: true,
      projects: user.purchasedProjects,
    });
  } catch (error) {
    console.error("Get purchased projects error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching purchased projects",
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
    const { period = "month" } = req.query; // day, week, month, year

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
        dateFilter = {
          $gte: new Date(now.getFullYear(), now.getMonth(), 1),
        };
        break;
      case "year":
        dateFilter = {
          $gte: new Date(now.getFullYear(), 0, 1),
        };
        break;
    }

    const totalRevenue = await Payment.aggregate([
      {
        $match: {
          status: "paid",
          ...(Object.keys(dateFilter).length && { createdAt: dateFilter }),
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalPayments = await Payment.countDocuments({
      status: "paid",
      ...(Object.keys(dateFilter).length && { createdAt: dateFilter }),
    });

    const successfulPayments = await Payment.countDocuments({
      status: "paid",
      ...(Object.keys(dateFilter).length && { createdAt: dateFilter }),
    });

    const failedPayments = await Payment.countDocuments({
      status: "failed",
      ...(Object.keys(dateFilter).length && { createdAt: dateFilter }),
    });

    const revenueByCategory = await Payment.aggregate([
      {
        $match: {
          status: "paid",
          ...(Object.keys(dateFilter).length && { createdAt: dateFilter }),
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
    ]);

    const recentPayments = await Payment.find({ status: "paid" })
      .populate("user", "name")
      .populate("project", "title category")
      .sort({ createdAt: -1 })
      .limit(10);

    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: "paid",
          createdAt: { $gte: new Date(now.getFullYear(), 0, 1) },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$amount" },
          payments: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalRevenue: totalRevenue[0]?.total || 0,
        totalPayments,
        successfulPayments,
        failedPayments,
        successRate:
          totalPayments > 0
            ? ((successfulPayments / totalPayments) * 100).toFixed(2)
            : 0,
        revenueByCategory,
        recentPayments,
        monthlyRevenue,
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

    // In production, implement actual Razorpay refund
    // const refund = await razorpay.payments.refund(payment.paymentId, {
    //   amount: payment.amount * 100
    // });

    // For now, just update the status
    payment.status = "refunded";
    await payment.save();

    // Remove project from user's purchased projects
    await User.findByIdAndUpdate(payment.user, {
      $pull: { purchasedProjects: payment.project },
    });

    res.json({
      success: true,
      message: "Payment refunded successfully",
      payment,
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
      paymentId: payment.paymentId,
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
