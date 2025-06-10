import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Clock, AlertTriangle, CheckCircle, FileText, Lock, Zap, ArrowRight, Home } from 'lucide-react';

function Terms() {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    {
      id: 'overview',
      title: 'Overview',
      icon: FileText,
      content: {
        title: 'Welcome to SmartHome',
        description: 'Your intelligent home automation platform built for the future.',
        points: [
          'Premium smart home control and automation',
          'Advanced AI-powered routines and insights',
          'Enterprise-grade security and privacy protection',
        ]
      }
    },
    {
      id: 'usage',
      title: 'Usage Rights',
      icon: Users,
      content: {
        title: 'Your Rights & Responsibilities',
        description: 'Understanding how you can use SmartHome services.',
        points: [
          'Must be 18+ years old or have parental consent',
          'Responsible for account security and device access',
          'Business use requires a commercial license'
        ]
      }
    },
    {
      id: 'service',
      title: 'Service Level',
      icon: Zap,
      content: {
        title: 'What We Guarantee',
        description: 'Our commitment to reliable, high-quality service.',
        points: [
          'We aim for 99.9% service availability',
          '24/7 monitoring and quick problem resolution',
          'Planned maintenance with advance notice',
        ]
      }
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: Lock,
      content: {
        title: 'Your Data Protection',
        description: 'How we safeguard your personal information and smart home data.',
        points: [
          'Sensitive automation rules processed locally on your devices',
          'We follow all major privacy protection standards'
        ]
      }
    },
    {
      id: 'liability',
      title: 'Liability',
      icon: Shield,
      content: {
        title: 'Service Limitations',
        description: 'Understanding the scope of our responsibility.',
        points: [
          'Service provided as-is with continuous improvements',
          'We are not responsible for device manufacturer problems',
          'Natural disasters and emergencies beyond our control',
        ]
      }
    }
  ];

  const currentSection = sections.find(s => s.id === activeSection);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative overflow-hidden h-80">
        <img
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format&fit=crop&q=60"
          alt="Smart Home Terms"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30"></div>

        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl mb-6 shadow-lg">
              <Home className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-4">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Clear, fair terms that protect both you and SmartHome while enabling amazing smart home experiences.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <h3 className="text-lg font-semibold mb-6 text-gray-300">Navigate Sections</h3>
              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 text-left group ${
                        activeSection === section.id
                          ? 'bg-gradient-to-r from-green-700 to-green-600 shadow-lg'
                          : 'hover:bg-green-900/30 hover:translate-x-1'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mr-3 ${
                        activeSection === section.id ? 'text-white' : 'text-gray-400 group-hover:text-white'
                      }`} />
                      <span className={`font-medium ${
                        activeSection === section.id ? 'text-white' : 'text-gray-300 group-hover:text-white'
                      }`}>
                        {section.title}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-gradient-to-br from-gray-800/90 to-green-900/40 backdrop-blur-xl rounded-3xl p-8 border border-green-700/30 shadow-2xl">
              {currentSection && (
                <div>
                  <div className="flex items-center mb-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl flex items-center justify-center mr-4">
                      <currentSection.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">
                        {currentSection.content.title}
                      </h2>
                      <p className="text-gray-300 text-lg">
                        {currentSection.content.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {currentSection.content.points.map((point, index) => (
                      <div
                        key={index}
                        className="flex items-start p-4 bg-green-900/20 rounded-xl border border-green-700/30 hover:bg-green-900/30 transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-4 flex-shrink-0 group-hover:scale-110 transition-transform">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-gray-300 leading-relaxed group-hover:text-white transition-colors">
                          {point}
                        </p>
                      </div>
                    ))}
                  </div>

                  {activeSection === 'liability' && (
                    <div className="mt-8 p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl">
                      <div className="flex items-center mb-3">
                        <AlertTriangle className="w-6 h-6 text-amber-400 mr-3" />
                        <h4 className="text-lg font-semibold text-amber-400">Important Notice</h4>
                      </div>
                      <p className="text-gray-300 leading-relaxed">
                        We recommend consulting with your insurance provider about smart home coverage and maintaining regular backups of your automation settings.
                      </p>
                    </div>
                  )}

                  {activeSection === 'privacy' && (
                    <div className="mt-8 p-6 bg-gradient-to-r from-green-600/10 to-emerald-600/10 border border-green-500/30 rounded-xl">
                      <div className="flex items-center mb-3">
                        <Lock className="w-6 h-6 text-green-400 mr-3" />
                        <h4 className="text-lg font-semibold text-green-400">Privacy First</h4>
                      </div>
                      <p className="text-gray-300 leading-relaxed">
                        Your privacy is our priority. All data processing happens with your explicit consent, and you maintain full control over your information.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-gray-800/50 to-green-900/30 rounded-xl border border-green-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Questions about our terms?</h4>
                  <p className="text-gray-300">Our legal team is here to help clarify any concerns.</p>
                </div>
                <Link
                  to="/contact" 
                  className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center group"
                >
                  Contact Us
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-green-800/50 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center text-gray-400">
            <Clock className="w-4 h-4 mr-2" />
            <span>Last updated: June 2025</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Terms;