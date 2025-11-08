import { MailerSend, EmailParams, Recipient, Sender } from "mailersend";

const mailerSend = new MailerSend({ apiKey: process.env.MAILERSEND_API_KEY });

const sendEmail = async ({ to, subject, html }) => {
  try {
    const sender = new Sender(process.env.FROM_EMAIL, process.env.FROM_NAME);
    const recipients = [new Recipient(to)];

    const emailParams = new EmailParams()
      .setFrom(sender)
      .setTo(recipients)
      .setSubject(subject)
      .setHtml(html);

    const response = await mailerSend.email.send(emailParams);
    console.log("✅ Email sent via MailerSend:", response);
    return response;
  } catch (error) {
    console.error("❌ MailerSend error:", error);
    throw error;
  }
};

export default sendEmail;
