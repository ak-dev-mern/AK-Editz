// routes/newsletter.js (Enhanced Version)
import Newsletter from "../models/Newsletter.js";
import { sendWelcomeEmail } from "../utils/emailService.js";

// Subscribe to newsletter (Enhanced)
export const subscribeToNewsletter = async (req, res) => {
  try {
    const { email, name, source = "website" } = req.body;

    // Validate email format
    if (!email || !email.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Valid email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists and is active
    const existingSubscriber = await Newsletter.findOne({
      email: normalizedEmail,
      isActive: true,
    });

    if (existingSubscriber) {
      return res.status(409).json({
        success: false,
        message: "This email is already subscribed to our newsletter",
      });
    }

    let subscriber;

    // Check if email exists but is inactive (resubscribe)
    const inactiveSubscriber = await Newsletter.findOne({
      email: normalizedEmail,
      isActive: false,
    });

    if (inactiveSubscriber) {
      // Reactivate existing subscriber
      inactiveSubscriber.isActive = true;
      inactiveSubscriber.name = name || inactiveSubscriber.name;
      inactiveSubscriber.source = source;
      inactiveSubscriber.resubscribedAt = new Date();
      inactiveSubscriber.unsubscribedAt = undefined;
      subscriber = await inactiveSubscriber.save();
    } else {
      // Create new subscriber
      subscriber = await Newsletter.create({
        email: normalizedEmail,
        name: name?.trim() || "",
        source,
        subscribedAt: new Date(),
      });
    }

    // Send welcome email with enhanced error handling
    try {
      await sendWelcomeEmail(normalizedEmail, name?.trim() || "there");
      console.log("🎉 Welcome email sent successfully to:", normalizedEmail);

      // Update email sent status
      subscriber.lastEmailSent = new Date();
      await subscriber.save();
    } catch (emailError) {
      console.error("❌ Welcome email failed:", emailError);
      // Don't fail the subscription if email fails
      console.log("⚠️ Subscription saved but welcome email failed");
    }

    res.status(200).json({
      success: true,
      message:
        "Successfully subscribed to newsletter! Check your email for a welcome message.",
      data: {
        id: subscriber._id,
        email: subscriber.email,
        name: subscriber.name,
        source: subscriber.source,
        subscribedAt: subscriber.subscribedAt,
      },
    });
  } catch (error) {
    console.error("❌ Newsletter subscription error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This email is already subscribed to our newsletter",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to subscribe to newsletter. Please try again.",
    });
  }
};

// Unsubscribe from newsletter (Enhanced)
export const unsubscribeFromNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Valid email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const subscriber = await Newsletter.findOneAndUpdate(
      { email: normalizedEmail, isActive: true },
      {
        isActive: false,
        unsubscribedAt: new Date(),
      },
      { new: true }
    );

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Email not found in our active subscription list",
      });
    }

    res.status(200).json({
      success: true,
      message: "Successfully unsubscribed from newsletter",
      data: {
        email: subscriber.email,
        unsubscribedAt: subscriber.unsubscribedAt,
      },
    });
  } catch (error) {
    console.error("❌ Newsletter unsubscribe error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unsubscribe. Please try again.",
    });
  }
};

// Get all subscribers with pagination (Enhanced)
export const getSubscribers = async (req, res) => {
  try {
    const { page = 1, limit = 20, active = "true", search = "" } = req.query;

    const pageNumber = Math.max(1, parseInt(page));
    const limitNumber = Math.min(50, Math.max(1, parseInt(limit))); // Cap at 50 per page
    const isActive = active === "true";

    // Build search query
    const searchQuery = {
      isActive,
      ...(search && {
        $or: [
          { email: { $regex: search, $options: "i" } },
          { name: { $regex: search, $options: "i" } },
        ],
      }),
    };

    const [subscribers, total] = await Promise.all([
      Newsletter.find(searchQuery)
        .select("-__v") // Exclude version key
        .sort({ subscribedAt: -1 })
        .limit(limitNumber)
        .skip((pageNumber - 1) * limitNumber)
        .lean(),
      Newsletter.countDocuments(searchQuery),
    ]);

    const totalPages = Math.ceil(total / limitNumber);

    res.status(200).json({
      success: true,
      data: {
        subscribers,
        pagination: {
          totalPages,
          currentPage: pageNumber,
          total,
          hasNext: pageNumber < totalPages,
          hasPrev: pageNumber > 1,
          limit: limitNumber,
        },
      },
    });
  } catch (error) {
    console.error("❌ Get subscribers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscribers",
    });
  }
};

// Get subscriber stats (Enhanced)
export const getNewsletterStats = async (req, res) => {
  try {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalSubscribers,
      totalUnsubscribed,
      todaySubscribers,
      weekSubscribers,
      monthSubscribers,
      sources,
    ] = await Promise.all([
      Newsletter.countDocuments({ isActive: true }),
      Newsletter.countDocuments({ isActive: false }),
      Newsletter.countDocuments({
        subscribedAt: {
          $gte: new Date(today.setHours(0, 0, 0, 0)),
        },
      }),
      Newsletter.countDocuments({
        subscribedAt: { $gte: weekAgo },
        isActive: true,
      }),
      Newsletter.countDocuments({
        subscribedAt: { $gte: monthAgo },
        isActive: true,
      }),
      Newsletter.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: "$source",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalSubscribers,
        totalUnsubscribed,
        growth: {
          today: todaySubscribers,
          week: weekSubscribers,
          month: monthSubscribers,
        },
        sources: sources.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    console.error("❌ Get newsletter stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch newsletter stats",
    });
  }
};

// Get single subscriber by email
export const getSubscriberByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email parameter is required",
      });
    }

    const subscriber = await Newsletter.findOne({
      email: email.toLowerCase().trim(),
    }).select("-__v");

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Subscriber not found",
      });
    }

    res.status(200).json({
      success: true,
      data: subscriber,
    });
  } catch (error) {
    console.error("❌ Get subscriber error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscriber",
    });
  }
};
