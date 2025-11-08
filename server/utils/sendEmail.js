
import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, html }) => {
  try {
    console.log("🔧 Creating transporter with:", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_EMAIL,
      hasPassword: !!process.env.SMTP_PASSWORD,
    });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Verify connection
    await transporter.verify();
    console.log("✅ SMTP connection verified");

    const message = {
      from: `"Akeditz" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(message);
    console.log("✅ Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error;
  }
};
export default sendEmail;
