import React from 'react';

function Terms() {
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
        <div className="prose prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mb-4">Terms and Conditions</h2>
          <p className="text-gray-300 mb-6">
            By using SmartHome, you agree to these terms and conditions. Please read them carefully.
          </p>
          
          <h3 className="text-xl font-semibold mb-3">Usage Agreement</h3>
          <p className="text-gray-300 mb-6">
            You must be at least 18 years old to use this service. You are responsible for maintaining the security of your account.
          </p>

          <h3 className="text-xl font-semibold mb-3">Service Availability</h3>
          <p className="text-gray-300 mb-6">
            While we strive for 100% uptime, we cannot guarantee uninterrupted access to our services. Maintenance and updates may cause temporary disruptions.
          </p>

          <h3 className="text-xl font-semibold mb-3">Liability</h3>
          <p className="text-gray-300">
            SmartHome is not liable for any damages or losses resulting from the use or inability to use our services.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Terms;