import { MailerSend } from "mailersend";

const mailersend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY,
});

export const sendEmail = async (emailData) => {
  try {
    const { to, subject, html, from } = emailData;

    const sentFrom = from || {
      email: process.env.FROM_EMAIL,
      name: process.env.FROM_NAME,
    };

    await mailersend.emails.send({
      from: sentFrom,
      to: Array.isArray(to) ? to : [{ email: to, name: "" }],
      subject: subject,
      html: html,
    });

    console.log("✅ Email sent successfully to:", to);
    return { success: true };
  } catch (error) {
    console.error("❌ MailerSend error:", error);
    throw new Error("Failed to send email");
  }
};

export default sendEmail;
