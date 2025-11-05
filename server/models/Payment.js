import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    paymentIntentId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "usd",
    },
    status: {
      type: String,
      enum: [
        "created",
        "processing",
        "paid",
        "succeeded", // Added 'succeeded' to match Stripe
        "failed",
        "refunded",
        "canceled",
        "requires_payment_method",
        "requires_action",
      ],
      default: "created",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    // Stripe specific fields
    clientSecret: {
      type: String,
      required: true, // Made required since it's essential
    },
    paymentMethod: {
      type: String,
    },
    paymentMethodType: {
      type: String,
    },
    refundId: {
      type: String,
    },
    lastPaymentError: {
      type: mongoose.Schema.Types.Mixed,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    // REMOVED: orderId field to avoid duplicate key errors
    // If you need order tracking, use paymentIntentId instead
  },
  {
    timestamps: true, // Use mongoose timestamps instead of manual fields
  }
);

// Remove any existing problematic indexes (run this in MongoDB shell)
// db.payments.dropIndex("orderId_1");

// Update the updatedAt field before saving (handled by timestamps, but keeping for custom logic)
paymentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for formatted amount (dollars instead of cents)
paymentSchema.virtual("amountInDollars").get(function () {
  return (this.amount / 100).toFixed(2);
});

// Virtual for display status
paymentSchema.virtual("displayStatus").get(function () {
  const statusMap = {
    created: "Created",
    processing: "Processing",
    paid: "Paid",
    succeeded: "Succeeded", // Added mapping
    failed: "Failed",
    refunded: "Refunded",
    canceled: "Canceled",
    requires_payment_method: "Requires Payment Method",
    requires_action: "Requires Action",
  };
  return statusMap[this.status] || this.status;
});

// Index for better query performance
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ paymentIntentId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ project: 1 });
paymentSchema.index({ createdAt: 1 });
paymentSchema.index({ user: 1, project: 1 }); // Added for checking existing payments

// Method to check if payment is successful
paymentSchema.methods.isSuccessful = function () {
  return this.status === "paid" || this.status === "succeeded";
};

// Method to check if payment can be refunded
paymentSchema.methods.canBeRefunded = function () {
  return (
    (this.status === "paid" || this.status === "succeeded") && !this.refundId
  );
};

// Static method to get total revenue
paymentSchema.statics.getTotalRevenue = async function () {
  const result = await this.aggregate([
    {
      $match: {
        status: { $in: ["paid", "succeeded"] },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$amount" },
      },
    },
  ]);

  return result.length > 0 ? result[0].totalRevenue : 0;
};

// Static method to get payments by status
paymentSchema.statics.getPaymentsByStatus = async function (status) {
  return this.find({ status }).populate("user project").sort({ createdAt: -1 });
};

// Static method to find existing active payment for user and project
paymentSchema.statics.findActivePayment = async function (userId, projectId) {
  return this.findOne({
    user: userId,
    project: projectId,
    status: { $in: ["created", "processing"] },
  });
};

export default mongoose.model("Payment", paymentSchema);
