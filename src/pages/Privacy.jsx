import React from 'react';

function Privacy() {
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
        <div className="prose prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mb-4">Your Privacy Matters</h2>
          <p className="text-gray-300 mb-6">
            At SmartHome, we take your privacy seriously. This policy outlines how we collect, use, and protect your personal information.
          </p>
          
          <h3 className="text-xl font-semibold mb-3">Information We Collect</h3>
          <ul className="list-disc pl-6 text-gray-300 mb-6">
            <li>Device usage patterns</li>
            <li>Energy consumption data</li>
            <li>User preferences and settings</li>
            <li>Account information</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">How We Use Your Data</h3>
          <p className="text-gray-300 mb-6">
            We use your data to improve your smart home experience, optimize energy usage, and provide personalized recommendations.
          </p>

          <h3 className="text-xl font-semibold mb-3">Data Protection</h3>
          <p className="text-gray-300">
            Your data is encrypted and stored securely. We never share your personal information with third parties without your explicit consent.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Privacy;