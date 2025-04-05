import React, { useState } from 'react';
import { FaBell, FaCheck, FaCog, FaExclamationTriangle } from 'react-icons/fa';

function Notifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'alert',
      title: 'High Energy Usage Detected',
      message: 'Your living room AC has been running for 8 hours straight.',
      time: '2 hours ago',
      icon: FaExclamationTriangle,
      color: 'text-yellow-400'
    },
    {
      id: 2,
      type: 'success',
      title: 'Morning Routine Completed',
      message: 'All devices were activated according to your schedule.',
      time: '5 hours ago',
      icon: FaCheck,
      color: 'text-green-400'
    },
    {
      id: 3,
      type: 'info',
      title: 'Device Update Available',
      message: 'A new firmware update is available for your smart thermostat.',
      time: '1 day ago',
      icon: FaCog,
      color: 'text-blue-400'
    }
  ]);

  const clearNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Notifications</h1>
          <button 
            onClick={() => setNotifications([])}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Clear All
          </button>
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 text-center">
            <FaBell className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300">No new notifications</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <notification.icon className={`text-2xl ${notification.color} mt-1 mr-4`} />
                    <div>
                      <h3 className="text-white font-semibold">{notification.title}</h3>
                      <p className="text-gray-400 mt-1">{notification.message}</p>
                      <p className="text-sm text-gray-500 mt-2">{notification.time}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => clearNotification(notification.id)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;