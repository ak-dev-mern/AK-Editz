import React from "react";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            About Akeditz
          </h1>
          <div className="prose max-w-none">
            <p className="text-lg text-gray-600 mb-6">
              Akeditz is a platform dedicated to empowering developers and
              creators by providing high-quality code projects, insightful
              technical blogs, and a marketplace for digital assets.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              Our Mission
            </h2>
            <p className="text-gray-600 mb-6">
              To create a thriving ecosystem where developers can learn, share,
              and monetize their skills while helping others grow in their
              coding journey.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              What We Offer
            </h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
              <li>Premium code projects with complete source code</li>
              <li>Technical blogs and tutorials</li>
              <li>Secure payment integration</li>
              <li>Lifetime updates and support</li>
              <li>Community-driven content</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              Our Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-primary-50 p-4 rounded-lg">
                <h3 className="font-semibold text-primary-900 mb-2">
                  Quality First
                </h3>
                <p className="text-primary-700 text-sm">
                  Every project and blog post goes through rigorous quality
                  checks to ensure the best experience for our users.
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">
                  Community Driven
                </h3>
                <p className="text-green-700 text-sm">
                  We believe in the power of community and actively involve our
                  users in shaping the platform's future.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
