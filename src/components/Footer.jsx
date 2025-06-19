import { Zap, Mail, Phone, MapPin, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-green-400 border-t border-green-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-lime-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">SmartHome</span>
            </div>
            <p className="text-green-300 text-sm mb-2 leading-relaxed">
              "Revolutionizing home automation with AI-powered energy management and intelligent device control."
            </p>
            <p className="text-green-300 text-sm mb-3 leading-relaxed">
              "Experience the future of living, where your home adapts to you."
            </p>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              <img
                src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=120&h=80&fit=crop&crop=center"
                alt="Modern smart home exterior"
                className="w-full h-16 object-cover rounded-lg shadow-md"
                onError={(e) => { e.target.onerror = null; e.target.src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=120&h=80&fit=crop&crop=center"; }}
              />
              <img
                src="https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=120&h=80&fit=crop&crop=center"
                alt="Smart lighting system"
                className="w-full h-16 object-cover rounded-lg shadow-md"
                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/120x80/10B981/FFFFFF?text=Light"; }}
              />
              <img
                src="https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=120&h=80&fit=crop&crop=center"
                alt="Smart device control"
                className="w-full h-16 object-cover rounded-lg shadow-md"
                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/120x80/059669/FFFFFF?text=Tech"; }}
              />
            </div>
            
            <div className="flex space-x-3">
              <a href="#" className="text-green-400 hover:text-green-200 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-green-400 hover:text-green-200 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-green-400 hover:text-green-200 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3 text-base">Navigation</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-green-400 hover:text-white transition-colors text-base">Dashboard</a></li>
              <li><a href="/smart-routines" className="text-green-400 hover:text-white transition-colors text-base">Smart Routines</a></li>
              <li><a href="/analytics" className="text-green-400 hover:text-white transition-colors text-base">Analytics</a></li>
              <li><a href="/geofencing" className="text-green-400 hover:text-white transition-colors text-base">Geofencing</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3 text-base">Company</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="text-green-400 hover:text-white transition-colors text-base">About Us</a></li>
              <li><a href="/contact" className="text-green-400 hover:text-white transition-colors text-base">Contact</a></li>
              <li><a href="/terms" className="text-green-400 hover:text-white transition-colors text-base">Terms & Conditions</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3 text-base">Contact Info</h3>
            <ul className="space-y-2.5">
              <li className="flex items-center space-x-2 text-green-400 text-sm">
                <Mail className="w-4 h-4" />
                <span>hello@smarthome.ai</span>
              </li>
              <li className="flex items-center space-x-2 text-green-400 text-sm">
                <Phone className="w-4 h-4" />
                <span>+91 88268 34155</span>
              </li>
              <li className="flex items-center space-x-2 text-green-400 text-sm">
                <MapPin className="w-4 h-4" />
                <span>New Delhi, India</span>
              </li>
            </ul>
            
            <div className="mt-4">
              <img
                src="https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=200&h=100&fit=crop&crop=center"
                alt="Modern smart home"
                className="w-full h-20 object-cover rounded-lg shadow-md"
                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/200x100/16A34A/FFFFFF?text=Smart+Home"; }}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-green-700 mt-6 pt-4 text-center">
          <p className="text-green-400 text-sm">
            © 2025 SmartHome AI. All rights reserved. Built with ❤️ for the future of home automation.
          </p>
        </div>
      </div>
    </footer>
  );
}