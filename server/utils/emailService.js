// utils/emailService.js
import nodemailer from "nodemailer";

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER || "akeditzdj@gmail.com",
      pass: process.env.EMAIL_PASSWORD || "pmht bbfg peeb cpcw",
    },
  });
};

// Send beautiful welcome email
export const sendWelcomeEmail = async (email, name = "there") => {
  try {
    const transporter = createTransporter();

    // ✅ FRONTEND URL for manual unsubscribe
    const unsubscribeUrl = `${"https://akeditz.com"}/unsubscribe`;
    const frontendUrl = "https://akeditz.com";

    const mailOptions = {
      from: `"AK Editz Team" <${
        process.env.EMAIL_USER || "akeditzdj@gmail.com"
      }>`,
      to: email,
      subject: "🎉 Welcome to AK Editz Newsletter!",
      html: createWelcomeEmailTemplate(name, unsubscribeUrl, frontendUrl),
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Welcome email sent to:", email);
  } catch (error) {
    console.error("❌ Failed to send welcome email:", error);
    throw error;
  }
};

// Create beautiful email template
const createWelcomeEmailTemplate = (name, unsubscribeUrl, frontendUrl) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to AK Editz</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .logo {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .welcome-text {
            font-size: 18px;
            margin-bottom: 30px;
            color: #555;
            text-align: center;
        }
        
        .features {
            display: grid;
            gap: 20px;
            margin: 30px 0;
        }
        
        .feature {
            display: flex;
            align-items: center;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 10px;
            border-left: 4px solid #667eea;
        }
        
        .feature-icon {
            font-size: 24px;
            margin-right: 15px;
        }
        
        .feature-text {
            flex: 1;
        }
        
        .feature-title {
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
        }
        
        .feature-desc {
            color: #666;
            font-size: 14px;
        }
        
        .cta-section {
            text-align: center;
            margin: 30px 0;
            padding: 25px;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            border-radius: 15px;
            color: white;
        }
        
        .cta-title {
            font-size: 20px;
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        .cta-button {
            display: inline-block;
            padding: 12px 30px;
            background: white;
            color: #f5576c;
            text-decoration: none;
            border-radius: 25px;
            font-weight: 600;
            margin-top: 15px;
            transition: transform 0.3s ease;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
        }
        
        .footer {
            text-align: center;
            padding: 30px;
            background: #f8f9fa;
            color: #666;
            border-top: 1px solid #e9ecef;
        }
        
        .social-links {
            margin: 20px 0;
        }
        
        .social-link {
            display: inline-block;
            margin: 0 10px;
            color: #667eea;
            text-decoration: none;
        }
        
        .unsubscribe-section {
            margin: 25px 0 15px 0;
            padding: 20px;
            background: #f1f3f4;
            border-radius: 10px;
            border: 1px solid #e0e0e0;
            text-align: center;
        }
        
        .unsubscribe-button {
            display: inline-block;
            padding: 12px 28px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 25px;
            font-size: 15px;
            font-weight: 600;
            letter-spacing: 0.3px;
            box-shadow: 0 4px 10px rgba(102, 126, 234, 0.3);
            transition: all 0.3s ease;
        }
        
        .unsubscribe-button:hover {
            background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
            transform: translateY(-2px);
        }
        
        .unsubscribe-note {
            font-size: 13px;
            color: #444;
            margin-top: 12px;
        }
        
        .copyright {
            font-size: 12px;
            color: #999;
            margin-top: 20px;
        }
        
        @media (max-width: 600px) {
            .content {
                padding: 20px 15px;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .feature {
                flex-direction: column;
                text-align: center;
            }
            
            .feature-icon {
                margin-right: 0;
                margin-bottom: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">🚀 AK Editz</div>
            <h1>Welcome to Our Community!</h1>
            <p>You're now part of something amazing</p>
        </div>
        
        <div class="content">
            <div class="welcome-text">
                <p>Hello <strong>${name}</strong>,</p>
                <p>Thank you for subscribing to the AK Editz newsletter! We're thrilled to have you on board.</p>
            </div>
            
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">🎯</div>
                    <div class="feature-text">
                        <div class="feature-title">Exclusive Content</div>
                        <div class="feature-desc">Get access to premium tutorials, industry insights, and expert tips</div>
                    </div>
                </div>
                
                <div class="feature">
                    <div class="feature-icon">⚡</div>
                    <div class="feature-text">
                        <div class="feature-title">Latest Updates</div>
                        <div class="feature-desc">Be the first to know about new projects, features, and opportunities</div>
                    </div>
                </div>
                
                <div class="feature">
                    <div class="feature-icon">💼</div>
                    <div class="feature-text">
                        <div class="feature-title">Professional Growth</div>
                        <div class="feature-desc">Learn from real-world projects and accelerate your career</div>
                    </div>
                </div>
            </div>
            
            <div class="cta-section">
                <div class="cta-title">Ready to Explore?</div>
                <p>Check out our latest projects and start your journey today</p>
                <a href="${frontendUrl}/projects" class="cta-button">
                    Explore Projects
                </a>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>AK Editz - Building Digital Excellence</strong></p>
            <p>Creating amazing digital experiences with cutting-edge technology</p>
            
            <div class="social-links">
                <a href="https://youtube.com/@AKEditzDJ-Developer" class="social-link">YouTube</a>
                <a href="https://github.com/ak-dev-mern" class="social-link">GitHub</a>
                <a href="https://linkedin.com/in/akeditzdeveloper" class="social-link">LinkedIn</a>
                <a href="https://instagram.com/akeditz.developer" class="social-link">Instagram</a>
                <a href="https://www.facebook.com/akeditz.developer" class="social-link">Facebook</a>
                
            </div>
            
            <!-- UNSUBSCRIBE SECTION - NOW LINKS TO FRONTEND PAGE -->
               <div class="unsubscribe-section">
                 <p style="margin: 0 0 10px 0; font-size: 15px; color: #333; font-weight: 500;">
                   Don't want to receive these emails?
                 </p>
                 <a href="${unsubscribeUrl}" class="unsubscribe-button">
                   🚫 Unsubscribe
                 </a>
                 <p class="unsubscribe-note">
                   You'll be taken to our unsubscribe page to confirm
                 </p>
               </div>

            <div class="copyright">
                <p>&copy; ${new Date().getFullYear()} AK Editz. All rights reserved.</p>
                <p>You're receiving this email because you subscribed to our newsletter.</p>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};
