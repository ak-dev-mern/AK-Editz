// utils/sendEmail.js
import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, html }) => {
  try {
    // Create transporter using env variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com", // smtp.gmail.com
      port: process.env.SMTP_PORT || "587", // 587
      secure: process.env.SMTP_PORT === "465", // true for 465, false for 587
      auth: {
        user: process.env.SMTP_EMAIL || "akeditzdj@gmail.com",
        pass: process.env.SMTP_PASSWORD || "pmhtbbfgpeebcpcw", // Gmail App Password
      },
    });

    // Email message
    const message = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html,
    };

    // Send email
    const info = await transporter.sendMail(message);
    console.log("✅ Email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
};

export default sendEmail;
