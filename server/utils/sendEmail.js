// utils/sendEmail.js
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    service: "gmail", // Use Gmail service
    auth: {
      user: process.env.EMAIL_USER || "akeditzdj@gmail.com",
      pass: process.env.EMAIL_PASSWORD || "pmhtbbfgpeebcpcw", // Use App Password
    },
  });

  // Email message
  const message = {
    from: `"AK Editz" <${process.env.EMAIL_USER || "akeditzdj@gmail.com"}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log("✅ Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
};

export default sendEmail;
