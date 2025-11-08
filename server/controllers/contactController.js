import sendEmail from "../utils/sendEmail.js";

export const sendContactEmail = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    console.log("📨 Contact form submission:", {
      name,
      email,
      subject,
      env: process.env.NODE_ENV,
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
      to: process.env.ADMIN_EMAIL || "akeditzdj@gmail.com",
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
          <p><strong>Environment:</strong> ${process.env.NODE_ENV}</p>
        </div>
      `,
    };

    console.log("📤 Attempting to send emails...");

    // Send both emails
    await sendEmail(adminEmailTemplate);
    await sendEmail({
      to: email,
      subject: "We Received Your Message - Akeditz",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Thank You for Contacting Us!</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>We've received your message and will get back to you within 24 hours.</p>
        </div>
      `,
    });

    console.log("✅ All emails sent successfully");

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("❌ Contact controller error:", {
      message: error.message,
      stack: error.stack,
      env: process.env.NODE_ENV,
    });

    res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
    });
  }
};