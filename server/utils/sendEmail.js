const sendEmail = async ({ to, subject, html, text }) => {
  // Validate required environment variables
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    throw new Error("SMTP credentials not configured");
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // TLS
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD, // App Password
      },
    });

    // Verify connection configuration
    await transporter.verify();

    const message = {
      from: `"${process.env.FROM_NAME || "App"}" <${
        process.env.FROM_EMAIL || process.env.SMTP_EMAIL
      }>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""), // Fallback text version
    };

    const info = await transporter.sendMail(message);
    console.log("✅ Email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

export default sendEmail;
