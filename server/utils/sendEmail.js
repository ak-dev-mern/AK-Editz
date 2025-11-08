// controllers/contactController.js
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

const mailersend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY, // your MailerSend API token
});

 const sendEmail = async (req, res) => {
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

    // Emails must be from a verified domain
    const FROM_EMAIL = process.env.FROM_EMAIL || "hello@akeditz.com";
    const FROM_NAME = process.env.FROM_NAME || "Akeditz Team";
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "akeditzdj@gmail.com";

    console.log("📤 Sending emails via MailerSend...");

    // Send email to admin
    await mailersend.emails.send({
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      to: [
        {
          email: ADMIN_EMAIL,
          name: "Admin",
        },
      ],
      subject: `New Contact Form: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong> ${message.replace(/\n/g, "<br>")}</p>
        <p><strong>Environment:</strong> ${process.env.NODE_ENV}</p>
      `,
    });

    // Send confirmation email to user
    await mailersend.emails.send({
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      to: [
        {
          email: email,
          name: name,
        },
      ],
      subject: "We Received Your Message - Akeditz",
      html: `
        <h2>Thank You for Contacting Us!</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>We've received your message and will get back to you within 24 hours.</p>
        <p><strong>Your Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    });

    console.log("✅ Emails sent successfully via MailerSend");

    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("❌ MailerSend error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
    });
  }
};

export default sendEmail;