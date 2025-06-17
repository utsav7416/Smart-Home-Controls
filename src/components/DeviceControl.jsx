import React, { useState, useEffect } from 'react';
import { FaLightbulb, FaFan, FaTv, FaThermometerHalf, FaChartBar } from 'react-icons/fa';
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

function CalendarHeatmap({ data, deviceName, room }) {
  const getLast5DaysData = () => {
    const today = new Date();
    const last5Days = [];

    for (let i = 4; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = date.getDate();

      last5Days.push({
        date: dateString,
        dayName,
        dayNumber,
        count: data[dateString]?.count || 0
      });
    }

    return last5Days;
  };

  const daysData = getLast5DaysData();
  const maxCount = Math.max(...daysData.map(d => d.count), 1);

  const getIntensityColor = (count) => {
    if (count === 0) return '#0F172A'; 
    const intensity = count / maxCount;
    if (intensity <= 0.25) return '#4CAF50'; 
    if (intensity <= 0.5) return '#8BC34A';  
    if (intensity <= 0.75) return '#CDDC39';
    return '#FFEB3B';
  };

  return (
    <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <FaChartBar className="w-4 h-4 text-blue-400" />
        <h4 className="text-sm font-semibold text-white">
          {deviceName} Usage Activity
        </h4>
      </div>

      <p className="text-xs text-slate-400 mb-3">
        Track your device usage patterns over the last 5 days. Lighter squares indicate higher activity.
      </p>

      <div className="grid grid-cols-5 gap-2 mb-3">
        {daysData.map((day, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className="w-8 h-8 rounded-sm border border-slate-600 transition-all hover:scale-110"
              style={{ backgroundColor: getIntensityColor(day.count) }}
              title={`${day.dayName}, ${day.dayNumber}: ${day.count} actions`}
            />
            <span className="text-xs text-slate-500 mt-1">{day.dayName}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Less activity</span>
        <div className="flex gap-1">
          {[0, 0.25, 0.5, 0.75, 1].map((intensity, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: getIntensityColor(maxCount * intensity) }}
            />
          ))}
        </div>
        <span>More activity</span>
      </div>

      <div className="mt-3 p-2 bg-slate-800 rounded text-xs">
        <div className="flex justify-between">
          <span className="text-slate-300">Total actions (5 days):</span>
          <span className="text-blue-400 font-semibold">
            {daysData.reduce((sum, day) => sum + day.count, 0)}
          </span>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-slate-300">Most active day:</span>
          <span className="text-blue-400 font-semibold">
            {maxCount} actions
          </span>
        </div>
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
    const savedStates = localStorage.getItem('deviceStates');
    if (savedStates) {
      try {
        const parsed = JSON.parse(savedStates);
        // Add icons back to loaded data
        Object.keys(parsed).forEach(roomKey => {
          parsed[roomKey] = addIconsToDevices(parsed[roomKey]);
        });
        return parsed;
      } catch (error) {
        console.error('Failed to parse saved device states:', error);
      }
    }

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
    const savedUsageData = localStorage.getItem('usageData');
    if (savedUsageData) {
      try {
        return JSON.parse(savedUsageData);
      } catch (error) {
        console.error('Failed to parse saved usage data:', error);
      }
    }
    return {};
  };

  const getInitialHeatmapState = () => {
    const savedHeatmapState = localStorage.getItem('showHeatmap');
    if (savedHeatmapState) {
      try {
        return JSON.parse(savedHeatmapState);
      } catch (error) {
        console.error('Failed to parse saved heatmap state:', error);
      }
    }
    return {};
  };

  const [allDeviceStates, setAllDeviceStates] = useState(getInitialDeviceStates);
  const [usageData, setUsageData] = useState(getInitialUsageData);
  const [showHeatmap, setShowHeatmap] = useState(getInitialHeatmapState);

  // Save to localStorage whenever states change
  useEffect(() => {
    const statesToSave = {};
    Object.keys(allDeviceStates).forEach(roomKey => {
      statesToSave[roomKey] = allDeviceStates[roomKey].map(({ icon, ...rest }) => rest);
    });
    localStorage.setItem('deviceStates', JSON.stringify(statesToSave));
  }, [allDeviceStates]);

  useEffect(() => {
    localStorage.setItem('usageData', JSON.stringify(usageData));
  }, [usageData]);

  useEffect(() => {
    localStorage.setItem('showHeatmap', JSON.stringify(showHeatmap));
  }, [showHeatmap]);

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
      background: `linear-gradient(90deg, #3b82f6 ${percentage}%, #374151 ${percentage}%)`
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
      <div className="mt-3 p-3 bg-gray-800 rounded-lg border border-gray-600">
        <label className="text-sm font-medium text-gray-200 mb-2 block">
          {device.property === 'brightness' && 'Brightness Control'}
          {device.property === 'speed' && 'Fan Speed Control'}
          {device.property === 'temp' && 'Temperature Control'}
          {device.property === 'temperature' && 'Water Temperature Control'}
          {device.property === 'volume' && 'Volume Control'}
          {device.property === 'pressure' && 'Water Pressure Control'}
          {device.property === 'power' && 'Power Level Control'}
        </label>
        <input
          type="range"
          min={min}
          max={max}
          value={device.value}
          onChange={(e) => updateDeviceValue(device.id, 'value', parseInt(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer slider"
          style={getSliderStyle(device.value, min, max)}
        />
        <div className="flex justify-between text-sm text-gray-400 mt-2">
          <span>{minLabel}</span>
          <span className="font-semibold text-blue-400">{valueLabel}</span>
          <span>{maxLabel}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-900 rounded-xl shadow-2xl text-white border border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
        {room} Smart Controls
      </h2>
      <div className="grid grid-cols-1 gap-6">
        {getActiveRoomDevices().map(device => {
          const deviceKey = `${room}-${device.name}`;
          const deviceUsageData = usageData[deviceKey] || {};
          const hasUsageData = Object.keys(deviceUsageData).length > 0;
          return (
            <div key={device.id} className="bg-gray-800 p-5 rounded-xl border border-gray-600 hover:border-gray-500 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  {device.icon && (
                    <device.icon className={`w-7 h-7 transition-colors ${device.isOn ? 'text-blue-400' : 'text-gray-500'}`} />
                  )}
                  <div>
                    <span className="font-semibold text-lg">{device.name}</span>
                    <p className="text-xs text-gray-400">
                      {device.isOn ? 'Currently active' : 'Currently off'}
                    </p>
                  </div>
                  {hasUsageData && (
                    <button
                      onClick={() => toggleHeatmap(deviceKey)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        showHeatmap[deviceKey]
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }`}
                    >
                      <FaChartBar className="w-4 h-4" />
                      {showHeatmap[deviceKey] ? 'Hide Analytics' : 'View Analytics'}
                    </button>
                  )}
                </div>
                <button
                  onClick={() => toggleDevice(device.id)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                    device.isOn ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-lg ${
                      device.isOn ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {renderDeviceControls(device)}

              {showHeatmap[deviceKey] && hasUsageData && (
                <div className="mt-4">
                  <CalendarHeatmap
                    data={deviceUsageData}
                    deviceName={device.name}
                    room={room}
                  />
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