import React, { useState, useEffect } from 'react';
import { FaBell, FaQuestionCircle, FaLightbulb } from 'react-icons/fa';

function Settings() {
  // Lazy initialization: retrieve saved settings from localStorage or use defaults.
  const [notifications, setNotifications] = useState(() => {
    const storedSettings = localStorage.getItem('notificationSettings');
    return storedSettings
      ? JSON.parse(storedSettings)
      : { push: false, email: false, updates: false };
  });

  // Save notifications state to localStorage whenever it changes.
  useEffect(() => {
    localStorage.setItem('notificationSettings', JSON.stringify(notifications));
  }, [notifications]);

  // Toggle a specific notification setting.
  const handleToggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Notifications Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center mb-4">
            <FaBell className="text-2xl text-indigo-400 mr-3" />
            <h2 className="text-xl font-semibold text-white">Notifications</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Push Notifications', key: 'push' },
              { label: 'Email Alerts', key: 'email' },
              { label: 'Device Updates', key: 'updates' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-300">{item.label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notifications[item.key]} 
                    onChange={() => handleToggle(item.key)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer
                    peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                    after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600">
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center mb-4">
            <FaQuestionCircle className="text-2xl text-green-400 mr-3" />
            <h2 className="text-xl font-semibold text-white">Frequently Asked Questions (FAQ)</h2>
          </div>
          <div className="text-gray-300 space-y-4">
            <div className="mb-4">
              <h3 className="font-semibold">How do I add a new device?</h3>
              <p>
                To add a new device, navigate to the "Devices" tab and click the "Add Device" button. Follow the on-screen instructions for pairing.
              </p>
            </div>
            <div className="mb-4">
              <h3 className="font-semibold">How do I change the temperature unit from Fahrenheit to Celsius?</h3>
              <p>
                To change the temperature unit, simply go to the Home page and select the "Switch to Celsius" option to switch from Fahrenheit to Celsius. You can toggle between units easily from there.
              </p>
            </div>
            <div className="mb-4">
              <h3 className="font-semibold">What should I do if I experience issues with my devices?</h3>
              <p>
                If you're experiencing issues, try restarting your device or checking its connection. You can also visit our Help Center for detailed troubleshooting steps or contact support for assistance.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Tips Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center mb-4">
            <FaLightbulb className="text-2xl text-indigo-400 mr-3" />
            <h2 className="text-xl font-semibold text-white">Quick Tips</h2>
          </div>
          <ul className="text-gray-300 list-disc pl-5 space-y-2">
            <li>Use voice commands to control devices hands-free.</li>
            <li>Set automation routines for different times of the day.</li>
            <li>Monitor energy usage to optimize efficiency.</li>
            <li>Enable notifications for important updates and alerts.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Settings;
