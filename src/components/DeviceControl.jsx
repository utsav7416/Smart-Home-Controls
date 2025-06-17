import React, { useState, useEffect } from 'react';
import { FaLightbulb, FaFan, FaTv, FaThermometerHalf, FaQrcode } from 'react-icons/fa';
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

function CalendarHeatmap({ data, deviceName }) {
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth() - 11, 1);
  
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  
  const getIntensity = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayData = data[dateStr];
    if (!dayData) return 0;
    
    const maxInteractions = Math.max(...Object.values(data).map(d => d.count || 0));
    if (maxInteractions === 0) return 0;
    
    const intensity = (dayData.count || 0) / maxInteractions;
    if (intensity === 0) return 0;
    if (intensity <= 0.25) return 1;
    if (intensity <= 0.5) return 2;
    if (intensity <= 0.75) return 3;
    return 4;
  };
  
  const getColor = (intensity) => {
    const colors = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];
    return colors[intensity];
  };
  
  const months = [];
  const currentDate = new Date(startDate);
  
  for (let i = 0; i < 12; i++) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'short' });
    
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      if (date <= today) {
        days.push({
          date,
          intensity: getIntensity(date),
          count: data[date.toISOString().split('T')[0]]?.count || 0
        });
      }
    }
    
    months.push({ monthName, days, year, month });
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return (
    <div className="bg-gray-900 p-4 rounded-lg">
      <h4 className="text-sm font-semibold mb-3 text-gray-200">{deviceName} Usage - Last 12 Months</h4>
      <div className="grid grid-cols-4 gap-2 text-xs">
        {months.map((month, idx) => (
          <div key={idx} className="flex flex-col">
            <div className="text-gray-400 mb-1 text-center font-medium">{month.monthName}</div>
            <div className="grid grid-cols-7 gap-1">
              {month.days.map((day, dayIdx) => (
                <div
                  key={dayIdx}
                  className="w-3 h-3 rounded-sm cursor-pointer hover:ring-1 hover:ring-white"
                  style={{ backgroundColor: getColor(day.intensity) }}
                  title={`${day.date.toLocaleDateString()}: ${day.count} interactions`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: getColor(level) }}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}

function QRCode({ data }) {
  const size = 21; 
  const moduleSize = 8;
  
  const hash = data.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const pattern = [];
  for (let i = 0; i < size * size; i++) {
    pattern.push(((hash + i) * 9301 + 49297) % 233280 > 116640);
  }
  
  return (
    <div className="bg-white p-2 rounded">
      <div 
        className="grid gap-0"
        style={{ 
          gridTemplateColumns: `repeat(${size}, ${moduleSize}px)`,
          width: size * moduleSize,
          height: size * moduleSize
        }}
      >
        {pattern.map((isDark, i) => (
          <div
            key={i}
            className={isDark ? 'bg-black' : 'bg-white'}
            style={{ width: moduleSize, height: moduleSize }}
          />
        ))}
      </div>
    </div>
  );
}

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
    const defaultStates = {
      "Living Room": addIconsToDevices(initialLivingRoomDevices),
      "Bedroom": addIconsToDevices(initialBedroomDevices),
      "Office": addIconsToDevices(initialOfficeDevices),
      "Kitchen": addIconsToDevices(initialKitchenDevices),
      "Bathroom": addIconsToDevices(initialBathroomDevices),
    };
    return defaultStates;
  };

  const getInitialUsageData = () => {
    return {};
  };

  const [allDeviceStates, setAllDeviceStates] = useState(getInitialDeviceStates);
  const [usageData, setUsageData] = useState(getInitialUsageData);
  const [showHeatmap, setShowHeatmap] = useState({});

  const getActiveRoomDevices = () => {
    return allDeviceStates[room] || [];
  };

  const recordUsage = (deviceName, actionType, value = null) => {
    const today = new Date().toISOString().split('T')[0];
    const deviceKey = `${room}-${deviceName}`;
    
    setUsageData(prevData => {
      const newData = { ...prevData };
      if (!newData[deviceKey]) {
        newData[deviceKey] = {};
      }
      if (!newData[deviceKey][today]) {
        newData[deviceKey][today] = { count: 0, actions: [] };
      }
      
      newData[deviceKey][today].count += 1;
      newData[deviceKey][today].actions.push({
        time: new Date().toISOString(),
        type: actionType,
        value: value
      });
      
      return newData;
    });
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
    const device = currentDevices.find(d => d.id === deviceId);
    
    const newDevices = currentDevices.map(device =>
      device.id === deviceId
        ? { ...device, isOn: !device.isOn }
        : device
    );
    
    updateDeviceState(newDevices);
    recordUsage(device.name, 'toggle', !device.isOn);
  };

  const updateDeviceValue = (deviceId, property, value) => {
    const currentDevices = getActiveRoomDevices();
    const device = currentDevices.find(d => d.id === deviceId);
    
    const newDevices = currentDevices.map(device =>
      device.id === deviceId
        ? { ...device, [property]: value }
        : device
    );
    
    updateDeviceState(newDevices);
    recordUsage(device.name, 'adjust', value);
  };

  const toggleHeatmap = (deviceKey) => {
    setShowHeatmap(prev => ({
      ...prev,
      [deviceKey]: !prev[deviceKey]
    }));
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
      <div className="grid grid-cols-1 gap-4">
        {getActiveRoomDevices().map(device => {
          const deviceKey = `${room}-${device.name}`;
          const deviceUsageData = usageData[deviceKey] || {};
          const hasUsageData = Object.keys(deviceUsageData).length > 0;
          
          return (
            <div key={device.id} className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {device.icon && (
                    <device.icon className={`w-6 h-6 ${device.isOn ? 'text-blue-400' : 'text-gray-400'}`} />
                  )}
                  <span className="font-semibold">{device.name}</span>
                  {hasUsageData && (
                    <button
                      onClick={() => toggleHeatmap(deviceKey)}
                      className="flex items-center gap-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors"
                      title="View usage heatmap"
                    >
                      <FaQrcode className="w-3 h-3" />
                      Usage
                    </button>
                  )}
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
              
              {showHeatmap[deviceKey] && hasUsageData && (
                <div className="mt-4 flex gap-4">
                  <div className="flex-1">
                    <CalendarHeatmap 
                      data={deviceUsageData} 
                      deviceName={device.name}
                    />
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <QRCode data={JSON.stringify(deviceUsageData)} />
                    <span className="text-xs text-gray-400">Usage QR</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DeviceControl;