// routes/newsletter.js (Complete ES6 Version)
import Newsletter from "../models/Newsletter.js";
import { sendWelcomeEmail } from "../utils/emailService.js";

// Subscribe to newsletter (ES6)
export const subscribeToNewsletter = async (req, res) => {
  try {
    const { email, name, source = "website" } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if email already exists and is active
    const existingSubscriber = await Newsletter.findOne({
      email: email.toLowerCase(),
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
      email: email.toLowerCase(),
      isActive: false,
    });

    if (inactiveSubscriber) {
      // Reactivate existing subscriber
      inactiveSubscriber.isActive = true;
      inactiveSubscriber.unsubscribedAt = undefined;
      inactiveSubscriber.source = source;
      subscriber = await inactiveSubscriber.save();
    } else {
      // Create new subscriber
      subscriber = await Newsletter.create({
        email: email.toLowerCase(),
        name: name || "",
        source,
      });
    }

    // Send beautiful welcome email
    try {
      await sendWelcomeEmail(email, name || "there");
      console.log("🎉 Welcome email sent successfully to:", email);
    } catch (emailError) {
      console.log(
        "⚠️ Welcome email failed, trying confirmation email:",
        emailError
      );
    }

    res.status(200).json({
      success: true,
      message:
        "Successfully subscribed to newsletter! Check your email for a welcome message.",
      data: {
        id: subscriber._id,
        email: subscriber.email,
        name: subscriber.name,
      },
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);

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

// Unsubscribe from newsletter (ES6)

export const unsubscribeFromNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const subscriber = await Newsletter.findOneAndUpdate(
      { email: email.toLowerCase(), isActive: true },
      {
        isActive: false,
        unsubscribedAt: new Date(),
      },
      { new: true }
    );

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Email not found in our subscription list",
      });
    }

    res.status(200).json({
      success: true,
      message: "Successfully unsubscribed from newsletter",
    });
  } catch (error) {
    console.error("Newsletter unsubscribe error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unsubscribe. Please try again.",
    });
  }
};

// Get all subscribers with pagination (ES6) - THE MISSING ROUTE

export const getSubscribers = async (req, res) => {
  try {
    const { page = 1, limit = 20, active = "true" } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const isActive = active === "true";

    const [subscribers, total] = await Promise.all([
      Newsletter.find({ isActive })
        .sort({ subscribedAt: -1 })
        .limit(limitNumber)
        .skip((pageNumber - 1) * limitNumber),
      Newsletter.countDocuments({ isActive }),
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
        },
      },
    });
  } catch (error) {
    console.error("Get subscribers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscribers",
    });
  }
};

// Get subscriber stats (ES6)
export const getNewsletterStats = async (req, res) => {
  try {
    const [totalSubscribers, totalUnsubscribed, todaySubscribers] =
      await Promise.all([
        Newsletter.countDocuments({ isActive: true }),
        Newsletter.countDocuments({ isActive: false }),
        Newsletter.countDocuments({
          subscribedAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        }),
      ]);

    res.status(200).json({
      success: true,
      data: {
        totalSubscribers,
        totalUnsubscribed,
        todaySubscribers,
      },
    });
  } catch (error) {
    console.error("Get newsletter stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch newsletter stats",
    });
  }
};
