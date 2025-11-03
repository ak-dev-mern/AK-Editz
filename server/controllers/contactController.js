import sendEmail from "../utils/sendEmail.js";

export const sendContactEmail = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Email to admin
    const adminEmailTemplate = {
      to: process.env.CONTACT_EMAIL || "akeditzdj@gmail.com",
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
          <hr style="margin: 20px 0;">
          <p style="color: #64748b; font-size: 12px;">
            Sent from Akeditz website contact form
          </p>
        </div>
      `,
    };

    // Confirmation email to user
    const userEmailTemplate = {
      to: email,
      subject: "We Received Your Message - Akeditz",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Thank You for Contacting Us!</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>We've received your message and will get back to you within 24 hours.</p>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #075985; margin-top: 0;">Your Message Details:</h3>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p style="background: white; padding: 15px; border-radius: 5px;">
              ${message.replace(/\n/g, "<br>")}
            </p>
          </div>

          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0;">What happens next?</h4>
            <ul style="color: #475569;">
              <li>Our team will review your message</li>
              <li>We'll respond to your email within 24 hours</li>
              <li>For urgent matters, you can reply directly to this email</li>
            </ul>
          </div>

          <hr style="margin: 20px 0;">
          <p style="color: #64748b;">
            <strong>Akeditz Team</strong><br>
            Email: akeditzdj@gmail.com<br>
            Based in India
          </p>
        </div>
      `,
    };

    // Send both emails
    await sendEmail(adminEmailTemplate);
    await sendEmail(userEmailTemplate);

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Contact controller error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
    });
  }
};
