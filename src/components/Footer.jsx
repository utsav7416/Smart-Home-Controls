import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="bg-white/10 backdrop-blur-md border-t border-white/20 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">About SmartHome</h3>
            <p className="text-gray-300">
              Transforming houses into intelligent living spaces with cutting-edge home automation technology.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Our Mission</h3>
            <p className="text-gray-300">
              Creating sustainable, efficient, and comfortable living spaces through innovative smart home solutions.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Technology</h3>
            <p className="text-gray-300">
              Using state-of-the-art IoT devices and AI-powered systems to revolutionize home automation.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white text-xl"><FaFacebook /></a>
              <a href="#" className="text-gray-300 hover:text-white text-xl"><FaTwitter /></a>
              <a href="#" className="text-gray-300 hover:text-white text-xl"><FaInstagram /></a>
              <a href="#" className="text-gray-300 hover:text-white text-xl"><FaLinkedin /></a>
            </div>
            <p className="text-gray-300 mt-4">
              Subscribe to our newsletter for updates and tips.
            </p>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 mb-4 md:mb-0">
              © 2025 SmartHome. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</Link>
              <Link to="/terms" className="text-gray-300 hover:text-white">Terms of Service</Link>
              <Link to="/contact" className="text-gray-300 hover:text-white">Contact</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;