// utils/sendEmail.js
import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const message = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(message);
    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
};

export default sendEmail;
