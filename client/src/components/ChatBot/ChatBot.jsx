// components/ChatBot/ChatBot.jsx
import React, { useState, useRef, useEffect } from "react";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi there! 👋 I'm AK from AK Editz. I can help you with web development, project inquiries, or technical questions. What would you like to know?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatEnded, setChatEnded] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Comprehensive questions for quick replies
  const quickQuestions = [
    "What services do you offer?",
    "How much does a project cost?",
    "What's your tech stack?",
    "Can I see your portfolio?",
    "Do you provide ongoing support?",
    "How long does development take?",
    "Do you work with startups?",
    "What's your development process?",
    "Do you do e-commerce sites?",
    "Are you available for new projects?",
    "What's your experience with React?",
    "Do you provide hosting?",
    "Can you work with my existing team?",
    "What about mobile app development?",
    "Do you do UI/UX design?",
  ];

  // Enhanced bot responses for development services
  const botResponses = {
    // Greetings
    hello:
      "Hello! 👋 I'm AK, a full-stack developer. How can I help you with your project today?",
    hi: "Hi there! Ready to discuss your next web project? I specialize in modern web applications and e-commerce solutions.",

    // Services
    services: `I offer comprehensive web development services:

🚀 **Full-Stack Development**
• React, Next.js, Node.js applications
• MERN Stack (MongoDB, Express, React, Node.js)
• Real-time applications with Socket.io
• RESTful APIs and GraphQL

💻 **Frontend Development**
• Responsive React applications
• Modern UI/UX design with Tailwind CSS
• Progressive Web Apps (PWA)
• Performance optimization

🛒 **E-commerce Solutions**
• Custom online stores
• Payment integration (Stripe, PayPal, Razorpay)
• Inventory management systems
• Admin dashboards

📱 **Additional Services**
• API development & integration
• Database design & optimization
• Technical consulting & code reviews
• Website maintenance & support

What type of project are you planning?`,

    // Pricing
    price: `My pricing is project-based and depends on complexity:

💰 **Project Estimates**
• Simple website: $500 - $1,500
• Business web app: $1,500 - $5,000
• Complex application: $5,000 - $15,000+
• E-commerce store: $3,000 - $10,000+

💳 **Payment Options**
• 50% upfront, 50% on delivery
• Milestone-based payments
• Monthly retainers for ongoing work

I provide detailed quotes after understanding your requirements. Would you like me to prepare a custom quote?`,

    // Technology Stack
    techstack: `Here's my primary tech stack:

**Frontend Expertise:**
• React.js, Next.js, TypeScript
• Tailwind CSS, Material-UI, Styled Components
• Redux, Context API, React Query
• Framer Motion for animations

**Backend & Databases:**
• Node.js, Express.js, Python
• MongoDB, PostgreSQL, MySQL
• Firebase, Supabase, AWS
• RESTful & GraphQL APIs

**Tools & Platforms:**
• Git, GitHub, Docker, CI/CD
• AWS, Vercel, Netlify, Heroku
• Stripe, PayPal, Razorpay integration
• SendGrid, Twilio, WebSockets

I choose technologies based on project requirements for optimal performance and scalability.`,

    // Portfolio & Work
    portfolio:
      "You can view my complete portfolio at **/portfolio**. It includes e-commerce stores, SaaS applications, business dashboards, and custom web solutions. I've worked with clients across various industries including healthcare, education, and e-commerce. Would you like to see specific types of projects?",

    // Timeline
    time: `Typical development timelines:

⏱️ **Project Durations**
• Simple website: 2-4 weeks
• Business web application: 4-8 weeks
• Complex SaaS platform: 8-16 weeks
• E-commerce store: 6-12 weeks

🚀 **Fast-Track Options**
• MVP development in 2-3 weeks
• Rapid prototyping available
• Agile development with 2-week sprints

Need something delivered on a specific timeline?`,

    // Support & Maintenance
    support: `Yes! I provide comprehensive support:

🔧 **Post-Launch Support**
• 30 days free bug fixes & support
• Monthly maintenance plans from $99/month
• Emergency support available
• Regular updates & security patches

📞 **Support Plans Include**
• Technical support & troubleshooting
• Performance monitoring
• Security updates & backups
• Feature enhancements & updates

Interested in a support package?`,

    // Process & Methodology
    process: `My development process ensures quality and transparency:

1. **Discovery Call** - Free consultation to understand your needs
2. **Project Planning** - Detailed proposal with timeline & cost
3. **Design & Prototyping** - Wireframes & mockups for approval
4. **Development** - Agile development with weekly updates
5. **Testing & QA** - Thorough testing across devices
6. **Launch & Deployment** - Smooth deployment to production
7. **Post-Launch Support** - Ongoing maintenance & updates

I maintain transparent communication throughout with regular progress demos.`,

    // Startup & Business
    startup:
      "Absolutely! I love working with startups and offer flexible engagement models. I can help with MVP development, technical consulting, or joining as a technical partner. I understand startup constraints and can work within your budget while ensuring quality delivery.",

    // E-commerce
    ecommerce: `Yes! E-commerce is one of my specialties:

🛍️ **E-commerce Features**
• Custom online stores with admin panels
• Multiple payment gateways (Stripe, PayPal, Razorpay)
• Inventory & order management
• User accounts & wishlists
• Product reviews & ratings
• Advanced search & filters
• Mobile-responsive design
• SEO optimization

I've built stores for fashion, electronics, food delivery, and digital products. Ready to start your online store?`,

    // Availability
    available:
      "I'm currently available for new projects! I typically book 2-3 months in advance, but I might have immediate availability for smaller projects. Would you like to schedule a free consultation to discuss your project timeline and requirements?",

    // React & Technical
    react:
      "I have 3+ years of experience with React and have built numerous production applications. I'm proficient with React hooks, context API, Redux, Next.js, and modern React patterns. I focus on writing clean, maintainable code with proper testing.",

    // Hosting & Deployment
    hosting:
      "Yes, I provide hosting and deployment services. I work with various platforms including Vercel, Netlify, AWS, and Heroku. I can help you choose the best hosting solution based on your application's needs and budget.",

    // Team Collaboration
    team: "Absolutely! I frequently collaborate with existing teams. I can work alongside your designers, project managers, or other developers. I'm comfortable with tools like Slack, Trello, Jira, and GitHub for seamless collaboration.",

    // Mobile Development
    mobile:
      "While I specialize in web development, I also build mobile applications using React Native for cross-platform solutions. For complex native apps, I collaborate with mobile specialists to ensure the best results.",

    // UI/UX Design
    design:
      "Yes, I offer UI/UX design services! I create user-centered designs that are both beautiful and functional. I work with Figma for prototyping and can handle everything from wireframes to high-fidelity mockups and design systems.",

    // Contact
    contact: `You can reach me through multiple channels:

📧 **Email:** akeditzdj@gmail.com
📞 **Phone/WhatsApp:** +91 9786000352
💼 **LinkedIn:** linkedin.com/in/ak-editz
🐙 **GitHub:** github.com/akeditz
🌐 **Portfolio:** yourportfolio.com

I typically respond within a few hours. Would you like to schedule a meeting?`,

    // Thank you & End chat
    thank_you:
      "You're welcome! 😊 It was great chatting with you. If you have any more questions later, feel free to reach out. Have a wonderful day! 👋",

    goodbye:
      "Thank you for your time! If you decide to move forward with your project, don't hesitate to contact me. Have a great day! 🌟",

    // Default response
    default:
      "That's an interesting question! I'd love to help you with that. Could you provide a bit more detail about what you're looking for? Or feel free to email me directly at akeditzdj@gmail.com for a more comprehensive response.",
  };

  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();

    // Greetings
    if (
      message.includes("hello") ||
      message.includes("hi") ||
      message.includes("hey")
    )
      return botResponses.hello;

    // Services
    if (
      message.includes("service") ||
      message.includes("what do you do") ||
      message.includes("offer")
    )
      return botResponses.services;

    // Pricing
    if (
      message.includes("price") ||
      message.includes("cost") ||
      message.includes("how much") ||
      message.includes("budget")
    )
      return botResponses.price;

    // Technology
    if (
      message.includes("tech") ||
      message.includes("stack") ||
      message.includes("technology") ||
      message.includes("framework") ||
      message.includes("mern")
    )
      return botResponses.techstack;

    // Portfolio
    if (
      message.includes("portfolio") ||
      message.includes("work") ||
      message.includes("project") ||
      message.includes("experience")
    )
      return botResponses.portfolio;

    // Timeline
    if (
      message.includes("time") ||
      message.includes("how long") ||
      message.includes("duration") ||
      message.includes("timeline")
    )
      return botResponses.time;

    // Support
    if (
      message.includes("support") ||
      message.includes("maintenance") ||
      message.includes("after launch")
    )
      return botResponses.support;

    // Process
    if (
      message.includes("process") ||
      message.includes("methodology") ||
      message.includes("how do you work")
    )
      return botResponses.process;

    // Startups
    if (
      message.includes("startup") ||
      message.includes("mvp") ||
      message.includes("minimum viable")
    )
      return botResponses.startup;

    // E-commerce
    if (
      message.includes("ecommerce") ||
      message.includes("e-commerce") ||
      message.includes("online store") ||
      message.includes("shop")
    )
      return botResponses.ecommerce;

    // Availability
    if (
      message.includes("available") ||
      message.includes("hire") ||
      message.includes("book") ||
      message.includes("schedule")
    )
      return botResponses.available;

    // React
    if (message.includes("react") || message.includes("frontend"))
      return botResponses.react;

    // Hosting
    if (
      message.includes("host") ||
      message.includes("deploy") ||
      message.includes("server")
    )
      return botResponses.hosting;

    // Team collaboration
    if (
      message.includes("team") ||
      message.includes("collaborat") ||
      message.includes("work with")
    )
      return botResponses.team;

    // Mobile
    if (
      message.includes("mobile") ||
      message.includes("app") ||
      message.includes("ios") ||
      message.includes("android")
    )
      return botResponses.mobile;

    // Design
    if (
      message.includes("design") ||
      message.includes("ui") ||
      message.includes("ux") ||
      message.includes("figma")
    )
      return botResponses.design;

    // Contact
    if (
      message.includes("contact") ||
      message.includes("email") ||
      message.includes("call") ||
      message.includes("whatsapp") ||
      message.includes("reach")
    )
      return botResponses.contact;

    // Thank you & Goodbye
    if (message.includes("thank") || message.includes("thanks"))
      return botResponses.thank_you;

    if (
      message.includes("bye") ||
      message.includes("goodbye") ||
      message.includes("see you") ||
      message.includes("talk later")
    )
      return botResponses.goodbye;

    return botResponses.default;
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Check if this should end the chat
    const shouldEndChat =
      inputMessage.toLowerCase().includes("bye") ||
      inputMessage.toLowerCase().includes("goodbye") ||
      inputMessage.toLowerCase().includes("thank you");

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: getBotResponse(inputMessage),
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);

      // Auto-close chat after goodbye message
      if (shouldEndChat) {
        setTimeout(() => {
          setChatEnded(true);
          setTimeout(() => {
            setIsOpen(false);
            setChatEnded(false);
            // Reset messages after closing
            setTimeout(() => {
              setMessages([
                {
                  id: 1,
                  text: "Hi there! 👋 I'm AK from AK Editz. I can help you with web development, project inquiries, or technical questions. What would you like to know?",
                  sender: "bot",
                  timestamp: new Date(),
                },
              ]);
            }, 500);
          }, 2000);
        }, 1500);
      }
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    // Auto-send after a brief delay
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const handleEndChat = () => {
    const endMessage = {
      id: messages.length + 1,
      text: "Thanks for the chat! I'll end this conversation now.",
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, endMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: "Thank you for chatting with me! If you have more questions later, I'm always here to help. Have a great day! 🌟",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);

      // Auto-close after thank you message
      setTimeout(() => {
        setChatEnded(true);
        setTimeout(() => {
          setIsOpen(false);
          setChatEnded(false);
          // Reset messages after closing
          setTimeout(() => {
            setMessages([
              {
                id: 1,
                text: "Hi there! 👋 I'm AK from AK Editz. I can help you with web development, project inquiries, or technical questions. What would you like to know?",
                sender: "bot",
                timestamp: new Date(),
              },
            ]);
          }, 500);
        }, 2000);
      }, 1500);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <>
      {/* Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Chat Button */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-16 h-16 rounded-full shadow-2xl hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center group"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
          </button>
        )}

        {/* Chat Window */}
        {isOpen && (
          <div className="bg-white rounded-2xl shadow-2xl w-[330px] h-[650px] flex flex-col border border-gray-200 animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-lg bg-black rounded-3xl">
                    <img
                      src="/Logo-1.png"
                      alt="Ak Editz Logo"
                      className="w-8 h-8"
                    />
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold">AK Editz - Dev Assistant</h3>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-blue-100">Online now</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleEndChat}
                  className="text-white/80 hover:text-white transition-colors p-1 text-xs bg-white/20 rounded-lg px-2 py-1"
                  title="End Chat"
                >
                  End Chat
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-colors p-1"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 ${
                        message.sender === "user"
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-line">
                        {message.text}
                      </p>
                      <div
                        className={`text-xs mt-2 ${
                          message.sender === "user"
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none p-4 shadow-sm">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {chatEnded && (
                  <div className="flex justify-center">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 text-center">
                      <p className="text-sm text-yellow-800">
                        💫 Chat ended. Click the chat button to start a new
                        conversation.
                      </p>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Quick Questions */}
            {messages.length <= 3 && !chatEnded && (
              <div className="px-4 pt-2 bg-gray-50 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(question)}
                      className="bg-white border border-gray-300 text-gray-700 text-xs px-3 py-2 rounded-full hover:bg-gray-50 transition-colors flex-shrink-0"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            {!chatEnded && (
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about services, pricing, or your project..."
                      rows="1"
                      className="w-full border border-gray-300 rounded-2xl px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ minHeight: "50px", maxHeight: "120px" }}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </button>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    Ask about web development, pricing, or schedule a
                    consultation
                  </p>
                  <button
                    onClick={handleEndChat}
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    End chat
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add some custom styles for the animation */}
      <style jsx="true">{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default ChatBot;
