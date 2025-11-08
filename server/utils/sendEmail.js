// utils/sendEmail.js
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  // Create transporter - FIXED: createTransporter → createTransport
  const transporter = nodemailer.createTransport({
    service: "gmail", // Add this for Gmail
    host: "smtp.gmail.com",
    port: "587",
    secure: false, // true for 465, false for other ports
    auth: {
      user: "akeditzdj@gmail.com",
      pass: "pmhtbbfgpeebcpcw", // Use App Password here
    },
  });

  // Email message
  const message = {
    from: `${"AK Editz"} <${"akeditzdj@gmail.com"}>`,
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
