import React, { useState } from 'react';

function DeviceCard({ device }) {
  
  const [isOn, setIsOn] = useState(device.status);

  const toggleDevice = () => {
    setIsOn(!isOn);
  };

  return (
    <div className="device-card bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <div className="flex flex-col items-center">
        <device.icon className={`text-4xl ${isOn ? 'text-yellow-400' : 'text-gray-400'} mb-4`} />
        <h3 className="text-xl font-semibold text-white mb-2">{device.name}</h3>
        <p className="text-gray-300 mb-4">{isOn ? 'ON' : 'OFF'}</p>
        <button
          onClick={toggleDevice}
          className={`px-6 py-2 rounded-full transition-colors ${
            isOn
              ? 'bg-yellow-400 hover:bg-yellow-500 text-black'
              : 'bg-gray-600 hover:bg-gray-700 text-white'
          }`}
        >
          {isOn ? 'Turn Off' : 'Turn On'}
        </button>
      </div>
    </div>
  );
}

export default DeviceCard;