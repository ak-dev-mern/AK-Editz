import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, html }) => {
  try {
    // Validate environment variables
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
      throw new Error("SMTP credentials not configured");
    }

    console.log("🔧 Email config:", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_EMAIL,
      env: process.env.NODE_ENV,
    });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
      // Add timeout settings
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    // Verify connection
    await transporter.verify();
    console.log("✅ SMTP connection verified");

    const message = {
      from: `"${process.env.FROM_NAME || "Akeditz"}" <${
        process.env.FROM_EMAIL || process.env.SMTP_EMAIL
      }>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(message);
    console.log("✅ Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", {
      message: error.message,
      code: error.code,
      command: error.command,
    });
    throw error;
  }
};

export default sendEmail;
