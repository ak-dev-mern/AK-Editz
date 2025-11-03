import React from "react";
import { motion } from "framer-motion";
import { Users, HeartHandshake, Target, Star, Globe2 } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 py-16">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4 flex justify-center items-center gap-2">
            <Globe2 className="text-blue-600 w-8 h-8" />
            About <span className="text-blue-600">Akeditz</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Empowering developers and creators with high-quality code projects,
            insightful blogs, and a thriving tech community.
          </p>
        </motion.div>

        {/* Mission Section */}
        <motion.section
          className="bg-white/80 backdrop-blur-lg border border-slate-200 rounded-2xl shadow-lg p-10 mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="text-blue-600 w-7 h-7" />
                Our Mission
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                To create a thriving ecosystem where developers can learn,
                share, and monetize their skills — while inspiring others to
                grow through collaboration, creativity, and innovation.
              </p>
            </div>
            <motion.img
              src="/images/mission.svg"
              alt="Our Mission"
              className="w-full max-w-sm"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.section>

        {/* What We Offer */}
        <motion.section
          className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl shadow-md p-10 mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            What We Offer
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Premium code projects with full source code",
              "In-depth technical blogs and tutorials",
              "Secure payment integrations",
              "Lifetime updates and reliable support",
              "Community-driven content & collaboration",
              "Learning-focused resources for developers",
            ].map((item, index) => (
              <motion.li
                key={index}
                className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all"
                whileHover={{ scale: 1.03 }}
              >
                <div className="flex items-start gap-3">
                  <Star className="text-blue-600 w-6 h-6 mt-1" />
                  <p className="text-gray-700 text-sm font-medium leading-relaxed">
                    {item}
                  </p>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.section>

        {/* Values Section */}
        <motion.section
          className="bg-white/80 backdrop-blur-lg border border-slate-200 rounded-2xl shadow-lg p-10 mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Our Core Values
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              className="p-6 rounded-xl bg-blue-50 border border-blue-100 hover:shadow-md transition-all"
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="flex items-center gap-2 font-semibold text-blue-900 mb-2 text-lg">
                <Star className="w-5 h-5 text-blue-600" />
                Quality First
              </h3>
              <p className="text-blue-800/90 text-sm leading-relaxed">
                Every project and article undergoes a meticulous review process
                to maintain the highest quality standards, ensuring real value
                for our users.
              </p>
            </motion.div>

            <motion.div
              className="p-6 rounded-xl bg-green-50 border border-green-100 hover:shadow-md transition-all"
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="flex items-center gap-2 font-semibold text-green-900 mb-2 text-lg">
                <Users className="w-5 h-5 text-green-700" />
                Community Driven
              </h3>
              <p className="text-green-800/90 text-sm leading-relaxed">
                We believe in the power of community. Our users actively shape
                the platform’s direction by sharing ideas, feedback, and
                inspiration.
              </p>
            </motion.div>

            <motion.div
              className="p-6 rounded-xl bg-purple-50 border border-purple-100 hover:shadow-md transition-all"
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="flex items-center gap-2 font-semibold text-purple-900 mb-2 text-lg">
                <HeartHandshake className="w-5 h-5 text-purple-700" />
                Integrity & Support
              </h3>
              <p className="text-purple-800/90 text-sm leading-relaxed">
                We maintain transparency, fairness, and consistent support to
                build trust and reliability across our entire ecosystem.
              </p>
            </motion.div>

            <motion.div
              className="p-6 rounded-xl bg-yellow-50 border border-yellow-100 hover:shadow-md transition-all"
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="flex items-center gap-2 font-semibold text-yellow-900 mb-2 text-lg">
                <Target className="w-5 h-5 text-yellow-700" />
                Continuous Innovation
              </h3>
              <p className="text-yellow-800/90 text-sm leading-relaxed">
                We constantly evolve our products and resources to stay aligned
                with the latest industry trends and technologies.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Final CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            Join Our Growing Community
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Whether you’re a developer, designer, or content creator, Akeditz
            provides the tools and opportunities to grow and make an impact.
          </p>
          <a
            href="/register"
            className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-full font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md"
          >
            Get Started
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
