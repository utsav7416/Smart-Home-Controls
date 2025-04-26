import React from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

function Contact() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Contact Us</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-6">Get in Touch</h2>
          
          <form className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-2">Name</label>
              <input
                type="text"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                placeholder="Your name"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Email</label>
              <input
                type="email"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Message</label>
              <textarea
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white h-32"
                placeholder="How can we help?"
              ></textarea>
            </div>
            
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors">
              Send Message
            </button>
          </form>
        </div>
        
        <div className="space-y-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-6">Contact Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <FaEnvelope className="text-indigo-400 text-xl mr-4" />
                <div>
                  <p className="text-gray-300">Email</p>
                  <p className="text-white">support@smarthome.com</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <FaPhone className="text-indigo-400 text-xl mr-4" />
                <div>
                  <p className="text-gray-300">Phone</p>
                  <p className="text-white">+1 (555) 123-4567</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <FaMapMarkerAlt className="text-indigo-400 text-xl mr-4" />
                <div>
                  <p className="text-gray-300">Address</p>
                  <p className="text-white">123 Smart Street, Tech City, TC 12345</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-6">Business Hours</h2>
            <div className="space-y-2">
              <p className="text-gray-300">Monday - Friday: 9:00 AM - 6:00 PM</p>
              <p className="text-gray-300">Saturday: 10:00 AM - 4:00 PM</p>
              <p className="text-gray-300">Sunday: Closed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;