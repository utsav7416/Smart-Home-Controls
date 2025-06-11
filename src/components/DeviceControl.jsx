import React, { useState, useEffect } from 'react';
import { FaLightbulb, FaFan, FaTv, FaThermometerHalf } from 'react-icons/fa';
import { MdKitchen, MdHotTub, MdShower, MdMicrowave } from 'react-icons/md';

const ICON_MAP = {
  'Main Light': FaLightbulb,
  'Fan': FaFan,
  'AC': FaThermometerHalf,
  'TV': FaTv,
  'Microwave': MdMicrowave,
  'Refrigerator': MdKitchen,
  'Shower': MdShower,
  'Water Heater': MdHotTub,
  'Dryer': FaFan,
};

function DeviceControl({ room }) {
  const initialLivingRoomDevices = [
    { id: 1, name: 'Main Light', isOn: false, property: 'brightness', value: 70 },
    { id: 2, name: 'Fan', isOn: false, property: 'speed', value: 50 },
    { id: 3, name: 'AC', isOn: false, property: 'temp', value: 72 },
    { id: 4, name: 'TV', isOn: false, property: 'volume', value: 30 },
  ];

  const initialBedroomDevices = [
    { id: 1, name: 'Main Light', isOn: false, property: 'brightness', value: 70 },
    { id: 2, name: 'Fan', isOn: false, property: 'speed', value: 50 },
    { id: 3, name: 'AC', isOn: false, property: 'temp', value: 72 },
    { id: 4, name: 'TV', isOn: false, property: 'volume', value: 30 },
  ];

  const initialOfficeDevices = [
    { id: 1, name: 'Main Light', isOn: false, property: 'brightness', value: 70 },
    { id: 2, name: 'Fan', isOn: false, property: 'speed', value: 50 },
    { id: 3, name: 'AC', isOn: false, property: 'temp', value: 72 },
    { id: 4, name: 'TV', isOn: false, property: 'volume', value: 30 },
  ];

  const initialKitchenDevices = [
    { id: 1, name: 'Main Light', isOn: false, property: 'brightness', value: 70 },
    { id: 2, name: 'Microwave', isOn: false, property: 'temp', value: 50 },
    { id: 3, name: 'AC', isOn: false, property: 'temp', value: 72 },
    { id: 4, name: 'Refrigerator', isOn: false, property: 'power', value: 80 },
  ];

  const initialBathroomDevices = [
    { id: 1, name: 'Main Light', isOn: false, property: 'brightness', value: 70 },
    { id: 2, name: 'Shower', isOn: false, property: 'pressure', value: 50 },
    { id: 3, name: 'Water Heater', isOn: false, property: 'temperature', value: 60 },
    { id: 4, name: 'Dryer', isOn: false, property: 'speed', value: 60 },
  ];

  const addIconsToDevices = (devices) => {
    return devices.map(device => ({
      ...device,
      icon: ICON_MAP[device.name] || null
    }));
  };

  const getInitialDeviceStates = () => {
    try {
      const storedDevices = localStorage.getItem('deviceStates');
      if (storedDevices) {
        const parsedDevices = JSON.parse(storedDevices);
        const hydratedDevices = {};
        for (const roomName in parsedDevices) {
          hydratedDevices[roomName] = addIconsToDevices(parsedDevices[roomName]);
        }
        return hydratedDevices;
      }
    } catch (error) {
      console.error('Error parsing device states from localStorage:', error);
    }
    return {
      "Living Room": addIconsToDevices(initialLivingRoomDevices),
      "Bedroom": addIconsToDevices(initialBedroomDevices),
      "Office": addIconsToDevices(initialOfficeDevices),
      "Kitchen": addIconsToDevices(initialKitchenDevices),
      "Bathroom": addIconsToDevices(initialBathroomDevices),
    };
  };

  const [allDeviceStates, setAllDeviceStates] = useState(getInitialDeviceStates);

  useEffect(() => {
    const serializableStates = {};
    for (const roomName in allDeviceStates) {
      serializableStates[roomName] = allDeviceStates[roomName].map(({ icon, ...rest }) => rest);
    }
    localStorage.setItem('deviceStates', JSON.stringify(serializableStates));

    window.dispatchEvent(new Event('storage'));

    const sendDeviceStatesToBackend = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/update-device-states`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ deviceStates: serializableStates }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Device states updated on backend:', data);
      } catch (error) {
        console.error('Error sending device states to backend:', error);
      }
    };

    const handler = setTimeout(() => {
      sendDeviceStatesToBackend();
    }, 500);
    return () => {
      clearTimeout(handler);
    };

  }, [allDeviceStates]);

  const getActiveRoomDevices = () => {
    return allDeviceStates[room] || [];
  };

  const updateDeviceState = (updatedRoomDevices) => {
    const hydratedUpdatedRoomDevices = addIconsToDevices(updatedRoomDevices.map(({ icon, ...rest }) => rest));
    setAllDeviceStates(prevStates => ({
      ...prevStates,
      [room]: hydratedUpdatedRoomDevices,
    }));
  };

  const toggleDevice = (deviceId) => {
    const currentDevices = getActiveRoomDevices();
    const newDevices = currentDevices.map(device =>
      device.id === deviceId
        ? { ...device, isOn: !device.isOn }
        : device
    );
    updateDeviceState(newDevices);
  };

  const updateDeviceValue = (deviceId, property, value) => {
    const currentDevices = getActiveRoomDevices();
    const newDevices = currentDevices.map(device =>
      device.id === deviceId
        ? { ...device, [property]: value }
        : device
    );
    updateDeviceState(newDevices);
  };

  const getSliderStyle = (value, min, max) => {
    const percentage = ((value - min) / (max - min)) * 100;
    return {
      background: `linear-gradient(90deg, #3b82f6 ${percentage}%, #d1d5db ${percentage}%)`
    };
  };

  const renderDeviceControls = (device) => {
    if (!device.isOn) return null;

    let min, max;
    switch (device.property) {
      case 'brightness':
      case 'speed':
      case 'volume':
      case 'pressure':
      case 'power':
        min = 0;
        max = 100;
        break;
      case 'temp':
        min = device.name === 'Water Heater' ? 40 : 60;
        max = device.name === 'Water Heater' ? 120 : 85;
        break;
      case 'temperature':
        min = 40;
        max = 120;
        break;
      default:
        min = 0;
        max = 100;
    }

    const valueLabel =
      device.property === 'temp' || device.property === 'temperature' ? `${device.value}°F` :
      `${device.value}%`;

    const minLabel =
      device.property === 'temp' || device.property === 'temperature' ? `${min}°F` :
      (device.property === 'volume' ? 'Mute' : 'Low');

    const maxLabel =
      device.property === 'temp' || device.property === 'temperature' ? `${max}°F` :
      (device.property === 'volume' ? 'Max' : 'High');


    return (
      <div className="mt-2">
        <label className="text-sm text-gray-300 mb-1 block">
          {device.property === 'brightness' && 'Brightness'}
          {device.property === 'speed' && 'Fan Speed'}
          {device.property === 'temp' && 'Temperature'}
          {device.property === 'temperature' && 'Water Temperature'}
          {device.property === 'volume' && 'Volume'}
          {device.property === 'pressure' && 'Water Pressure'}
          {device.property === 'power' && 'Power Level'}
        </label>
        <input
          type="range"
          min={min}
          max={max}
          value={device.value}
          onChange={(e) => updateDeviceValue(device.id, 'value', parseInt(e.target.value))}
          className="w-full"
          style={getSliderStyle(device.value, min, max)}
        />
        <div className="flex justify-between text-sm text-gray-400 mt-1">
          <span>{minLabel}</span>
          <span>{valueLabel}</span>
          <span>{maxLabel}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-lg text-white">
      <h2 className="text-xl font-bold mb-4">{room} Controls</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {getActiveRoomDevices().map(device => (
          <div key={device.id} className="bg-gray-700 p-4 rounded-lg flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {device.icon && (
                  <device.icon className={`w-6 h-6 ${device.isOn ? 'text-blue-400' : 'text-gray-400'}`} />
                )}
                <span className="font-semibold">{device.name}</span>
              </div>
              <button
                onClick={() => toggleDevice(device.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  device.isOn ? 'bg-blue-600' : 'bg-gray-400'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    device.isOn ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {renderDeviceControls(device)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default DeviceControl;