import React, { useState } from 'react';
import { FaLightbulb, FaFan, FaTv, FaThermometerHalf } from 'react-icons/fa';
import { MdKitchen, MdHotTub, MdShower, MdMicrowave } from 'react-icons/md';

function DeviceControl({ room, onDeviceChange }) {
  const [livingRoomDevices] = useState([
    { id: 1, name: 'Main Light', icon: FaLightbulb, isOn: false, property: 'brightness', value: 70 },
    { id: 2, name: 'Fan', icon: FaFan, isOn: false, property: 'speed', value: 50 },
    { id: 3, name: 'AC', icon: FaThermometerHalf, isOn: false, property: 'temp', value: 72 },
    { id: 4, name: 'TV', icon: FaTv, isOn: false, property: 'volume', value: 30 },
  ]);

  const [bedroomDevices] = useState([
    { id: 1, name: 'Main Light', icon: FaLightbulb, isOn: false, property: 'brightness', value: 70 },
    { id: 2, name: 'Fan', icon: FaFan, isOn: false, property: 'speed', value: 50 },
    { id: 3, name: 'AC', icon: FaThermometerHalf, isOn: false, property: 'temp', value: 72 },
    { id: 4, name: 'TV', icon: FaTv, isOn: false, property: 'volume', value: 30 },
  ]);

  const [officeDevices] = useState([
    { id: 1, name: 'Main Light', icon: FaLightbulb, isOn: false, property: 'brightness', value: 70 },
    { id: 2, name: 'Fan', icon: FaFan, isOn: false, property: 'speed', value: 50 },
    { id: 3, name: 'AC', icon: FaThermometerHalf, isOn: false, property: 'temp', value: 72 },
    { id: 4, name: 'TV', icon: FaTv, isOn: false, property: 'volume', value: 30 },
  ]);

  const [kitchenDevices] = useState([
    { id: 1, name: 'Main Light', icon: FaLightbulb, isOn: false, property: 'brightness', value: 70 },
    { id: 2, name: 'Microwave', icon: MdMicrowave, isOn: false, property: 'temp', value: 50 },
    { id: 3, name: 'AC', icon: FaThermometerHalf, isOn: false, property: 'temp', value: 72 },
    { id: 4, name: 'Refrigerator', icon: MdKitchen, isOn: false, property: 'power', value: 80 },
  ]);

  const [bathroomDevices] = useState([
    { id: 1, name: 'Main Light', icon: FaLightbulb, isOn: false, property: 'brightness', value: 70 },
    { id: 2, name: 'Shower', icon: MdShower, isOn: false, property: 'pressure', value: 50 },
    { id: 3, name: 'Water Heater', icon: MdHotTub, isOn: false, property: 'temperature', value: 60 },
    { id: 4, name: 'Dryer', icon: FaFan, isOn: false, property: 'speed', value: 60 },
  ]);

  const [livingRoomState, setLivingRoomState] = useState(livingRoomDevices);
  const [bedroomState, setBedroomState] = useState(bedroomDevices);
  const [officeState, setOfficeState] = useState(officeDevices);
  const [kitchenState, setKitchenState] = useState(kitchenDevices);
  const [bathroomState, setBathroomState] = useState(bathroomDevices);

  const getActiveRoomDevices = () => {
    switch (room) {
      case "Living Room": return livingRoomState;
      case "Bedroom": return bedroomState;
      case "Office": return officeState;
      case "Kitchen": return kitchenState;
      case "Bathroom": return bathroomState;
      default: return [];
    }
  };

  const getCurrentStateSetter = () => {
    switch (room) {
      case "Living Room": return setLivingRoomState;
      case "Bedroom": return setBedroomState;
      case "Office": return setOfficeState;
      case "Kitchen": return setKitchenState;
      case "Bathroom": return setBathroomState;
      default: return () => {};
    }
  };

  const toggleDevice = (deviceId) => {
    const setCurrentRoomState = getCurrentStateSetter();
    const currentDevices = getActiveRoomDevices();
    const newDevices = currentDevices.map(device =>
      device.id === deviceId
        ? { ...device, isOn: !device.isOn }
        : device
    );
    setCurrentRoomState(newDevices);
    if (onDeviceChange) {
      onDeviceChange(newDevices);
    }
  };

  const updateDeviceValue = (deviceId, property, value) => {
    const setCurrentRoomState = getCurrentStateSetter();
    const currentDevices = getActiveRoomDevices();
    const newDevices = currentDevices.map(device =>
      device.id === deviceId
        ? { ...device, [property]: value }
        : device
    );
    setCurrentRoomState(newDevices);
    if (onDeviceChange) {
      onDeviceChange(newDevices);
    }
  };

  const renderDeviceControls = (device) => {
    if (!device.isOn) return null;
    
    switch (device.property) {
      case 'brightness':
        return (
          <div className="mt-2">
            <label className="text-sm text-gray-300 mb-1 block">Brightness</label>
            <input
              type="range"
              min="0"
              max="100"
              value={device.value}
              onChange={(e) => updateDeviceValue(device.id, 'value', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-400 mt-1">
              <span>Low</span>
              <span>{device.value}%</span>
              <span>High</span>
            </div>
          </div>
        );
      case 'speed':
        return (
          <div className="mt-2">
            <label className="text-sm text-gray-300 mb-1 block">Fan Speed</label>
            <input
              type="range"
              min="0"
              max="100"
              value={device.value}
              onChange={(e) => updateDeviceValue(device.id, 'value', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-400 mt-1">
              <span>Slow</span>
              <span>{device.value}%</span>
              <span>Fast</span>
            </div>
          </div>
        );
      case 'temp':
        return (
          <div className="mt-2">
            <label className="text-sm text-gray-300 mb-1 block">Temperature</label>
            <input
              type="range"
              min="60"
              max="85"
              value={device.value}
              onChange={(e) => updateDeviceValue(device.id, 'value', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-400 mt-1">
              <span>60°F</span>
              <span>{device.value}°F</span>
              <span>85°F</span>
            </div>
          </div>
        );
      case 'volume':
        return (
          <div className="mt-2">
            <label className="text-sm text-gray-300 mb-1 block">Volume</label>
            <input
              type="range"
              min="0"
              max="100"
              value={device.value}
              onChange={(e) => updateDeviceValue(device.id, 'value', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-400 mt-1">
              <span>Mute</span>
              <span>{device.value}%</span>
              <span>Max</span>
            </div>
          </div>
        );
      case 'pressure':
        return (
          <div className="mt-2">
            <label className="text-sm text-gray-300 mb-1 block">Water Pressure</label>
            <input
              type="range"
              min="0"
              max="100"
              value={device.value}
              onChange={(e) => updateDeviceValue(device.id, 'value', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-400 mt-1">
              <span>Low</span>
              <span>{device.value}%</span>
              <span>High</span>
            </div>
          </div>
        );
      case 'temperature':
        return (
          <div className="mt-2">
            <label className="text-sm text-gray-300 mb-1 block">Water Temperature</label>
            <input
              type="range"
              min="40"
              max="120"
              value={device.value}
              onChange={(e) => updateDeviceValue(device.id, 'value', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-400 mt-1">
              <span>40°F</span>
              <span>{device.value}°F</span>
              <span>120°F</span>
            </div>
          </div>
        );
      case 'power':
        return (
          <div className="mt-2">
            <label className="text-sm text-gray-300 mb-1 block">Power Level</label>
            <input
              type="range"
              min="10"
              max="100"
              value={device.value}
              onChange={(e) => updateDeviceValue(device.id, 'value', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-400 mt-1">
              <span>Low</span>
              <span>{device.value}%</span>
              <span>High</span>
            </div>
            <button 
              onClick={() => alert('Refrigerator started!')}
              className="mt-2 bg-green-500 text-white py-1 px-3 rounded-md w-full"
            >
              Start
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const currentDevices = getActiveRoomDevices();

  const headerTitle = room === "All Rooms" ? (
    <div className="w-full p-6 text-center bg-transparent">
      <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-green-400">
        Your Smart Home, Simplified – Effortless Control!
      </p>
      <p className="text-xl font-medium text-gray-100 mt-2">
        Lights, Fans, Appliances – All at Your Fingertips!
      </p>
      <p className="text-xl font-medium text-gray-100 mt-1">
        Seamless Automation, Smarter Living!
      </p>
      <p className="text-xl font-medium text-gray-100 mt-1">
        Control Everything, Anytime, Anywhere!
      </p>
      <p className="text-xl font-medium text-gray-100 mt-1">
        A Smarter Home for a Smarter You!
      </p>
      <p className="text-xl font-medium text-gray-100 mt-1">
        Experience Convenience Like Never Before!
      </p>
    </div>
  ) : (
    <h2 className="text-2xl font-bold text-white">{room} Controls</h2>
  );

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-6">{headerTitle}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentDevices.map(device => (
          <div
            key={device.id}
            className="flex flex-col p-4 bg-white/5 rounded-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <device.icon
                  className={`text-3xl mr-3 ${device.isOn ? 'text-yellow-400' : 'text-gray-400'}`}
                />
                <div>
                  <p className="text-gray-300">{device.name}</p>
                  <button
                    onClick={() => toggleDevice(device.id)}
                    className={`mt-1 px-3 py-1 rounded-full text-sm ${
                      device.isOn
                        ? 'bg-yellow-400 text-black'
                        : 'bg-gray-600 text-white'
                    }`}
                  >
                    {device.isOn ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>
            {renderDeviceControls(device)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default DeviceControl;
