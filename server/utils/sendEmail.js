// utils/sendEmail.js
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  // Create transporter - FIXED: createTransporter → createTransport
  const transporter = nodemailer.createTransport({
    service: "gmail", // Add this for Gmail
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD, // Use App Password here
    },
  });

  // Email message
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  try {
    // Send email
    const info = await transporter.sendMail(message);
    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export default sendEmail;
