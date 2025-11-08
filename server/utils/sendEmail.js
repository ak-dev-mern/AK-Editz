import { MailerSend } from "mailersend";

const mailersend = new MailerSend({ apiKey: process.env.MAILERSEND_API_KEY });

const sendEmail = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message)
    return res
      .status(400)
      .json({ success: false, message: "All fields required" });

  const FROM_EMAIL = process.env.FROM_EMAIL;
  const FROM_NAME = process.env.FROM_NAME;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

  try {
    await mailersend.emails.send({
      from: { email: FROM_EMAIL, name: FROM_NAME },
      to: [{ email: ADMIN_EMAIL, name: "Admin" }],
      subject: `New Contact Form: ${subject}`,
      html: `<p>Name: ${name}</p><p>Email: ${email}</p><p>Message: ${message}</p>`,
    });

    await mailersend.emails.send({
      from: { email: FROM_EMAIL, name: FROM_NAME },
      to: [{ email, name }],
      subject: "We Received Your Message",
      html: `<p>Hi ${name}, we received your message: ${message}</p>`,
    });

    res
      .status(200)
      .json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error("MailerSend error:", error);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
};

export default sendEmail;
