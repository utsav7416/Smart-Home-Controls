import { Zap, Mail, Phone, MapPin, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 text-green-400 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-green-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-lime-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 via-green-500 to-lime-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-lime-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                  SmartHome
                </span>
                <div className="w-14 h-0.5 bg-gradient-to-r from-green-400 to-lime-400 mt-1"></div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="relative pl-3 border-l-2 border-green-500/30">
                <p className="text-green-200 text-sm leading-relaxed font-medium">
                  "Revolutionizing home automation with AI-powered energy management and intelligent device control."
                </p>
              </div>
              <div className="relative pl-3 border-l-2 border-lime-500/30">
                <p className="text-green-200 text-sm leading-relaxed font-medium">
                  "Experience the future of living, where your home adapts to you."
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="relative group overflow-hidden rounded-lg">
                <img
                  src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=120&h=80&fit=crop&crop=center"
                  alt="Modern smart home exterior"
                  className="w-full h-14 object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => { e.target.onerror = null; e.target.src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=120&h=80&fit=crop&crop=center"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="relative group overflow-hidden rounded-lg">
                <img
                  src="https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=120&h=80&fit=crop&crop=center"
                  alt="Smart lighting system"
                  className="w-full h-14 object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/120x80/10B981/FFFFFF?text=Light"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="relative group overflow-hidden rounded-lg">
                <img
                  src="https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=120&h=80&fit=crop&crop=center"
                  alt="Smart device control"
                  className="w-full h-14 object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/120x80/059669/FFFFFF?text=Tech"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
            
            <div className="flex space-x-3 pt-1">
              <a href="#" className="group p-1.5 bg-green-900/30 rounded-lg border border-green-800/50 hover:border-green-500/50 hover:bg-green-800/30 transition-all duration-300">
                <Github className="w-4 h-4 text-green-400 group-hover:text-green-200 transition-colors" />
              </a>
              <a href="#" className="group p-1.5 bg-green-900/30 rounded-lg border border-green-800/50 hover:border-green-500/50 hover:bg-green-800/30 transition-all duration-300">
                <Twitter className="w-4 h-4 text-green-400 group-hover:text-green-200 transition-colors" />
              </a>
              <a href="#" className="group p-1.5 bg-green-900/30 rounded-lg border border-green-800/50 hover:border-green-500/50 hover:bg-green-800/30 transition-all duration-300">
                <Linkedin className="w-4 h-4 text-green-400 group-hover:text-green-200 transition-colors" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-white font-bold text-base relative inline-block">
                Navigation
                <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-green-400 to-transparent"></div>
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="/" className="group flex items-center text-green-300 hover:text-white transition-all duration-300 text-sm">
                    <div className="w-1 h-1 bg-green-400 rounded-full mr-2 group-hover:w-1.5 transition-all duration-300"></div>
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="/smart-routines" className="group flex items-center text-green-300 hover:text-white transition-all duration-300 text-sm">
                    <div className="w-1 h-1 bg-green-400 rounded-full mr-2 group-hover:w-1.5 transition-all duration-300"></div>
                    Smart Routines
                  </a>
                </li>
                <li>
                  <a href="/analytics" className="group flex items-center text-green-300 hover:text-white transition-all duration-300 text-sm">
                    <div className="w-1 h-1 bg-green-400 rounded-full mr-2 group-hover:w-1.5 transition-all duration-300"></div>
                    Analytics
                  </a>
                </li>
                <li>
                  <a href="/geofencing" className="group flex items-center text-green-300 hover:text-white transition-all duration-300 text-sm">
                    <div className="w-1 h-1 bg-green-400 rounded-full mr-2 group-hover:w-1.5 transition-all duration-300"></div>
                    Geofencing
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-white font-bold text-base relative inline-block">
                Company
                <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-green-400 to-transparent"></div>
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="/about" className="group flex items-center text-green-300 hover:text-white transition-all duration-300 text-sm">
                    <div className="w-1 h-1 bg-green-400 rounded-full mr-2 group-hover:w-1.5 transition-all duration-300"></div>
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/contact" className="group flex items-center text-green-300 hover:text-white transition-all duration-300 text-sm">
                    <div className="w-1 h-1 bg-green-400 rounded-full mr-2 group-hover:w-1.5 transition-all duration-300"></div>
                    Contact
                  </a>
                </li>
                <li>
                  <a href="/terms" className="group flex items-center text-green-300 hover:text-white transition-all duration-300 text-sm">
                    <div className="w-1 h-1 bg-green-400 rounded-full mr-2 group-hover:w-1.5 transition-all duration-300"></div>
                    Terms & Conditions
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-white font-bold text-base relative inline-block">
              Contact Info
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-green-400 to-transparent"></div>
            </h3>
            
            <div className="space-y-2">
              <div className="group flex items-center space-x-2 p-2 rounded-lg bg-green-900/20 border border-green-800/30 hover:border-green-500/50 transition-all duration-300">
                <div className="p-1.5 bg-green-500/20 rounded-lg">
                  <Mail className="w-3 h-3 text-green-400" />
                </div>
                <span className="text-green-200 group-hover:text-white transition-colors text-sm">hello@smarthome.ai</span>
              </div>
              
              <div className="group flex items-center space-x-2 p-2 rounded-lg bg-green-900/20 border border-green-800/30 hover:border-green-500/50 transition-all duration-300">
                <div className="p-1.5 bg-green-500/20 rounded-lg">
                  <Phone className="w-3 h-3 text-green-400" />
                </div>
                <span className="text-green-200 group-hover:text-white transition-colors text-sm">+91 88268 34155</span>
              </div>
              
              <div className="group flex items-center space-x-2 p-2 rounded-lg bg-green-900/20 border border-green-800/30 hover:border-green-500/50 transition-all duration-300">
                <div className="p-1.5 bg-green-500/20 rounded-lg">
                  <MapPin className="w-3 h-3 text-green-400" />
                </div>
                <span className="text-green-200 group-hover:text-white transition-colors text-sm">New Delhi, India</span>
              </div>
            </div>
            
            <div className="relative group overflow-hidden rounded-lg">
              <img
                src="https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=200&h=100&fit=crop&crop=center"
                alt="Modern smart home"
                className="w-full h-16 object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/200x100/16A34A/FFFFFF?text=Smart+Home"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <div className="absolute bottom-1 left-2 text-xs text-white font-medium">Smart Living</div>
            </div>
          </div>
        </div>

        <div className="relative mt-6 pt-4">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
          <div className="text-center">
            <p className="text-green-300 text-xs bg-gradient-to-r from-green-400 to-lime-400 bg-clip-text text-transparent font-medium">
              © 2025 SmartHome AI. All rights reserved. Built with ❤️ by Utsav Choudhary for the future of home automation.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}