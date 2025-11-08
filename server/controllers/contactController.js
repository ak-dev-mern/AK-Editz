import sendEmail from "../utils/sendEmail.js";

export const sendContactEmail = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    console.log("📨 Contact form submission received:", {
      name,
      email,
      subject,
    });

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Email to admin
    const adminEmailTemplate = {
      to: "akeditzdj@gmail.com",
      subject: `New Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Contact Form Submission</h2>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #2563eb;">
              ${message.replace(/\n/g, "<br>")}
            </p>
          </div>
        </div>
      `,
    };

    console.log("📤 Attempting to send admin email...");

    // Send admin email first
    await sendEmail(adminEmailTemplate);
    console.log("✅ Admin email sent successfully");

    // Then send confirmation to user
    console.log("📤 Attempting to send user confirmation email...");
    const userEmailTemplate = {
      to: email,
      subject: "We Received Your Message - Akeditz",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Thank You for Contacting Us!</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>We've received your message and will get back to you within 24 hours.</p>
        </div>
      `,
    };

    await sendEmail(userEmailTemplate);
    console.log("✅ User confirmation email sent successfully");

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("❌ Contact controller error:", error);
    console.error("🔍 Error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });

    res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
      // Remove this in production, but useful for debugging:
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};