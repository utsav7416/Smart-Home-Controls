import { Link } from 'react-router-dom';
import { Zap, Mail, Phone, MapPin, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-green-400 border-t border-green-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-lime-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">SmartHome</span>
            </div>
            <p className="text-green-300 text-xs">
              "Revolutionizing home automation with AI-powered energy management and intelligent device control."
            </p>
            <p className="text-green-300 text-xs">
              "Experience the future of living, where your home adapts to you."
            </p>
            <p className="text-green-300 text-xs">
              "SmartHome: Innovation for a sustainable and connected lifestyle."
            </p>
            <div className="flex space-x-3">
              <img
                src="https://placehold.co/50x50/34D399/FFFFFF?text=AI"
                alt="AI integration icon"
                className="w-10 h-10 rounded-full shadow-lg"
                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/50x50/888888/FFFFFF?text=Err"; }}
              />
              <img
                src="https://placehold.co/50x50/10B981/FFFFFF?text=Energy"
                alt="Energy management icon"
                className="w-10 h-10 rounded-full shadow-lg"
                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/50x50/888888/FFFFFF?text=Err"; }}
              />
            </div>
            <div className="flex space-x-3">
              <a href="#" className="text-green-400 hover:text-green-200 transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="text-green-400 hover:text-green-200 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="text-green-400 hover:text-green-200 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Navigation</h3>
            <ul className="space-y-1.5">
              <li><Link to="/" className="text-green-400 hover:text-white transition-colors text-xs">Dashboard</Link></li>
              <li><Link to="/devices" className="text-green-400 hover:text-white transition-colors text-xs">Devices</Link></li>
              <li><Link to="/analytics" className="text-green-400 hover:text-white transition-colors text-xs">Analytics</Link></li>
              <li><Link to="/geofencing" className="text-green-400 hover:text-white transition-colors text-xs">Geofencing</Link></li>
              <li><Link to="/automation" className="text-green-400 hover:text-white transition-colors text-xs">Automation</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Company</h3>
            <ul className="space-y-1.5">
              <li><Link to="/about" className="text-green-400 hover:text-white transition-colors text-xs">About Us</Link></li>
              <li><Link to="/contact" className="text-green-400 hover:text-white transition-colors text-xs">Contact</Link></li>
              <li><span className="text-green-400 text-xs">Terms of Service</span></li>
              <li><span className="text-green-400 text-xs">Privacy Policy</span></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Contact Info</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-1.5 text-green-400 text-xs">
                <Mail className="w-3.5 h-3.5" />
                <span>hello@smarthome.ai</span>
              </li>
              <li className="flex items-center space-x-1.5 text-green-400 text-xs">
                <Phone className="w-3.5 h-3.5" />
                <span>+91 88268 34155</span>
              </li>
              <li className="flex items-center space-x-1.5 text-green-400 text-xs">
                <MapPin className="w-3.5 h-3.5" />
                <span>New Delhi, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-green-700 mt-6 pt-6 text-center">
          <p className="text-green-400 text-xs">
            © 2025 SmartHome AI. All rights reserved. Built with ❤️ for the future of home automation.
          </p>
        </div>
      </div>
    </footer>
  );
}